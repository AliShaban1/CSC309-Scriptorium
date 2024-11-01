import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // create a new blog post 
    const { title, description, tags, templateIds, authorId } = req.body;

    if (!title || !description || !authorId) {
      return res.status(400).json({ error: 'Title, description, and authorId are required' });
    }

    // VALIDATE AUTHOR ID LATER

    try {
        const data = {
            title,
            description,
            authorId,
            tags: {
              connectOrCreate: tags.map((tag) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            },
          };;
          
          const newPost = await prisma.blogPost.create({
            data,
            include: {
                tags: true,
            },
          });
          
      return res.status(201).json(newPost);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create blog post' });
    }
  } else if (req.method === 'GET') {

    try {
      let orderBy = { rating: 'desc' }; 
      const blogPosts = await prisma.blogPost.findMany({
        orderBy,
        include: {
          comments: {
            orderBy: { rating: 'desc' },
          },
        },
      });

      return res.status(200).json(blogPosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return res.status(500).json({ error: 'Failed to retrieve blog posts' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
