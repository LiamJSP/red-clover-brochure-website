#!/usr/bin/env bash
set -euo pipefail

: "${AWS_REGION:?AWS_REGION is required}"
: "${ECR_REPOSITORY:?ECR_REPOSITORY is required}"
: "${IMAGE_TAG:?IMAGE_TAG is required}"
: "${ECS_TASK_FAMILY:?ECS_TASK_FAMILY is required}"
: "${ECS_CONTAINER_NAME:?ECS_CONTAINER_NAME is required}"

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_URI="${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"

aws ecr describe-repositories --repository-names "$ECR_REPOSITORY" >/dev/null 2>&1 || \
  aws ecr create-repository --repository-name "$ECR_REPOSITORY" >/dev/null

aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

docker build -f Dockerfile.cms -t "$IMAGE_URI" .
docker push "$IMAGE_URI"

CURRENT_TASK_DEF="$(aws ecs describe-task-definition --task-definition "$ECS_TASK_FAMILY" --query 'taskDefinition' --output json)"

UPDATED_TASK_DEF="$(printf '%s' "$CURRENT_TASK_DEF" | jq \
  --arg image "$IMAGE_URI" \
  --arg containerName "$ECS_CONTAINER_NAME" \
  'del(
      .taskDefinitionArn,
      .revision,
      .status,
      .requiresAttributes,
      .compatibilities,
      .registeredAt,
      .registeredBy
    )
    | .containerDefinitions = (
      .containerDefinitions | map(
        if .name == $containerName then (.image = $image | del(.command)) else . end
      )
    )'
)"

TASK_DEF_ARN="$(aws ecs register-task-definition --cli-input-json "$UPDATED_TASK_DEF" --query 'taskDefinition.taskDefinitionArn' --output text)"

echo "TASK_DEF_ARN=${TASK_DEF_ARN}" >> "$GITHUB_ENV"
echo "IMAGE_URI=${IMAGE_URI}" >> "$GITHUB_ENV"
echo "Registered task definition: ${TASK_DEF_ARN}"
