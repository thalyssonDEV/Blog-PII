import prisma from '../prismaClient';
import bcrypt from 'bcrypt';
import path from 'path';
import { Storage } from '@google-cloud/storage';
import { env } from '../config/env';

// Tipagem para o arquivo que o Multer nos entrega na memória
interface FotoArquivo {
    originalname: string;
    buffer: Buffer;
}

export class UserService {
    // Instancia o cliente do Google Cloud Storage
    private storage = new Storage({
        keyFilename: env.GOOGLE_APPLICATION_CREDENTIALS,
        projectId: env.GCP_PROJECT_ID
    });
    // Pega o nome do bucket do nosso arquivo .env
    private bucket = this.storage.bucket(env.GCS_BUCKET_NAME);

    /**
     * Registra um novo usuário, hasheia a senha e faz o upload da foto (se enviada).
     */
    public async registrar(dadosUsuario: any, arquivoFoto?: FotoArquivo) {
        const { nome, email, senha } = dadosUsuario;

        const usuarioExistente = await prisma.user.findUnique({ where: { email } });
        if (usuarioExistente) {
            throw new Error('Este e-mail já está cadastrado.');
        }

        const senha_hash = await this.hashPassword(senha);

        const novoUsuario = await prisma.user.create({
            data: {
                nome,
                email,
                senha_hash
            },
        });

        let urlFotoFinal = '/assets/default-avatar.svg';

        if (arquivoFoto) {
            const nomeArquivoFinal = `${novoUsuario.id}${path.extname(arquivoFoto.originalname)}`;
            urlFotoFinal = await this.uploadToGCS(arquivoFoto, nomeArquivoFinal);
        }

        const usuarioAtualizado = await prisma.user.update({
            where: { id: novoUsuario.id },
            data: { foto_url: urlFotoFinal },
        });

        const { senha_hash: hash, ...usuarioSemSenha } = usuarioAtualizado;
        return usuarioSemSenha;
    }

    /**
     * Autentica um usuário, verificando seu e-mail e senha.
     */
    public async autenticar(email: string, senhaPlana: string) {
        const usuario = await prisma.user.findUnique({
            where: { email }
        });
        
        if (!usuario) {
            throw new Error('Credenciais inválidas.');
        }

        const senhaCorresponde = await bcrypt.compare(senhaPlana, usuario.senha_hash);
        if (!senhaCorresponde) {
            throw new Error('Credenciais inválidas.');
        }

        const { senha_hash, ...usuarioSemSenha } = usuario;
        return usuarioSemSenha;
    }

    /**
     * Deleta um usuário, sua foto no GCS e todos os dados relacionados.
     */
    public async deletarUsuario(userId: number, senhaFornecida: string) {
        const usuario = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!usuario) {
            throw new Error("Usuário não encontrado.");
        }

        const senhaCorresponde = await bcrypt.compare(senhaFornecida, usuario.senha_hash);
        if (!senhaCorresponde) {
            throw new Error("Senha incorreta.");
        }

        if (usuario.foto_url && !usuario.foto_url.includes('default-avatar.svg')) {
            try {
                const nomeArquivo = path.basename(usuario.foto_url);
                // A CORREÇÃO ESTÁ AQUI
                await this.deleteFromGCS(nomeArquivo);
            } catch (error) {
                console.error("Falha ao deletar foto do GCS, mas continuando com a exclusão do usuário:", error);
            }
        }
        
        await prisma.user.delete({
            where: { id: userId }
        });

        return { mensagem: 'Conta deletada com sucesso.' };
    }

    /**
     * Método privado para hashear a senha.
     */
    private async hashPassword(senha: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(senha, salt);
    }

    /**
     * Método privado para fazer upload do arquivo para o Google Cloud Storage.
     */
    private uploadToGCS(arquivo: FotoArquivo, nomeArquivoFinal: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const blob = this.bucket.file(nomeArquivoFinal);
            const blobStream = blob.createWriteStream({
                resumable: false,
            });

            blobStream.on('error', (err) => {
                reject(err);
            });

            blobStream.on('finish', () => {
                const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${blob.name}`;
                resolve(publicUrl);
            });

            blobStream.end(arquivo.buffer);
        });
    }

    /**
     * Método privado para deletar um arquivo do Google Cloud Storage.
     */
    private async deleteFromGCS(nomeArquivo: string): Promise<void> {
        try {
            await this.bucket.file(nomeArquivo).delete();
            console.log(`Arquivo ${nomeArquivo} deletado do GCS com sucesso.`);
        } catch (error: any) {
            if (error.code === 404) {
                console.warn(`Arquivo ${nomeArquivo} não encontrado no GCS, mas prosseguindo.`);
                return;
            }
            throw error;
        }
    }

    public async atualizarFotoPerfil(userId: number, arquivoFoto: FotoArquivo): Promise<string> {
    // 1. Busca o usuário para garantir que ele existe e para pegar a URL da foto antiga
    const usuario = await prisma.user.findUnique({ where: { id: userId } });
    if (!usuario) {
        throw new Error('Usuário não encontrado.');
    }
    const fotoAntigaUrl = usuario.foto_url;

    const timestamp = Date.now();
    const nomeArquivoNovo = `${userId}-${timestamp}${path.extname(arquivoFoto.originalname)}`;

    // 2. Constrói o nome do novo arquivo e faz o upload para o Google Cloud
    console.log("Iniciando upload para o GCS...");
    const novaFotoUrl = await this.uploadToGCS(arquivoFoto, nomeArquivoNovo);
    console.log(`Upload concluído. Nova URL: ${novaFotoUrl}`);

    // 3. ATUALIZA o banco de dados com a URL da nova foto
    console.log("Atualizando o banco de dados com a nova URL da foto...");
    await prisma.user.update({
        where: { id: userId },
        data: { foto_url: novaFotoUrl },
    });
    console.log("Banco de dados atualizado com sucesso.");

    // 4. SOMENTE APÓS o sucesso do upload e da atualização do banco,
    // tenta deletar a foto antiga.
    if (fotoAntigaUrl && !fotoAntigaUrl.includes('default-avatar.svg')) {
        console.log(`Tentando deletar a foto antiga: ${fotoAntigaUrl}`);
        try {
            const nomeArquivoAntigo = path.basename(fotoAntigaUrl);
            // Evita deletar o mesmo arquivo que acabou de subir, caso o nome seja o mesmo
            if (nomeArquivoAntigo !== nomeArquivoNovo) {
                await this.deleteFromGCS(nomeArquivoAntigo);
            }
        } catch (error) {
            // Apenas logamos o erro, pois a operação principal (atualizar a foto) já foi um sucesso.
            console.warn('AVISO: Falha ao deletar a foto antiga, mas o perfil foi atualizado:', error);
        }
    }

    // Retorna a nova URL para a rota, que a enviará ao front-end
    return novaFotoUrl;
}
}