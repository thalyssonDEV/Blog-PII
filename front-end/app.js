"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function getById(id) {
    return document.getElementById(id);
}
const apiUrl = 'http://localhost:3000/socialifpi/postagem'; // Atualize a URL conforme necessário
// Função para listar todas as postagens
function listarPostagens() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(apiUrl);
        const postagens = yield response.json();
        const postagensElement = getById('postagens');
        if (postagensElement) {
            postagensElement.innerHTML = ''; // Limpa as postagens anteriores
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
    });
}
// Função para curtir uma postagem
function curtirPostagem(id, curtidasElement) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`${apiUrl}/${id}/curtir`, {
            method: 'POST'
        });
        const result = yield response.json();
        curtidasElement.textContent = `Curtidas: ${result.curtidas}`;
    });
}
// Função para incluir uma nova postagem
function incluirPostagem() {
    return __awaiter(this, void 0, void 0, function* () {
        const tituloInput = getById('titulo');
        const conteudoInput = getById('conteudo');
        if (tituloInput && conteudoInput) {
            const novaPostagem = {
                titulo: tituloInput.value,
                conteudo: conteudoInput.value,
                data: new Date().toISOString(),
                curtidas: 0
            };
            const response = yield fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(novaPostagem)
            });
            const postagemIncluida = yield response.json();
            listarPostagens(); // Atualiza a lista de postagens
            // Limpa os campos do formulário
            tituloInput.value = '';
            conteudoInput.value = '';
        }
    });
}
// Inicializa a aplicação
listarPostagens();
const botaoNovaPostagem = getById("botaoNovaPostagem");
if (botaoNovaPostagem) {
    botaoNovaPostagem.addEventListener('click', incluirPostagem);
}
