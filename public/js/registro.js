// --- FUNÇÃO REUTILIZÁVEL PARA CRIAR NOTIFICAÇÕES (TOASTS) ---
function showToast(message, type = 'error') {
    const container = document.getElementById('toast-container');
    
    // Cria o elemento do toast
    const toast = document.createElement('div');
    
    // Define as classes de estilo com Tailwind CSS
    const baseClasses = 'p-4 rounded-lg shadow-lg text-white font-bold text-sm';
    const successClasses = 'bg-green-500';
    const errorClasses = 'bg-red-500';
    
    toast.className = `${baseClasses} ${type === 'success' ? successClasses : errorClasses} toast-animate-in`;
    toast.textContent = message;
    
    // Adiciona o toast ao contêiner
    container.appendChild(toast);
    
    // Remove o toast depois de alguns segundos
    setTimeout(() => {
        // Adiciona a animação de saída
        toast.classList.add('toast-animate-out');
        
        // Espera a animação de saída terminar para remover o elemento do DOM
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000); // O toast ficará visível por 4 segundos
}


// --- LÓGICA DO FORMULÁRIO (AGORA USANDO A FUNÇÃO showToast) ---

const form = document.getElementById('registro-form');
const fotoInputElement = document.getElementById('foto');
const fotoPreviewElement = document.getElementById('foto-preview');

// Lógica de preview da imagem (continua a mesma)
fotoInputElement.addEventListener('change', () => {
    const file = fotoInputElement.files[0];
    if (file) {
        fotoPreviewElement.src = URL.createObjectURL(file);
    }
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Pega os valores dos campos
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    
    // 1. Validação de campos obrigatórios
    if (!nome || !email || !senha) {
        showToast('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // --- NOVA VALIDAÇÃO DE FORMATO DO E-MAIL ---
    // Esta expressão regular simples verifica se o texto tem o formato "algo@algo.algo"
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        showToast('Por favor, digite um formato de e-mail válido.');
        return;
    }

    // --- NOVA VALIDAÇÃO DE TAMANHO DA SENHA ---
    // 2. Verifica se a senha tem pelo menos 8 caracteres
    if (senha.length < 8) {
        showToast('A senha precisa ter no mínimo 8 caracteres.');
        return; // Interrompe a execução se a senha for muito curta
    }
    // --- FIM DA NOVA VALIDAÇÃO ---

    // 3. Validação de confirmação de senha
    if (senha !== confirmarSenha) {
        showToast('As senhas não coincidem.');
        return;
    }

    const formData = new FormData(form);

    try {
        const response = await fetch('/api/registro', {
            method: 'POST',
            body: formData,
        });
        
        const result = await response.json();

        // Se a resposta do back-end tiver um array de erros (do express-validator)
        if (result.erros) {
            // Mostra a primeira mensagem de erro do back-end
            showToast(result.erros[0].msg, 'error');
        } else {
            // Mostra a mensagem de sucesso ou erro geral
            showToast(result.mensagem, response.ok ? 'success' : 'error');
        }
        
        if (response.ok) {
            form.reset();
            fotoPreviewElement.src = '/assets/default-avatar.svg';
        }
    } catch (error) {
         showToast('Erro de conexão. Tente novamente.');
    }
});