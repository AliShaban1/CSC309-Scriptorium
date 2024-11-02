import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const pageSize = 10;

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

      const { id, title, description, tags, templateIds, authorId, page } = req.body;

      const filters = {};

      if (id && Number(id)) {
        filters.id = id;
      }
      if (authorId && Number(authorId)) {
        filters.authorId = Number(authorId);
      }
      if (title) {
        filters.title = {
          contains: title,
        }
      }
      if (description) {
        filters.description = {
          contains: description,
        }
      }
      if (tags) {
        let tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
        filters.tags = {
          some: {
            name: { in: tagArray }
          }
        }
      }
      if (templateIds) {
        let templateIdArray = templateIds.split(',').map(templateId => Number(templateId));
        filters.templates = {
          some: {
            id: { in: templateIdArray }
          }
        }
      }

      const blogPosts = await prisma.blogPost.findMany({
        orderBy,
        where: filters,
        include: {
          comments: {
            orderBy: { rating: 'desc' },
          },
          tags: true
        },
      });
      let pageNumber = 1;
      if (page && Number(page)) {
        pageNumber = Number(page);
      }
      const firstOnPage = (pageNumber - 1) * pageSize;
      const blogPostPage = blogPosts.slice(firstOnPage, firstOnPage + pageSize - 1);

      return res.status(200).json(blogPostPage);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return res.status(400).json({ error: 'Failed to retrieve blog posts' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
