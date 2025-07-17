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

    /**
     * Deleta um post, mas somente se o usuário for o autor.
     */
    public async deletarPost(postId: number, autorIdRequisicao: number) {
        // Primeiro, busca o post para verificar quem é o dono
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { autorId: true } // Só precisamos do ID do autor para a verificação
        });

        if (!post) {
            throw new Error('Post não encontrado.');
        }

        // A verificação de segurança mais importante!
        if (post.autorId !== autorIdRequisicao) {
            throw new Error('Permissão negada. Você não é o autor deste post.');
        }

        // Se a verificação passar, deleta o post.
        // Graças ao 'onDelete: Cascade' que configuramos, todos os comentários
        // relacionados a este post serão apagados automaticamente.
        await prisma.post.delete({
            where: { id: postId }
        });
    }
}