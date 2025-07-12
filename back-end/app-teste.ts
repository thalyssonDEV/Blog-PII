import express, { NextFunction, Request, Response } from 'express';
import { Postagem } from './Postagem';

const app = express();
app.use(express.json());

// Endpoint para listar todas as postagens
app.get('/postagem', (req: Request, res: Response) => {
    const postagem = new Postagem(
        1,
        "Minha primeira postagem...",
        "Este é o conteúdo da minha primeira postagem.",
        new Date("2024-09-02"),
        0
    );

    res.json(postagem);
});

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).send('Não encontrado');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});