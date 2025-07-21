document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const postId = new URLSearchParams(window.location.search).get('id');

    const postContainer = document.getElementById('post-container');
    const comentariosContainer = document.getElementById('comentarios-container');
    const formComentario = document.getElementById('form-comentario');
    const textoComentario = document.getElementById('texto-comentario');
    const replyingToUser = document.getElementById('replying-to-user');
    const meuAvatar = document.getElementById('meu-avatar');
    
    let meuUserId = null;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            meuUserId = payload.userId;
            fetch(`/api/perfil/${meuUserId}`, { headers: { 'Authorization': `Bearer ${token}` }})
                .then(res => res.json())
                .then(data => {
                    if (data.foto_url && meuAvatar) {
                        meuAvatar.src = data.foto_url;
                    }
                });
        } catch (e) { console.error("Erro ao decodificar token:", e); }
    }

    if (!postId) {
        postContainer.innerHTML = '<p class="text-center p-8 text-red-500">ID do post não encontrado.</p>';
        return;
    }

    const renderizarPost = (post) => {
        const dataPost = new Date(post.createdAt).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' });
        const username = post.autor.nome.toLowerCase().replace(/ /g, '_');
        
        if (replyingToUser) {
            replyingToUser.textContent = `@${username}`;
        }
        
        postContainer.innerHTML = `
            <div class="flex items-center gap-3">
                <a href="/outro_perfil.html?id=${post.autor.id}">
                    <img src="${post.autor.foto_url || '/assets/default-avatar.svg'}" alt="Foto de ${post.autor.nome}" class="w-12 h-12 rounded-full object-cover">
                </a>
                <div>
                    <a href="/outro_perfil.html?id=${post.autor.id}" class="font-bold hover:underline">${post.autor.nome}</a>
                    <p class="text-sm text-slate-500 dark:text-gray-400">@${username}</p>
                </div>
            </div>
            <h1 class="text-2xl lg:text-3xl font-extrabold my-4 text-slate-800 dark:text-gray-100 break-words">${post.titulo}</h1>
            <p class="text-base lg:text-lg whitespace-pre-wrap leading-relaxed break-words">${post.conteudo}</p>
            <p class="text-sm text-slate-500 dark:text-gray-400 mt-6 border-t border-slate-200 dark:border-gray-700 pt-4">${dataPost}</p>
        `;
    };

    const renderizarComentarios = (comentarios) => {
        if (comentarios.length === 0) {
            comentariosContainer.innerHTML = '<p class="text-center p-8 text-slate-500 dark:text-gray-400">Seja o primeiro a comentar!</p>';
            return;
        }
        comentariosContainer.innerHTML = comentarios.map(comentario => {
            // Verifica se o perfil do comentário é o do próprio usuário logado
            const ehMeuComentario = comentario.autor.id === meuUserId;
            const linkPerfilComentario = ehMeuComentario ? '/perfil.html' : `/outro_perfil.html?id=${comentario.autor.id}`;

            return `
            <div class="p-4 border-b border-slate-200 dark:border-gray-700 flex gap-4">
                <a href="${linkPerfilComentario}">
                    <img src="${comentario.autor.foto_url || '/assets/default-avatar.svg'}" alt="Foto de ${comentario.autor.nome}" class="w-10 h-10 rounded-full object-cover mt-1">
                </a>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                        <a href="${linkPerfilComentario}" class="font-bold hover:underline">${comentario.autor.nome}</a>
                        <span class="text-sm text-slate-500 dark:text-gray-400">· ${new Date(comentario.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p class="mt-1 text-base break-words">${comentario.texto}</p>
                </div>
            </div>
        `}).join('');
    };

    const carregarPostEComentarios = async () => {
        try {
            const response = await fetch(`/api/posts/${postId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Post não encontrado');
            const post = await response.json();
            renderizarPost(post);
            renderizarComentarios(post.comentarios);
        } catch (error) {
            postContainer.innerHTML = `<p class="text-center p-8 text-red-500">${error.message}</p>`;
        }
    };

    formComentario.addEventListener('submit', async (e) => {
        e.preventDefault();
        const texto = textoComentario.value.trim();
        if (!texto) return;

        try {
            const response = await fetch('/api/comentarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ texto, postId: parseInt(postId) })
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    throw new Error(errorData.mensagem || `Erro ${response.status}`);
                } else {
                    throw new Error('Sessão expirada. Por favor, faça login novamente.');
                }
            }

            const result = await response.json();
            
            showToast('Comentário publicado!', 'success');
            textoComentario.value = '';
            carregarPostEComentarios(); 

        } catch (error) {
            showToast(error.message, 'error');
            if (error.message.toLowerCase().includes("sessão expirada") || error.message.toLowerCase().includes("autenticado")) {
                setTimeout(() => window.location.href = '/login.html', 2500);
            }
        }
    });

    carregarPostEComentarios();
});