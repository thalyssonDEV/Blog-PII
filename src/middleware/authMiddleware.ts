import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Estendendo a interface Request do Express para incluir nossa propriedade userId
export interface AuthRequest extends Request {
    userId?: number;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Pega o token do cabeçalho 'Authorization'
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ mensagem: 'Acesso negado. Nenhum token fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verifica e decodifica o token
        const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: number };
        
        // Anexa o ID do usuário ao objeto da requisição para ser usado nas rotas
        req.userId = decoded.userId;
        
        // Passa para a próxima etapa (a lógica da rota)
        next();
    } catch (error) {
        res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
    }
};