import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { UserService } from '../classes/UserService';
import { env } from '../config/env';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import multer from 'multer';
import prisma from '../prismaClient';

const router = Router();
const userService = new UserService()

 // --- Configuração do Multer (já deve existir, verifique se está como memoryStorage) ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Regras de Validação
const regrasValidacaoLogin = [
    body('email').isEmail().withMessage('Por favor, forneça um e-mail válido.'),
    body('senha').notEmpty().withMessage('A senha é obrigatória.')
];

const regrasValidacaoRegistro = [
    body('nome')
        .notEmpty().withMessage('O nome de usuário é obrigatório.')
        .isLength({ min: 3, max: 15 })
        .withMessage('O nome de usuário precisa ter entre 3 e 20 caracteres.')
        .not().contains(' ').withMessage('O nome de usuário não pode conter espaços.')
        .matches(/^[a-zA-Z0-9_@.-]+$/).withMessage('O nome de usuário contém caracteres inválidos.')
        .trim().escape(),

    body('email').isEmail().withMessage('Por favor, forneça um e-mail válido.').normalizeEmail(),
    body('senha').isLength({ min: 8 }).withMessage('A senha precisa ter no mínimo 8 caracteres.')
];

// --- NOVA ROTA PARA UPLOAD DE FOTO DE PERFIL ---
  router.post('/perfil/foto', authMiddleware, upload.single('foto'), async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhuma foto foi enviada.' });
    }

    try {
      const usuarioId = req.userId;

      // Validação para garantir que o userId foi passado pelo middleware
      if (!usuarioId) {
        return res.status(401).json({ erro: 'Token inválido ou usuário não autenticado.' });
      }

      const fotoArquivo = {
        originalname: req.file.originalname,
        buffer: req.file.buffer,
      };

      const novaFotoUrl = await userService.atualizarFotoPerfil(usuarioId, fotoArquivo);
      res.json({ mensagem: 'Foto de perfil atualizada com sucesso.', novaFotoUrl });

    } catch (error: any) {
      console.error('Erro ao atualizar foto de perfil:', error);
      res.status(500).json({ erro: error.message || 'Erro ao atualizar a foto de perfil.' });
    }
  });


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
            env.JWT_SECRET as string,
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

router.get('/perfil/meu', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId; // Pega o ID do usuário que o middleware anexou

        const perfil = await prisma.user.findUnique({
            where: { id: userId },
            // Seleciona os campos do usuário e inclui seus posts e comentários
            select: {
                id: true,
                nome: true,
                email: true,
                foto_url: true,
                posts: {
                    orderBy: { createdAt: 'desc' }
                },
                comentarios: {
                    orderBy: { createdAt: 'desc' },
                    include: { // Para cada comentário, inclui o título do post comentado
                        post: {
                            select: { titulo: true }
                        }
                    }
                }
            }
        });

        if (!perfil) {
            return res.status(404).json({ mensagem: "Perfil não encontrado." });
        }
        res.status(200).json(perfil);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao buscar perfil." });
    }
});


// ROTA DE PERFIL ATUALIZADA: Retorna apenas os dados do usuário.
router.get('/perfil/:userId', authMiddleware, async (req: Request, res: Response) => {
    const userIdParam = parseInt(req.params.userId, 10);
    if (isNaN(userIdParam)) {
        return res.status(400).json({ mensagem: 'ID de usuário inválido.' });
    }

    try {
        const perfil = await prisma.user.findUnique({
            where: { id: userIdParam },
            select: { id: true, nome: true, email: true, foto_url: true }
        });

        if (!perfil) {
            return res.status(404).json({ mensagem: 'Perfil não encontrado.' });
        }
        res.status(200).json(perfil);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao buscar perfil." });
    }
});

// ROTA PARA BUSCAR POSTS DE UM USUÁRIO COM PAGINAÇÃO
router.get('/usuario/:userId/posts', authMiddleware, async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId, 10);
    const cursor = req.query.cursor ? parseInt(req.query.cursor as string, 10) : undefined;
    const take = 5; // Quantos posts buscar por vez

    try {
        const posts = await prisma.post.findMany({
            take,
            skip: cursor ? 1 : 0, // Pula o cursor se ele existir
            cursor: cursor ? { id: cursor } : undefined,
            where: { autorId: userId },
            orderBy: { createdAt: 'desc' },
        });

        // Determina o cursor para a próxima página
        const nextCursor = posts.length === take ? posts[posts.length - 1].id : null;

        res.json({ posts, nextCursor });
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao buscar posts do usuário." });
    }
});

// ROTA PARA BUSCAR COMENTÁRIOS DE UM USUÁRIO COM PAGINAÇÃO
router.get('/usuario/:userId/comentarios', authMiddleware, async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId, 10);
    const cursor = req.query.cursor ? parseInt(req.query.cursor as string, 10) : undefined;
    const take = 5; // Quantos comentários buscar por vez

    try {
        const comentarios = await prisma.comment.findMany({
            take,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            where: { autorId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                post: { select: { titulo: true } }
            }
        });

        const nextCursor = comentarios.length === take ? comentarios[comentarios.length - 1].id : null;

        res.json({ comentarios, nextCursor });
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao buscar comentários do usuário." });
    }
});


// --- NOVA ROTA PARA DELETAR A CONTA DO PRÓPRIO USUÁRIO ---
router.delete('/perfil/meu', authMiddleware, async (req: AuthRequest, res: Response) => {
    const userId = req.userId; // ID do usuário logado, vindo do token
    const { senha } = req.body; // Senha enviada no corpo da requisição para confirmação

    if (!senha) {
        return res.status(400).json({ mensagem: "A senha é necessária para confirmar a exclusão." });
    }

    if (!userId) {
        return res.status(401).json({ mensagem: "Usuário não autenticado." });
    }

    try {
        const resultado = await userService.deletarUsuario(userId, senha);
        res.status(200).json(resultado);
    } catch (error: any) {
        // Envia a mensagem de erro específica (ex: "Senha incorreta")
        res.status(403).json({ mensagem: error.message });
    }
});

export default router;