import { PrismaClient } from '@prisma/client';
import { protect } from '../../../../middleware/auth';

const prisma = new PrismaClient();
const editBlogPost = async (req, res) => {
    const { id } = req.query;
    const { title, description, tags, templateIds } = req.body;

    let templateConnections = [];
    if (templateIds) {
      const templateArray = templateIds.split(',').map(templateId => parseInt(templateId.trim()));
      templateConnections = templateArray.map(templateId => ({
        id: templateId
      }));
    }
    let tagConnections = [];
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      tagConnections = tagArray.map(tag => ({
        where: { name: tag },
        create: { name: tag },
      }));
    }
    try {
      // Restrict editing if the post is hidden
      const blogPost = await prisma.blogPost.findUnique({
        where: { id: parseInt(id) },
      });

      if (!blogPost || blogPost.hidden) {
        return res.status(404).json({ error: 'Blog post not found' });
      }

      if (blogPost.authorId !== req.userId) {
        return res.status(403).json({ error: 'You do not have permission to edit this blog post' });
      }
      
      const updatedPost = await prisma.blogPost.update({
        where: { id: parseInt(id) },
        data: {
          title,
          description,
          tags: {
            connectOrCreate: tagConnections,
            },
          templates: {
            connect: templateConnections
          },
        },
        include: {
            tags: true,
        },
      });

      res.status(200).json(updatedPost);
    } catch (error) {
      res.status(400).json({ error: `Failed to update post: ${error}` });
    }
}

const deleteBlogPost = async (req, res) => {
    const { id } = req.query;
    if (!Number(id)) {
        return res.status(404).json({ error: "Invalid ID." });
    }
    try {
    const blogPost = await prisma.blogPost.findUnique({
        where: { id: Number(id) },
    });
    if (!blogPost) {
        return res.status(404).json({ error: "Blog post not found." });
    }
    if (blogPost.authorId !== req.userId) {
        return res.status(403).json({ error: "You do not have permission to delete this blog post." });
    }
    // user is authorized, delete the post 
    await prisma.blogPost.delete({
        where: { id: Number(id) },
    });

    return res.status(200).json({ message: "Blog post deleted." });
    } catch (error) {
    res.status(400).json({ error: `Failed to delete blog post: ${error}` });
    }
}

const rateBlogPost = async (req, res) => {
    // we'll use POST requests for rating
    const { id } = req.query;
    const authorId = req.userId;
    const { rating } = req.body;
    if (!rating) {
      return res.status(400).json({ error: "rating is required." });
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
}

const handler = async (req, res) => {

  if (req.method === 'GET') {
    try {
        const { id } = req.query;
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

        if (!blogPost || blogPost.hidden) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        res.status(200).json(blogPost);
    } catch (error) {
      res.status(400).json({ error: 'Failed to get blog post' });
    }
  } else if (req.method === 'PUT') {
    return protect(editBlogPost)(req, res);
  } else if (req.method === 'DELETE') {
    return protect(deleteBlogPost)(req, res);
  } else if (req.method === 'POST') {
    return protect(rateBlogPost)(req, res);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default protect(handler);