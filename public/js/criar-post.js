document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-criar-post');
    const btnCancelar = document.getElementById('btn-cancelar');
    const token = localStorage.getItem('authToken');

    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            window.location.href = '/home.html';
        });
    }

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const titulo = document.getElementById('titulo').value;
            const conteudo = document.getElementById('conteudo').value;

            if (!titulo.trim() || !conteudo.trim()) {
                showToast('Título e conteúdo são obrigatórios.');
                return;
            }

            try {
                const response = await fetch('/api/posts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ titulo, conteudo })
                });

                if (!response.ok) {
                    const result = await response.json();
                    const errorMessage = result.erros ? result.erros[0].msg : result.mensagem;
                    showToast(errorMessage, 'error');
                } else {
                    // --- ALTERAÇÃO AQUI ---
                    // 1. Mostra a mensagem de sucesso
                    showToast('Post publicado!', 'success');
                    
                    // 2. Aguarda um pouco antes de redirecionar para que o usuário veja a mensagem
                    setTimeout(() => {
                        window.location.href = '/home.html';
                    }, 1500); // 1.5 segundos de espera
                }
            } catch (error) {
                showToast('Erro de conexão ao tentar publicar. Tente novamente.', 'error');
            }
        });
    }
});