import prisma from '../prismaClient';

// Interface para garantir que os dados do comentário tenham a forma correta.
interface CommentData {
    texto: string;
}

export class CommentService {

    /**
     * Cria um novo comentário em um post específico, associado a um autor.
     * @param autorId O ID do usuário que está comentando.
     * @param postId O ID do post que está sendo comentado.
     * @param dadosComentario O objeto contendo o texto do comentário.
     * @returns O novo comentário criado com os dados do autor.
     */
    public async criarComentario(autorId: number, postId: number, dadosComentario: CommentData) {
        const { texto } = dadosComentario;

        // Verifica se o post realmente existe antes de criar o comentário
        const postExiste = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!postExiste) {
            throw new Error("Post não encontrado. Não é possível adicionar o comentário.");
        }

        const novoComentario = await prisma.comment.create({
            data: {
                texto,
                autorId, // ID do usuário logado
                postId,  // ID do post que está sendo comentado
            },
            // Inclui os dados do autor no objeto retornado para exibição imediata
            include: {
                autor: {
                    select: {
                        nome: true,
                        foto_url: true,
                    },
                },
            },
        });

        return novoComentario;
    }
}