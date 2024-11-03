import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function fetchReportsHandler(req, res) {
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'You must be logged in to view reports' });
  }

  try {
    const { userId, role } = jwt.verify(token, process.env.JWT_SECRET);
    if (role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to view reports' });
    }
    
    //fetch reported blog posts and comments sorted by reportCount
    const reportedPosts = await prisma.blogPost.findMany({
      where: { reportCount: { gt: 0 } },
      orderBy: { reportCount: 'desc' },
    });

    const reportedComments = await prisma.comment.findMany({
      where: { reportCount: { gt: 0 } },
      orderBy: { reportCount: 'desc' },
    });

    return res.status(200).json({ reportedPosts, reportedComments })

  } catch (error) {
    console.error("Error in fetching reports:", error);
    return res.status(500).json({ error: 'Unable to fetch reports', error: error.message });
  }
}