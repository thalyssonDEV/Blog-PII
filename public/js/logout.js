document.addEventListener('DOMContentLoaded', () => {
    // Seleciona todos os botões de logout (caso exista mais de um, como na nav de desktop e mobile)
    const logoutButtons = document.querySelectorAll('.btn-logout');
    
    // Seleciona os elementos do modal
    const logoutModal = document.getElementById('logout-confirmation-modal');
    const confirmLogoutButton = document.getElementById('btn-modal-confirm-logout');
    const cancelLogoutButton = document.getElementById('btn-modal-cancel-logout');

    // Se não existir o modal na página, o script não faz nada.
    if (!logoutModal || !confirmLogoutButton || !cancelLogoutButton) {
        return;
    }

    // Adiciona o evento para mostrar o modal a todos os botões de logout
    logoutButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Impede qualquer ação padrão do link/botão
            logoutModal.classList.remove('hidden');
            logoutModal.classList.add('flex');
        });
    });

    // Evento para o botão de confirmação "Sair" dentro do modal
    confirmLogoutButton.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        showToast('Você foi desconectado com sucesso.', 'success');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1500); // Aguarda o toast ser visível antes de redirecionar
    });

    // Evento para o botão "Cancelar" que apenas fecha o modal
    cancelLogoutButton.addEventListener('click', () => {
        logoutModal.classList.add('hidden');
        logoutModal.classList.remove('flex');
    });
});