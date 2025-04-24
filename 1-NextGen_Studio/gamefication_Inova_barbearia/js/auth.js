document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Simulação de login - na implementação real, isso seria uma chamada à API
            if (username && password) {
                // Armazenar token simulado (na prática, viria da API)
                localStorage.setItem('authToken', 'simulated-token-123456');
                localStorage.setItem('username', username);
                
                // Redirecionar para o dashboard
                window.location.href = 'dashboard.html';
            } else {
                alert('Por favor, preencha todos os campos.');
            }
        });
    }
    
    // Verificar autenticação em páginas protegidas
    const protectedPages = ['dashboard.html', 'desafios.html', 'ranking.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = 'login.html';
        }
    }
    
    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            window.location.href = 'login.html';
        });
    }
});