// Espera o HTML inteiro ser carregado antes de executar qualquer código
document.addEventListener('DOMContentLoaded', () => {
    // Pega o token de autenticação, que será usado em todas as requisições
    const token = localStorage.getItem('authToken');
    
    // Variáveis de estado para controlar a paginação
    let postsCursor = null;
    let comentariosCursor = null;
    let meuUserId = null;

    // --- Seleciona os contêineres principais que sempre existem na página ---
    const perfilInfoContainer = document.getElementById('perfil-info-container');
    const postsContainer = document.getElementById('meus-posts-container');
    const comentariosContainer = document.getElementById('meus-comentarios-container');
    const lerMaisPostsContainer = document.getElementById('ler-mais-posts-container');
    const lerMaisComentariosContainer = document.getElementById('ler-mais-comentarios-container');

    // --- FUNÇÕES DE RENDERIZAÇÃO ---

    const renderizarPosts = (posts) => {
        if (posts.length === 0 && postsContainer.innerHTML === '') {
            postsContainer.innerHTML = '<p class="text-slate-500">Você ainda não criou nenhum post.</p>';
            return;
        }

        // --- LÓGICA DE RENDERIZAÇÃO CORRIGIDA (IGUAL À DO FEED) ---
        const postsHtml = posts.map(post => {
            const limiteCaracteres = 200;
            let conteudoExibido = post.conteudo;
            if (post.conteudo.length > limiteCaracteres) {
                conteudoExibido = post.conteudo.substring(0, limiteCaracteres) + '...';
            }

            return `
            <article id="post-${post.id}" class="bg-white p-6 rounded-lg shadow flex flex-col relative">
                <button data-post-id="${post.id}" class="btn-deletar-post absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                </button>
                <h2 class="text-xl font-bold mb-2 pr-8">${post.titulo}</h2>
                <p class="text-slate-700 break-words flex-grow">${post.conteudo.substring(0, 500)}...</p>
                <div class="mt-4 pt-4 border-t border-slate-200">
                    <a href="/post.html?id=${post.id}" class="font-medium text-indigo-600 hover:text-indigo-700">Ver post completo</a>
                </div>
            </article>`;
        }).join('');
        // --- FIM DA LÓGICA ATUALIZADA ---

        postsContainer.innerHTML += postsHtml;
    };

    const renderizarComentarios = (comentarios) => {
        if (comentarios.length === 0 && comentariosContainer.innerHTML === '') {
            comentariosContainer.innerHTML = '<p class="text-slate-500">Você ainda não fez nenhum comentário.</p>';
            return;
        }
        const comentariosHtml = comentarios.map(comentario => `
            <div class="bg-white p-3 rounded-lg shadow-sm">
                <p class="text-slate-700">"${comentario.texto}"</p>
                <p class="text-xs text-slate-500 mt-1">...em resposta ao post: <strong>${comentario.post.titulo}</strong></p>
            </div>`).join('');
        comentariosContainer.innerHTML += comentariosHtml;
    };

    // --- FUNÇÕES DE FETCH (PAGINAÇÃO) ---
    const carregarMaisPosts = async () => {
        if (!meuUserId) return;
        const url = `/api/usuario/${meuUserId}/posts${postsCursor ? `?cursor=${postsCursor}` : ''}`;
        try {
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            renderizarPosts(data.posts);
            postsCursor = data.nextCursor;
            if (postsCursor) {
                lerMaisPostsContainer.innerHTML = `<button id="btn-ler-mais-posts" class="bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-lg hover:bg-indigo-200">Carregar mais posts</button>`;
                document.getElementById('btn-ler-mais-posts').addEventListener('click', carregarMaisPosts);
            } else {
                lerMaisPostsContainer.innerHTML = '';
            }
        } catch (error) {
            console.error("Erro ao carregar posts:", error);
        }
    };

    const carregarMaisComentarios = async () => {
        if (!meuUserId) return;
        const url = `/api/usuario/${meuUserId}/comentarios${comentariosCursor ? `?cursor=${comentariosCursor}` : ''}`;
        try {
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            renderizarComentarios(data.comentarios);
            comentariosCursor = data.nextCursor;
            if (comentariosCursor) {
                lerMaisComentariosContainer.innerHTML = `<button id="btn-ler-mais-comentarios" class="bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-lg hover:bg-indigo-200">Carregar mais comentários</button>`;
                document.getElementById('btn-ler-mais-comentarios').addEventListener('click', carregarMaisComentarios);
            } else {
                lerMaisComentariosContainer.innerHTML = '';
            }
        } catch (error) {
            console.error("Erro ao carregar comentários:", error);
        }
    };

    // --- FUNÇÃO PARA CONFIGURAR TODOS OS EVENT LISTENERS ---
    const setupEventListeners = () => {
        const btnAlterarFoto = document.getElementById('btn-alterar-foto');
        const inputFotoUpload = document.getElementById('input-foto-upload');
        const fotoPreview = document.getElementById('foto-preview');
        const btnIniciarExclusao = document.getElementById('btn-iniciar-exclusao');
        const secaoConfirmar = document.getElementById('secao-confirmar-exclusao');
        const btnCancelarExclusao = document.getElementById('btn-cancelar-exclusao');
        const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');
        const inputSenha = document.getElementById('input-senha-confirmacao');
        const modal = document.getElementById('modal-confirmar-exclusao');
        const btnModalCancelar = document.getElementById('btn-modal-cancelar');
        const btnModalConfirmar = document.getElementById('btn-modal-confirmar');

        const abrirModalDelecao = (postId) => {
            // Define qual post será deletado quando o botão "Sim" for clicado
            if(btnModalConfirmar) btnModalConfirmar.dataset.postId = postId;
            if(modal) modal.classList.remove('hidden');
        };

        const fecharModalDelecao = () => {
            if(modal) modal.classList.add('hidden');
            if(btnModalConfirmar) btnModalConfirmar.dataset.postId = '';
        };

        // Adiciona o listener para fechar o modal
        if(btnModalCancelar) btnModalCancelar.addEventListener('click', fecharModalDelecao);

        // Adiciona o listener para confirmar a deleção
        if(btnModalConfirmar) {
            btnModalConfirmar.addEventListener('click', async () => {
                const postId = btnModalConfirmar.dataset.postId;
                if (!postId) return;

                try {
                    const response = await fetch(`/api/posts/${postId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.mensagem);
                    }

                    // Remove o post da tela e fecha o modal
                    document.getElementById(`post-${postId}`).remove();
                    fecharModalDelecao();
                    showToast(result.mensagem, 'success');

                } catch (error) {
                    showToast(error.message, 'error');
                }
            });
        }

        // --- ADICIONA EVENTO NO CONTAINER DOS POSTS (DELEGAÇÃO) ---
        const postsContainer = document.getElementById('meus-posts-container');
        if(postsContainer) {
            postsContainer.addEventListener('click', (event) => {
                const deleteButton = event.target.closest('.btn-deletar-post');
                if (deleteButton) {
                    const postId = deleteButton.dataset.postId;
                    abrirModalDelecao(postId);
                }
            });
        }

        if (btnAlterarFoto && inputFotoUpload) {
            btnAlterarFoto.addEventListener('click', () => inputFotoUpload.click());
            inputFotoUpload.addEventListener('change', async () => {
                const file = inputFotoUpload.files?.[0];
                if (!file) return;
                if (fotoPreview) fotoPreview.src = URL.createObjectURL(file);
                const formData = new FormData();
                formData.append('foto', file);
                try {
                    const response = await fetch('/api/perfil/foto', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: formData
                    });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.mensagem || 'Erro ao fazer upload.');
                    showToast('Foto de perfil atualizada!', 'success');
                } catch (error) {
                    showToast(error.message, 'error');
                    carregarPagina();
                }
            });
        }

        if (btnIniciarExclusao && secaoConfirmar) {
            btnIniciarExclusao.addEventListener('click', () => {
                secaoConfirmar.classList.remove('hidden');
                btnIniciarExclusao.classList.add('hidden');
            });
        }

        if (btnCancelarExclusao && secaoConfirmar) {
            btnCancelarExclusao.addEventListener('click', () => {
                secaoConfirmar.classList.add('hidden');
                btnIniciarExclusao.classList.remove('hidden');
                if(inputSenha) inputSenha.value = '';
            });
        }

        if (btnConfirmarExclusao) {
            btnConfirmarExclusao.addEventListener('click', async () => {
                const senha = inputSenha.value;
                if (!senha) {
                    showToast('Por favor, digite sua senha para confirmar.');
                    return;
                }
                try {
                    const response = await fetch('/api/perfil/meu', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ senha })
                    });
                    const result = await response.json();
                    if (!response.ok) {
                        showToast(result.mensagem, 'error');
                        return;
                    }
                    showToast(result.mensagem, 'success');
                    localStorage.removeItem('authToken');
                    setTimeout(() => window.location.href = '/login.html', 2000);
                } catch (error) {
                    showToast('Erro de conexão ao tentar deletar a conta.');
                }
            });
        }
    };

    // --- FUNÇÃO DE INICIALIZAÇÃO DA PÁGINA ---
    const carregarPagina = async () => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            meuUserId = payload.userId;

            const perfilResponse = await fetch(`/api/perfil/${meuUserId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!perfilResponse.ok) throw new Error('Falha ao buscar perfil.');
            const perfil = await perfilResponse.json();

            if (perfilInfoContainer) {
                perfilInfoContainer.innerHTML = `
                    <div class="relative mb-6 sm:mb-0 sm:mr-8 flex-shrink-0">
                        <img id="foto-preview" class="w-32 h-32 rounded-full border-4 border-indigo-200 bg-slate-200 object-cover" src="${perfil.foto_url || '/assets/default-avatar.svg'}" alt="Foto de Perfil">
                        <button id="btn-alterar-foto" class="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" title="Alterar foto de perfil">
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
                        </button>
                        <input type="file" id="input-foto-upload" class="hidden" accept="image/*">
                    </div>
                    <div>
                        <h1 id="perfil-nome" class="text-3xl font-bold text-slate-800">${perfil.nome}</h1>
                        <p id="perfil-email" class="text-slate-600 mt-1">${perfil.email}</p>
                    </div>`;
            }

            await carregarMaisPosts();
            await carregarMaisComentarios();
            
            setupEventListeners();
        } catch (error) {
            console.error("Falha ao carregar perfil, redirecionando para login:", error);
            // 1. Remove o token inválido que causou o erro
            localStorage.removeItem('authToken');
            
            // 2. Redireciona o usuário para a página de login
            window.location.href = '/login.html';
        }
    };

    carregarPagina();
});