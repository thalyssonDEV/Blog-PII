document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    
    let postsCursor = null;
    let userId = null;

    // --- Elementos do DOM ---
    const perfilInfoContainer = document.getElementById('perfil-info-container');
    const postsContainer = document.getElementById('posts-usuario-container');
    const lerMaisPostsContainer = document.getElementById('ler-mais-posts-container');
    const nomeUsuarioTitulo = document.getElementById('nome-usuario-titulo');

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    const renderizarPosts = (posts) => {
        if (posts.length === 0 && postsContainer.innerHTML === '') {
            postsContainer.innerHTML = '<p class="text-slate-500">Este usuário ainda não criou nenhum post.</p>';
            return;
        }

        // --- LÓGICA DE RENDERIZAÇÃO ATUALIZADA ---
        const postsHtml = posts.map(post => {
            const limiteCaracteres = 200;
            let conteudoExibido = post.conteudo;
            if (post.conteudo.length > limiteCaracteres) {
                conteudoExibido = post.conteudo.substring(0, limiteCaracteres) + '...';
            }
            return `
            <article class="bg-white p-6 rounded-lg shadow flex flex-col">
                <h2 class="text-xl font-bold mb-2">${post.titulo}</h2>
                <p class="text-slate-700 break-words flex-grow">${conteudoExibido}</p>
                <div class="mt-4 pt-4 border-t border-slate-200">
                    <a href="/post.html?id=${post.id}" class="font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
                        Ver post completo
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </a>
                </div>
            </article>`;
        }).join('');
        // --- FIM DA LÓGICA ATUALIZADA ---

        postsContainer.innerHTML += postsHtml;
    };

    // --- FUNÇÃO DE FETCH (PAGINAÇÃO) ---
    const carregarMaisPosts = async () => {
        if (!userId) return;
        const url = `/api/usuario/${userId}/posts${postsCursor ? `?cursor=${postsCursor}` : ''}`;
        
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
            lerMaisPostsContainer.innerHTML = '<p class="text-red-500">Não foi possível carregar mais posts.</p>';
        }
    };

    // --- FUNÇÃO DE INICIALIZAÇÃO DA PÁGINA ---
    const carregarPagina = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        userId = urlParams.get('id');

        if (!userId) {
            document.querySelector('main').innerHTML = '<p class="text-center text-red-500">ID de usuário não fornecido.</p>';
            return;
        }

        try {
            const perfilResponse = await fetch(`/api/perfil/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!perfilResponse.ok) {
                throw new Error('Falha ao buscar perfil. O usuário pode não existir.');
            }
            const perfil = await perfilResponse.json();

            if (perfilInfoContainer) {
                perfilInfoContainer.innerHTML = `
                    <div class="relative flex-shrink-0">
                        <img class="w-32 h-32 rounded-full border-4 border-indigo-200 bg-slate-200 object-cover" src="${perfil.foto_url || '/assets/default-avatar.svg'}" alt="Foto de ${perfil.nome}">
                    </div>
                    <div class="mt-6 sm:mt-0 sm:ml-8">
                        <h1 class="text-3xl font-bold text-slate-800">${perfil.nome}</h1>
                        <p class="text-slate-600">${perfil.email}</p>
                    </div>
                `;
            }
            
            if (nomeUsuarioTitulo) {
                nomeUsuarioTitulo.textContent = perfil.nome;
            }

            await carregarMaisPosts();

        } catch (error) {
            console.error(error);
            document.querySelector('main').innerHTML = `<p class="text-center text-red-500">${error.message}</p>`;
        }
    };

    carregarPagina();
});