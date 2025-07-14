document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    
    // Variáveis de estado
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
        const postsHtml = posts.map(post => `
            <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-bold text-lg">${post.titulo}</h3>
                <p class="text-sm text-slate-600">${post.conteudo.substring(0, 100)}...</p>
            </div>
        `).join('');
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
        // Pega o ID do usuário da URL da página
        const urlParams = new URLSearchParams(window.location.search);
        userId = urlParams.get('id');

        if (!userId) {
            document.querySelector('main').innerHTML = '<p class="text-center text-red-500">ID de usuário não fornecido.</p>';
            return;
        }

        try {
            // Busca os dados básicos do perfil
            const perfilResponse = await fetch(`/api/perfil/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!perfilResponse.ok) {
                throw new Error('Falha ao buscar perfil. O usuário pode não existir.');
            }
            const perfil = await perfilResponse.json();

            // Renderiza as informações do perfil
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

            // Carrega o primeiro lote de posts
            await carregarMaisPosts();

        } catch (error) {
            console.error(error);
            document.querySelector('main').innerHTML = `<p class="text-center text-red-500">${error.message}</p>`;
        }
    };

    // Inicia o carregamento da página
    carregarPagina();
});