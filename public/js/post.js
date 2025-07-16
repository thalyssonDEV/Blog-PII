document.addEventListener('DOMContentLoaded', async () => {
    // --- Seleção de Elementos ---
    const postContainer = document.getElementById('post-container');
    const comentariosContainer = document.getElementById('comentarios-container');
    const btnAdicionarComentario = document.getElementById('btn-adicionar-comentario');
    const formComentarioContainer = document.getElementById('form-comentario-container');
    const btnCancelarComentario = document.getElementById('btn-cancelar-comentario');
    const btnEnviarComentario = document.getElementById('btn-enviar-comentario');
    const textareaComentario = document.getElementById('textarea-comentario');

    const token = localStorage.getItem('authToken');
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    // --- VARIÁVEL DE ESTADO PARA OS COMENTÁRIOS ---
    let comentariosNaTela = [];

    // --- PEGANDO ID DO USUÁRIO LOGADO ---
    let meuUserId = null;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            meuUserId = payload.userId;
        } catch (e) {
            console.error("Erro ao decodificar o token:", e);
            localStorage.removeItem('authToken');
            window.location.href = '/login.html';
            return;
        }
    }

    if (!postId) {
        postContainer.innerHTML = '<p class="text-center text-red-500">ID do post não encontrado na URL.</p>';
        return;
    }

    // --- FUNÇÃO PARA RENDERIZAR COMENTÁRIOS ---
    const renderizarTodosOsComentarios = () => {
        comentariosContainer.innerHTML = '';

        if (comentariosNaTela.length === 0) {
            comentariosContainer.innerHTML = '<p class="text-slate-500 text-center">Nenhum comentário ainda. Seja o primeiro a comentar!</p>';
            return;
        }

        // Ordenar do mais recente para o mais antigo
        comentariosNaTela.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        comentariosNaTela.forEach(comentario => {
            const comentarioHtml = `
                <div class="bg-slate-50 p-4 rounded-lg shadow-sm flex items-start space-x-4">
                    <img src="${comentario.autor.foto_url || '/assets/default-avatar.svg'}" alt="Foto de ${comentario.autor.nome}" class="w-10 h-10 rounded-full object-cover">
                    <div class="flex-1">
                        <div class="flex items-baseline space-x-2">
                            <p class="font-bold text-slate-800">${comentario.autor.nome}</p>
                            <p class="text-xs text-slate-500">${new Date(comentario.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
                        </div>
                        <p class="text-slate-700 mt-1 break-words">${comentario.texto}</p>
                    </div>
                </div>
            `;
            comentariosContainer.insertAdjacentHTML('beforeend', comentarioHtml);
        });
    };

    // --- FORMULÁRIO DE COMENTÁRIO ---
    if (btnAdicionarComentario) {
        btnAdicionarComentario.addEventListener('click', () => {
            formComentarioContainer.classList.remove('hidden');
            btnAdicionarComentario.classList.add('hidden');
        });
    }

    if (btnCancelarComentario) {
        btnCancelarComentario.addEventListener('click', () => {
            formComentarioContainer.classList.add('hidden');
            btnAdicionarComentario.classList.remove('hidden');
            textareaComentario.value = '';
        });
    }

    if (btnEnviarComentario) {
        btnEnviarComentario.addEventListener('click', async () => {
            const texto = textareaComentario.value.trim();
            if (!texto || texto.length > 300) {
                showToast('O comentário deve ter entre 1 e 300 caracteres.');
                return;
            }

            try {
                const response = await fetch(`/api/posts/${postId}/comentarios`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ texto })
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.mensagem || "Erro ao enviar comentário.");

                showToast(result.mensagem, 'success');
                textareaComentario.value = '';
                formComentarioContainer.classList.add('hidden');
                btnAdicionarComentario.classList.remove('hidden');

                comentariosNaTela.unshift(result.comentario);
                renderizarTodosOsComentarios();

            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }

    // --- CARREGAMENTO DO POST E COMENTÁRIOS ---
    try {
        const response = await fetch(`/api/posts/${postId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.mensagem || 'Post não encontrado.');
        }

        const post = await response.json();

        const ehMeuPerfil = post.autor.id === meuUserId;
        const linkPerfil = ehMeuPerfil ? '/perfil.html' : `/outro_perfil.html?id=${post.autor.id}`;

        postContainer.innerHTML = `
            <article class="bg-white p-8 rounded-xl shadow-lg">
                <h1 class="text-4xl font-bold text-slate-900 mb-4">${post.titulo}</h1>
                <div class="flex items-center mb-8 border-b pb-4">
                    <a href="${linkPerfil}">
                        <img src="${post.autor.foto_url || '/assets/default-avatar.svg'}" alt="Foto de ${post.autor.nome}" class="w-12 h-12 rounded-full mr-4 object-cover">
                    </a>
                    <div>
                        <a href="${linkPerfil}" class="font-semibold text-slate-800 hover:text-indigo-700">${post.autor.nome}</a>
                        <p class="text-sm text-slate-500">Publicado em ${new Date(post.createdAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
                <div class="prose max-w-none text-slate-800 break-words">
                    ${post.conteudo.replace(/\n/g, '<br>')}
                </div>
            </article>
        `;

        if (post.comentarios && post.comentarios.length > 0) {
            comentariosNaTela = post.comentarios;
        }
        renderizarTodosOsComentarios();

    } catch (error) {
        postContainer.innerHTML = `<p class="text-center text-red-500">${error.message}</p>`;
    }
});