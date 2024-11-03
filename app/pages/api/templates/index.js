const { PrismaClient } = require('@prisma/client')
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const supportedLanguages = ["python", "cpp", "c", "java", "javascript"];
const pageSize = 10;

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const token = req.headers.authorization.split(' ')[1];
            let { title, code, language, explanation, tags, forked, forkedId } = req.body;

            if (!token) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            const { userId } = jwt.verify(token, process.env.JWT_SECRET);

            // check for absolutely necessary fields
            if (!title || !code || !authorId || !language) {
                return res.status(400).json({ error: "Missing required fields." });
            }

            // add default values to fields that aren't required
            if (!explanation) {
                explanation = "";
            }

            if (!forked) {
                forked = false;
            }

            // convert to proper data types
            forked = (forked === 'true');

            let authorId = userId;

            if (forkedId) {
                forkedId = parseInt(forkedId);
            }

            // ensure author is valid
            // this is where we should also authenticate the user
            let author = await prisma.user.findUnique({
                where: {
                    id: authorId
                }
            });
            if (author === null) {
                return res.status(400).json({ error: "Invalid user." });
            }

            // if it has been forked from another template, make sure it exists
            if (forked) {
                let forkedTemplate = await prisma.template.findFirst({
                    where: {
                        id: forkedId
                    }
                });
                if (forkedTemplate === null) {
                    // if the forkedId doesn't exist, just say it's not forked
                    forked = false;
                };
            }

            // make sure language is actually supported
            if (!supportedLanguages.includes(language)) {
                return res.status(400).json({ error: "Unsupported language." });
            }

            // if there are tags, we need to split them by comma
            let tagConnections = [];
            if (tags) {
                const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
                tagConnections = tagArray.map(tag => ({
                    where: { name: tag },
                    create: { name: tag }
                }));
            }

            // now, save the actual template
            let template;
            if (forked) {
                template = await prisma.template.create({
                    data: {
                        title,
                        code,
                        language,
                        explanation,
                        tags: {
                            connectOrCreate: tagConnections
                        },
                        author: { connect: { id: authorId } },
                        forked,
                        forkedFrom: { connect: { id: forkedId } }
                    }
                });
            } else {
                template = await prisma.template.create({
                    data: {
                        title,
                        code,
                        language,
                        explanation,
                        tags: {
                            connectOrCreate: tagConnections
                        },
                        author: { connect: { id: authorId } },
                        forked
                    }
                });
            }

            return res.status(201).json(template);
        } catch (error) {
            return res.status(400).json({ error: "Unable to upload template." });
        }

    } else if (req.method === 'GET') {
        const { id, title, code, tags, authorId, page } = req.body;
        const filters = {};

        // add the search filters if they are actually valid
        if (id && Number(id)) {
            filters.id = Number(id);
        }
        if (authorId && Number(authorId)) {
            filters.authorId = Number(authorId);
        }
        if (title) {
            filters.title = {
                contains: title,
            }
        }
        if (code) {
            filters.code = {
                contains: code,
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
        let pageNumber = 1;
        if (page && Number(page) && Number(page) > 0) {
            pageNumber = parseInt(page);
        }

        const templates = await prisma.template.findMany({ where: filters, include: { author: true, tags: true } });
        const firstOnPage = (pageNumber - 1) * pageSize;

        const templatesPage = templates.slice(firstOnPage, firstOnPage + pageSize - 1);

        return res.status(200).json({ results: templatesPage });
    } else {
        return res.status(400).json({ error: "Method not supported." })
    }
}