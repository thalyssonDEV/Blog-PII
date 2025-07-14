// Este script verifica se o usuário está logado
const token = localStorage.getItem('authToken');

// Se não houver token, redireciona para a página de login
if (!token) {
    window.location.href = '/login.html'; // ou para a sua página de login
}