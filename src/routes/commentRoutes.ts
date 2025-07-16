import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { CommentService } from '../classes/CommentService';

const router = Router();
const commentService = new CommentService();

// Regras de validação para novos comentários
const regrasValidacaoComentario = [
    body('texto')
        .notEmpty().withMessage('O comentário não pode estar vazio.')
        .isLength({ max: 300 }).withMessage('O comentário não pode ter mais de 300 caracteres.')
        .trim().escape(),
];

// Rota para criar um novo comentário em um post específico
router.post('/posts/:postId/comentarios', authMiddleware, regrasValidacaoComentario, async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ erros: errors.array() });
    }

    try {
        const autorId = req.userId;
        const postId = parseInt(req.params.postId, 10);

        if (!autorId) {
            return res.status(401).json({ mensagem: "Usuário não autenticado." });
        }
        if (isNaN(postId)) {
            return res.status(400).json({ mensagem: "ID de post inválido." });
        }

        const novoComentario = await commentService.criarComentario(autorId, postId, req.body);
        res.status(201).json({ mensagem: "Comentário adicionado com sucesso!", comentario: novoComentario });

    } catch (error) {
        console.error("Erro ao criar comentário:", error);
        res.status(500).json({ mensagem: "Erro interno ao salvar o comentário." });
    }
});

export default router;