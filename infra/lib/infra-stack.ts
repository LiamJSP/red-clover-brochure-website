import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as backup from 'aws-cdk-lib/aws-backup';
import * as events from 'aws-cdk-lib/aws-events';

export class RedCloverInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domainName = 'redcloversoftware.ca';
    const siteDomain = `www.${domainName}`;
    const cmsDomain = `cms.${domainName}`;

    // 1. Networking (Zero NAT Gateway to eliminate idle costs)
    const vpc = new ec2.Vpc(this, 'RedCloverVpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        { name: 'Public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
        { name: 'Isolated', subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: 24 },
      ],
    });

    // 2. DNS Zone
    const hostedZone = route53.HostedZone.fromLookup(this, 'Zone', { domainName });

    // 3. Certificates
    const cmsCert = new acm.Certificate(this, 'CmsCert', {
      domainName: cmsDomain,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // CloudFront requires a cert in us-east-1
    const siteCert = new acm.DnsValidatedCertificate(this, 'SiteCert', {
      domainName: siteDomain,
      subjectAlternativeNames: [domainName],
      hostedZone,
      region: 'us-east-1',
    });

    // 4. Database & Backups
    const dbSecret = new secretsmanager.Secret(this, 'DbSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'payload' }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\',
      },
    });

    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSg', { vpc });
    
    const db = new rds.DatabaseInstance(this, 'CmsDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_16 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      credentials: rds.Credentials.fromSecret(dbSecret),
      securityGroups: [dbSecurityGroup],
      multiAz: false, // Cost optimization
      allocatedStorage: 20,
      deleteAutomatedBackups: true,
      backupRetention: cdk.Duration.days(1), // Rely on AWS Backup for long-term
    });

    // Backup Plan: Once a month, keep for 3 months
    // We explicitly name the vault to avoid collisions with orphaned vaults from failed rollbacks
    const backupVault = new backup.BackupVault(this, 'RedCloverBackupVault', {
      backupVaultName: 'RedClover-Db-Vault-V2', 
      removalPolicy: cdk.RemovalPolicy.DESTROY, 
    });

    const backupPlan = new backup.BackupPlan(this, 'MonthlyDbBackup', {
      backupVault: backupVault
    });
    
    backupPlan.addRule(new backup.BackupPlanRule({
      scheduleExpression: events.Schedule.cron({ minute: '0', hour: '5', day: '1', month: '*' }),
      deleteAfter: cdk.Duration.days(90),
    }));
    backupPlan.addSelection('DbSelection', { resources: [backup.BackupResource.fromRdsDatabaseInstance(db)] });
    
    // 5. ECS, Fargate, and ALB
    const payloadSecret = new secretsmanager.Secret(this, 'PayloadSecret', {
      generateSecretString: { passwordLength: 32 },
    });

    const cluster = new ecs.Cluster(this, 'CmsCluster', { vpc });
    const repository = new ecr.Repository(this, 'CmsRepo', { removalPolicy: cdk.RemovalPolicy.DESTROY });

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'CmsTaskDef', {
      memoryLimitMiB: 1024,
      cpu: 512,
    });

    const cmsImageTag = this.node.tryGetContext('cmsImageTag') ?? 'latest';

    const container = taskDefinition.addContainer('CmsContainer', {
          image: ecs.ContainerImage.fromEcrRepository(repository, cmsImageTag),
          logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'CmsLogs' }),
          environment: {
            NODE_ENV: 'production',
            CMS_PUBLIC_URL: `https://${cmsDomain}`,
            SITE_BASE_URL: `https://${siteDomain}`,
            CORS_ORIGINS: `https://${siteDomain},https://${domainName}`,
            // These stay!
            DB_HOST: db.instanceEndpoint.hostname,
            DB_NAME: 'payload',
          },
          secrets: {
            // These stay!
            DB_USER: ecs.Secret.fromSecretsManager(dbSecret, 'username'),
            DB_PASS: ecs.Secret.fromSecretsManager(dbSecret, 'password'),
            PAYLOAD_SECRET: ecs.Secret.fromSecretsManager(payloadSecret),
          },
          portMappings: [{ containerPort: 3000 }],
        });

    const albSecurityGroup = new ec2.SecurityGroup(this, 'AlbSg', { vpc });
    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443));
    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));

    const ecsSecurityGroup = new ec2.SecurityGroup(this, 'EcsSg', { vpc });
    ecsSecurityGroup.addIngressRule(albSecurityGroup, ec2.Port.tcp(3000));
    dbSecurityGroup.addIngressRule(ecsSecurityGroup, ec2.Port.tcp(5432));

    const service = new ecs.FargateService(this, 'CmsService', {
      cluster,
      taskDefinition,
      assignPublicIp: true,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroups: [ecsSecurityGroup],
      desiredCount: 1,
      minHealthyPercent: 0, // ✅ Prevents deployment hangs on scale-1 services
      circuitBreaker: { rollback: true },
    });

    const alb = new elbv2.ApplicationLoadBalancer(this, 'CmsAlb', {
      vpc,
      internetFacing: true,
      securityGroup: albSecurityGroup,
    });

    const listener = alb.addListener('HttpsListener', {
      port: 443,
      certificates: [cmsCert],
    });

    listener.addTargets('EcsTargets', {
      targets: [service],
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      healthCheck: {
        path: '/api/health',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 2,
        healthyHttpCodes: '200',
      },
    });

    alb.addListener('HttpListener', { port: 80, defaultAction: elbv2.ListenerAction.redirect({ port: '443' }) });

    // CMS DNS Record
    new route53.ARecord(this, 'CmsDnsRecord', {
      zone: hostedZone,
      recordName: 'cms',
      target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(alb)),
    });

    // 6. Astro Static Site (S3 + CloudFront + HSTS + HTTP/3)
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const responseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(this, 'SecurityHeaders', {
      securityHeadersBehavior: {
        strictTransportSecurity: { accessControlMaxAge: cdk.Duration.days(365), includeSubdomains: true, override: true },
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
        xssProtection: { protection: true, modeBlock: true, override: true },
      },
    });

    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy,
      },
      domainNames: [siteDomain, domainName],
      certificate: siteCert,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      defaultRootObject: 'index.html',
      errorResponses: [{ httpStatus: 404, responsePagePath: '/404.html' }],
    });

    // Site DNS Records (Overwriting the existing Gatsby records)
    new route53.ARecord(this, 'SiteWwwRecord', {
      zone: hostedZone,
      recordName: 'www',
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      deleteExisting: true, 
    });

    new route53.ARecord(this, 'SiteApexRecord', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      deleteExisting: true, 
    });

    // IPv6 Records (Overwriting if they exist)
    new route53.AaaaRecord(this, 'SiteWwwIpv6Record', {
      zone: hostedZone,
      recordName: 'www',
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      deleteExisting: true,
    });

    new route53.AaaaRecord(this, 'SiteApexIpv6Record', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      deleteExisting: true,
    });
  }
}