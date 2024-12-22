import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);

    if (req.method === 'GET') {
      // Fetch user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          profilePicture: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ user });
    } else if (req.method === 'PUT') {
      // Update user profile
      const { firstName, lastName, phoneNumber, profilePicture } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          phoneNumber,
          profilePicture,
        },
      });

      return res.status(200).json({ message: 'User profile updated successfully', user: updatedUser });
    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).end(`Method ${req.method} not allowed`);
    }
  } catch (error) {
    return res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
}
