// Dashboard Copy Widget - dashboard_copy.js
(function() {
    'use strict';

    // Configuração do Widget
    const WIDGET_ID = 'dashboard_copy';

    // Estado do Widget
    let playerData = null;
    let isLoading = false;
    let widgetConfig = null; // Para armazenar as configurações carregadas do admin

    // Imagens padrão para fallback
    const DEFAULT_IMAGES = {
        xp: 'https://s3.amazonaws.com/funifier-widget/catalog_new/profile/default/images/star-icon.png',
        moedas: 'https://s3.amazonaws.com/funifier-widget/catalog_new/profile/default/images/coin-icon.png',
        level: 'https://s3.amazonaws.com/funifier-widget/catalog_new/profile/default/images/level-icon.png'
    };

    // Funções de Utilitário
    function getElement(id) {
        return document.getElementById(id);
    }

    function formatNumber(num) {
        return new Intl.NumberFormat('pt-BR').format(num);
    }

    function setElementText(id, text) {
        const element = getElement(id);
        if (element) {
            element.textContent = text;
        }
    }

    function setElementAttribute(id, attribute, value) {
        const element = getElement(id);
        if (element) {
            element.setAttribute(attribute, value);
        }
    }

    function setElementStyle(id, property, value) {
        const element = getElement(id);
        if (element) {
            element.style[property] = value;
        }
    }

    // Funções de API (mantendo a estrutura original do seu widget)
    function getPlayerId() {
        let playerId = "me";
        if (window.Funifier &&
            window.Funifier.widget &&
            window.Funifier.widget.options &&
            window.Funifier.widget.options[WIDGET_ID] &&
            window.Funifier.widget.options[WIDGET_ID].player) {
            playerId = window.Funifier.widget.options[WIDGET_ID].player;
        }
        return playerId;
    }

    function getAuthToken() {
        if (window.Funifier && window.Funifier.auth && window.Funifier.auth.getAuthorization) {
            return window.Funifier.auth.getAuthorization();
        }
        return '';
    }

    function getApiUrl() {
        if (window.Funifier && window.Funifier.config && window.Funifier.config.service) {
            return window.Funifier.config.service;
        }
        return 'https://api.funifier.com'; // Fallback
    }

    // Função para obter imagens de ícones de dentro dos dados da API
    function getImageFromAPI(type) {
        if (!playerData) return DEFAULT_IMAGES[type];

        switch(type) {
            case 'level':
                // Tenta pegar a imagem do nível dos dados do jogador
                if (playerData.level && playerData.level.image && playerData.level.image.small) {
                    return playerData.level.image.small.url;
                }
                if (playerData.level_progress && playerData.level_progress.level &&
                    playerData.level_progress.level.image && playerData.level_progress.level.image.small) {
                    return playerData.level_progress.level.image.small.url;
                }
                return DEFAULT_IMAGES.level;

            case 'xp':
                // Tenta pegar a imagem de XP das categorias de pontos
                if (playerData.point_category_images && playerData.point_category_images.xp) {
                    return playerData.point_category_images.xp;
                }
                return DEFAULT_IMAGES.xp;

            case 'moedas':
                // Tenta pegar a imagem de moedas das categorias de pontos
                if (playerData.point_category_images && playerData.point_category_images.moedas) {
                    return playerData.point_category_images.moedas;
                }
                return DEFAULT_IMAGES.moedas;

            default:
                return DEFAULT_IMAGES[type] || 'https://s3.amazonaws.com/funifier-widget/catalog_new/profile/default/images/no-image.png';
        }
    }

    // --- Funções para Carregar e Aplicar Configurações do Admin ---
    async function loadAdminConfig() {
        console.log(`[${WIDGET_ID}] Carregando configurações do admin (ID: admin_dashboard__c)...`);
        // Adicionando um parâmetro de cache-busting para garantir que sempre peguemos a versão mais recente
        const cacheBuster = new Date().getTime(); // Timestamp atual como cache-buster
        const configUrl = `${getApiUrl()}/v3/database/admin_dashboard__c?strict=true&q=_id:'admin_dashboard__c'&_cacheBuster=${cacheBuster}`; // <--- AQUI ESTÁ A ALTERAÇÃO CHAVE
        try {
            const response = await fetch(configUrl, {
                method: 'GET',
                headers: {
                    'Authorization': getAuthToken(),
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache' // Reforça para não usar cache HTTP
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data && data[0]) {
                // Mescla as configurações carregadas com os valores padrão para ter certeza que todas as propriedades existem
                widgetConfig = Object.assign({}, {
                    font_family: "Roboto, sans-serif",
                    font_color: "#2d5c5c",
                    background_color_main: "#a8d3c8",
                    background_color_header: "#f8b37f",
                    background_color_cards: "#f8b37f",
                    avatar_border_color: "#FFFFFF",
                    progress_bar_color: "#4a90e2",
                    progress_bar_background_color: "#e0e0e0"
                }, data[0]); // Sobrescreve os padrões com o que veio do admin
                console.log(`[${WIDGET_ID}] Configurações do admin recebidas:`, widgetConfig);
                applyAdminConfig(widgetConfig);
            } else {
                console.warn(`[${WIDGET_ID}] Nenhuma configuração encontrada para 'admin_dashboard__c'. Usando padrões.`);
                // Aplicar padrões se não houver configurações salvas
                 widgetConfig = {
                    font_family: "Roboto, sans-serif",
                    font_color: "#2d5c5c",
                    background_color_main: "#a8d3c8",
                    background_color_header: "#f8b37f",
                    background_color_cards: "#f8b37f",
                    avatar_border_color: "#FFFFFF",
                    progress_bar_color: "#4a90e2",
                    progress_bar_background_color: "#e0e0e0"
                };
                applyAdminConfig(widgetConfig);
            }
        } catch (error) {
            console.error(`[${WIDGET_ID}] Erro ao carregar configurações do admin:`, error);
            console.warn(`[${WIDGET_ID}] Falha ao carregar configurações. Usando padrões.`);
            // Aplicar padrões em caso de erro na requisição
            widgetConfig = {
                font_family: "Roboto, sans-serif",
                font_color: "#2d5c5c",
                background_color_main: "#a8d3c8",
                background_color_header: "#f8b37f",
                background_color_cards: "#f8b37f",
                avatar_border_color: "#FFFFFF",
                progress_bar_color: "#4a90e2",
                progress_bar_background_color: "#e0e0e0"
            };
            applyAdminConfig(widgetConfig);
        }
        // Independentemente do resultado do carregamento da config, proceda para buscar os dados do jogador
        fetchPlayerData();
    }

    function applyAdminConfig(config) {
        const rootElement = getElement(WIDGET_ID);
        if (!rootElement) {
            console.error(`[${WIDGET_ID}] Elemento raiz '${WIDGET_ID}' não encontrado para aplicar configurações.`);
            return;
        }

        // Aplicar estilos via variáveis CSS (definidas no CSS e setadas aqui no JS)
        rootElement.style.setProperty('--widget-background-color-main', config.background_color_main);
        rootElement.style.setProperty('--widget-background-color-header', config.background_color_header);
        rootElement.style.setProperty('--widget-background-color-cards', config.background_color_cards);
        rootElement.style.setProperty('--widget-font-color', config.font_color);
        rootElement.style.setProperty('--widget-avatar-border-color', config.avatar_border_color);
        rootElement.style.setProperty('--widget-progress-bar-color', config.progress_bar_color);
        rootElement.style.setProperty('--widget-progress-bar-background-color', config.progress_bar_background_color);

        // Carregar a fonte do Google Fonts dinamicamente
        if (config.font_family) {
            let cleanedFontName = config.font_family.replace(/['"]/g, '').trim();
            let formattedFont = cleanedFontName.replace(/ /g, '+');
            const linkId = `dynamic-${WIDGET_ID}-font-link`; // ID único para o link da fonte
            let existingLink = document.getElementById(linkId);

            if (existingLink) {
                existingLink.href = `https://fonts.googleapis.com/css2?family=${formattedFont}&display=swap`;
            } else {
                const link = document.createElement('link');
                link.id = linkId;
                link.rel = 'stylesheet';
                link.href = `https://fonts.googleapis.com/css2?family=${formattedFont}&display=swap`;
                document.head.appendChild(link);
            }
            rootElement.style.setProperty('--widget-font-family', config.font_family);
        } else {
             rootElement.style.setProperty('--widget-font-family', "Roboto, sans-serif"); // Fallback CSS
        }
    }
    // --- FIM: Funções para Carregar e Aplicar Configurações do Admin ---


    async function fetchPlayerData() {
        if (!getAuthToken()) {
            console.error(`[${WIDGET_ID}] No authorization token available`);
            showError(i18n('auth_required'));
            return;
        }

        try {
            isLoading = true;
            showLoading();

            const playerId = getPlayerId();
            const apiUrl = getApiUrl();
            const url = `${apiUrl}/v3/player/${playerId}/status`;

            console.log(`[${WIDGET_ID}] Fetching player data from: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': getAuthToken(),
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`[${WIDGET_ID}] Player data received:`, data);

            if (data && data._id) {
                playerData = data;
                updateUI();
            } else {
                throw new Error('Invalid player data received');
            }

        } catch (error) {
            console.error(`[${WIDGET_ID}] Error fetching player data:`, error);
            showError(i18n('error_loading_data'));
        } finally {
            isLoading = false;
        }
    }

    // Funções para Atualização da Interface (UI)
    function showLoading() {
        setElementText('player-name', i18n('loading'));
        setElementText('total-points', '...');
        setElementText('level-position', '...');
        setElementText('total-coins', '...');
        setElementText('progress-percent', '...');
        // setElementAttribute('player-avatar', 'src', 'URL_DE_LOADING_AQUI'); // Opcional: ícone de loading
    }

    function showError(message) {
        setElementText('player-name', i18n('error'));
        setElementText('total-points', '0');
        setElementText('level-position', '0');
        setElementText('total-coins', '0');
        setElementText('progress-percent', '0%');
        console.error(`[${WIDGET_ID}] ${message}`);
    }

    function updateUI() {
        if (!playerData) return;

        // Atualiza informações do jogador
        setElementText('player-name', playerData.name);

        // Atualiza avatar
        if (playerData.image && playerData.image.small && playerData.image.small.url) {
            setElementAttribute('player-avatar', 'src', playerData.image.small.url);
            setElementAttribute('player-avatar', 'alt', playerData.name);
        }

        // Atualiza estatísticas com base nos dados corretos da API
        // PONTUAÇÃO TOTAL: usando XP (point_categories.xp ou pointCategories.xp)
        const totalXP = playerData.point_categories?.xp || playerData.pointCategories?.xp || 0;
        setElementText('total-points', formatNumber(totalXP));

        // Atualiza ícone de XP
        const xpImageUrl = getImageFromAPI('xp');
        setElementAttribute('xp-icon', 'src', xpImageUrl);
        setElementAttribute('xp-icon', 'alt', 'XP Icon');

        // NÍVEL: usando level.level (nome do nível)
        const levelName = playerData.level?.level || 'N/A'; // Usar optional chaining para evitar erro se level for undefined
        setElementText('level-position', levelName);

        // Atualiza ícone de Nível
        const levelImageUrl = getImageFromAPI('level');
        setElementAttribute('level-icon', 'src', levelImageUrl);
        setElementAttribute('level-icon', 'alt', 'Level Icon');


        const totalCoins = playerData.point_categories?.moedas || playerData.pointCategories?.moedas || 0;
        setElementText('total-coins', formatNumber(totalCoins));

        // Atualiza ícone de Moedas
        const coinsImageUrl = getImageFromAPI('moedas');
        setElementAttribute('coins-icon', 'src', coinsImageUrl);
        setElementAttribute('coins-icon', 'alt', 'Coins Icon');

        // Atualiza barra de progresso
        const progressPercent = Math.round(playerData.level_progress?.percent_completed || 0);
        setElementText('progress-percent', `${progressPercent}%`);
        setElementStyle('progress-fill', 'width', `${progressPercent}%`);

        // Atualiza próximo nível
        const nextLevelPosition = (playerData.level?.position || 0) + 1;
        setElementText('next-level', `${i18n('level')} ${nextLevelPosition}`);

        console.log('Dados do jogador atualizados na UI:');
        console.log('- Nome:', playerData.name);
        console.log('- XP (Pontuação Total):', totalXP);
        console.log('- Nível (nome):', levelName);
        console.log('- Nível (posição):', playerData.level?.position);
        console.log('- Moedas:', totalCoins);
        console.log('- Progresso:', progressPercent + '%');
        console.log('- URLs de Imagens dos Ícones:', {
            xp: xpImageUrl,
            level: levelImageUrl,
            moedas: coinsImageUrl // Renomeado para moedas para consistência
        });
    }

    // Função de Internacionalização (i18n)
    function i18n(key) {
        if (window.Funifier && window.Funifier.i18n && window.Funifier.i18n.get) {
            return window.Funifier.i18n.get(WIDGET_ID, key);
        }

        // Traduções de fallback (para testes ou se Funifier.i18n não estiver disponível)
        const translations = {
            'points': 'pontos',
            'level': 'nível',
            'challenges': 'conquistas',
            'loading': 'Carregando...',
            'error': 'Erro ao carregar',
            'auth_required': 'Autorização necessária',
            'error_loading_data': 'Erro ao carregar dados do jogador',
            'pts_next_level': 'pts para próximo nível'
        };
        return translations[key] || key;
    }

    // Função principal de carregamento de dados
    function load() {
        if (getAuthToken()) {
            // Inicia o processo carregando as configurações do admin, que depois chamará fetchPlayerData
            loadAdminConfig();
        } else {
            console.warn(`[${WIDGET_ID}] Autorização não disponível, não é possível carregar dados do jogador.`);
            showError(i18n('auth_required'));
        }
    }

    // Função de Inicialização
    function init() {
        console.log(`Inicializando widget ${WIDGET_ID}`);

        const widgetElement = getElement(WIDGET_ID);
        if (!widgetElement) {
            console.error(`[${WIDGET_ID}] Elemento HTML com ID '${WIDGET_ID}' não encontrado. O widget não pode ser inicializado.`);
            return;
        }

        load(); // Inicia o carregamento de dados e configurações
    }

    // API Pública do Widget (opcional, para interações externas)
    window.DashboardCopy = {
        ID: WIDGET_ID,
        init: init,
        load: load,
        reload: load, // Permite recarregar os dados
        getPlayerData: function() {
            return playerData;
        },
        i18n: i18n,
        setDefaultImages: function(images) { // Permite sobrescrever imagens padrão
            Object.assign(DEFAULT_IMAGES, images);
        }
    };

    // Auto-inicialização quando o DOM estiver pronto
    // Usamos setTimeout para garantir que o elemento HTML esteja disponível
    setTimeout(function() {
        const element = getElement(WIDGET_ID);
        if (element) { // Verifica se o elemento do widget existe antes de inicializar
            init();
        } else {
            console.warn(`[${WIDGET_ID}] Elemento '${WIDGET_ID}' não encontrado no DOM. Auto-inicialização adiada ou falhou.`);
        }
    }, 10); // Pequeno atraso para garantir que o DOM esteja totalmente carregado

    // Garante que o objeto global Funifier exista (para testes locais ou ambientes incomuns)
    // Em um ambiente Funifier Studio normal, Funifier já estaria disponível.
    window.Funifier = window.Funifier || {};
    window.Funifier.widget = window.Funifier.widget || {};
    window.Funifier.widget.options = window.Funifier.widget.options || {};
    window.Funifier.config = window.Funifier.config || {
        service: 'https://api.funifier.com' // URL de serviço padrão
    };
    window.Funifier.auth = window.Funifier.auth || {
        getAuthorization: function() {
            // Em um ambiente Funifier, isso seria preenchido automaticamente.
            // Para testes locais sem um token de sessão, pode ser necessário um token hardcoded temporário.
            // Ex: return 'Bearer SEU_TOKEN_DE_TESTE_AQUI';
            return localStorage.getItem('funifier_auth_token') || ''; // Tenta pegar do localStorage
        }
    };
    window.Funifier.i18n = window.Funifier.i18n || {
        get: function(widgetId, key) {
            // Fallback de internacionalização
            const translations = {
                'points': 'pontos', 'level': 'nível', 'challenges': 'conquistas',
                'pts_next_level': 'pts para próximo nível', 'loading': 'Carregando...',
                'error': 'Erro ao carregar', 'auth_required': 'Autorização necessária',
                'error_loading_data': 'Erro ao carregar dados do jogador'
            };
            return translations[key] || key;
        }
    };

})();