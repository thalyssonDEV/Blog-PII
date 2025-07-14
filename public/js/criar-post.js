document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-criar-post');
    const btnCancelar = document.getElementById('btn-cancelar');
    const token = localStorage.getItem('authToken');

    btnCancelar.addEventListener('click', () => {
        // Simplesmente volta para a página anterior
        window.location.href = '/home.html';
    });

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
                // Mostra o primeiro erro de validação do back-end, se houver
                const errorMessage = result.erros ? result.erros[0].msg : result.mensagem;
                throw new Error(errorMessage);
            }

            localStorage.setItem('post-creation-success', result.mensagem);
            window.location.href = '/home.html';

        } catch (error) {
            showToast(error.message || 'Erro ao criar o post.');
        }
    });
});