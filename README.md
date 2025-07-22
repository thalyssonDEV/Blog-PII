# Blog PII

<div align="center">

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

</div>

Este projeto foi desenvolvido como projeto final da disciplina Programação para Internet I, com o objetivo de criar uma plataforma de um blog.

**Integrantes do Grupo:**
1. [Álvaro Pietro Borges de Sousa Brandão](https://github.com/PietroDev-01)
2. [João Paulo Lopes da Silva](https://github.com/jpaullopes)
3. [Thalysson Delano Borges Ferreira](https://github.com/thalyssonDEV)

## Sumário

- [Principais Diferenciais](#principais-diferenciais)
- [Funcionalidades](#funcionalidades)
  - [Funcionalidades Principais](#funcionalidades-principais)
- [Stack Tecnológico](#stack-tecnológico)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Infraestrutura](#infraestrutura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
  - [Clonar o Repositório](#1-clonar-o-repositório)
  - [Instalar Dependências](#2-instalar-dependências)
  - [Configuração do Ambiente](#3-configuração-do-ambiente)
  - [Configuração do Banco de Dados](#4-configuração-do-banco-de-dados)
  - [Configuração do Google Cloud Storage](#5-configuração-do-google-cloud-storage)
- [Executando a Aplicação](#executando-a-aplicação)
  - [Modo de Desenvolvimento](#modo-de-desenvolvimento)
  - [Build de Produção](#build-de-produção)
  - [Usando Docker](#usando-docker)
  - [Teste do Banco de Dados](#teste-do-banco-de-dados)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Endpoints da API](#endpoints-da-api)
  - [Autenticação](#autenticação)
  - [Gerenciamento de Usuários](#gerenciamento-de-usuários)
  - [Posts](#posts)
  - [Comentários](#comentários)
- [Recursos de Segurança](#recursos-de-segurança)
  - [Autenticação e Autorização](#autenticação-e-autorização)
  - [Validação de Entrada](#validação-de-entrada)
  - [Proteção de Dados](#proteção-de-dados)
- [Recursos do Frontend](#recursos-do-frontend)
  - [Interface do Usuário](#interface-do-usuário)
  - [Experiência do Usuário](#experiência-do-usuário)
- [Schema do Banco de Dados](#schema-do-banco-de-dados)
  - [Tabela de Usuários](#tabela-de-usuários)
  - [Tabela de Posts](#tabela-de-posts)
  - [Tabela de Comentários](#tabela-de-comentários)
  - [Relacionamentos](#relacionamentos)
- [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)
  - [Organização do Código](#organização-do-código)
  - [Gerenciamento do Banco de Dados](#gerenciamento-do-banco-de-dados)
  - [Scripts de Desenvolvimento](#scripts-de-desenvolvimento)


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
│   ├── classes/                  # Contém classes que encapsulam a lógica de negócio, como UserService e PostService
│   ├── config/                   # Arquivos de configuração, como validação de ambiente e upload de arquivos
│   ├── middleware/               # Middleware do Express para autenticação e outras funções transversais
│   ├── routes/                   # Manipuladores de rotas da API, organizados por recurso
│   ├── main.ts                   # Ponto de entrada da aplicação
│   ├── prismaClient.ts           # Cliente do banco de dados Prisma
│   └── testConnection.ts         # Teste de conexão do banco
├── public/                       # Arquivos estáticos do frontend, como HTML, CSS e JavaScript
│   ├── js/                       # Módulos JavaScript para funcionalidades específicas
│   ├── css/                      # Estilos customizados
│   ├── assets/                   # Recursos estáticos, como imagens
│   └── *.html                    # Páginas HTML
├── prisma/                       # Schema do banco e migrações
│   ├── schema.prisma             # Definição do schema do banco
│   └── migrations/               # Arquivos de migração do banco
├── Dockerfile                    # Configuração do Docker
├── docker-compose.yml            # Configuração do Docker Compose
├── package.json                  # Dependências e scripts
├── tsconfig.json                 # Configuração do TypeScript
└── README.md                     # Documentação do projeto
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

### Screenshots da Aplicação

#### Página de Login
<div align="center">
  <img src="images/imagem_login.png" alt="Página de Login" width="800">
  <p><em>Interface de login com design moderno e responsivo</em></p>
</div>

#### Página de Cadastro
<div align="center">
  <img src="images/imagem_cadastro.png" alt="Página de Cadastro" width="800">
  <p><em>Formulário de registro</em></p>
</div>

#### Página Principal (Home)
<div align="center">
  <img src="images/imagem_home_page.png" alt="Página Principal" width="800">
  <p><em>Feed de posts com sistema de paginação e interações</em></p>
</div>

#### Página de Perfil
<div align="center">
  <img src="images/imagem_perfil.png" alt="Página de Perfil" width="800">
  <p><em>Gerenciamento de perfil com abas para posts e comentários</em></p>
</div>

### Experiência do Usuário
- Validação de formulário em tempo real
- Pré-visualização de imagem para uploads
- Paginação para grandes conjuntos de dados
- Estados de carregamento e tratamento de erros
- Navegação intuitiva

## Schema do Banco de Dados

### Diagrama Relacional

<div align="center">
  <img src="images/imagem_diagrama_bd.png" alt="Diagrama" width="800">
  <p><em>Diagrama relacional do BD usado no sistema</em></p>
</div>

### Tabela de Usuário
- `id` (Chave Primária)
- `email` (Único)
- `nome` (Nome de usuário)
- `senha_hash` (Senha hasheada)
- `foto_url` (URL da imagem de perfil)
- `createdAt` (Timestamp)

### Tabela de Post
- `id` (Chave Primária)
- `titulo` (Título do post do blog)
- `conteudo` (Conteúdo do post do blog)
- `autorId` (Chave Estrangeira para Usuários)
- `createdAt` / `updatedAt` (Timestamps)

### Tabela de Comentário
- `id` (Chave Primária)
- `texto` (Texto do comentário)
- `autorId` (Chave Estrangeira para Usuários)
- `postId` (Chave Estrangeira para Posts)
- `createdAt` (Timestamp)

### Relacionamentos
- Zero-para-Muitos: Usuário → Posts do Blog
- Zero-para-Muitos: Usuário → Comentários
- Zero-para-Muitos: Post do Blog → Comentários
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
