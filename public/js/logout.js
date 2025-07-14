document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('btn-logout');

    // Verifica se o botão de logout existe na página atual
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // 1. Remove o token de autenticação do armazenamento do navegador.
            // Esta é a ação que "desloga" o usuário no lado do cliente.
            localStorage.removeItem('authToken');
            
            // Opcional: Mostra uma mensagem de despedida (se você tiver a função showToast)
            // showToast('Você saiu com sucesso!', 'success');

            // 2. Redireciona o usuário para a página de login.
            window.location.href = '/login.html'; // ou para /index.html
        });
    }
});