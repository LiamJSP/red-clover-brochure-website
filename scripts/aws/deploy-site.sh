#!/usr/bin/env bash
set -euo pipefail

: "${SITE_BUCKET:?SITE_BUCKET is required}"
: "${CF_DISTRIBUTION_ID:?CF_DISTRIBUTION_ID is required}"

DIST_DIR="apps/site/dist"

if [ ! -d "$DIST_DIR" ]; then
  echo "Expected built Astro output at $DIST_DIR"
  exit 1
fi

aws s3 sync "$DIST_DIR/" "s3://${SITE_BUCKET}/" \
  --delete \
  --exclude "*.html" \
  --exclude "*.xml" \
  --exclude "robots.txt" \
  --cache-control "public,max-age=31536000,immutable"

aws s3 sync "$DIST_DIR/" "s3://${SITE_BUCKET}/" \
  --delete \
  --exclude "*" \
  --include "*.html" \
  --include "*.xml" \
  --include "robots.txt" \
  --cache-control "no-cache,max-age=0,must-revalidate"

aws cloudfront create-invalidation \
  --distribution-id "$CF_DISTRIBUTION_ID" \
  --paths "/" "/index.html" "/*.html" "/*.xml" "/robots.txt"

echo "Site deploy complete."
