import prisma from '../prismaClient';

interface PostData {
    titulo: string;
    conteudo: string;
}

export class PostService {
    /**
     * Cria um novo post associado a um autor.
     */
    public async criarPost(autorId: number, dadosPost: any) {
        const { titulo, conteudo } = dadosPost;

        // A MUDANÇA ESTÁ AQUI: Adicionamos o 'include'
        const novoPost = await prisma.post.create({
            data: {
                titulo,
                conteudo,
                autorId: autorId,
            },
            // Inclui os dados do autor na resposta da criação
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

        return novoPost;
    }
}