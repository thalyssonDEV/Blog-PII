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

                const result = await response.json();

                if (!response.ok) {
                    const errorMessage = result.erros ? result.erros[0].msg : result.mensagem;
                    throw new Error(errorMessage);
                }
                
                localStorage.setItem('post-creation-success', result.mensagem || "Post criado com sucesso!");
                window.location.href = '/home.html';

            } catch (error) {
                showToast(error.message || 'Erro ao criar o post.');
            }
        });
    }
});