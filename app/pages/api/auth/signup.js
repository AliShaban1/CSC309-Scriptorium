import { Prisma, PrismaClient } from "@prisma/client";
import { hashPassword, generateToken } from "../../../lib/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
	if (req.method === "POST") {
		const {
			firstName,
			lastName,
			email,
			password,
			phoneNumber,
			profilePicture,
			role,
		} = req.body;

		try {
			//check if user already exists
			const existingUser = await prisma.user.findUnique({ where: { email } });
			if (existingUser) {
				return res.status(400).json({ message: "User already exists" });
			}
			//hash password and create user
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

			//generate token
			const token = generateToken(user.id);
			return res
				.status(201)
				.json({ token, user: { id: user.id, email: user.email } });
		} catch (error) {
			return res.status(500).json({ error: "Internal server error" });
		}
	} else {
		res.setHeader("Allow", ["POST"]);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
