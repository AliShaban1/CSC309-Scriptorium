import { PrismaClient } from "@prisma/client";
import { protect, adminOnly } from "../../../middleware/auth";

const prisma = new PrismaClient();

const hideContentHandler = async (req, res) => {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} not allowed`);
  }

  const { contentId, contentType } = req.body;
  
  try {
    let content;
    if (contentType === 'post') {
      content = await prisma.blogPost.update({
        where: { id: contentId },
        data: { hidden: true },
      });
    } else if (contentType === 'comment') {
      content = await prisma.comment.update({
        where: { id: contentId },
        data: { hidden: true },
      });
    }

    return res.status(200).json({ message: 'Content hidden successfully', content });
  } catch (error) {
    console.error("Error hiding content:", error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export default protect(adminOnly(hideContentHandler));