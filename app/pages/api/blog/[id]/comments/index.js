import { PrismaClient } from '@prisma/client';
import { protect } from '../../../../../middleware/auth';
const prisma = new PrismaClient();

const createComment = async (req, res) => {
    const { id } = req.query;
    let { content, parentId } = req.body;
    const authorId = req.userId;
    try {
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        // validate parent id 
        if (parentId) {
            const parentComment = await prisma.comment.findUnique({
                where: { id: parseInt(parentId) },
            });
            if (!parentComment || parentComment.hidden) {
                return res.status(400).json({ error: 'Invalid parentId: parent comment does not exist or is hidden' });
            }
            if (parentComment.postId !== parseInt(id)) {
                return res.status(400).json({ error: 'Invalid parentId: parent comment does not belong to this blog post' });
            }
        }
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
    // check if authenticated user 
    const authHeader = req.headers.authorization;
    let userId = null;

    if (authHeader) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.userId;
        } catch (error) {
            // proceed as unathenticated 
        }
    }
    try {
        const filters = { postId: parseInt(id), parentId: null };
        if (userId) {
            // show non hidden posts or hidden posts authored by them for authenitcated users
            filters.OR = [
              { hidden: false },
              { hidden: true, authorId: userId },
            ];
        } else {
            // show only non hidden posts for unauthenticated users
            filters.hidden = false;
        }
      const comments = await prisma.comment.findMany({
        where: filters,
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
