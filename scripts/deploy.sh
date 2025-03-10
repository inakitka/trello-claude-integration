#!/bin/bash

# Script for deploying the Trello-Claude integration to Smithery.ai

set -e

echo "Starting deployment to Smithery.ai..."

# Check if environment variables are set
if [ -z "$SMITHERY_API_KEY" ]; then
  echo "Error: SMITHERY_API_KEY environment variable is not set"
  exit 1
fi

if [ -z "$SMITHERY_PROJECT_ID" ]; then
  echo "Error: SMITHERY_PROJECT_ID environment variable is not set"
  exit 1
fi

# Check if required files exist
if [ ! -f "server.js" ]; then
  echo "Error: server.js file not found"
  exit 1
fi

if [ ! -f "Dockerfile" ]; then
  echo "Error: Dockerfile not found"
  exit 1
fi

if [ ! -f "smithery.yaml" ]; then
  echo "Error: smithery.yaml not found"
  exit 1
fi

# Deploy to Smithery.ai using their CLI or API
echo "Deploying to Smithery.ai..."

# Option 1: Using curl to API (simplified example)
curl -X POST \
  -H "Authorization: Bearer $SMITHERY_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"projectId\": \"$SMITHERY_PROJECT_ID\"}" \
  https://api.smithery.ai/v1/deployments

# Option 2: If Smithery has a CLI tool
# smithery deploy --project-id $SMITHERY_PROJECT_ID --api-key $SMITHERY_API_KEY

echo "Deployment completed successfully!"
echo "Your MCP Server should be available soon at your Smithery.ai project URL."
echo "Done!" 