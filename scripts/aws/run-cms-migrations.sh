# scripts/aws/run-cms-migrations.sh
#!/usr/bin/env bash
set -euo pipefail

: "${AWS_REGION:?AWS_REGION is required}"
: "${ECS_CLUSTER:?ECS_CLUSTER is required}"
: "${ECS_TASK_FAMILY:?ECS_TASK_FAMILY is required}"
: "${ECS_CONTAINER_NAME:?ECS_CONTAINER_NAME is required}"
: "${ECS_SUBNETS:?ECS_SUBNETS is required}"
: "${ECS_SECURITY_GROUPS:?ECS_SECURITY_GROUPS is required}"
: "${ECS_SERVICE:?ECS_SERVICE is required}"

TASK_DEFINITION="${TASK_DEF_ARN:-$ECS_TASK_FAMILY}"
SUBNET_JSON="$(printf '%s' "$ECS_SUBNETS" | jq -R 'split(",")')"
SECURITY_GROUP_JSON="$(printf '%s' "$ECS_SECURITY_GROUPS" | jq -R 'split(",")')"

OVERRIDES="$(jq -n --arg name "$ECS_CONTAINER_NAME" '{
  containerOverrides: [
    {
      name: $name,
      command: ["pnpm", "--filter", "@red-clover/cms", "migrate"]
    }
  ]
}')"

NETWORK_CONFIGURATION="$(jq -n \
  --argjson subnets "$SUBNET_JSON" \
  --argjson securityGroups "$SECURITY_GROUP_JSON" \
  '{awsvpcConfiguration: {subnets: $subnets, securityGroups: $securityGroups, assignPublicIp: "ENABLED"}}'
)"

RUN_TASK_JSON="$(aws ecs run-task \
  --cluster "$ECS_CLUSTER" \
  --launch-type FARGATE \
  --task-definition "$TASK_DEFINITION" \
  --overrides "$OVERRIDES" \
  --network-configuration "$NETWORK_CONFIGURATION" \
  --output json)"

TASK_ARN="$(printf '%s' "$RUN_TASK_JSON" | jq -r '.tasks[0].taskArn')"

if [ -z "$TASK_ARN" ] || [ "$TASK_ARN" = "null" ]; then
  echo "Failed to start migration task."
  printf '%s\n' "$RUN_TASK_JSON"
  exit 1
fi

aws ecs wait tasks-stopped \
  --cluster "$ECS_CLUSTER" \
  --tasks "$TASK_ARN"

EXIT_CODE="$(aws ecs describe-tasks \
  --cluster "$ECS_CLUSTER" \
  --tasks "$TASK_ARN" \
  --query "tasks[0].containers[?name==\`$ECS_CONTAINER_NAME\`].exitCode | [0]" \
  --output text)"

if [ "$EXIT_CODE" != "0" ]; then
  echo "Migration task failed with exit code: $EXIT_CODE"
  aws ecs describe-tasks --cluster "$ECS_CLUSTER" --tasks "$TASK_ARN" --output json
  exit 1
fi

aws ecs update-service \
  --cluster "$ECS_CLUSTER" \
  --service "$ECS_SERVICE" \
  --task-definition "$TASK_DEFINITION" \
  --force-new-deployment >/dev/null

echo "CMS migrations succeeded and ECS service updated to ${TASK_DEFINITION}."
