import cloudinary from 'cloudinary';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer to save files locally in an "uploads" directory
const upload = multer({ dest: 'uploads/' });

export const config = {
  api: {
    bodyParser: false, // Disable body parser for file uploads
  },
};

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve(result);
    });
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} not allowed`);
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);

    // Run multer middleware to handle the file upload
    await runMiddleware(req, res, upload.single('profilePicture'));

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Path to the uploaded file
    const filePath = path.join(process.cwd(), req.file.path);

    const result = await cloudinary.v2.uploader.upload(filePath);

    // Update the user's profile picture URL in your database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: result.secure_url },
    });

    // Remove the local file after upload
    fs.unlinkSync(filePath);

    // Send the response
    return res.status(200).json({
      message: 'User avatar updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in handler:", error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
