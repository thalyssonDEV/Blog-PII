import prisma from '../prismaClient';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

// Tipagem para o arquivo de foto que vem do Multer
interface FotoArquivo {
    path: string;
    originalname: string;
    destination: string;
}

export class UserService {

    // --- MÉTODO PARA REGISTRAR UM NOVO USUÁRIO ---
    async registrar(dadosUsuario: any, arquivoFoto?: FotoArquivo) {
        const { nome, email, senha } = dadosUsuario;

        // 1. Verifica se o e-mail já existe
        const usuarioExistente = await prisma.user.findUnique({ where: { email } });
        if (usuarioExistente) {
            // Lança um erro que será capturado pela rota
            throw new Error('Este e-mail já está cadastrado.');
        }

        // 2. Hasheia a senha
        const senha_hash = await this.hashPassword(senha);

        // 3. Cria o usuário no banco
        const novoUsuario = await prisma.user.create({
            data: { nome, email, senha_hash },
        });

        // 4. Lida com a foto (se existir)
        let urlFotoFinal = '/assets/default-avatar.svg';
        if (arquivoFoto) {
            const extensao = path.extname(arquivoFoto.originalname);
            const nomeArquivoFinal = `${novoUsuario.id}${extensao}`;
            const caminhoNovo = path.resolve(arquivoFoto.destination, nomeArquivoFinal);
            fs.renameSync(arquivoFoto.path, caminhoNovo);
            urlFotoFinal = `/imagens/${nomeArquivoFinal}`;
        }
        
        // 5. Atualiza o usuário com a URL da foto e retorna o usuário final
        const usuarioAtualizado = await prisma.user.update({
            where: { id: novoUsuario.id },
            data: { foto_url: urlFotoFinal },
        });

        const { senha_hash: hash, ...usuarioSemSenha } = usuarioAtualizado;
        return usuarioSemSenha;
    }

    // --- MÉTODO PARA AUTENTICAR UM USUÁRIO ---
    async autenticar(email: string, senhaPlana: string) {
        // 1. Busca o usuário pelo e-mail
        const usuario = await prisma.user.findUnique({ where: { email } });
        if (!usuario) {
            throw new Error('Credenciais inválidas.');
        }

        // 2. Compara as senhas
        const senhaCorresponde = await bcrypt.compare(senhaPlana, usuario.senha_hash);
        if (!senhaCorresponde) {
            throw new Error('Credenciais inválidas.');
        }

        // 3. Retorna o usuário se tudo estiver correto
        const { senha_hash, ...usuarioSemSenha } = usuario;
        return usuarioSemSenha;
    }

    private async hashPassword(senha: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(senha, salt);
    }
}