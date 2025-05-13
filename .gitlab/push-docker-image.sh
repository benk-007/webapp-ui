#!/bin/sh


# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Retrieve version from package.json
VERSION=$(node -pe "require('$SCRIPT_DIR/../package.json').version")

# Build Docker image with the retrieved version
docker build  --build-arg PROFILE=production -t registry.gitlab.com/xstay1/pms-ui:$VERSION -t registry.gitlab.com/xstay1/pms-ui:latest .

# Push Docker images
docker push registry.gitlab.com/pms-ui:$VERSION
docker push registry.gitlab.com/pms-ui:latest
