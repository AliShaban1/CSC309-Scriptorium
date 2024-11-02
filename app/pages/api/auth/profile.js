import { Prisma, PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { firstName, lastName, phoneNumber, profilePicture } = req.body;
    const token = req.headers.authorization.split(' ')[1];

    try {
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { userId } = jwt.verify(token, process.env.JWT_SECRET);

      //update user profile
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          phoneNumber,
          profilePicture
        }
      });
      return res.status(200).json({ message: 'User profile updated successfully', user: updatedUser });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}