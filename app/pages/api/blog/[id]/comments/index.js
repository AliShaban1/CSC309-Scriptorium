import { PrismaClient } from '@prisma/client';
import { protect } from '../../../../middleware/auth';
const prisma = new PrismaClient();

const createComment = async (req, res) => {
    const { id } = req.query;
    let { content, parentId } = req.body;
    authorId = req.userId;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    // validate parent id 
    if (parentId) {
        const parentComment = await prisma.comment.findUnique({
            where: { id: parseInt(parentId) },
        });
        if (!parentComment) {
            return res.status(400).json({ error: 'Invalid parentId: parent comment does not exist' });
        }
        if (parentComment.postId !== parseInt(id)) {
            return res.status(400).json({ error: 'Invalid parentId: parent comment does not belong to this blog post' });
        }
        if (parentComment.hidden && parentComment.authorId === userId) {
          return res.status(403).json({ error: 'You cannot reply to a hidden comment' });
        }
    }

    try {
      const newComment = await prisma.comment.create({
        data: {
          content,
          authorId,
          postId: parseInt(id),
          parentId: parentId ? parseInt(parentId) : null, // set parent id if this is a reply to an existing comment
          rating: 0,
        },
      });

      res.status(201).json(newComment);
    } catch (error) {
      res.status(400).json({ error: "Failed to create comment." });
    }
}



export default async function handler(req, res) {
  
  if (req.method === 'GET') {
    const { id } = req.query;
    try {
      const comments = await prisma.comment.findMany({
        where: { postId: parseInt(id), parentId: null }, // only fetch only top level comments 
        OR: [
          { hidden: false }, // Publicly visible comments
          { hidden: true, authorId: userId }, // Hidden comments visible only to the author
        ],
        orderBy: { rating: 'desc' },
        include: {
          Replies: {
            where: { hidden: false }, // Only include non-hidden replies
            orderBy: { rating: 'desc' },
          },
        },
      });

      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve comments' });
    }
  } else if (req.method === 'POST') {
    return protect(createComment)(req, res);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
