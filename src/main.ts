import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';

// Carrega as variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares para entender JSON e dados de formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para servir arquivos estáticos (imagens, css, js) da pasta 'public'
app.use(express.static('public'));

// Define um prefixo para as rotas de usuário
app.use('/api', userRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});