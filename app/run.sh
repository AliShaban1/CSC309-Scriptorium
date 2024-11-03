#!/bin/bash

# Exit on any error
set -e

echo "Starting the server..."

# Load environment variables from .env file
if [ -f .env ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found. Please create a .env file with the required environment variables."
  exit 1
fi

# Start the server using npm
npm run start

echo "Server is running!"
