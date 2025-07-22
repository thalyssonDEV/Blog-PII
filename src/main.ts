import { env } from './config/env';
import commentRoutes from './routes/commentRoutes';
import path from 'path';
import { Request, Response } from 'express';

import express from 'express';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import prisma from './prismaClient';

const app = express();
const PORT = process.env.PORT || 8000;

// Servir arquivos estáticos da pasta 'public' de forma robusta
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- Rota para a raiz do site ---
// Redireciona para a página de login por padrão.
app.get('/', (req: Request, res: Response) => {
    res.redirect('/login.html');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/api', userRoutes);
app.use('/api', postRoutes);
app.use('/api', commentRoutes);

// Função assíncrona para iniciar o servidor
const startServer = async () => {
    try {
        // 2. Tenta se conectar ao banco de dados
        console.log('Tentando Conectar ao Banco de Dados...');
        await prisma.$connect();
        console.log('Conexão com o Banco de Dados Bem-Sucedida.');

        // 3. SOMENTE se a conexão for bem-sucedida, inicia o servidor Express
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}, Link para LocalHost: http://localhost:${PORT}/login.html`);
        });

    } catch (error) {
        // 4. Se a conexão com o banco falhar, mostra o erro e encerra a aplicação
        console.error('Não foi Possível Conectar ao Banco de Dados.');
        console.error(error);
        // Encerra o processo para evitar que o servidor rode em um estado quebrado
        process.exit(1);
    }
};

startServer();
