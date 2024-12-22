import { PrismaClient } from '@prisma/client';
import { protect } from '../../../middleware/auth';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();

const pageSize = 6;


const createBlogPost = async (req, res) => {
  // create a new blog post 
  let { title, description, tags, templateIds } = req.body;
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
    return res.status(400).json({ error: `failed to create blog: ${error}` });
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return protect(createBlogPost)(req, res);
  } else if (req.method === 'GET') {

    try {
      let orderBy = { rating: 'desc' };

      const { id, title, description, tags, templateIds, authorId, page } = req.query;

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
      const authHeader = req.headers.authorization;
      let userId = null;

      if (authHeader) {
        try {
          const token = authHeader.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId;
        } catch (error) {
          // proceed as unauthenticated user
        }
      }
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
      const blogPosts = await prisma.blogPost.findMany({
        where: filters,
        orderBy,
        include: {
          comments: {
            where: { hidden: false },
            orderBy: { rating: 'desc' },
          },
          tags: true,
          author: true
        },
      });
      let pageNumber = 1;
      if (page && Number(page)) {
        pageNumber = Number(page);
      }
      const totalPages = Math.ceil(blogPosts.length / pageSize);
      const firstOnPage = (pageNumber - 1) * pageSize;

      const blogPostPage = blogPosts.slice(firstOnPage, firstOnPage + pageSize);

      return res.status(200).json({ results: blogPostPage, totalPages });
    } catch (error) {
      return res.status(400).json({ error: `Error: ${error}` });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
