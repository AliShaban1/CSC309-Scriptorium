import { PrismaClient } from "@prisma/client";
import { comparePassword, generateToken } from "../../../lib/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      //check if user exists
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      //compare password
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      //generate token
      const token = generateToken(user.id);
      return res.status(200).json({ token, user: { id: user.id, email: user.email } });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}