#!/bin/bash

# Exit on any error
set -e

echo "Starting environment setup..."

# Step 1: Create the .env file and add environment variables
echo "Creating .env file with environment variables..."
cat <<EOL > .env
# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB, and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"

JWT_SECRET="3d3bf0ed81d42788943088953085ff76e1e2a94b22697e032d5f4d2025734678"

# Cloudinary credentials
CLOUDINARY_CLOUD_NAME="dvvz3o66x"
CLOUDINARY_API_KEY="263781414727465"
CLOUDINARY_API_SECRET="OEwFG93VfZ3nH_IMclvPrl89z0U"
EOL
echo ".env file created successfully."

# Step 2: Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

# Step 3: Install all required packages via npm
echo "Installing npm packages..."
npm install

# Step 4: Run Prisma migrations to set up the database
echo "Running Prisma migrations..."
npx prisma migrate dev --name init

# Step 5: Generate the Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Step 6: Check for Node.js (you can remove Python/Java checks if not needed)
echo "Checking for Node.js..."
if ! command -v node &> /dev/null
then
    echo "Error: Node.js is not installed. Please install Node.js to proceed."
    exit 1
else
    echo "Node.js is installed."
fi

# Step 7: Create an admin user
echo "Creating an admin user..."
node -e "
  const { PrismaClient } = require('@prisma/client');
  const bcrypt = require('bcrypt');
  const prisma = new PrismaClient();
  
  async function createAdminUser() {
    const hashedPassword = await bcrypt.hash('adminpassword', 10);
    await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      }
    });
    console.log('Admin user created successfully with email: admin@example.com and password: adminpassword');
  }

  createAdminUser()
    .catch((error) => {
      console.error('Error creating admin user:', error);
    })
    .finally(() => {
      prisma.$disconnect();
    });
"

echo "Environment setup completed successfully!"
