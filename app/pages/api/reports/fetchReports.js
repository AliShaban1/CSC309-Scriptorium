import { PrismaClient } from "@prisma/client";
import { protect, adminOnly } from "../../../middleware/auth";

const prisma = new PrismaClient();

const fetchReportsHandler = async (req, res) => {
  try {
    // Fetch reported blog posts and comments sorted by reportCount
    const reportedPosts = await prisma.blogPost.findMany({
      where: { reportCount: { gt: 0 } },
      orderBy: { reportCount: 'desc' },
    });

    const reportedComments = await prisma.comment.findMany({
      where: { reportCount: { gt: 0 } },
      orderBy: { reportCount: 'desc' },
    });

    return res.status(200).json({ reportedPosts, reportedComments });
  } catch (error) {
    console.error("Error in fetching reports:", error);
    return res.status(500).json({ error: 'Unable to fetch reports', details: error.message });
  }
};

export default protect(adminOnly(fetchReportsHandler));