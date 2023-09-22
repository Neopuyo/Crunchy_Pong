#!/bin/bash
echo "Begin Next configuration"

cd home
yarn global add node-gyp
# Check if node_modules folder exists
if [ -d "node_modules" ]; then
  echo "already installed"
  yarn cache clean
  yarn install
else
  echo "Install required dependencies"
  yarn install
fi

# Check the value of ENVIRONNEMENT variable in .env file
ENVIRONNEMENT=$(grep -i 'ENVIRONNEMENT' .env | cut -d'=' -f2)

if [ "$ENVIRONNEMENT" == "dev" ]; then
  # Start dev env
  echo "Starting dev frontend environment"
  yarn run start:dev:frontend
elif [ "$ENVIRONNEMENT" == "build" ]; then
  # Start prod env
  echo "Starting prod frontend environment"
  yarn run start:prod:frontend
else
  echo "Unknown ENVIRONNEMENT value: $ENVIRONNEMENT"
fi
