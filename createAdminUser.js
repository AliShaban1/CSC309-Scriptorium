const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createAdminUser() {
  try {
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
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
