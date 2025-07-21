document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const userId = new URLSearchParams(window.location.search).get('id');

    const headerInfo = document.getElementById('header-info');
    const perfilHeaderContainer = document.getElementById('perfil-header-container');
    const postsContainer = document.getElementById('posts-container');
    const lerMaisPostsContainer = document.getElementById('ler-mais-posts-container');
    let postsCursor = null;

    if (!userId) {
        document.body.innerHTML = '<p class="text-center p-8 text-red-500">ID de usuário não fornecido.</p>';
        return;
    }

    const renderizarPerfil = (perfil) => {
        // Agora 'perfil._count.posts' existe e é seguro de usar.
        const postCount = perfil._count ? perfil._count.posts : 0;

        headerInfo.innerHTML = `
            <h1 class="text-xl font-bold">${perfil.nome}</h1>
            <p class="text-sm text-slate-500 dark:text-gray-400">${postCount} posts</p>
        `;

        perfilHeaderContainer.innerHTML = `
            <div class="h-48 bg-slate-200 dark:bg-gray-700"></div>
            <div class="p-4">
                <div class="flex justify-between items-start">
                    <img class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 bg-slate-200 object-cover -mt-20" src="${perfil.foto_url || '/assets/default-avatar.svg'}" alt="Foto de ${perfil.nome}">
                    <button class="border border-slate-300 dark:border-gray-600 font-semibold py-2 px-4 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800">Seguir</button>
                </div>
                <div class="mt-4">
                    <h1 class="text-2xl font-bold text-slate-800 dark:text-gray-100">${perfil.nome}</h1>
                    <p class="text-slate-600 dark:text-gray-400 mt-1">@${perfil.nome.toLowerCase().replace(/ /g, '_')}</p>
                    <p class="text-base text-slate-700 dark:text-gray-300 mt-3">Juntou-se em ${new Date(perfil.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                </div>
            </div>
        `;
    };

    const renderizarPosts = (posts) => {
        if (posts.length === 0 && postsContainer.innerHTML === '') {
            postsContainer.innerHTML = '<p class="text-center p-8 text-slate-500 dark:text-gray-400">Este usuário ainda não publicou nada.</p>';
            return;
        }
        const postsHtml = posts.map(post => {
            const dataPost = new Date(post.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short' });
            return `
            <article class="p-4 border-b border-slate-200 dark:border-gray-700 flex space-x-4 hover:bg-slate-50 dark:hover:bg-gray-800/50 cursor-pointer" onclick="window.location.href='/post.html?id=${post.id}'">
                <div class="flex-1 min-w-0">
                    <span class="text-xs text-slate-500 dark:text-gray-500">${dataPost}</span>
                    <h2 class="text-lg font-bold mt-1 truncate">${post.titulo}</h2>
                    <p class="mt-1 text-base text-slate-600 dark:text-gray-300 line-clamp-2">${post.conteudo}</p>
                </div>
            </article>`;
        }).join('');
        postsContainer.insertAdjacentHTML('beforeend', postsHtml);
    };

    const carregarMaisPosts = async () => {
        const url = `/api/usuario/${userId}/posts${postsCursor ? `?cursor=${postsCursor}` : ''}`;
        try {
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            renderizarPosts(data.posts);
            postsCursor = data.nextCursor;
            if (postsCursor) {
                lerMaisPostsContainer.innerHTML = `<button id="btn-ler-mais-posts" class="border border-slate-300 dark:border-gray-600 font-semibold py-2 px-4 rounded-full">Carregar mais</button>`;
                document.getElementById('btn-ler-mais-posts').addEventListener('click', carregarMaisPosts);
            } else {
                lerMaisPostsContainer.innerHTML = '';
            }
        } catch (error) { console.error("Erro ao carregar posts:", error); }
    };
    
    const carregarPerfil = async () => {
        try {
            const response = await fetch(`/api/perfil/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Usuário não encontrado');
            const perfil = await response.json();
            renderizarPerfil(perfil);
            carregarMaisPosts();
        } catch (error) {
            document.body.innerHTML = `<p class="text-center p-8 text-red-500">${error.message}</p>`;
        }
    };

    carregarPerfil();
});