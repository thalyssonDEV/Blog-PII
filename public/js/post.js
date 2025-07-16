document.addEventListener('DOMContentLoaded', async () => {
    const postContainer = document.getElementById('post-container');
    const token = localStorage.getItem('authToken');

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        postContainer.innerHTML = '<p class="text-center text-red-500">ID do post não encontrado na URL.</p>';
        return;
    }

    try {
        const response = await fetch(`/api/posts/${postId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.mensagem || 'Post não encontrado.');
        }

        const post = await response.json();

        postContainer.innerHTML = `
            <article class="bg-white p-8 rounded-xl shadow-lg">
                <h1 class="text-4xl font-bold text-slate-900 mb-4">${post.titulo}</h1>
                <div class="flex items-center mb-8 border-b pb-4">
                    <a href="/outro_perfil.html?id=${post.autor.id}">
                        <img src="${post.autor.foto_url || '/assets/default-avatar.svg'}" alt="Foto de ${post.autor.nome}" class="w-12 h-12 rounded-full mr-4 object-cover">
                    </a>
                    <div>
                        <p class="font-semibold text-slate-800">${post.autor.nome}</p>
                        <p class="text-sm text-slate-500">Publicado em ${new Date(post.createdAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
                <div class="prose max-w-none text-slate-800 break-words">
                    ${post.conteudo.replace(/\n/g, '<br>')}
                </div>
            </article>
        `;

    } catch (error) {
        postContainer.innerHTML = `<p class="text-center text-red-500">${error.message}</p>`;
    }
});