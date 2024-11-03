import { PrismaClient } from '@prisma/client';
import { protect, adminOnly } from '../../../../middleware/auth';

const prisma = new PrismaClient();

const handler = async (req, res) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const blogPost = await prisma.blogPost.findUnique({
        where: { id: parseInt(id) },
        include: {
          comments: {
            where: { hidden: false }, // Only include non-hidden comments
            orderBy: { rating: 'desc' },
          },
          tags: true,
          liked: true,
          disliked: true
        },
      });

      if (!blogPost) {
        return res.status(404).json({ error: 'Blog post not found' });
      }

      // Check if the post is hidden and if the requester is not the author
      if (blogPost.hidden && blogPost.authorId !== userId) {
        return res.status(403).json({ error: 'You do not have permission to view this post' });
      }

      res.status(200).json(blogPost);
    } catch (error) {
      res.status(400).json({ error: 'Failed to get blog post' });
    }
  } else if (req.method === 'PUT') {
    const { title, description, tags, templateIds } = req.body;

    let templateConnections = [];
    if (templateIds) {
      const templateArray = templateIds.split(',').map(templateId => parseInt(templateId.trim()));
      templateConnections = templateArray.map(templateId => ({
        id: templateId
      }));
    }

    try {
      // Restrict editing if the post is hidden
      const blogPost = await prisma.blogPost.findUnique({
        where: { id: parseInt(id) },
      });

      if (!blogPost) {
        return res.status(404).json({ error: 'Blog post not found' });
      }

      if (blogPost.hidden && blogPost.authorId === userId) {
        return res.status(403).json({ error: 'You cannot edit a hidden blog post' });
      }

      const { title, description, tags, templateIds } = req.body;
      const updatedPost = await prisma.blogPost.update({
        where: { id: parseInt(id) },
        data: {
          title,
          description,
          tags,
          templates: {
            connect: templateConnections
          },
        },
      });

      res.status(200).json(updatedPost);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update blog post' });
    }
  } else if (req.method === 'DELETE') {
    if (!Number(id)) {
      return res.status(404).json({ error: "Invalid ID." });
    }
    try {
      await prisma.blogPost.delete({
        where: { id: Number(id) },
      });

      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: `Failed, ${error}` });
    }
  } else if (req.method === 'POST') {
    // we'll use POST requests for rating
    const { authorId, rating } = req.body;
    if (!authorId || !rating) {
      return res.status(400).json({ error: "authorId and rating are required." });
    }

    if (!Number(rating)) {
      return res.status(400).json({ error: "Invalid rating." });
    }
    let upOrDown = 0;
    if (Number(rating) >= 0) {
      upOrDown = 1;
    } else {
      upOrDown = -1;
    }

    try {
      // we need to check if the user has already liked this post

      const post = await prisma.blogPost.findUnique({
        where: { id: parseInt(id) },
        include: {
          liked: true,
          disliked: true,
        },
      });

      const likedByUser = post.liked.some(user => user.id === Number(authorId));
      const dislikedByUser = post.disliked.some(user => user.id === Number(authorId));

      let updatedPost;

      if (upOrDown === 1) {
        if (likedByUser) {
          // user already liked this post, so unlike it
          updatedPost = await prisma.blogPost.update({
            where: { id: parseInt(id) },
            data: {
              liked: {
                disconnect: {
                  id: Number(authorId)
                }
              }
            },
            include: { liked: true, disliked: true }
          });
        } else {
          if (dislikedByUser) {
            // user disliked post previously
            updatedPost = await prisma.blogPost.update({
              where: { id: parseInt(id) },
              data: {
                disliked: {
                  disconnect: {
                    id: Number(authorId)
                  }
                }
              },
            });
          }
          updatedPost = await prisma.blogPost.update({
            where: { id: parseInt(id) },
            data: {
              liked: {
                connect: {
                  id: Number(authorId)
                }
              }
            },
            include: { liked: true, disliked: true }
          });
        }
      } else {
        if (dislikedByUser) {
          // user already disliked post, undislike it now
          updatedPost = await prisma.blogPost.update({
            where: { id: parseInt(id) },
            data: {
              disliked: {
                disconnect: {
                  id: Number(authorId)
                }
              }
            },
            include: { liked: true, disliked: true }
          });
        } else {
          if (likedByUser) {
            // user had previously liked the post
            updatedPost = await prisma.blogPost.update({
              where: { id: parseInt(id) },
              data: {
                liked: {
                  disconnect: {
                    id: Number(authorId)
                  }
                }
              },
            });
          }
          updatedPost = await prisma.blogPost.update({
            where: { id: parseInt(id) },
            data: {
              disliked: {
                connect: {
                  id: Number(authorId)
                }
              }
            },
            include: { liked: true, disliked: true }
          });
        }
      }
      const newRating = updatedPost.liked.length - updatedPost.disliked.length;

      const fullyUpdatedPost = await prisma.blogPost.update({
        where: { id: parseInt(id) },
        data: { rating: newRating }
      });

      return res.status(200).json(fullyUpdatedPost);
    } catch (error) {
      return res.status(400).json({ error: `Failed to update blog post: ${error}` });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default protect(adminOnly(handler));