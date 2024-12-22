import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function reportContentHandler(req, res) { 
  const { contentId, contentType, explanation } = req.body;
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'You must be logged in to report content' });
  }

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);

    //create new report
    const report = await prisma.report.create({
      data: {
        contentId: contentId,
        contentType: contentType,
        explanation: explanation,
        userId: userId
      }
    });

    //increment report count on the reported content
    if (contentType === 'post') {
      await prisma.blogPost.update({
        where: { id: contentId },
        data: { reportCount: { increment: 1 } }
      });
    } else if (contentType === 'comment') {
      await prisma.comment.update({
        where: { id: contentId },
        data: { reportCount: { increment: 1 } }
      });
    }
    return res.status(201).json({ message: 'Report created successfully', report });
  } catch (error) {
    console.error("Error in reporting content:", error);
    return res.status(500).json({ error: 'Unable to report content', error: error.message });
  } 
}