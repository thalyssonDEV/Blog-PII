import prisma from './prismaClient';

async function main() {
    console.log('🚀 Iniciando teste de conexão...');

    console.log('✍️  Criando um novo usuário...');
    // ✅ Você continua usando 'prisma.user'
    const newUser = await prisma.user.create({
        data: {
            nome: 'Usuário Teste Mapeado',
            email: `teste-mapeado-2-${Date.now()}@teste.com`,
            senha_hash: 'hash_da_senha_123',
        },
    });
    console.log('✅ Usuário criado:', newUser);

    console.log('🔍 Buscando todos os usuários...');
    // ✅ Você continua usando 'prisma.user'
    const allUsers = await prisma.user.findMany();
    console.log('✅ Todos os usuários encontrados:');
    console.dir(allUsers, { depth: null });

}

main()
    .catch((e) => {
        console.error('❌ Ocorreu um erro durante o teste:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log('🚪 Conexão com o banco fechada.');
    });