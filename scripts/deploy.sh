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

# Create deployment package
echo "Creating deployment package..."
mkdir -p ./deploy
cp -r ./smithery ./deploy/
cp -r ./claude ./deploy/
cp package.json ./deploy/

# Install dependencies for production
echo "Installing production dependencies..."
cd ./deploy
npm install --production
cd ..

# Deploy to Smithery.ai
echo "Deploying to Smithery.ai..."
curl -X POST \
  -H "Authorization: Bearer $SMITHERY_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"projectId\": \"$SMITHERY_PROJECT_ID\", \"source\": \"$(cat ./deploy | base64)\"}" \
  https://api.smithery.ai/v1/deployments

echo "Deployment completed successfully!"

# Cleanup
echo "Cleaning up..."
rm -rf ./deploy

echo "Done!" 