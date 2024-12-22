import { PrismaClient } from "@prisma/client";
import { hashPassword, generateToken } from "../../../lib/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { firstName, lastName, email, password, phoneNumber, profilePicture, role } =
      req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long and include both letters and numbers." });
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists." });
      }

      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          phoneNumber,
          profilePicture,
          role,
        },
      });

      const token = generateToken(user.id);
      return res.status(201).json({ token, user: { id: user.id, email: user.email } });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
