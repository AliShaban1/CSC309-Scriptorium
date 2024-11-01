import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const blogPost = await prisma.blogPost.findUnique({
        where: { id: parseInt(id) },
        include: {
          comments: {
            orderBy: { rating: 'desc' },
          },
          tags: true,
        },
      });

      if (!blogPost) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
      res.status(200).json(blogPost);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get blog post' });
    }
  } else if (req.method === 'PUT') {
    const { title, description, tags, templateIds } = req.body;

    try {
      const updatedPost = await prisma.blogPost.update({
        where: { id: parseInt(id) },
        data: {
          title,
          description,
          tags,
          templateIds,
        },
      });

      res.status(200).json(updatedPost);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update blog post' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.blogPost.delete({
        where: { id: parseInt(id) },
      });

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete blog post' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
