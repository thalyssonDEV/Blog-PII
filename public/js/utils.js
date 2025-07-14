function showToast(message, type = 'error') {
    const container = document.getElementById('toast-container');
    
    // VERIFICAÇÃO ADICIONADA: Se o contêiner não existir na página, não faz nada.
    if (!container) {
        console.error('O elemento #toast-container não foi encontrado na página.');
        return; 
    }

    const toast = document.createElement('div');
    
    const baseClasses = 'p-4 rounded-lg shadow-lg text-white font-bold text-sm';
    const successClasses = 'bg-green-500';
    const errorClasses = 'bg-red-500';
    
    toast.className = `${baseClasses} ${type === 'success' ? successClasses : errorClasses} toast-animate-in`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('toast-animate-out');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 4000);
}