document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const postsContainer = document.getElementById('posts-container');
    const paginationContainer = document.getElementById('pagination-container');

    // NOVO: Bloco para decodificar o token e obter o ID do usuário logado
    let meuUserId = null;
    if (token) {
        try {
            // Decodifica a parte do meio (payload) do token JWT para pegar o userId
            const payload = JSON.parse(atob(token.split('.')[1]));
            meuUserId = payload.userId;
        } catch (e) {
            console.error("Erro ao decodificar o token:", e);
            // Se o token for inválido, desloga o usuário por segurança
            localStorage.removeItem('authToken');
            window.location.href = '/login.html';
            return; // Para a execução do script
        }
    }

    // Variável de estado para controlar a paginação
    let currentPage = 1;

    // --- FUNÇÃO PARA RENDERIZAR OS POSTS ---
    const renderizarPosts = (posts) => {
        postsContainer.innerHTML = ''; // Limpa os posts antigos
        if (posts.length === 0) {
            postsContainer.innerHTML = '<p class="text-center text-slate-500">Nenhum post encontrado.</p>';
            return;
        }

        const postsHtml = posts.map(post => {
            const limiteCaracteres = 500;
            let conteudoExibido = post.conteudo;
            if (post.conteudo.length > limiteCaracteres) {
                conteudoExibido = post.conteudo.substring(0, limiteCaracteres) + '...';
            }

            // Lógica para criar o link de perfil correto
            const ehMeuPerfil = post.autor.id === meuUserId;
            const linkPerfil = ehMeuPerfil ? '/perfil.html' : `/outro_perfil.html?id=${post.autor.id}`;

            return `
                <article class="bg-white p-6 rounded-lg shadow-md">
                    <div class="flex items-center mb-4">
                        <a href="/outro_perfil.html?id=${post.autor.id}">
                            <img src="${post.autor.foto_url || '/assets/default-avatar.svg'}" alt="Foto de ${post.autor.nome}" class="w-12 h-12 rounded-full mr-4 object-cover">
                        </a>
                        <div>
                            <a href="/outro_perfil.html?id=${post.autor.id}" class="font-bold text-slate-800 hover:text-indigo-600">${post.autor.nome}</a>
                            <p class="text-sm text-slate-500">${new Date(post.createdAt).toLocaleString('pt-BR', {dateStyle: 'short', timeStyle: 'short'})}</p>
                        </div>
                    </div>
                    <h2 class="text-2xl font-bold mb-2">${post.titulo}</h2>
                    <p class="text-slate-700 break-words">${conteudoExibido}</p>
                    <div class="mt-4 pt-4 border-t border-slate-200">
                        <a href="/post.html?id=${post.id}" class="font-medium text-indigo-600 hover:text-indigo-700">Ver post completo &rarr;</a>
                        <a href="/post.html?id=${post.id}#comentarios-secao" class="font-medium text-slate-600 hover:text-indigo-700 ml-4">Ver comentários</a>
                    </div>
                </article>
            `;
        }).join('');
        postsContainer.innerHTML = postsHtml;
    };

    // --- FUNÇÃO PARA RENDERIZAR OS CONTROLES DE PAGINAÇÃO ---
    const renderizarPaginacao = (totalPages) => {
        paginationContainer.innerHTML = '';
        if (totalPages <= 1) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'flex items-center gap-4';

        const btnAnterior = document.createElement('button');
        btnAnterior.innerHTML = '← Anterior';
        btnAnterior.disabled = currentPage === 1;
        btnAnterior.className = 'bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
        btnAnterior.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                fetchPosts(currentPage);
            }
        });

        const infoPagina = document.createElement('span');
        infoPagina.textContent = `Página ${currentPage} de ${totalPages}`;
        infoPagina.className = 'text-slate-700 font-medium';

        const btnProximo = document.createElement('button');
        btnProximo.innerHTML = 'Próximo →';
        btnProximo.disabled = currentPage === totalPages;
        btnProximo.className = 'bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
        btnProximo.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                fetchPosts(currentPage);
            }
        });

        // Adiciona os elementos ao wrapper
        wrapper.appendChild(btnAnterior);
        wrapper.appendChild(infoPagina);
        wrapper.appendChild(btnProximo);

        // Aplica as classes para centralizar tudo com espaçamento inferior
        paginationContainer.className = 'mt-8 mb-12 flex flex-col items-center gap-4';
        paginationContainer.appendChild(wrapper);
    };

    // --- FUNÇÃO PRINCIPAL PARA BUSCAR OS POSTS ---
    const fetchPosts = async (page) => {
        try {
            const response = await fetch(`/api/posts?page=${page}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error('Erro ao carregar os posts.');
            }
            const data = await response.json();
            
            renderizarPosts(data.posts);
            renderizarPaginacao(data.totalPages);

        } catch (error) {
            postsContainer.innerHTML = `<p class="text-center text-red-500">${error.message}</p>`;
        }
    };

    // --- INICIALIZAÇÃO ---
    const successMessage = localStorage.getItem('post-creation-success');
    if (successMessage) {
        showToast(successMessage, 'success');
        localStorage.removeItem('post-creation-success');
    }

    fetchPosts(currentPage);
});