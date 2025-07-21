document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const postsContainer = document.getElementById('posts-container');
    const paginationContainer = document.getElementById('pagination-container');
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

    let currentPage = 1;

    const renderizarPosts = (posts) => {
        postsContainer.innerHTML = '';
        if (posts.length === 0) {
            postsContainer.innerHTML = '<p class="text-center text-slate-500 dark:text-gray-400 p-8">Nenhum post encontrado. Siga outros usuários ou crie o seu primeiro post!</p>';
            return;
        }

        const postsHtml = posts.map(post => {
            const ehMeuPerfil = post.autor.id === meuUserId;
            const linkPerfil = ehMeuPerfil ? '/perfil.html' : `/outro_perfil.html?id=${post.autor.id}`;
            const dataPost = new Date(post.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
            const commentCount = post._count ? post._count.comentarios : 0;

            return `
            <article class="p-4 border-b border-slate-200 dark:border-gray-700 flex space-x-4 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer" data-post-id="${post.id}">
                <div class="flex-shrink-0">
                    <a href="${linkPerfil}" class="author-link">
                        <img src="${post.autor.foto_url || '/assets/default-avatar.svg'}" alt="Foto de ${post.autor.nome}" class="w-12 h-12 rounded-full object-cover">
                    </a>
                </div>
                
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 text-sm">
                        <a href="${linkPerfil}" class="font-bold hover:underline author-link">${post.autor.nome}</a>
                        <span class="text-slate-600 dark:text-gray-400">@${post.autor.nome.toLowerCase().replace(/ /g,'_')} · ${dataPost}</span>
                    </div>

                    <h2 class="text-lg font-bold mt-1 truncate">${post.titulo}</h2>
                    
                    <p class="mt-1 text-base text-slate-600 dark:text-gray-300 line-clamp-3 break-words">
                        ${post.conteudo}
                    </p>

                    <div class="flex justify-start items-center mt-3 max-w-sm text-slate-500 dark:text-gray-500">
                        <a href="/post.html?id=${post.id}#comentarios-secao" class="group flex items-center gap-2 mr-8 comment-link">
                            <div class="p-2 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50">
                                <svg class="w-5 h-5 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            </div>
                           <span class="text-xs group-hover:text-blue-500">${commentCount}</span>
                        </a>
                        <button class="btn-share group flex items-center" data-post-title="${post.titulo}">
                           <div class="p-2 rounded-full group-hover:bg-green-100 dark:group-hover:bg-green-900/50">
                                <svg class="w-5 h-5 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                            </div>
                        </button>
                    </div>
                </div>
            </article>
            `;
        }).join('');

        postsContainer.innerHTML = postsHtml;
        const articles = postsContainer.querySelectorAll('article');
        articles.forEach((article, index) => {
            article.style.opacity = '0';
            article.style.animation = `fadeInUp 0.4s ease-out ${index * 0.07}s forwards`;
        });
    };
    
    const setupFeedClickListener = () => {
        postsContainer.addEventListener('click', async (event) => {
            const target = event.target;
            
            const shareButton = target.closest('.btn-share');
            const authorLink = target.closest('.author-link');
            const commentLink = target.closest('.comment-link');
            const articleCard = target.closest('article');

            if (!articleCard) return;

            if (shareButton) {
                event.preventDefault(); 
                const postId = articleCard.dataset.postId;
                const postTitle = shareButton.dataset.postTitle;
                const fullUrl = `${window.location.origin}/post.html?id=${postId}`;

                if (navigator.share) {
                    try {
                        await navigator.share({ title: postTitle, text: `Confira este post: ${postTitle}`, url: fullUrl });
                    } catch (err) {
                        console.log('Compartilhamento cancelado ou falhou:', err);
                    }
                } else {
                    try {
                        await navigator.clipboard.writeText(fullUrl);
                        showToast('Link copiado para a área de transferência!', 'success');
                    } catch (err) {
                        showToast('Não foi possível copiar o link.', 'error');
                    }
                }
                return; 
            }

            if (authorLink || commentLink) {
                return;
            }

            const postId = articleCard.dataset.postId;
            window.location.href = `/post.html?id=${postId}`;
        });
    };

    const renderizarPaginacao = (totalPages) => {
        paginationContainer.innerHTML = '';
        if (totalPages <= 1) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'flex items-center justify-center gap-4';
        const btnAnterior = document.createElement('button');
        btnAnterior.innerHTML = '← Anterior';
        btnAnterior.disabled = currentPage === 1;
        btnAnterior.className = 'border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 font-semibold py-2 px-4 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed';
        btnAnterior.addEventListener('click', () => { if (currentPage > 1) { currentPage--; fetchPosts(currentPage); } });
        const infoPagina = document.createElement('span');
        infoPagina.textContent = `Página ${currentPage} de ${totalPages}`;
        infoPagina.className = 'text-slate-700 dark:text-gray-300 font-medium';
        const btnProximo = document.createElement('button');
        btnProximo.innerHTML = 'Próximo →';
        btnProximo.disabled = currentPage === totalPages;
        btnProximo.className = 'border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 font-semibold py-2 px-4 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed';
        btnProximo.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; fetchPosts(currentPage); } });
        wrapper.appendChild(btnAnterior);
        wrapper.appendChild(infoPagina);
        wrapper.appendChild(btnProximo);
        paginationContainer.appendChild(wrapper);
    };

    const fetchPosts = async (page) => {
        try {
            postsContainer.innerHTML = '<p class="text-center text-slate-500 dark:text-gray-400 p-8">Carregando posts...</p>';
            const response = await fetch(`/api/posts?page=${page}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) {
                throw new Error('Erro ao carregar os posts.');
            }
            const data = await response.json();
            renderizarPosts(data.posts);
            renderizarPaginacao(data.totalPages);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            postsContainer.innerHTML = `<p class="text-center text-red-500 p-8">${error.message}</p>`;
        }
    };
    
    fetchPosts(currentPage);
    setupFeedClickListener();
});