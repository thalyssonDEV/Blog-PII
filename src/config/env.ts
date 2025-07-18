import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// 1. Define o schema (o "contrato") para as variáveis de ambiente
const envSchema = z.object({
    // Garante que DATABASE_URL seja uma string no formato de URL e não esteja vazia
    DATABASE_URL: z.string(),
    // Garante que JWT_SECRET seja uma string e não esteja vazia
    JWT_SECRET: z.string().min(1),

    GOOGLE_APPLICATION_CREDENTIALS: z.string().min(1, "O caminho para a chave do Google Cloud é obrigatório."),

    GCS_BUCKET_NAME: z.string().min(1),

    GCP_PROJECT_ID: z.string().min(1, "O ID do projeto Google Cloud é obrigatório."),
});

// 2. Tenta validar process.env contra o schema definido
const parsedEnv = envSchema.safeParse(process.env);

// 3. Se a validação falhar, mostra um erro claro e encerra a aplicação
if (!parsedEnv.success) {
    console.error(
        '❌ Erro nas Variáveis de Ambiente:',
        parsedEnv.error.flatten().fieldErrors,
    );
    // Encerra o processo com um código de erro
    process.exit(1);
}

// 4. Exporta as variáveis validadas e com tipagem correta
export const env = parsedEnv.data;
