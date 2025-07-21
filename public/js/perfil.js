document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    
    let meuUserId = null;
    const perfilInfoContainer = document.getElementById('perfil-info-container');
    const fotoPreview = document.getElementById('foto-preview');
    
    const postsContainer = document.getElementById('meus-posts-container');
    const comentariosContainer = document.getElementById('meus-comentarios-container');
    const lerMaisPostsContainer = document.getElementById('ler-mais-posts-container');
    const lerMaisComentariosContainer = document.getElementById('ler-mais-comentarios-container');
    let postsCursor = null;
    let comentariosCursor = null;

    const postDeleteModal = document.getElementById('modal-confirmar-exclusao-post');
    const btnCancelPostDelete = document.getElementById('btn-modal-cancelar-post');
    const btnConfirmPostDelete = document.getElementById('btn-modal-confirmar-post');


    const setupTabs = () => {
        const tabs = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                tabs.forEach(t => {
                    t.classList.remove('border-accent-600', 'text-accent-600', 'dark:border-accent-500', 'dark:text-accent-500');
                    t.classList.add('text-slate-500', 'dark:text-gray-500');
                });
                tab.classList.add('border-accent-600', 'text-accent-600', 'dark:border-accent-500', 'dark:text-accent-500');
                tab.classList.remove('text-slate-500', 'dark:text-gray-500');
                tabContents.forEach(content => {
                    content.id === `tab-content-${target}` ? content.classList.remove('hidden') : content.classList.add('hidden');
                });
            });
        });
    };
    
    const renderizarPosts = (posts) => {
        if (posts.length === 0 && postsContainer.innerHTML === '') {
            postsContainer.innerHTML = '<p class="text-slate-500 dark:text-gray-400 p-8 text-center">Você ainda não criou nenhum post.</p>';
            return;
        }
        const postsHtml = posts.map(post => `
            <article id="post-${post.id}" class="p-4 border-b border-slate-200 dark:border-gray-700 relative group/article">
                <div class="flex space-x-4">
                    <div class="flex-1 min-w-0">
                        <span class="text-sm text-slate-500 dark:text-gray-400">${new Date(post.createdAt).toLocaleDateString('pt-BR', {day: '2-digit', month: 'long', year: 'numeric'})}</span>
                        <h2 class="text-lg font-bold mt-1 truncate">${post.titulo}</h2>
                        <p class="mt-1 text-base text-slate-600 dark:text-gray-300 line-clamp-2 break-words">${post.conteudo}</p>
                        <a href="/post.html?id=${post.id}" class="text-accent-600 dark:text-accent-500 font-semibold mt-2 inline-block">Ver post completo &rarr;</a>
                    </div>
                    <button data-post-id="${post.id}" class="btn-deletar-post absolute top-4 right-4 text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-500/10 opacity-0 group-hover/article:opacity-100 transition-opacity">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                    </button>
                </div>
            </article>`).join('');
        postsContainer.insertAdjacentHTML('beforeend', postsHtml);
    };

    const renderizarComentarios = (comentarios) => {
        if (comentarios.length === 0 && comentariosContainer.innerHTML.trim() === '') {
            comentariosContainer.innerHTML = '<p class="text-slate-500 dark:text-gray-400 text-center p-8">Você ainda não fez nenhum comentário.</p>';
            return;
        }
        const comentariosHtml = comentarios.map(c => `
            <div class="border border-slate-200 dark:border-gray-700 p-3 rounded-lg bg-slate-50 dark:bg-gray-800">
                <p class="text-slate-700 dark:text-gray-300 break-words">"${c.texto}"</p>
                <a href="/post.html?id=${c.postId}" class="text-xs text-slate-500 dark:text-gray-500 mt-2 block hover:underline">
                    ...em resposta a: <strong>${c.post.titulo}</strong>
                </a>
            </div>`).join('');
        comentariosContainer.insertAdjacentHTML('beforeend', comentariosHtml);
    };

    const carregarMais = async (tipo) => {
        const isPosts = tipo === 'posts';
        const url = `/api/usuario/${meuUserId}/${tipo}${isPosts ? (postsCursor ? `?cursor=${postsCursor}` : '') : (comentariosCursor ? `?cursor=${comentariosCursor}` : '')}`;
        const lerMaisContainer = isPosts ? lerMaisPostsContainer : lerMaisComentariosContainer;
        
        try {
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            
            if(isPosts) {
                renderizarPosts(data.posts);
                postsCursor = data.nextCursor;
            } else {
                renderizarComentarios(data.comentarios);
                comentariosCursor = data.nextCursor;
            }

            const nextCursor = isPosts ? postsCursor : comentariosCursor;
            if (nextCursor) {
                lerMaisContainer.innerHTML = `<button id="btn-ler-mais-${tipo}" class="border border-slate-300 dark:border-gray-600 font-semibold py-2 px-4 rounded-full">Carregar mais</button>`;
                document.getElementById(`btn-ler-mais-${tipo}`).addEventListener('click', () => carregarMais(tipo));
            } else {
                lerMaisContainer.innerHTML = '';
            }
        } catch (error) { console.error(`Erro ao carregar ${tipo}:`, error); }
    };
    
    const setupEventListeners = () => {
        postsContainer.addEventListener('click', (event) => {
            const deleteButton = event.target.closest('.btn-deletar-post');
            if (deleteButton) {
                const postId = deleteButton.dataset.postId;
                if(postDeleteModal) {
                    btnConfirmPostDelete.dataset.postId = postId;
                    postDeleteModal.classList.remove('hidden');
                    postDeleteModal.classList.add('flex');
                }
            }
        });

        if(btnConfirmPostDelete) {
            btnConfirmPostDelete.addEventListener('click', async () => {
                const postId = btnConfirmPostDelete.dataset.postId;
                if (!postId) return;
                try {
                    const response = await fetch(`/api/posts/${postId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.mensagem);
                    document.getElementById(`post-${postId}`)?.remove();
                    showToast(result.mensagem, 'success');
                } catch (error) {
                    showToast(error.message, 'error');
                } finally {
                    if(postDeleteModal) {
                        postDeleteModal.classList.add('hidden');
                        postDeleteModal.classList.remove('flex');
                    }
                }
            });
        }
        
        if(btnCancelPostDelete) {
            btnCancelPostDelete.addEventListener('click', () => {
                if(postDeleteModal) {
                    postDeleteModal.classList.add('hidden');
                    postDeleteModal.classList.remove('flex');
                }
            });
        }

        const btnAlterarFoto = document.getElementById('btn-alterar-foto');
        const inputFotoUpload = document.getElementById('input-foto-upload');
        const btnIniciarExclusao = document.getElementById('btn-iniciar-exclusao');
        const secaoConfirmar = document.getElementById('secao-confirmar-exclusao');
        const btnCancelarExclusao = document.getElementById('btn-cancelar-exclusao');
        const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');
        const inputSenha = document.getElementById('input-senha-confirmacao');
        
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
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
    
    const carregarPagina = async () => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            meuUserId = payload.userId;
            const perfilResponse = await fetch(`/api/perfil/${meuUserId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!perfilResponse.ok) throw new Error('Falha ao buscar perfil.');
            const perfil = await perfilResponse.json();
            perfilInfoContainer.innerHTML = `<h1 class="text-2xl font-bold">${perfil.nome}</h1><p class="text-slate-600 dark:text-gray-400 mt-1">${perfil.email}</p>`;
            fotoPreview.src = perfil.foto_url || '/assets/default-avatar.svg';
            
            await carregarMais('posts');
            await carregarMais('comentarios');
            
            setupTabs();
            setupEventListeners();
        } catch (error) {
            localStorage.removeItem('authToken');
            window.location.href = '/login.html';
        }
    };
    
    carregarPagina();
});