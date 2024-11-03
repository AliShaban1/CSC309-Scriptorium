import { PrismaClient } from '@prisma/client';
import { protect } from '../../../middleware/auth';
const prisma = new PrismaClient();

const pageSize = 10;


const createBlogPost = async (req, res) => {
    // create a new blog post 
    let { title, description, tags, templateIds} = req.body;
    let authorId = req.userId;
    if (!title || !description || !tags) {
      return res.status(400).json({ error: 'Title, description, and tags are required' });
    }

    authorId = Number(authorId)

    let tagConnections = [];
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      tagConnections = tagArray.map(tag => ({
        where: { name: tag },
        create: { name: tag }
      }));
    }

    let templateConnections = [];
    if (templateIds) {
      const templateArray = templateIds.split(',').map(templateId => parseInt(templateId.trim()));
      templateConnections = templateArray.map(templateId => ({
        id: templateId
      }));
    }

    try {
      const data = {
        title,
        description,
        authorId,
        tags: {
          connectOrCreate: tagConnections
        },
        templates: {
          connect: templateConnections
        }
      };;

      const newPost = await prisma.blogPost.create({
        data,
        include: {
          tags: true,
        },
      });

      return res.status(201).json(newPost);
    } catch (error) {
      return res.status(400).json({ error: "Failed to create Blog" });
    }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return protect(createBlogPost)(req, res);
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

      filters.OR = [
        { hidden: false }, // Publicly visible posts
        { hidden: true, authorId: userId }, // Hidden posts visible only to the author
      ]
      const blogPosts = await prisma.blogPost.findMany({
        where: filters,
        orderBy,
        include: {
          comments: {
            where: { hidden: false},
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
