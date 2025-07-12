function getById(id: string) {
    return document.getElementById(id);
}

const apiUrl = 'http://localhost:3000/socialifpi/postagem';  // Atualize a URL conforme necessário

interface Postagem {
    id: number;
    titulo: string;
    conteudo: string;
    data: string;
    curtidas: number;
}

// Função para listar todas as postagens
async function listarPostagens() {
    const response = await fetch(apiUrl);
    const postagens: Postagem[] = await response.json();

    const postagensElement = getById('postagens');
    if (postagensElement) {
        postagensElement.innerHTML = '';  // Limpa as postagens anteriores
        postagens.forEach(postagem => {
            const article = document.createElement('article');

            const titulo = document.createElement('h2');
            titulo.textContent = postagem.titulo;

            const conteudo = document.createElement('p');
            conteudo.textContent = postagem.conteudo;

            const data = document.createElement('p');
            data.className = 'data';
            data.textContent = new Date(postagem.data).toLocaleDateString();

            const curtidas = document.createElement('p');
            curtidas.textContent = `Curtidas: ${postagem.curtidas}`;
            curtidas.style.fontWeight = 'bold';

            const botaoCurtir = document.createElement('button');
            botaoCurtir.textContent = 'Curtir';
            botaoCurtir.addEventListener('click', () => curtirPostagem(postagem.id, curtidas));

            article.appendChild(titulo);
            article.appendChild(conteudo);
            article.appendChild(data);
            article.appendChild(curtidas);
            article.appendChild(botaoCurtir);

            postagensElement.appendChild(article);
        });
    }
}

// Função para curtir uma postagem
async function curtirPostagem(id: number, curtidasElement: HTMLParagraphElement) {
    const response = await fetch(`${apiUrl}/${id}/curtir`, {
        method: 'POST'
    });
    const result = await response.json();
    curtidasElement.textContent = `Curtidas: ${result.curtidas}`;
}

// Função para incluir uma nova postagem
async function incluirPostagem() {
    const tituloInput = <HTMLInputElement>getById('titulo');
    const conteudoInput = <HTMLInputElement>getById('conteudo');

    if (tituloInput && conteudoInput) {
        const novaPostagem = {
            titulo: tituloInput.value,
            conteudo: conteudoInput.value,
            data: new Date().toISOString(),
            curtidas: 0
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novaPostagem)
        });

        const postagemIncluida = await response.json();
        listarPostagens();  // Atualiza a lista de postagens

        // Limpa os campos do formulário
        tituloInput.value = '';
        conteudoInput.value = '';
    }
}

// Inicializa a aplicação
listarPostagens();

const botaoNovaPostagem = getById("botaoNovaPostagem");
if (botaoNovaPostagem) {
    botaoNovaPostagem.addEventListener('click', incluirPostagem);
}

