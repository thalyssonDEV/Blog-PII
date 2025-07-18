# Estágio 1: Builder - Compila o TypeScript e prepara os artefatos de produção.
# Usamos a imagem node:20-slim como base, que é leve e moderna.
FROM node:20-slim AS builder

# --- CORREÇÃO ADICIONADA AQUI ---
# Instala o OpenSSL no ambiente de build para garantir que o Prisma gere
# o "query engine" para a mesma versão que será usada no ambiente de execução.
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /app

# Copia os arquivos de definição de pacotes para o diretório de trabalho.
# Fazemos isso primeiro para aproveitar o cache do Docker. Se esses arquivos não mudarem,
# o Docker não precisará reinstalar as dependências.
COPY package.json package-lock.json ./

# Instala TODAS as dependências, incluindo as 'devDependencies' que são
# necessárias para o processo de build (como typescript, ts-node, etc).
RUN npm install --production=false

# Copia o restante do código-fonte da aplicação.
COPY . .

# Gera o Prisma Client com base no schema.
# Agora, ele será gerado para o ambiente correto (com openssl 3.0.x).
RUN npx prisma generate

# Compila o código TypeScript para JavaScript.
# O resultado será salvo no diretório 'dist' (conforme configurado no tsconfig.json).
RUN npm run build


# Estágio 2: Runner - Cria a imagem final de produção.
# Partimos de uma imagem limpa para garantir que apenas os artefatos necessários sejam incluídos.
FROM node:20-slim

# Instala o OpenSSL, uma dependência de sistema necessária para o Prisma
# se conectar a bancos de dados de forma segura (SSL/TLS).
# Também limpamos o cache do apt para manter a imagem pequena.
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Define a variável de ambiente para indicar que estamos em um ambiente de produção.
# Isso otimiza a performance de bibliotecas como o Express.
ENV NODE_ENV=production

# Define o diretório de trabalho.
WORKDIR /app

# Copia os arquivos de definição de pacotes novamente.
COPY package.json package-lock.json ./

# Instala APENAS as dependências de produção.
# O --omit=dev é a forma moderna e recomendada de fazer isso.
RUN npm install --omit=dev

# Copia os artefatos de build do estágio 'builder'.
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Copia o Prisma Client já gerado do estágio 'builder' para a node_modules da imagem final.
# Isso resolve o erro "@prisma/client did not initialize".
COPY --from=builder /app/node_modules/.prisma/client ./node_modules/.prisma/client

# Expõe a porta em que a aplicação será executada (definida em src/main.ts).
EXPOSE 8000

# Comando para iniciar a aplicação.
# Executamos o arquivo JavaScript compilado diretamente com o Node.js.
# Isso é mais performático e seguro do que usar 'ts-node' em produção.
CMD ["node", "dist/main.js"]
