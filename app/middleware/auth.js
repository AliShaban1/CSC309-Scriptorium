import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const protect = (handler) => async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token is missing' });
  }

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch the user from the database to get the role
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    req.userId = userId;
    req.userRole = user.role; // Attach the role to the request object

    return handler(req, res);
  } catch (error) {
    return res.status(500).json({ message: 'Invalid token' });
  }
}

// Middleware to restrict access to admin users only
export const adminOnly = (handler) => (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  return handler(req, res);
};