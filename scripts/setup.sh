#!/bin/bash

# Script for setting up the Trello-Claude integration project

set -e

echo "Setting up Trello-Claude integration project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed"
  echo "Please install Node.js 18 or later: https://nodejs.org/"
  exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "Error: Node.js version 18 or later is required"
  echo "Current version: $(node -v)"
  echo "Please upgrade Node.js: https://nodejs.org/"
  exit 1
fi

# Create .env file from example if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file from .env.example..."
  cp .env.example .env
  echo "Please edit .env file with your API keys"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Initialize Git repository if it doesn't exist
if [ ! -d .git ]; then
  echo "Initializing Git repository..."
  git init
  git add .
  git commit -m "Initial commit"
fi

echo "Setup completed successfully!"
echo "Next steps:"
echo "1. Edit the .env file with your API keys"
echo "2. Run 'npm test' to ensure everything is working"
echo "3. Deploy with 'npm run deploy' or set up GitHub Actions" 