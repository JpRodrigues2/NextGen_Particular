document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Simular dados da API (na prática, seria uma chamada real)
    const username = localStorage.getItem('username') || 'David';
    
    // Dados mockados baseados no exemplo fornecido
    const dashboardData = {
        name: username,
        image: {
            small: {
                url: "https://s3.amazonaws.com/funifier/games/67fd7f312327f74f3a35615f/images/67fedb172327f74f3a3595b1_original_Capturar.PNG"
            }
        },
        total_challenges: 7,
        challenges: {
            "ESCCnvA": 2,
            "ESBdHBF": 4,
            "ESBd5eM": 1
        },
        total_points: 129,
        point_categories: {
            "moedas": 43,
            "xp": 86
        },
        level_progress: {
            percent_completed: 100,
            next_points: 0,
            level: {
                level: "Mestre do corte",
                description: "Conquiste 50 pontos de XP para atingir esse nível",
                minPoints: 50,
                image: {
                    small: {
                        url: "https://s3.amazonaws.com/funifier/games/67fd7f312327f74f3a35615f/images/680037fb2327f74f3a35cea2_original_4.png"
                    }
                }
            },
            next_level: {
                level: "Na régua máxima",
                minPoints: 100,
                image: {
                    small: {
                        url: "https://s3.amazonaws.com/funifier/games/67fd7f312327f74f3a35615f/images/6800380f2327f74f3a35cea4_original_1.png"
                    }
                }
            }
        }
    };
    
    // Preencher dados do dashboard
    renderDashboard(dashboardData);
    
    function renderDashboard(data) {
        // Preencher perfil
        document.querySelector('.profile-img').src = data.image.small.url;
        document.querySelector('.profile-details h3').textContent = data.name;
        document.querySelector('.profile-details p').textContent = `Nível: ${data.level_progress.level.level}`;
        
        // Preencher estatísticas
        document.querySelectorAll('.stat-item')[0].innerHTML = `
            <div class="stat-value">${data.total_points}</div>
            <div class="stat-label">Pontos Totais</div>
        `;
        
        document.querySelectorAll('.stat-item')[1].innerHTML = `
            <div class="stat-value">${data.total_challenges}</div>
            <div class="stat-label">Desafios</div>
        `;
        
        document.querySelectorAll('.stat-item')[2].innerHTML = `
            <div class="stat-value">${data.point_categories.moedas}</div>
            <div class="stat-label">Moedas</div>
        `;
        
        document.querySelectorAll('.stat-item')[3].innerHTML = `
            <div class="stat-value">${data.point_categories.xp}</div>
            <div class="stat-label">XP</div>
        `;
        
        // Preencher progresso
        const progressFill = document.querySelector('.progress-fill');
        progressFill.style.width = `${data.level_progress.percent_completed}%`;
        
        document.querySelector('.current-level').textContent = data.level_progress.level.level;
        document.querySelector('.next-level').textContent = `Próximo nível: ${data.level_progress.next_level.level} (${data.level_progress.next_level.minPoints} XP)`;
        
        // Adicionar imagem do nível atual
        const levelBadge = document.createElement('img');
        levelBadge.src = data.level_progress.level.image.small.url;
        levelBadge.alt = data.level_progress.level.level;
        levelBadge.classList.add('level-badge');
        document.querySelector('.level-info').prepend(levelBadge);
    }
});