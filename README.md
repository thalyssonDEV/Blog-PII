# Blog 

Uma solução completa de blog empresarial com foco em segurança, escalabilidade e experiência do usuário. Desenvolvida com TypeScript, Node.js e PostgreSQL, oferece autenticação robusta com JWT, sistema de comentários moderado, upload seguro de imagens via Google Cloud Storage e arquitetura preparada para alta disponibilidade.

**Principais Diferenciais:**
- Arquitetura em camadas com separação clara de responsabilidades
- Sistema de autenticação JWT com tokens de curta duração
- Upload de imagens otimizado com Google Cloud Storage
- Validação rigorosa de entrada e proteção contra XSS
- Interface responsiva construída com Tailwind CSS
- Containerização Docker para deploy simplificado

## Funcionalidades

### Funcionalidades Principais
- **Gerenciamento de Usuários**
  - Registro e autenticação segura de usuários
  - Gerenciamento de sessão baseado em JWT
  - Upload de foto de perfil com integração ao Google Cloud Storage
  - Exclusão de conta com limpeza em cascata dos dados

- **Gerenciamento de Conteúdo**
  - Criar, ler e excluir posts de blog
  - Suporte a texto rico (até 10.000 caracteres)
  - Paginação para performance otimizada
  - Atribuição de autoria e timestamps

- **Interação do Blog**
  - Sistema de comentários nos posts do blog
  - Visualização de perfil do autor
  - Navegação e descoberta de conteúdo
  - Design responsivo para todos os dispositivos

- **Segurança e Validação**
  - Hash de senhas com bcrypt
  - Validação e sanitização de entrada
  - Proteção XSS
  - Middleware de autenticação
  - Restrições de upload de arquivos

## Stack Tecnológico

### Backend
- **Runtime**: Node.js com TypeScript
- **Framework**: Express.js
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: JWT (JSON Web Tokens)
- **Armazenamento de Arquivos**: Google Cloud Storage
- **Validação**: express-validator
- **Segurança**: bcrypt para hash de senhas

### Frontend
- **Framework**: JavaScript Vanilla (ES6+)
- **Estilização**: Tailwind CSS
- **Componentes de UI**: Design responsivo customizado
- **Ícones**: Heroicons

### Infraestrutura
- **Containerização**: Docker com builds multi-estágio
- **Migrações de Banco**: Prisma Migrate
- **Gerenciamento de Ambiente**: dotenv
- **Desenvolvimento**: Nodemon com hot reload

## Pré-requisitos

Antes de executar esta aplicação, certifique-se de ter:

- Node.js (v18 ou superior)
- Banco de dados PostgreSQL
- Conta no Google Cloud Platform com:
  - Bucket do Cloud Storage
  - Service account com permissões de Storage Admin
- Docker (opcional, para deploy containerizado)

## Instalação e Configuração

### 1. Clonar o Repositório
```bash
git clone <repository-url>
cd Social-Network-PII
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configuração do Ambiente
Crie um arquivo `.env` no diretório raiz:

```env
# Configuração do Banco de Dados
DATABASE_URL="postgresql://username:password@localhost:5432/social_network_db"

# Chave Secreta JWT (use uma string forte e aleatória)
JWT_SECRET="your-super-secret-jwt-key"

# Configuração do Google Cloud
GOOGLE_APPLICATION_CREDENTIALS="caminho/para/sua/chave-service-account.json"
GCS_BUCKET_NAME="nome-do-seu-bucket"
GCP_PROJECT_ID="id-do-seu-projeto"

# Porta da Aplicação (opcional)
PORT=8000
```

### 4. Configuração do Banco de Dados
```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações do banco
npx prisma migrate deploy

# (Opcional) Visualizar banco no Prisma Studio
npx prisma studio
```

### 5. Configuração do Google Cloud Storage

1. Crie um bucket GCS para armazenar imagens de perfil dos usuários
2. Crie uma service account com permissões de Storage Admin
3. Baixe o arquivo JSON da chave da service account
4. Atualize o caminho `GOOGLE_APPLICATION_CREDENTIALS` no seu arquivo `.env`

## Executando a Aplicação

### Modo de Desenvolvimento
```bash
npm start
```
A aplicação será iniciada em `http://localhost:8000` com hot reload habilitado.

### Build de Produção
```bash
# Compilar TypeScript
npm run build

# Iniciar servidor de produção
node dist/main.js
```

### Usando Docker
```bash
# Construir a imagem Docker
docker build -t personal-blog .

# Executar o container
docker run -p 8000:8000 --env-file .env personal-blog
```

### Teste do Banco de Dados
```bash
# Testar conexão com o banco
npm run test:db
```

## Estrutura do Projeto

```
Social-Network-PII/
├── src/                          # Código fonte do backend
│   ├── classes/                  # Classes da camada de serviço
│   │   ├── UserService.ts        # Lógica de gerenciamento de usuários
│   │   ├── PostService.ts        # Lógica de gerenciamento de posts
│   │   └── CommentService.ts     # Lógica de gerenciamento de comentários
│   ├── config/                   # Arquivos de configuração
│   │   ├── env.ts               # Validação de ambiente
│   │   └── multer.ts            # Configuração de upload de arquivos
│   ├── middleware/               # Middleware do Express
│   │   └── authMiddleware.ts     # Autenticação JWT
│   ├── routes/                   # Manipuladores de rotas da API
│   │   ├── userRoutes.ts         # Endpoints relacionados a usuários
│   │   ├── postRoutes.ts         # Endpoints relacionados a posts
│   │   └── commentRoutes.ts      # Endpoints relacionados a comentários
│   ├── main.ts                   # Ponto de entrada da aplicação
│   ├── prismaClient.ts           # Cliente do banco de dados
│   └── testConnection.ts         # Teste de conexão do banco
├── public/                       # Arquivos estáticos do frontend
│   ├── js/                       # Módulos JavaScript
│   │   ├── auth.js              # Lógica de autenticação
│   │   ├── home.js              # Funcionalidade da página inicial
│   │   ├── perfil.js            # Gerenciamento de perfil
│   │   ├── post.js              # Visualização de posts
│   │   ├── criar-post.js        # Criação de posts
│   │   ├── login.js             # Formulário de login
│   │   ├── registro.js          # Formulário de registro
│   │   ├── logout.js            # Funcionalidade de logout
│   │   ├── outro_perfil.js      # Perfis de outros usuários
│   │   └── utils.js             # Utilitários compartilhados
│   ├── css/
│   │   └── styles.css           # Estilos customizados
│   ├── assets/
│   │   └── default-avatar.svg   # Imagem de perfil padrão
│   └── *.html                   # Páginas HTML
├── prisma/                       # Schema do banco e migrações
│   ├── schema.prisma            # Definição do schema do banco
│   └── migrations/              # Arquivos de migração do banco
├── Dockerfile                    # Configuração do Docker
├── docker-compose.yml           # Configuração do Docker Compose
├── package.json                 # Dependências e scripts
├── tsconfig.json               # Configuração do TypeScript
└── README.md                   # Documentação do projeto
```

## Endpoints da API

### Autenticação
- `POST /api/registro` - Registrar novo usuário
- `POST /api/login` - Login do usuário
- `POST /api/perfil/foto` - Upload de foto de perfil

### Gerenciamento de Usuários
- `GET /api/perfil/meu` - Obter perfil do usuário atual
- `GET /api/perfil/:userId` - Obter perfil do usuário por ID
- `DELETE /api/perfil/meu` - Excluir conta do usuário
- `GET /api/usuario/:userId/posts` - Obter posts do usuário (paginado)
- `GET /api/usuario/:userId/comentarios` - Obter comentários do usuário (paginado)

### Posts
- `GET /api/posts` - Obter todos os posts do blog (paginado)
- `POST /api/posts` - Criar novo post do blog
- `GET /api/posts/:postId` - Obter post específico do blog com comentários
- `DELETE /api/posts/:postId` - Excluir post do blog (apenas autor)

### Comentários
- `POST /api/posts/:postId/comentarios` - Adicionar comentário ao post do blog

## Recursos de Segurança

### Autenticação e Autorização
- Tokens JWT com expiração de 1 hora
- Hash de senhas usando bcrypt com salt rounds
- Proteção de rotas baseada em middleware
- Autorização de usuário para acesso a recursos

### Validação de Entrada
- Validação server-side usando express-validator
- Proteção XSS através de sanitização de entrada
- Restrições de upload de arquivos (limite de 5MB, apenas tipos de imagem)
- Validação de formato de nome de usuário e email

### Proteção de Dados
- Validação de variáveis de ambiente
- Prevenção de injeção SQL via Prisma ORM
- Manipulação segura de arquivos com armazenamento em memória
- Sanitização de mensagens de erro

## Recursos do Frontend

### Interface do Usuário
- Design responsivo com Tailwind CSS
- Notificações toast para feedback do usuário
- Diálogos modais para confirmações
- Rolagem suave e animações
- Layouts otimizados para mobile

### Experiência do Usuário
- Validação de formulário em tempo real
- Pré-visualização de imagem para uploads
- Paginação para grandes conjuntos de dados
- Estados de carregamento e tratamento de erros
- Navegação intuitiva

## Schema do Banco de Dados

### Tabela de Usuários
- `id` (Chave Primária)
- `email` (Único)
- `nome` (Nome de usuário)
- `senha_hash` (Senha hasheada)
- `foto_url` (URL da imagem de perfil)
- `createdAt` (Timestamp)

### Tabela de Posts
- `id` (Chave Primária)
- `titulo` (Título do post do blog)
- `conteudo` (Conteúdo do post do blog)
- `autorId` (Chave Estrangeira para Usuários)
- `createdAt` / `updatedAt` (Timestamps)

### Tabela de Comentários
- `id` (Chave Primária)
- `texto` (Texto do comentário)
- `autorId` (Chave Estrangeira para Usuários)
- `postId` (Chave Estrangeira para Posts)
- `createdAt` (Timestamp)

### Relacionamentos
- Um-para-Muitos: Usuário → Posts do Blog
- Um-para-Muitos: Usuário → Comentários
- Um-para-Muitos: Post do Blog → Comentários
- Exclusão em cascata para integridade dos dados

## Fluxo de Desenvolvimento

### Organização do Código
- Padrão de camada de serviço para lógica de negócio
- Manipuladores de rota para requisição/resposta HTTP
- Middleware para concerns transversais
- TypeScript para segurança de tipos

### Gerenciamento do Banco de Dados
```bash
# Criar nova migração
npx prisma migrate dev --name nome_da_migracao

# Resetar banco (apenas desenvolvimento)
npx prisma migrate reset

# Deploy das migrações (produção)
npx prisma migrate deploy
```

### Scripts de Desenvolvimento
```bash
npm start          # Iniciar servidor de desenvolvimento
npm run build      # Compilar TypeScript
npm run test:db    # Testar conexão do banco
```

## Deploy

### Variáveis de Ambiente
Certifique-se de que todas as variáveis de ambiente necessárias estejam definidas:
- `DATABASE_URL`
- `JWT_SECRET`
- `GOOGLE_APPLICATION_CREDENTIALS`
- `GCS_BUCKET_NAME`
- `GCP_PROJECT_ID`

### Checklist de Produção
- [ ] Definir chave JWT forte
- [ ] Configurar banco de dados de produção
- [ ] Configurar Google Cloud Storage
- [ ] Configurar HTTPS
- [ ] Configurar monitoramento e logging
- [ ] Executar migrações do banco
- [ ] Testar todos os endpoints

## Contribuindo

1. Faça um fork do repositório
2. Crie uma branch de funcionalidade (`git checkout -b feature/funcionalidade-incrivel`)
3. Faça commit das suas alterações (`git commit -m 'Adicionar funcionalidade incrível'`)
4. Faça push para a branch (`git push origin feature/funcionalidade-incrivel`)
5. Abra um Pull Request

### Padrões de Código
- Use TypeScript para todo o código backend
- Siga a configuração do ESLint
- Adicione validação para todas as entradas do usuário
- Inclua tratamento de erro para todas as operações
- Escreva mensagens de commit descritivas

## Licença

Este projeto está licenciado sob a Licença ISC. Veja o arquivo `package.json` para detalhes.

## Suporte

Para suporte e dúvidas:
1. Verifique a documentação acima
2. Revise os comentários do código para detalhes de implementação
3. Verifique o schema do banco em `prisma/schema.prisma`
4. Verifique a configuração do ambiente

## Melhorias Futuras

- Notificações em tempo real para novos comentários
- Funcionalidade de busca avançada para posts do blog
- Assinaturas por email para novos posts
- Verificação por email para contas de usuário
- Autenticação com redes sociais (Google, GitHub)
- Ferramentas avançadas de moderação de conteúdo
- Dashboard de analytics para métricas do blog
- Aplicação mobile
- Suporte a feed RSS
- Categorização e tags de conteúdo

---

Construído para a comunidade de blogging
