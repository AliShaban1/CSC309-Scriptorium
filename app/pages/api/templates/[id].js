import { protect } from '../../../middleware/auth';

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient();

const updateTemplate = async (req, res) => {
    const { id } = req.query;
    const { title, explanation, tags, code } = req.body;

    const userId = Number(req.userId);

    // check that id is actually valid
    if (!Number(id)) {
        return res.status(404).json({ error: "Invalid ID." })
    }

    const initialTemplate = await prisma.template.findUnique({
        where: { id: Number(id) },
        include: { author: true }
    });

    if (!initialTemplate) {
        return res.status(404).json({ error: "Invalid ID." });
    } else if (initialTemplate.author.id !== userId) {
        return res.status(401).json({ error: "Cannot update a template that doesn't belong to you!" })
    }

    const data = {};
    if (title) {
        data.title = title;
    }

    if (explanation) {
        data.explanation = explanation;
    }

    if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
        const tagConnections = tagArray.map(tag => ({
            where: { name: tag },
            create: { name: tag }
        }));
        data.tags = { connectOrCreate: tagConnections };
    }

    if (code) {
        data.code = code;
    }

    try {
        const template = await prisma.template.update({
            where: { id: Number(id) },
            data: data,
        });

        return res.status(200).json(template);
    } catch (error) {
        return res.status(404).json({ error: "Invalid ID or data." })
    }
}

const deleteTemplate = async (req, res) => {
    const { id } = req.query;
    if (!Number(id)) {
        return res.status(404).json({ error: "Invalid ID." });
    }

    const userId = Number(req.userId);
    try {
        const initialTemplate = await prisma.template.findUnique({
            where: { id: Number(id) },
            include: { author: true }
        });

        if (!initialTemplate) {
            return res.status(404).json({ error: "Invalid ID." });
        } else if (initialTemplate.author.id !== userId) {
            return res.status(401).json({ error: "Cannot delete a template that does not belong to you!" })
        }
        const deleted = await prisma.template.delete({
            where: { id: Number(id) },
        })
        return res.status(200).json(deleted);
    } catch (error) {
        return res.status(404).json({ error: `Error: ${error}` })
    }
}

export default async function handler(req, res) {
    if (req.method === "PUT") {
        return protect(updateTemplate)(req, res);
    } else if (req.method === "DELETE") {
        return protect(deleteTemplate)(req, res);
    } else if (req.method === "GET") {
        const { id } = req.query;
        if (!Number(id)) {
            return res.status(404).json({ error: "Invalid ID." });
        }
        try {
            const requested = await prisma.template.findFirst({
                where: { id: Number(id) },
                include: { tags: true, blogPosts: true }
            })
            if (requested === null) {
                return res.status(404).json({ error: `Template with ID ${id} not found.` })
            }
            return res.status(200).json(requested);
        } catch (error) {
            return res.status(404).json({ error: "Invalid ID." })
        }
    } else {
        res.status(405).json({ error: "Method not allowed." })
    }
}