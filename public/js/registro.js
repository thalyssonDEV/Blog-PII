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

    // Adicionamos a verificação de tamanho mínimo e máximo aqui
    if (nome.length < 3 || nome.length > 15) {
        showToast('O nome de usuário deve ter entre 3 e 20 caracteres.');
        return;
    }

    // 1. Nova validação: Verifica se há espaços no nome de usuário
    if (nome.includes(' ')) {
        showToast('O nome de usuário não pode conter espaços.');
        return;
    }

    // 2. Nova validação: Verifica se os caracteres são permitidos
    const nomeUsuarioRegex = /^[a-zA-Z0-9_@.-]+$/;
    if (!nomeUsuarioRegex.test(nome)) {
        showToast('O nome de usuário contém caracteres inválidos (não são permitidos emojis ou símbolos especiais).');
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

            setTimeout(() => {
                window.location.href = '/login.html'; 
            }, 1500); 

        }
    } catch (error) {
         showToast('Erro de conexão. Tente novamente.');
    }
});