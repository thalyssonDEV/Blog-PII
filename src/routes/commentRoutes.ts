import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { CommentService } from '../classes/CommentService';

const router = Router();
const commentService = new CommentService();

const regrasValidacaoComentario = [
    body('texto').notEmpty().withMessage('O texto do comentário é obrigatório.').trim().escape(),
    body('postId').notEmpty().withMessage('O ID do post é obrigatório.').isInt({ gt: 0 })
];

// O caminho PRECISA ser '/comentarios'
router.post('/comentarios', authMiddleware, regrasValidacaoComentario, async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ erros: errors.array() });
    }

    try {
        const autorId = req.userId;
        if (!autorId) {
            return res.status(401).json({ mensagem: 'Usuário não autenticado.' });
        }
        
        const { texto, postId } = req.body;
        const comentario = await commentService.criarComentario(autorId, postId, { texto });
        res.status(201).json({ mensagem: 'Comentário criado com sucesso!', comentario });

    } catch (error: any) {
        if (error.message.includes("Post não encontrado")) {
            return res.status(404).json({ mensagem: error.message });
        }
        res.status(500).json({ mensagem: 'Erro interno ao criar o comentário.' });
    }
});

export default router;