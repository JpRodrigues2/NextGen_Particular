document.addEventListener('DOMContentLoaded', function() {
    // Navegação ativa
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage) {
            link.classList.add('active');
        }
    });
    
    // Carregar conteúdo dinâmico
    if (currentPage === 'dashboard.html') {
        loadDashboard();
    } else if (currentPage === 'desafios.html') {
        loadChallenges();
    } else if (currentPage === 'ranking.html') {
        loadRanking();
    }
});

function loadDashboard() {
    // Carregar dashboard.js dinamicamente
    const script = document.createElement('script');
    script.src = 'js/dashboard.js';
    document.body.appendChild(script);
}

function loadChallenges() {
    // Carregar desafios.js dinamicamente
    const script = document.createElement('script');
    script.src = 'js/desafios.js';
    document.body.appendChild(script);
}

function loadRanking() {
    // Carregar ranking.js dinamicamente
    const script = document.createElement('script');
    script.src = 'js/ranking.js';
    document.body.appendChild(script);
}


