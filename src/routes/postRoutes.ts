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
        .isLength({ max: 50 }).withMessage('O título não pode ter mais de 100 caracteres.')
        .trim().escape(),
    body('conteudo')
        .notEmpty().withMessage('O conteúdo é obrigatório.')
        .isLength({ max: 1500 }).withMessage('O conteúdo não pode ter mais de 1500 caracteres.')
        .trim().escape()
];

// Rota para buscar TODOS os posts (para o feed principal)
// Usamos o authMiddleware para proteger esta rota
router.get('/posts', authMiddleware, async (req: Request, res: Response) => {
    try {
        const posts = await prisma.post.findMany({
            // Ordena pelos mais recentes primeiro
            orderBy: {
                createdAt: 'desc'
            },
            // Inclui os dados do autor de cada post
            include: {
                autor: {
                    select: {
                        id: true,
                        nome: true,
                        foto_url: true
                    }
                }
            }
        });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao buscar posts." });
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

export default router;