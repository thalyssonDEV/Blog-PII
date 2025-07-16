import prisma from '../prismaClient';

interface CommentData {
    texto: string;
}

export class CommentService {
    /**
     * Cria um novo comentário em um post específico, associado a um autor.
     */
    public async criarComentario(autorId: number, postId: number, dadosComentario: CommentData) {
        const { texto } = dadosComentario;

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