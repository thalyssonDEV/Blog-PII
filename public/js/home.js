document.addEventListener('DOMContentLoaded', async () => {
    // Verifica se há uma mensagem de sucesso vinda da página de criação
    const successMessage = localStorage.getItem('post-creation-success');
    if (successMessage) {
        showToast(successMessage, 'success');
        // Limpa a mensagem para não aparecer novamente ao recarregar
        localStorage.removeItem('post-creation-success');
    }

    const postsContainer = document.getElementById('posts-container');
    const token = localStorage.getItem('authToken');

    // --- NOVA LÓGICA: PEGAR O ID DO USUÁRIO LOGADO ---
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
    // --- FIM DA NOVA LÓGICA ---

    try {
        const response = await fetch('/api/posts', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Falha ao buscar posts.');

        const posts = await response.json();

        if (posts.length === 0) {
            postsContainer.innerHTML = '<p class="text-center text-slate-500">Ainda não há posts para mostrar.</p>';
            return;
        }

        postsContainer.innerHTML = posts.map(post => {
            // --- LÓGICA CONDICIONAL DE LINK ---
            // Verifica se o autor do post é o usuário que está logado
            const ehMeuPerfil = post.autor.id === meuUserId;
            // Define o link de destino com base na verificação
            const linkPerfil = ehMeuPerfil ? '/perfil.html' : `/outro_perfil.html?id=${post.autor.id}`;
            // --- FIM DA LÓGICA CONDICIONAL ---

            // --- LÓGICA PARA TRUNCAR O CONTEÚDO ---
            const limiteCaracteres = 500;
            let conteudoExibido = post.conteudo;
            if (post.conteudo.length > limiteCaracteres) {
                conteudoExibido = post.conteudo.substring(0, limiteCaracteres) + '...';
            }

            return `
            <article class="bg-white p-6 rounded-lg shadow flex flex-col">
                <div class="flex items-center mb-4">
                    <a href="${linkPerfil}" class="block">
                        <img src="${post.autor.foto_url || '/assets/default-avatar.svg'}" alt="Foto de ${post.autor.nome}" class="w-12 h-12 rounded-full mr-4 object-cover cursor-pointer">
                    </a>
                    <div>
                        <a href="${linkPerfil}" class="font-bold text-slate-800 hover:text-indigo-700 hover:cursor-pointer">${post.autor.nome}</a>
                        <p class="text-sm text-slate-500">${new Date(post.createdAt).toLocaleString('pt-BR', {dateStyle: 'short', timeStyle: 'short'})}</p>
                    </div>
                </div>
                <h2 class="text-2xl font-bold mb-2">${post.titulo}</h2>
                <p class="text-slate-700 break-words flex-grow">${conteudoExibido}</p>
                
                <div class="mt-4 pt-4 border-t border-slate-200">
                    <a href="/post.html?id=${post.id}" class="font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
                        Ver post completo
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </a>
                </div>
            </article>
            `;
        }).join('');

    } catch (error) {
        console.error(error);
        postsContainer.innerHTML = '<p class="text-center text-red-500">Não foi possível carregar o feed.</p>';
    }
});