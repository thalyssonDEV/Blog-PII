// --- LÓGICA DO FORMULÁRIO DE LOGIN ---
const form = document.getElementById('login-form');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim().toLowerCase();
    const senha = document.getElementById('senha').value;

    if (!email || !senha) {
        showToast('Por favor, preencha e-mail e senha.');
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        
        const result = await response.json();

        if (!response.ok) {
            // Se a resposta do back-end tiver um array de erros (do express-validator)
            const errorMessage = result.erros ? result.erros[0].msg : result.mensagem;
            showToast(errorMessage, 'error');
        } else {
            showToast(result.mensagem, 'success');
            
            // Guarda o token no navegador para usar em futuras requisições
            localStorage.setItem('authToken', result.token);
            
            // Redireciona para uma página de "home" após 1.5 segundos
            setTimeout(() => {
                window.location.href = '/home.html'; // Vamos criar esta página
            }, 1500);
        }

    } catch (error) {
        showToast('Erro de conexão. Tente novamente.');
    }
});