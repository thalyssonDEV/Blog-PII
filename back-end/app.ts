import express, { NextFunction, Request, Response } from 'express';
import { RepositorioDePostagens } from './RepositorioDePostagens';
import { Postagem } from './Postagem';
import cors from 'cors';



const app = express();
const repositorio = new RepositorioDePostagens();

// Configurações do Express
app.use(express.json());

// Configuração básica do CORS
app.use(cors());

// Povoar o repositório com postagens iniciais
repositorio.povoar();

// Endpoint para raiz
const PATH: string = '/socialifpi/postagem';
const PATH_ID: string = PATH + '/:id';
const PATH_CURTIR = PATH_ID + '/curtir';



// Endpoint para listar todas as postagens
app.get(PATH, (req: Request, res: Response) => {
    const postagens = repositorio.listar();
    res.json(postagens);
});

// Endpoint para consultar uma postagem pelo ID
app.get(PATH_ID, (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const postagem = repositorio.consultar(id);
    
    if (!postagem) {
        res.status(404).json({ message: 'Postagem não encontrada' });
        return;
        
    } 

    res.json(postagem);
});

// Endpoint para incluir uma nova postagem
app.post(PATH, (req: Request, res: Response) => {
    const { titulo, conteudo, data, curtidas } = req.body;
    const novaPostagem = new Postagem(0, titulo, conteudo, new Date(data), curtidas || 0);
    const postagemIncluida = repositorio.incluir(novaPostagem);
    res.status(201).json(postagemIncluida);
});

// Endpoint para alterar uma postagem existente
app.put(PATH_ID, (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { titulo, conteudo, data, curtidas } = req.body;
    
    const sucesso = repositorio.alterar(id, titulo, conteudo, data, curtidas);
    if (!sucesso) {
        res.status(404).json({ message: 'Postagem não encontrada' });
        return;
    }

    res.status(200).json({ message: 'Postagem alterada com sucesso' });
});

// Endpoint para excluir uma postagem pelo ID
app.delete(PATH_ID, (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const sucesso = repositorio.excluir(id);
    if (!sucesso) {
        res.status(404).json({ message: 'Postagem não encontrada' });
        return;
    }

    res.status(200).json({ message: 'Postagem excluída com sucesso' });
});

// Endpoint para curtir uma postagem pelo ID
// Endpoint para curtir uma postagem pelo ID e retornar a quantidade de curtidas
app.post(PATH_CURTIR, (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const curtidas = repositorio.curtir(id);
    
    if (curtidas == null) {
        res.status(404).json({ message: 'Postagem não encontrada' });
        return;
        
    } 
    
    res.json({ message: 'Postagem curtida com sucesso', curtidas });
});

// Inicializar o servidor na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});


app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).send('Não encontrado');
});