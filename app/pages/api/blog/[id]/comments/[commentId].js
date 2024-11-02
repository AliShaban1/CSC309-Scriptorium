import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { commentId } = req.query;
    const id = commentId;
    if (req.method === 'POST') {
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

            const post = await prisma.comment.findUnique({
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
                    updatedPost = await prisma.comment.update({
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
                        updatedPost = await prisma.comment.update({
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
                    updatedPost = await prisma.comment.update({
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
                    updatedPost = await prisma.comment.update({
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
                        updatedPost = await prisma.comment.update({
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
                    updatedPost = await prisma.comment.update({
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

            const fullyUpdatedPost = await prisma.comment.update({
                where: { id: parseInt(id) },
                data: { rating: newRating }
            });

            return res.status(200).json(fullyUpdatedPost);
        } catch (error) {
            return res.status(400).json({ error: `Failed to update blog post: ${error}` });
        }
    }
}