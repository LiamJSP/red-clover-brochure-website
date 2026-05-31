# AWS infrastructure notes

This repo does not force a single IaC tool, but the deployment workflows assume the following AWS resources already exist.

## Static site resources

- S3 bucket for the Astro build output
- CloudFront distribution in front of that bucket
- Route 53 records for the public site domain
- ACM certificate in `us-east-1` for the CloudFront distribution

GitHub variables used by `deploy-site.yml`:

- `AWS_REGION`
- `SITE_BUCKET`
- `CF_DISTRIBUTION_ID`
- `CMS_URL`
- `PUBLIC_SITE_URL`
- `PUBLIC_BRAND_NAME`
- `PUBLIC_CONTACT_EMAIL`
- `PUBLIC_CALENDLY_URL`

GitHub secret:

- `AWS_ROLE_TO_ASSUME_SITE`

## CMS resources

- ECR repository for the Payload image
- ECS cluster and service
- ECS task definition family
- ALB and Route 53 record for `cms.example.com`
- RDS PostgreSQL instance in private subnets
- ACM certificate in the ALB region
- optional S3 bucket for media uploads

GitHub variables used by `deploy-cms.yml`:

- `AWS_REGION`
- `ECR_REPOSITORY`
- `ECS_CLUSTER`
- `ECS_SERVICE`
- `ECS_TASK_FAMILY`
- `ECS_CONTAINER_NAME`
- `ECS_SUBNETS`
- `ECS_SECURITY_GROUPS`

GitHub secrets:

- `AWS_ROLE_TO_ASSUME_CMS`
- `DATABASE_URL`
- `PAYLOAD_SECRET`

## Why this is left tool-agnostic

The stack document treats IaC as recommended rather than mandatory. The workflows and shell scripts in this repo are already aligned with the intended AWS topology, so you can layer in either:

- AWS CDK in TypeScript
- Terraform
- console-created resources, then migrate to IaC later

The key contracts are already represented in the workflows and environment variable names.
