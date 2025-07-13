import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { UserService } from '../classes/UserService';
import upload from '../config/multer';

const router = Router();
const userService = new UserService()

// --- Regras de Validação
const regrasValidacaoLogin = [
    body('email').isEmail().withMessage('Por favor, forneça um e-mail válido.'),
    body('senha').notEmpty().withMessage('A senha é obrigatória.')
];
const regrasValidacaoRegistro = [
    body('nome').notEmpty().withMessage('O nome é obrigatório.').trim().escape(),
    body('email').isEmail().withMessage('Por favor, forneça um e-mail válido.').normalizeEmail(),
    body('senha').isLength({ min: 8 }).withMessage('A senha precisa ter no mínimo 8 caracteres.')
];


// --- ROTA DE LOGIN REFATORADA ---
router.post('/login', regrasValidacaoLogin, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ erros: errors.array() });
    }

    try {
        const { email, senha } = req.body;
        // Delega a lógica de autenticação para o serviço
        const usuario = await userService.autenticar(email, senha);

        // A lógica de gerar o token (que é específica de HTTP/API) permanece aqui
        const token = jwt.sign(
            { userId: usuario.id },
            process.env.JWT_SECRET as string,
            { expiresIn: '8h' }
        );

        res.status(200).json({ mensagem: 'Login bem-sucedido!', token, usuario });

    } catch (error: any) {
        // Captura os erros lançados pelo serviço
        res.status(401).json({ mensagem: error.message });
    }
});


// --- ROTA DE REGISTRO REFATORADA ---
router.post(
    '/registro',
    upload.single('foto'),
    regrasValidacaoRegistro,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (req.file) require('fs').unlinkSync(req.file.path);
            return res.status(400).json({ erros: errors.array() });
        }

        try {
            // Delega a lógica de registro para o serviço
            const usuarioRegistrado = await userService.registrar(req.body, req.file);
            res.status(201).json({ mensagem: 'Usuário registrado com sucesso!', usuario: usuarioRegistrado });

        } catch (error: any) {
            // Captura os erros lançados pelo serviço
            if (error.message === 'Este e-mail já está cadastrado.') {
                return res.status(409).json({ mensagem: error.message });
            }
            res.status(500).json({ mensagem: 'Ocorreu um erro interno no servidor.' });
        }
    }
);

export default router;