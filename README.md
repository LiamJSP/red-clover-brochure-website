# Red Clover Software Brochure Site

Production-ready, statically rendered brochure site built with Astro and Payload CMS. Designed for calm corporate positioning, clear service lanes, and direct engagement pathways. Optimized for AWS deployment with GitHub Actions CI/CD.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Astro static site |
| CMS | Payload CMS with Next.js admin and REST API |
| Database | PostgreSQL |
| Frontend Hosting | AWS S3 and CloudFront |
| CMS Hosting | AWS ECS Fargate, Application Load Balancer, and RDS |
| DNS / TLS | Route 53, ACM, CloudFront, ALB |
| CI/CD | GitHub Actions |
| Package Manager | pnpm |

## Repository Structure

```text
apps/cms/          # Payload CMS application
apps/site/         # Astro static frontend
infra/             # AWS CDK infrastructure stack
.github/workflows/ # CI/CD deployment pipelines
scripts/aws/       # Reusable AWS deployment utilities
Dockerfile.cms     # Production CMS image
````

## Local Development

### Prerequisites

Example setup for openSUSE Tumbleweed:

```bash
# Docker & Compose
sudo zypper install -y docker docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER

# Node 22 & pnpm
sudo zypper addrepo https://download.opensuse.org/repositories/devel:languages:nodejs/openSUSE_Tumbleweed/devel:languages:nodejs.repo
sudo zypper refresh
sudo zypper install -y nodejs22
corepack enable
corepack prepare pnpm@latest --activate
```

For other Linux distributions, install:

```text
Node.js 22
pnpm via Corepack
Docker
Docker Compose
AWS CLI v2
```

### Setup & Run

```bash
# 1. Configure environment
cp apps/cms/.env.example apps/cms/.env.local
cp apps/site/.env.example apps/site/.env.local

# 2. Start PostgreSQL
pnpm db:up

# 3. Install dependencies
pnpm install

# 4. Start local dev servers
pnpm dev
```

Local URLs:

```text
CMS Admin:  http://localhost:3000/admin
Astro Site: http://localhost:4321
```

Initial seed content runs automatically on first CMS boot when:

```env
SEED_ON_INIT=true
```

### Build Locally

```bash
pnpm build
```

The Astro build requires a reachable CMS at the `CMS_URL` defined in `apps/site/.env.local`.

For local builds against the local CMS:

```env
CMS_URL=http://localhost:3000
PUBLIC_SITE_URL=http://localhost:4321
```

For local builds against production CMS:

```env
CMS_URL=https://cms.redcloversoftware.ca
PUBLIC_SITE_URL=http://localhost:4321
```

When using the production CMS from local Astro, ensure the CMS `CORS_ORIGINS` includes:

```text
http://localhost:4321
```

## Environment Configuration

### `apps/cms/.env.local`

| Variable                                                 | Description                                        |
| -------------------------------------------------------- | -------------------------------------------------- |
| `DATABASE_URL`                                           | PostgreSQL connection string for local development |
| `PAYLOAD_SECRET`                                         | Payload encryption secret                          |
| `CMS_PUBLIC_URL`                                         | Publicly accessible CMS URL                        |
| `SITE_BASE_URL`                                          | Frontend public URL                                |
| `CORS_ORIGINS`                                           | Comma-separated list of allowed frontend origins   |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD`                         | Default admin credentials for local seed/bootstrap |
| `SEED_ON_INIT`                                           | Enable demo content seeding                        |
| `SITE_DEPLOY_WEBHOOK_URL` / `SITE_DEPLOY_WEBHOOK_SECRET` | Optional webhook to trigger site rebuilds          |
| `S3_BUCKET` / `S3_REGION`                                | Optional S3 media storage config                   |

Production CMS runtime values are supplied by ECS/CDK and AWS Secrets Manager.

The production CMS uses split database variables:

| Variable         | Source                              |
| ---------------- | ----------------------------------- |
| `DB_HOST`        | RDS endpoint from CDK               |
| `DB_NAME`        | `payload`                           |
| `DB_USER`        | Secrets Manager `DbSecret.username` |
| `DB_PASS`        | Secrets Manager `DbSecret.password` |
| `PAYLOAD_SECRET` | Secrets Manager `PayloadSecret`     |

### `apps/site/.env.local`

| Variable                                       | Description                                 |
| ---------------------------------------------- | ------------------------------------------- |
| `CMS_URL`                                      | Payload API endpoint                        |
| `PUBLIC_SITE_URL`                              | Live frontend URL                           |
| `PUBLIC_BRAND_NAME`                            | Display name                                |
| `PUBLIC_CONTACT_EMAIL` / `PUBLIC_CALENDLY_URL` | Direct engagement links                     |
| `PUBLIC_ENABLE_SW_CLEANUP`                     | Enable legacy service worker removal script |
| `PUBLIC_ENABLE_CALENDLY_EMBED`                 | Enable inline Calendly widget               |

## Content Model & Routing

### CMS-Driven Pages

Pages are stored in the Payload `pages` collection and pre-rendered by Astro at build time.

Expected production pages include:

```text
/
 /about-us
 /contact-us
 /faq
 /news
 /security
 /services
 /services/*
```

Optional section pages, such as `/work`, should only be rendered when matching CMS content exists.

### Template-Driven Routes

Dynamic listings and detail routes are generated from CMS collections:

```text
/news
/news/[slug]
/work
/work/[slug]
```

Content changes require a static rebuild or webhook-triggered deploy.

## Deployment Overview

GitHub Actions handle normal application deployment.

### Static Site Deployment

Workflow:

```text
.github/workflows/deploy-site.yml
```

The static site deployment:

1. Installs dependencies
2. Builds the Astro site from CMS content
3. Syncs immutable static assets to S3 with long cache headers
4. Syncs HTML with `no-cache, must-revalidate`
5. Invalidates CloudFront paths

The frontend is served by CloudFront in front of a private S3 bucket.

CloudFront uses a viewer-request function to rewrite clean URLs:

```text
/services       -> /services/index.html
/services/      -> /services/index.html
/about-us       -> /about-us/index.html
```

This is required because the private S3 origin does not automatically resolve extensionless routes to `index.html`.

### CMS Deployment

Workflow:

```text
.github/workflows/deploy-cms.yml
```

The CMS deployment:

1. Builds Docker image from `Dockerfile.cms`
2. Pushes the image to Amazon ECR using the Git SHA as the image tag
3. Runs Payload migrations as a one-off ECS task
4. Updates the ECS service

The CMS image must include the RDS CA bundle / system CA certificates so production PostgreSQL TLS connections work correctly.

The CMS package must expose a migration script compatible with the deployment utilities, for example:

```json
{
  "scripts": {
    "migrate": "cross-env NODE_OPTIONS=--no-deprecation payload migrate"
  }
}
```

## Infrastructure Deployment

Infrastructure is provisioned with AWS CDK from the `infra/` directory.

The stack includes:

```text
VPC with public and isolated subnets
RDS PostgreSQL
Secrets Manager secrets for DB and Payload
ECR repository
ECS Fargate service
Application Load Balancer for CMS
S3 bucket for static site
CloudFront distribution for frontend
CloudFront Function for clean URL rewrites
ACM certificates
Route 53 CMS DNS record
Optional Route 53 frontend DNS records
AWS Backup plan for RDS
```

### CDK Deploy Command

Always pass a known-good CMS image tag when deploying infrastructure:

```bash
cd infra
npx cdk deploy -c cmsImageTag=<known-good-ecr-image-tag>
```

Do not rely on `latest` unless CI is explicitly pushing and validating a `latest` tag.

For example, after a successful CMS deploy that pushed image tag `cb52e6c4a816b77542c660c6dd8a4aa26675e3de`:

```bash
cd infra
npx cdk deploy -c cmsImageTag=cb52e6c4a816b77542c660c6dd8a4aa26675e3de
```

### Confirm an ECR Image Tag Exists

```bash
aws ecr describe-images \
  --region us-east-1 \
  --repository-name <cms-ecr-repository-name> \
  --image-ids imageTag=<image-tag> \
  --query 'imageDetails[0].imageTags' \
  --output json
```

### Why `cmsImageTag` Matters

The CDK task definition references an ECR image. If CDK is deployed with a tag that does not exist, or with a placeholder value such as `latest` or `3.9-alpine`, ECS may fail to start the service and trigger the deployment circuit breaker.

Use the Git SHA image tag from a successful `deploy-cms` workflow run.

## Frontend DNS Ownership

Frontend DNS records may be managed manually or by CDK depending on the deployment mode.

The relevant records are:

```text
redcloversoftware.ca        A      Alias to CloudFront
redcloversoftware.ca        AAAA   Alias to CloudFront
www.redcloversoftware.ca    A      Alias to CloudFront
www.redcloversoftware.ca    AAAA   Alias to CloudFront
```

The current live environment may have these records restored manually in Route 53.

The CDK stack supports a context flag:

```bash
-c manageSiteDns=true
```

Use this only for a true scratch rebuild where the frontend records do not already exist:

```bash
cd infra
npx cdk deploy \
  -c cmsImageTag=<known-good-ecr-image-tag> \
  -c manageSiteDns=true
```

For the current live environment, where frontend DNS records already exist manually, deploy without `manageSiteDns=true`:

```bash
cd infra
npx cdk deploy -c cmsImageTag=<known-good-ecr-image-tag>
```

Do not enable `manageSiteDns=true` against an environment where those A/AAAA records already exist outside the stack unless you intentionally import them into CloudFormation/CDK or remove/recreate them in a controlled maintenance window.

### Restore Frontend DNS Manually

If the frontend returns `ERR_NAME_NOT_RESOLVED` while the CMS still works, verify the frontend Route 53 records.

Find the CloudFront distribution:

```bash
aws cloudfront list-distributions \
  --query "DistributionList.Items[].{Id:Id,DomainName:DomainName,Aliases:Aliases.Items,Status:Status}" \
  --output table
```

For the current production distribution:

```text
Distribution ID: E3DJESK0EZ7LRL
Distribution domain: d1vxc38g04od26.cloudfront.net
Aliases: redcloversoftware.ca, www.redcloversoftware.ca
```

The CloudFront alias hosted zone ID is:

```text
Z2FDTNDATAQYW2
```

The Route 53 hosted zone ID for `redcloversoftware.ca` is:

```text
Z04275671DBKK3Z387X6L
```

Restore the records:

```bash
export HOSTED_ZONE_ID='Z04275671DBKK3Z387X6L'
export CF_DOMAIN='d1vxc38g04od26.cloudfront.net'
export CF_ZONE_ID='Z2FDTNDATAQYW2'

cat > /tmp/restore-redclover-site-dns.json <<EOF
{
  "Comment": "Restore Red Clover frontend CloudFront alias records",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "redcloversoftware.ca.",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "$CF_ZONE_ID",
          "DNSName": "$CF_DOMAIN",
          "EvaluateTargetHealth": false
        }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "redcloversoftware.ca.",
        "Type": "AAAA",
        "AliasTarget": {
          "HostedZoneId": "$CF_ZONE_ID",
          "DNSName": "$CF_DOMAIN",
          "EvaluateTargetHealth": false
        }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "www.redcloversoftware.ca.",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "$CF_ZONE_ID",
          "DNSName": "$CF_DOMAIN",
          "EvaluateTargetHealth": false
        }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "www.redcloversoftware.ca.",
        "Type": "AAAA",
        "AliasTarget": {
          "HostedZoneId": "$CF_ZONE_ID",
          "DNSName": "$CF_DOMAIN",
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}
EOF

aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch file:///tmp/restore-redclover-site-dns.json
```

Verify:

```bash
aws route53 list-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --query "ResourceRecordSets[?Name=='redcloversoftware.ca.' || Name=='www.redcloversoftware.ca.'].[Name,Type,AliasTarget.DNSName]" \
  --output table

dig redcloversoftware.ca
dig www.redcloversoftware.ca

curl -I https://redcloversoftware.ca
curl -I https://www.redcloversoftware.ca
```

## CloudFront Invalidation

After frontend deploys or infrastructure changes that affect routing, invalidate relevant paths.

Find the distribution ID:

```bash
aws cloudfront list-distributions \
  --query "DistributionList.Items[].{Id:Id,DomainName:DomainName,Aliases:Aliases.Items,Status:Status}" \
  --output table
```

Set:

```bash
export CF_DISTRIBUTION_ID='E3DJESK0EZ7LRL'
```

Invalidate common clean URL paths:

```bash
aws cloudfront create-invalidation \
  --distribution-id "$CF_DISTRIBUTION_ID" \
  --paths "/services" "/services/" "/services/index.html"
```

For broader cache clearing:

```bash
aws cloudfront create-invalidation \
  --distribution-id "$CF_DISTRIBUTION_ID" \
  --paths "/*"
```

## Production Health Checks

### CMS Health

The CMS must expose:

```text
/api/health
```

Expected response:

```json
{
  "ok": true
}
```

Check production:

```bash
curl -I https://cms.redcloversoftware.ca/api/health
curl https://cms.redcloversoftware.ca/api/health
```

The ALB target group health check should use:

```text
Path: /api/health
Healthy HTTP codes: 200
```

### Frontend Health

Check common frontend routes:

```bash
curl -I https://redcloversoftware.ca
curl -I https://www.redcloversoftware.ca
curl -I https://redcloversoftware.ca/services
curl -I https://redcloversoftware.ca/services/
curl -I https://redcloversoftware.ca/services/index.html
```

Expected result for normal pages:

```text
HTTP/2 200
```

If `/services` returns S3 `AccessDenied` while `/services/index.html` works, the CloudFront clean URL rewrite function is missing or not attached.

If all frontend domains return `ERR_NAME_NOT_RESOLVED`, check Route 53 frontend A/AAAA records.

## RDS and Secrets Notes

The production CMS connects to RDS using the username and password stored in AWS Secrets Manager.

Important:

```text
Secrets Manager DbSecret username/password must match the actual PostgreSQL role credentials.
```

If the database is restored from a snapshot or manually modified, verify the secret still works.

Symptoms of a DB secret mismatch include ECS task failures or migration failures with:

```text
password authentication failed for user "payload"
```

If this happens, align the actual RDS user password with `DbSecret.password`, then rerun migrations/deploy.

## Scratch Rebuild Notes

A full scratch rebuild is more than a normal CDK deploy. Confirm these before deleting and recreating infrastructure:

```text
1. A known-good CMS image has been built and pushed to ECR.
2. CDK is deployed with -c cmsImageTag=<known-good-tag>.
3. If Route 53 frontend records do not already exist, deploy with -c manageSiteDns=true.
4. CMS /api/health route exists in the repo.
5. CMS package has the migrate script expected by scripts/aws/run-cms-migrations.sh.
6. Payload database content is restored or seeded.
7. Frontend site build has the required CMS content.
8. CloudFront clean URL rewrite function is present in infra-stack.ts.
9. Frontend CloudFront invalidation is run after site/routing changes.
```

Database content is not fully represented by IaC. If the stack is destroyed, CMS content must be restored from backup, export/import, or seed scripts.

## Architecture & Design Principles

* **Static-first**: All indexable frontend content is pre-rendered HTML; no client-side rendering required
* **CMS-backed content**: Payload provides structured content, admin UI, and REST APIs
* **Clean URL support**: CloudFront rewrites extensionless paths to `index.html` for private S3 hosting
* **No service worker**: Deliberately omitted to avoid caching conflicts; optional cleanup script provided for legacy migrations
* **Direct engagement**: Email and Calendly links replace custom form workflows for reliability and simplicity
* **Webhook-driven sync**: Optional Payload webhook triggers static rebuilds on content publish
* **AWS-native deployment**: S3/CloudFront for frontend, ECS/RDS for CMS, immutable asset caching, explicit HTML cache-busting
* **Pinned CMS images**: CDK deploys should reference known-good ECR image tags, not unverified local Git state
* **Minimal idle cost**: VPC uses public and isolated subnets with no NAT gateway

## Useful Commands

### Check CloudFormation Stack Status

```bash
aws cloudformation describe-stacks \
  --region us-east-1 \
  --stack-name RedCloverInfraStack \
  --query 'Stacks[0].StackStatus' \
  --output text
```

### Watch Recent CloudFormation Events

```bash
aws cloudformation describe-stack-events \
  --region us-east-1 \
  --stack-name RedCloverInfraStack \
  --query 'StackEvents[0:10].[Timestamp,LogicalResourceId,ResourceStatus,ResourceStatusReason]' \
  --output table
```

### Check ECS Service Events

```bash
aws ecs describe-services \
  --region us-east-1 \
  --cluster RedCloverInfraStack-CmsClusterE873263C-H1JjhqQc6Sd3 \
  --services RedCloverInfraStack-CmsService6CC7659C-0R7oiFF2UcEQ \
  --query 'services[0].events[0:10].message' \
  --output text
```

### Find the Currently Referenced CMS Image

```bash
ECS_CLUSTER='RedCloverInfraStack-CmsClusterE873263C-H1JjhqQc6Sd3'
ECS_SERVICE='RedCloverInfraStack-CmsService6CC7659C-0R7oiFF2UcEQ'

TASK_DEF_ARN="$(
  aws ecs describe-services \
    --region us-east-1 \
    --cluster "$ECS_CLUSTER" \
    --services "$ECS_SERVICE" \
    --query 'services[0].taskDefinition' \
    --output text
)"

CURRENT_CMS_IMAGE="$(
  aws ecs describe-task-definition \
    --region us-east-1 \
    --task-definition "$TASK_DEF_ARN" \
    --query 'taskDefinition.containerDefinitions[?name==`CmsContainer`].image | [0]' \
    --output text
)"

CURRENT_CMS_IMAGE_TAG="${CURRENT_CMS_IMAGE##*:}"

echo "$CURRENT_CMS_IMAGE"
echo "$CURRENT_CMS_IMAGE_TAG"
```

Do not blindly redeploy using `CURRENT_CMS_IMAGE_TAG` if the current image is a placeholder such as:

```text
python:3.9-alpine
```

Use a real ECR Git SHA tag from a successful CMS deployment.

## Additional References

For infrastructure provisioning, secret management, and workflow configuration, refer to:

```text
infra/
.github/workflows/
scripts/aws/
README_INFRA.md
```

```
