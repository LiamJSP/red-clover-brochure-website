# Red Clover Software Brochure Site

Production-ready, statically rendered brochure site built with Astro and Payload CMS. Designed for calm corporate positioning, clear service lanes, and direct engagement pathways. Optimized for AWS deployment with GitHub Actions CI/CD.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend  | Astro (static, pre-rendered) |
| CMS       | Payload (Next.js admin + REST API) |
| Database  | PostgreSQL |
| Deployment| AWS S3, CloudFront, ECS, RDS |
| CI/CD     | GitHub Actions |
| Package Manager | pnpm |

## Repository Structure

```
apps/cms/          # Payload CMS application
apps/site/         # Astro static frontend
.github/workflows/ # CI/CD deployment pipelines
scripts/aws/       # Reusable AWS deployment utilities
```

## Local Development

### Prerequisites (openSUSE Tumbleweed)
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
- CMS Admin: `http://localhost:3000/admin`
- Astro Site: `http://localhost:4321`
- Initial seed runs automatically on first CMS boot when `SEED_ON_INIT=true`

### Build Locally
```bash
pnpm build
```
Requires a reachable CMS at the `CMS_URL` defined in `apps/site/.env.local`.

## Environment Configuration

### `apps/cms/.env.local`
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PAYLOAD_SECRET` | Payload encryption secret |
| `CMS_PUBLIC_URL` | Publicly accessible CMS URL |
| `SITE_BASE_URL` | Frontend public URL |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Default admin credentials |
| `SEED_ON_INIT` | Enable demo content seeding |
| `SITE_DEPLOY_WEBHOOK_URL` / `SITE_DEPLOY_WEBHOOK_SECRET` | Optional webhook to trigger site rebuilds |
| `S3_BUCKET` / `S3_REGION` | Optional S3 media storage config |

### `apps/site/.env.local`
| Variable | Description |
|----------|-------------|
| `CMS_URL` | Payload API endpoint |
| `PUBLIC_SITE_URL` | Live frontend URL |
| `PUBLIC_BRAND_NAME` | Display name |
| `PUBLIC_CONTACT_EMAIL` / `PUBLIC_CALENDLY_URL` | Direct engagement links |
| `PUBLIC_ENABLE_SW_CLEANUP` | Enable legacy service worker removal script |
| `PUBLIC_ENABLE_CALENDLY_EMBED` | Enable inline Calendly widget |

### Remote CMS Usage
Point the local Astro site at a deployed Payload instance:
```env
# apps/site/.env.local
CMS_URL=https://cms.example.com
PUBLIC_SITE_URL=http://localhost:4321
```
Ensure `CORS_ORIGINS` on the CMS includes `http://localhost:4321`.

## Deployment

GitHub Actions handle end-to-end CI/CD. Required secrets and variables are documented in the workflow files.

### Static Site (`deploy-site.yml`)
1. Installs dependencies and builds Astro
2. Syncs static assets to S3 with long immutable cache headers
3. Syncs HTML with `no-cache, must-revalidate`
4. Invalidates CloudFront HTML paths

### CMS (`deploy-cms.yml`)
1. Builds Docker image from `Dockerfile.cms`
2. Pushes to Amazon ECR
3. Runs Payload migrations as a one-off ECS task
4. Updates ECS service with zero-downtime deployment

## Content Model & Routing

### CMS-Driven Pages
Stored in the `pages` collection and pre-rendered at build time:
`/`, `/services/*`, `/partners`, `/about`, `/contact`, `/security`, `/faq`, `/work` (hero/intro), `/insights` (hero/intro)

### Template-Driven Routes
Dynamic listings and details generated from CMS collections:
`/work`, `/work/[slug]`, `/insights`, `/insights/[slug]`

Content changes require a static rebuild or webhook-triggered deploy.

## Architecture & Design Principles

- **Static-first**: All indexable content is pre-rendered HTML; no client-side rendering required
- **No service worker**: Deliberately omitted to avoid caching conflicts; optional cleanup script provided for legacy migrations
- **Direct engagement**: Email and Calendly links replace custom form workflows for reliability and simplicity
- **Webhook-driven sync**: Optional Payload webhook triggers static rebuilds on content publish
- **AWS-native deployment**: S3/CloudFront for frontend, ECS/RDS for CMS, immutable asset caching, and explicit HTML cache-busting

---
For infrastructure provisioning, secret management, or workflow configuration, refer to `.github/workflows/` and `scripts/aws/`.