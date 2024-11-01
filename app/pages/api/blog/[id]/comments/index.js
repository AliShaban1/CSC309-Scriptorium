import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default async function handler(req, res) {
  const { id } = req.query; 

  if (req.method === 'GET') {
    
    try {
      const comments = await prisma.comment.findMany({
        where: { postId: parseInt(id), parentId: null }, // only fetch only top level comments 
        orderBy: { rating: 'desc' },
        include: {
          Replies: {
            orderBy: { rating: 'desc' },
          },
        },
      });

      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve comments' });
    }
  } else if (req.method === 'POST') {
    const { content, authorId, parentId } = req.body;

    if (!content || !authorId) {
      return res.status(400).json({ error: 'Content and authorId are required' });
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
      res.status(500).json({ error: 'Failed to create comment' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
