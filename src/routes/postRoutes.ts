import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../prismaClient';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { PostService } from '../classes/PostService';

const router = Router();
const postService = new PostService(); // Instancia o serviço de posts

// --- REGRAS DE VALIDAÇÃO PARA NOVOS POSTS ---
const regrasValidacaoPost = [
    body('titulo')
        .notEmpty().withMessage('O título é obrigatório.')
        .isLength({ max: 50 }).withMessage('O título não pode ter mais de 50 caracteres.')
        .trim().escape(),
    body('conteudo')
        .notEmpty().withMessage('O conteúdo é obrigatório.')
        .isLength({ max: 10000 }).withMessage('O conteúdo não pode ter mais de 10000 caracteres.')
        .trim().escape()
];

router.get('/posts', authMiddleware, async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = 5;
        const skip = (page - 1) * pageSize;

        const [totalPosts, posts] = await prisma.$transaction([
            prisma.post.count(),
            prisma.post.findMany({
                skip: skip,
                take: pageSize,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    autor: {
                        select: {
                            id: true,
                            nome: true,
                            foto_url: true,
                        },
                    },
                    _count: {
                        select: { comentarios: true }
                    }
                },
            })
        ]);

        const totalPages = Math.ceil(totalPosts / pageSize);

        res.status(200).json({
            posts,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao buscar os posts.' });
    }
});

// --- NOVA ROTA PARA CRIAR UM POST ---
router.post('/posts', authMiddleware, regrasValidacaoPost, async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ erros: errors.array() });
    }

    try {
        const userId = req.userId; // Pego do token pelo middleware
        if (!userId) {
            return res.status(401).json({ mensagem: "Usuário não autenticado." });
        }

        const postCriadoComAutor = await postService.criarPost(userId, req.body);
        res.status(201).json({ mensagem: "Post criado com sucesso!", post: postCriadoComAutor });

    } catch (error) {
        console.error("Erro ao criar post:", error);
        res.status(500).json({ mensagem: "Erro interno ao criar o post." });
    }
});

router.get('/posts/:postId', authMiddleware, async (req: Request, res: Response) => {
    try {
        const postId = parseInt(req.params.postId, 10);
        if (isNaN(postId)) {
            return res.status(400).json({ mensagem: "ID de post inválido." });
        }

        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                autor: { // Inclui os dados do autor do post
                    select: {
                        id: true,
                        nome: true,
                        foto_url: true
                    }
                },
                comentarios: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        autor: { // Para cada comentário, inclui os dados do autor
                            select: { nome: true, foto_url: true }
                        }
                    }
                }
            }
        });

        if (!post) {
            return res.status(404).json({ mensagem: "Post não encontrado." });
        }

        res.status(200).json(post);

    } catch (error) {
        console.error("Erro ao buscar o post:", error);
        res.status(500).json({ mensagem: "Erro interno ao buscar o post." });
    }
});


// --- NOVA ROTA PARA DELETAR UM POST ---
router.delete('/posts/:postId', authMiddleware, async (req: AuthRequest, res: Response) => {
    const autorId = req.userId;
    const postId = parseInt(req.params.postId, 10);

    if (!autorId) {
        return res.status(401).json({ mensagem: 'Usuário não autenticado.' });
    }
    if (isNaN(postId)) {
        return res.status(400).json({ mensagem: 'ID de post inválido.' });
    }

    try {
        await postService.deletarPost(postId, autorId);
        res.status(200).json({ mensagem: 'Post Deletado com Sucesso.' });
    } catch (error: any) {
        // Se o erro for de permissão, retorna 403 (Forbidden)
        if (error.message.includes('Permissão negada')) {
            return res.status(403).json({ mensagem: error.message });
        }
        res.status(500).json({ mensagem: 'Erro interno ao deletar o post.' });
    }
});

export default router;
