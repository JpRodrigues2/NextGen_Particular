document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Simular dados da API (na prática, seria uma chamada real)
    const challengesData = [
        {
            "challenge": "Barba feita",
            "description": "A cada barba feita, ganhe 3 moedas e 6XP.",
            "badge": {
                "small": {
                    "url": "https://s3.amazonaws.com/funifier/games/67fd7f312327f74f3a35615f/images/680032c42327f74f3a35cdb8_original_2.png"
                }
            },
            "points": [
                {
                    "total": 3,
                    "category": "moedas"
                },
                {
                    "total": 6,
                    "category": "xp"
                }
            ],
            "_id": "ESBd5eM"
        },
        {
            "challenge": "Faça 1 corte de cabelo",
            "description": "A cada corte de cabelo feito, ganhe 5 moedas e 10XP.",
            "badge": {
                "small": {
                    "url": "https://s3.amazonaws.com/funifier/games/67fd7f312327f74f3a35615f/images/680032b12327f74f3a35cdb6_original_3.png"
                }
            },
            "points": [
                {
                    "total": 5,
                    "category": "moedas"
                },
                {
                    "total": 10,
                    "category": "xp"
                }
            ],
            "_id": "ESBdHBF"
        },
        {
            "challenge": "Leve para casa",
            "description": "Compre R$100,00 e ganhe 10 moedas e 20XP.",
            "badge": {
                "small": {
                    "url": "https://s3.amazonaws.com/funifier/games/67fd7f312327f74f3a35615f/images/680032d52327f74f3a35cdba_original_1.png"
                }
            },
            "points": [
                {
                    "total": 10,
                    "category": "moedas"
                },
                {
                    "total": 20,
                    "category": "xp"
                }
            ],
            "_id": "ESCCnvA"
        },
        {
            "challenge": "Fique na Régua",
            "description": "Faça a barba e a sobrancelha conosco e ganhe 10 moedas e 20 XP.",
            "badge": {
                "small": {
                    "url": "https://s3.amazonaws.com/funifier/games/67fd7f312327f74f3a35615f/images/680032ef2327f74f3a35cdca_original_4.png"
                }
            },
            "points": [
                {
                    "total": 10,
                    "category": "moedas"
                },
                {
                    "total": 20,
                    "category": "xp"
                }
            ],
            "_id": "ESIrfPT"
        }
    ];
    
    // Renderizar desafios
    renderChallenges(challengesData);
    
    function renderChallenges(challenges) {
        const challengesContainer = document.querySelector('.challenges-list');
        
        challenges.forEach(challenge => {
            const challengeCard = document.createElement('div');
            challengeCard.className = 'challenge-card card-transition hover-grow';
            
            // Encontrar recompensas
            const coins = challenge.points.find(p => p.category === 'moedas');
            const xp = challenge.points.find(p => p.category === 'xp');
            
            challengeCard.innerHTML = `
                <img src="${challenge.badge.small.url}" alt="${challenge.challenge}" class="challenge-badge">
                <h3 class="challenge-title">${challenge.challenge}</h3>
                <p class="challenge-desc">${challenge.description}</p>
                <div class="rewards">
                    <span class="reward-badge"><i class="fas fa-coins"></i> ${coins.total} moedas</span>
                    <span class="reward-badge"><i class="fas fa-star"></i> ${xp.total} XP</span>
                </div>
            `;
            
            challengesContainer.appendChild(challengeCard);
        });
    }
});