function showToast(message, type = 'error') {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.error('O elemento #toast-container não foi encontrado na página.');
        return;
    }

    const toast = document.createElement('div');

    // --- ÍCONES SVG ---
    const successIcon = `
        <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`;
    const errorIcon = `
        <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`;

    // --- CLASSES DE ESTILO ---
    const baseClasses = 'w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 flex items-center p-4 space-x-3';
    
    // --- MONTAGEM DO TOAST ---
    toast.className = `${baseClasses} toast-animate-in`;
    toast.innerHTML = `
        <div class="flex-shrink-0">
            ${type === 'success' ? successIcon : errorIcon}
        </div>
        <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-800 dark:text-gray-100">${type === 'success' ? 'Sucesso!' : 'Ocorreu um erro'}</p>
            <p class="text-sm text-slate-600 dark:text-gray-400">${message}</p>
        </div>
    `;

    container.appendChild(toast);

    // --- LÓGICA DE REMOÇÃO ---
    setTimeout(() => {
        toast.classList.remove('toast-animate-in');
        toast.classList.add('toast-animate-out');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000);
}