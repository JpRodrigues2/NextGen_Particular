angular.module("espacial", []).controller("espacial", [
    "$scope",
    "$http",
    "$timeout",
    "$interval",
    ($scope, $http, $timeout, $interval) => {
      console.log("Espacial widget inicializado")
  
      // Configuração inicial
      $scope.players = []
      $scope.previousPlayers = [] // Armazena estado anterior para detectar mudanças de posição
      $scope.maxDistance = 0
      $scope.baseSpacing = 120 // Espaçamento base entre naves
      $scope.progressiveSpacing = 20 // Espaçamento adicional para posições mais altas
      $scope.connectionStatus = "connecting" // Status padrão
      $scope.isFirstLoad = true // Flag para primeira carga (sem animações)
      $scope.firstPlaceId = null // Rastrear ID do jogador em primeiro lugar
      $scope.selectedPlayer = {} // Jogador selecionado para a sidebar
      $scope.audioEnabled = true // Flag para controlar se o áudio está habilitado
  
      // Configuração de idiomas para a interface
      $scope.translations = {
        pt: {
          SPACE_STATION: "Estação Espacial",
          PLAYER_SHIP: "Nave do Jogador",
          PLAYER_PHOTO: "Foto do jogador",
          PLAYER_NAME: "Nome do Jogador",
          POINTS: "pts",
          SCORE: "Pontuação",
          SHIP: "Nave",
          LEVEL: "Nível",
          XP: "XP",
          COINS: "Moedas",
          PLACE: "lugar",
          SCROLL_HINT: "← Deslize para ver mais →",
          CONNECTION_STATUS: {
            CONNECTED: "Conectado",
            CONNECTING: "Conectando...",
            DISCONNECTED: "Desconectado",
          },
          POSITIONS: {
            FIRST: "1º Lugar",
            SECOND: "2º Lugar",
            THIRD: "3º Lugar",
            FOURTH: "4º Lugar",
            OTHER: "Posição",
          },
          SHIP_TYPES: {
            GOLD: "Elite",
            SILVER: "Avançada",
            BRONZE: "Padrão",
            REGULAR: "Básica",
          },
        },
        en: {
          SPACE_STATION: "Space Station",
          PLAYER_SHIP: "Player Ship",
          PLAYER_PHOTO: "Player Photo",
          PLAYER_NAME: "Player Name",
          POINTS: "pts",
          SCORE: "Score",
          SHIP: "Ship",
          LEVEL: "Level",
          XP: "XP",
          COINS: "Coins",
          PLACE: "place",
          SCROLL_HINT: "← Scroll to see more →",
          CONNECTION_STATUS: {
            CONNECTED: "Connected",
            CONNECTING: "Connecting...",
            DISCONNECTED: "Disconnected",
          },
          POSITIONS: {
            FIRST: "1st Place",
            SECOND: "2nd Place",
            THIRD: "3rd Place",
            FOURTH: "4th Place",
            OTHER: "Position",
          },
          SHIP_TYPES: {
            GOLD: "Elite",
            SILVER: "Advanced",
            BRONZE: "Standard",
            REGULAR: "Basic",
          },
        },
      }
  
      // Idioma padrão
      $scope.currentLang = "pt"
  
      // Função para traduzir
      $scope.t = (key) => {
        // Suporte para chaves aninhadas como 'CONNECTION_STATUS.CONNECTED'
        if (key.includes(".")) {
          const parts = key.split(".")
          return $scope.translations[$scope.currentLang][parts[0]][parts[1]]
        }
        return $scope.translations[$scope.currentLang][key] || key
      }
  
      // Função para alternar idioma
      $scope.toggleLanguage = () => {
        $scope.currentLang = $scope.currentLang === "pt" ? "en" : "pt"
      }
  
      // Função para formatar posições em inglês (1st, 2nd, 3rd, etc)
      $scope.formatPosition = (position) => {
        if (position % 10 == 1 && position % 100 != 11) {
          return position + "st"
        } else if (position % 10 == 2 && position % 100 != 12) {
          return position + "nd"
        } else if (position % 10 == 3 && position % 100 != 13) {
          return position + "rd"
        } else {
          return position + "th"
        }
      }
  
      // Função para obter URL de assets do GitHub
      $scope.getAssetUrl = (filename) => {
        // Base URL para os assets no GitHub
        const baseUrl =
          "https://raw.githubusercontent.com/JpRodrigues2/NextGen_Particular/main/1-NextGen_Studio/assets/espacial/"
  
        // Log para depuração
        console.log(`Carregando asset: ${baseUrl}${filename}`)
  
        return baseUrl + filename
      }
  
      // Elementos de áudio
      let warpSound
      let thrusterSound
      let spaceAmbientSound // Áudio para som constante
  
      // Inicializar os áudios
      function initAudio() {
        try {
          // Som de warp para mudança de primeiro lugar
          warpSound = new Audio()
          warpSound.src = $scope.getAssetUrl("bell.mp3")
          warpSound.volume = 0.7
          warpSound.preload = "auto"
  
          // Verificar se o áudio está carregado
          warpSound.addEventListener("canplaythrough", () => {
            console.log("Som de sino carregado com sucesso")
            $scope.audioLoaded = true
          })
  
          // Som de propulsores para mudanças de posição
          thrusterSound = new Audio()
          thrusterSound.src = $scope.getAssetUrl("thruster.mp3")
          thrusterSound.volume = 0.5
          thrusterSound.preload = "auto"
          thrusterSound.loop = false
  
          // Novo som ambiente espacial constante
          spaceAmbientSound = new Audio()
          spaceAmbientSound.src = "https://raw.githubusercontent.com/JpRodrigues2/NextGen_Particular/main/1-NextGen_Studio/assets/espacial/space.mp3"
          spaceAmbientSound.volume = 0.3 // Volume ajustável
          spaceAmbientSound.loop = true // Reprodução contínua
          spaceAmbientSound.preload = "auto"
  
          // Evento para iniciar a reprodução do som ambiente ao carregar
          spaceAmbientSound.addEventListener("canplaythrough", () => {
            console.log("Som ambiente espacial carregado com sucesso")
            spaceAmbientSound.play().catch((e) => {
              console.error("Erro ao tocar o som ambiente espacial:", e)
              $scope.audioEnabled = false
            })
          })
  
          // Tratamento de erros para todos os áudios
          warpSound.addEventListener("error", (e) => {
            console.error("Erro ao carregar o som de sino:", e)
            console.log("URL do sino:", warpSound.src)
            $scope.audioEnabled = false
          })
  
          thrusterSound.addEventListener("error", (e) => {
            console.error("Erro ao carregar o som de propulsores:", e)
            console.log("URL do propulsor:", thrusterSound.src)
            $scope.audioEnabled = false
          })
  
          spaceAmbientSound.addEventListener("error", (e) => {
            console.error("Erro ao carregar o som ambiente espacial:", e)
            console.log("URL do som ambiente:", spaceAmbientSound.src)
            $scope.audioEnabled = false
          })
  
          console.log("Áudios inicializados com as URLs:", {
            warp: warpSound.src,
            thruster: thrusterSound.src,
            ambient: spaceAmbientSound.src,
          })
  
          // Tentar carregar os áudios manualmente
          warpSound.load()
          thrusterSound.load()
          spaceAmbientSound.load()
        } catch (e) {
          console.error("Erro ao inicializar áudios:", e)
          $scope.audioEnabled = false
        }
      }
  
      // Função para tocar o som do sino com tratamento de erros
      function playBellSound() {
        console.log("Tentando tocar o som de sino...")
  
        try {
          // Criar um novo elemento de áudio a cada vez
          const bell = new Audio($scope.getAssetUrl("bell.mp3"))
          bell.volume = 0.7
  
          // Adicionar log quando o áudio estiver pronto
          bell.addEventListener("canplaythrough", () => {
            console.log("Som de sino pronto para tocar")
            bell.play().catch((e) => {
              console.error("Erro ao tocar o som de sino:", e)
            })
          })
  
          // Adicionar log de erro
          bell.addEventListener("error", (e) => {
            console.error("Erro ao carregar o som de sino:", e)
          })
  
          // Iniciar carregamento
          bell.load()
        } catch (e) {
          console.error("Erro ao criar o elemento de áudio para o sino:", e)
        }
      }
  
      // Get position badge class based on position
      $scope.getPositionClass = (position) => {
        if (position === 1) return "pos-1"
        if (position === 2) return "pos-2"
        if (position === 3) return "pos-3"
        if (position === 4) return "pos-4"
        return "pos-other"
      }
  
      // Get player image URL (using small version when available)
      $scope.getPlayerImageUrl = (player) => {
        // Check if player has image object with small version
        if (player && player.image && typeof player.image === "object" && player.image.small && player.image.small.url) {
          return player.image.small.url
        }
  
        // Check if player has image as string (backward compatibility)
        if (player && player.image && typeof player.image === "string") {
          return player.image
        }
  
        // Default image if no player image is available
        return $scope.getAssetUrl("default-player.png")
      }
  
      // Obter o tipo de nave com base na posição
      $scope.getShipType = (position) => {
        if (position === 1) return $scope.t("SHIP_TYPES.GOLD")
        if (position === 2) return $scope.t("SHIP_TYPES.SILVER")
        if (position === 3) return $scope.t("SHIP_TYPES.BRONZE")
        return $scope.t("SHIP_TYPES.REGULAR")
      }
  
      // Fetch leaderboard data
      function fetchLeaderboard() {
        $scope.connectionStatus = "connecting"
        console.log("Iniciando busca de leaderboard...")
  
        // Usar a URL exata fornecida pelo usuário
        const apiUrl = "https://service2.funifier.com/v3/leaderboard/EVJsbyw/leader/aggregate?period=&live=true"
        console.log("Usando URL exata:", apiUrl)
  
        const req = {
          method: "POST",
          url: apiUrl,
          headers: {
            Authorization: Funifier.auth.getAuthorization(),
            "Content-Type": "application/json",
          },
          data: [], // Corpo vazio, pois os parâmetros estão na URL
        }
  
        $http(req).then(
          (response) => {
            console.log("Resposta da API:", response)
  
            let errorCode = null
            if (response.data && response.data.errorCode) {
              console.error("Erro retornado pela API:", response.data)
              errorCode = response.data.errorCode
              useDummyData()
              return
            }
  
            $scope.connectionStatus = "connected"
  
            // Verificar a estrutura da resposta e processar adequadamente
            if (response.data && Array.isArray(response.data)) {
              // Se a resposta já for um array, use diretamente
              processLeaderboardData(response.data)
            } else {
              console.error("Não foi possível encontrar dados de leaderboard na resposta:", response.data)
              useDummyData()
            }
          },
          (error) => {
            console.error("Erro ao buscar ranking:", error)
            useDummyData()
          },
        )
      }
  
      // Adicione esta nova função após tryFetchLeaderboard()
      function useDummyData() {
        console.log("Usando dados de exemplo...")
        $scope.connectionStatus = "disconnected"
  
        // Criar dados de exemplo para teste
        const dummyData = generateDummyData(8)
        processLeaderboardData(dummyData)
  
        // Tentar novamente após um atraso
        $timeout(() => {
          fetchLeaderboard()
        }, 30000) // Tentar novamente após 30 segundos
      }
  
      // Process leaderboard data
      function processLeaderboardData(data) {
        if (!data || !Array.isArray(data)) {
          console.error("Formato de dados inválido:", data)
          return
        }
  
        // Armazenar estado anterior antes de atualizar
        $scope.previousPlayers = [...$scope.players]
  
        // Ordenar por total (maior para menor)
        data.sort((a, b) => b.total - a.total)
  
        // Definir posição (rank)
        data.forEach((player, index) => {
          player.position = index + 1
          player.id = player.id || player.player || `player-${index}` // Usar ID se disponível, caso contrário nome como identificador
          player.name = player.name || `Jogador ${index + 1}` // Garantir que há um nome
  
          // Atribuir pista (linha) para layout de grid F1
          player.lane = index % 2 === 0 ? 0 : 1 // Alternando pistas superior/inferior
  
          // Atribuir cor da nave com base na posição
          player.shipColor = getShipColorByPosition(index + 1)
  
          // Buscar dados do jogador para exibir no sidebar
          if (player.player) {
            fetchPlayerData(player)
          }
        })
  
        // Verificar mudança de primeiro lugar
        const newFirstPlace = data.length > 0 ? data[0].id : null
  
        if ($scope.firstPlaceId !== null && newFirstPlace !== $scope.firstPlaceId) {
          // Primeiro lugar mudou, tocar som de sino
          console.log("Primeiro lugar mudou! Anterior:", $scope.firstPlaceId, "Novo:", newFirstPlace)
          if (!$scope.isFirstLoad) {
            playBellSound()
          }
        }
  
        // Atualizar ID do primeiro lugar
        $scope.firstPlaceId = newFirstPlace
  
        // Atualizar array de jogadores
        $scope.players = data
  
        // Calcular largura total da pista com base no número de jogadores e espaçamento
        $scope.maxDistance = calculateMaxDistance(data)
  
        // Inicializar posições das naves com animação
        if ($scope.isFirstLoad) {
          // Primeira carga - sem animações
          $scope.isFirstLoad = false
          initializeShipPositions(false)
        } else {
          // Cargas subsequentes - animar mudanças de posição
          animatePositionChanges()
        }
      }
  
      // Buscar dados do jogador para exibir no sidebar
      function fetchPlayerData(player) {
        const playerId = player.player
  
        if (!playerId) return
  
        const req = {
          method: "GET",
          url: Funifier.config.service + "/v3/player/" + playerId + "/status",
          headers: {
            Authorization: Funifier.auth.getAuthorization(),
            "Content-Type": "application/json",
          },
        }
  
        $http(req).then(
          (response) => {
            player.playerData = response.data
  
            // Se este jogador estiver selecionado, atualizar a sidebar
            if ($scope.selectedPlayer && $scope.selectedPlayer.player === player.player) {
              $scope.selectedPlayer = player
            }
          },
          (error) => {
            console.error("Erro ao buscar dados do jogador:", error)
          },
        )
      }
  
      // Melhorar a função animatePositionChanges para animações mais dinâmicas
      function animatePositionChanges() {
        if ($scope.previousPlayers.length === 0) return
  
        // Criar um mapa de posições anteriores por ID do jogador
        const prevPositions = {}
        $scope.previousPlayers.forEach((player) => {
          prevPositions[player.id] = player.position
        })
  
        // Verificar quais jogadores mudaram de posição
        const changedPlayers = $scope.players.filter(
          (player) => prevPositions[player.id] !== undefined && prevPositions[player.id] !== player.position,
        )
  
        console.log("Jogadores que mudaram de posição:", changedPlayers.length)
  
        if (changedPlayers.length > 0) {
          // Tocar som de propulsores para mudanças de posição
          if ($scope.audioEnabled) {
            thrusterSound.play().catch((e) => {
              console.log("Não foi possível reproduzir o som:", e)
              $scope.audioEnabled = false
            })
          }
  
          // Adicionar classes de animação aos jogadores que mudaram
          $timeout(() => {
            changedPlayers.forEach((player) => {
              const shipElement = document.querySelector(`.nave[data-player-id="${player.id}"]`)
              if (shipElement) {
                console.log(`Animando nave do jogador ${player.name} (ID: ${player.id})`)
  
                // Remover classes de animação anteriores
                shipElement.classList.remove("position-improved", "position-lost")
  
                // Forçar reflow para garantir que a animação seja aplicada
                void shipElement.offsetWidth
  
                // Adicionar classe de animação com base na direção da mudança
                if (player.position < prevPositions[player.id]) {
                  // Subiu no ranking
                  console.log(`${player.name} subiu de ${prevPositions[player.id]} para ${player.position}`)
                  shipElement.classList.add("position-improved")
  
                  // Remover a classe após a animação terminar
                  $timeout(() => {
                    shipElement.classList.remove("position-improved")
                  }, 1500)
                } else {
                  // Desceu no ranking
                  console.log(`${player.name} desceu de ${prevPositions[player.id]} para ${player.position}`)
                  shipElement.classList.add("position-lost")
  
                  // Remover a classe após a animação terminar
                  $timeout(() => {
                    shipElement.classList.remove("position-lost")
                  }, 1500)
                }
              } else {
                console.warn(`Elemento da nave não encontrado para o jogador ${player.name} (ID: ${player.id})`)
              }
            })
          }, 100)
        }
  
        // Inicializar posições das naves após verificar mudanças
        initializeShipPositions(true)
      }
  
      // Calculate total track width needed
      function calculateMaxDistance(players) {
        if (!players || players.length === 0) return 1200
  
        // Base width + progressive spacing for each player
        let totalWidth = 600 // Base width for finish line and margins
  
        // Add space for each player with progressive spacing
        for (let i = 0; i < players.length; i++) {
          totalWidth += $scope.baseSpacing + (players.length - i) * $scope.progressiveSpacing
        }
  
        // Ensure minimum width
        return Math.max(totalWidth, 1200)
      }
  
      // Initialize ship positions with animation
      function initializeShipPositions(animate) {
        $timeout(() => {
          // Force browser reflow to ensure animations work
          if (document.querySelector(".space")) {
            document.querySelector(".space").offsetHeight
          }
  
          // Add animation class to ships if animating
          if (animate) {
            document.querySelectorAll(".nave").forEach((ship) => {
              ship.classList.add("animated")
            })
          }
        }, 100)
      }
  
      // Get ship color based on position
      function getShipColorByPosition(position) {
        // First 3 positions get special colors
        if (position === 1) return "gold"
        if (position === 2) return "silver"
        if (position === 3) return "bronze"
  
        // Other positions get rotating colors
        const colors = ["red", "blue", "green", "yellow"]
        return colors[(position - 1) % colors.length]
      }
  
      // Melhorar o cálculo de posição das naves para centralização
      $scope.getShipStyle = (index, total) => {
        const player = $scope.players[index]
        const position = player.position
  
        // Calculate horizontal position (right to left)
        // First place is rightmost, with progressive spacing
        const baseSpacing = $scope.baseSpacing
        const progressiveSpacing = $scope.progressiveSpacing
  
        // Calculate total distance from right edge
        let distanceFromRight = 150 // Base distance from finish line
  
        // Add additional spacing for top 3 positions to prevent overlap
        let additionalSpacing = 0
        if (position <= 3) {
          // Add extra spacing for top 3 positions (more for 1st, less for 3rd)
          additionalSpacing = (4 - position) * 30 // 90px for 1st, 60px for 2nd, 30px for 3rd
        }
  
        // Add progressive spacing for each position
        for (let i = 1; i < position; i++) {
          // Add extra spacing for positions 1-3 when calculating distance
          let positionSpacing = baseSpacing + i * progressiveSpacing
  
          // Add additional spacing for top positions
          if (i <= 3) {
            positionSpacing += (4 - i) * 30
          }
  
          distanceFromRight += positionSpacing
        }
  
        // Add the additional spacing for the current position
        distanceFromRight += additionalSpacing
  
        // Calculate right position (from right edge)
        const rightPosition = distanceFromRight
  
        // Centralizar verticalmente com um leve offset baseado na posição
        // Posições ímpares ficam um pouco acima, pares um pouco abaixo
        let verticalOffset = 0
        if (position % 2 === 0) {
          // Posições pares (2º, 4º, etc.) - linha inferior
          verticalOffset = 40 // 40px abaixo do centro
        } else {
          // Posições ímpares (1º, 3º, etc.) - linha superior
          verticalOffset = -40 // 40px acima do centro
        }
  
        // Z-index based on position (higher positions appear on top)
        const zIndex = 100 - position
  
        return {
          right: rightPosition + "px",
          top: "calc(50% + " + verticalOffset + "px)",
          transform: "translateY(-50%)",
          zIndex: zIndex,
        }
      }
  
      // --- White-label config ---
      $scope.whitelabelConfig = null;
      $scope.whitelabelCars = [];
  
      // Fetch white-label config and car images from DB
      function fetchWhitelabelConfig() {
        // Fetch global config
        $http({
          method: 'GET',
          url: Funifier.config.service + "/v3/database/espacial__c?strict=true&q=_id:'global'",
          headers: {
            Authorization: Funifier.auth.getAuthorization(),
            "Content-Type": "application/json",
            "cache-control": "no-cache"
          }
        }).then(function (data) {
          if (data.data && data.data[0]) {
            $scope.whitelabelConfig = data.data[0];
            applyWhitelabelStyles();
          }
        });
        // Fetch car images
        $http({
          method: 'GET',
          url: Funifier.config.service + "/v3/database/espacial__c?strict=true&q=type:'car'",
          headers: {
            Authorization: Funifier.auth.getAuthorization(),
            "Content-Type": "application/json",
            "cache-control": "no-cache"
          }
        }).then(function (data) {
          $scope.whitelabelCars = (data.data || []);
          console.log('[WhiteLabel] Loaded car images from DB:', $scope.whitelabelCars);
        });
      }
  
      // Apply styles from the config to the widget
      function applyWhitelabelStyles() {
        var cfg = $scope.whitelabelConfig;
        if (!cfg) return;
        // Background color
        if (cfg.background_color) {
          document.querySelector('.space-background').style.background = cfg.background_color;
        } else {
          console.error('[WhiteLabel] Background color not found in DB:', {
            key: 'background_color',
            config: cfg,
            reason: 'No background_color found in DB.'
          });
        }
        // Border color
        if (cfg.border_color) {
          document.getElementById('funifier-space-widget').style.border = '2px solid ' + cfg.border_color;
        } else {
          console.error('[WhiteLabel] Border color not found in DB:', {
            key: 'border_color',
            config: cfg,
            reason: 'No border_color found in DB.'
          });
        }
        // Font
        if (cfg.font) {
          document.getElementById('espacial').style.fontFamily = cfg.font;
        } else {
          console.error('[WhiteLabel] Font not found in DB:', {
            key: 'font',
            config: cfg,
            reason: 'No font found in DB.'
          });
        }
        // Font color
        if (cfg.font_color) {
          document.getElementById('funifier-space-widget').style.color = cfg.font_color;
        } else {
          console.error('[WhiteLabel] Font color not found in DB:', {
            key: 'font_color',
            config: cfg,
            reason: 'No font_color found in DB.'
          });
        }
        // Background image
        if (cfg.background_image) {
          document.querySelector('.space-background').style.backgroundImage = 'url(' + cfg.background_image + ')';
          document.querySelector('.space-background').style.backgroundSize = 'cover';
          document.querySelector('.space-background').style.backgroundPosition = 'center';
        } else if ('background_image' in cfg) {
          // If key exists but is empty, clear image
          document.querySelector('.space-background').style.backgroundImage = '';
        } else {
          console.error('[WhiteLabel] Background image not found in DB:', {
            key: 'background_image',
            config: cfg,
            reason: 'No background_image found in DB.'
          });
        }
      }
  
      // Helper to get car image by key
      function getWhitelabelCarImage(key) {
        console.log('[WhiteLabel] getWhitelabelCarImage called with key:', key);
        var found = $scope.whitelabelCars.find(function(car) { return car.car === key; });
        if (found && found.image) {
          console.log('[WhiteLabel] Found car image for key:', key, found.image);
          return found.image;
        }
        // No fallback: log error and return empty string
        console.error('[WhiteLabel] Car image not found:', {
          searchedKey: key,
          whitelabelCars: $scope.whitelabelCars,
          reason: 'No car image found in DB for this key.'
        });
        return '';
      }
  
      // Override getShipImage to use DB car images
      $scope.getShipImage = (position) => {
        console.log('[WhiteLabel] getShipImage called for position:', position);
        // Special ships for top 3 positions
        if (position === 1) return getWhitelabelCarImage('gold');
        if (position === 2) return getWhitelabelCarImage('silver');
        if (position === 3) return getWhitelabelCarImage('bronze');
        // For other positions, use color-based ships
        const colors = ['red', 'blue', 'green', 'yellow'];
        const colorKey = colors[(position - 1) % colors.length];
        return getWhitelabelCarImage(colorKey);
      };
  
      // Mostrar a sidebar com informações do jogador
      $scope.showPlayerSidebar = (player) => {
        $scope.selectedPlayer = player
        document.getElementById("player-sidebar").classList.add("active")
  
        // Adicionar classe selected à nave clicada
        $timeout(() => {
          document.querySelectorAll(".nave.selected").forEach((ship) => {
            ship.classList.remove("selected")
          })
  
          const shipElement = document.querySelector(`.nave[data-player-id="${player.id || player.player}"]`)
          if (shipElement) {
            shipElement.classList.add("selected")
          }
        }, 10)
      }
  
      // Esconder a sidebar
      $scope.hidePlayerSidebar = () => {
        document.getElementById("player-sidebar").classList.remove("active")
  
        // Remover classe selected de todas as naves
        document.querySelectorAll(".nave.selected").forEach((ship) => {
          ship.classList.remove("selected")
        })
      }
  
      // Funções para obter dados do jogador (do PlayerStatus API)
      $scope.getLevelName = (playerData) => {
        if (!playerData || !playerData.level) return "N/A"
  
        // Verificar diferentes estruturas possíveis para o nível
        if (typeof playerData.level === "string") {
          return playerData.level
        } else if (playerData.level.level) {
          return playerData.level.level
        } else if (playerData.level.name) {
          return playerData.level.name
        }
  
        return "N/A"
      }
  
      $scope.getXP = (playerData) => {
        if (!playerData) return 0
  
        // Tentar obter de point_categories
        if (playerData.point_categories && playerData.point_categories.xp !== undefined) {
          return playerData.point_categories.xp
        }
  
        // Tentar obter de pointCategories (alternativa)
        if (playerData.pointCategories && playerData.pointCategories.xp !== undefined) {
          return playerData.pointCategories.xp
        }
  
        return 0
      }
  
      $scope.getCoins = (playerData) => {
        if (!playerData) return 0
  
        // Tentar obter de point_categories
        if (playerData.point_categories && playerData.point_categories.moedas !== undefined) {
          return playerData.point_categories.moedas
        }
  
        // Tentar obter de pointCategories (alternativa)
        if (playerData.pointCategories && playerData.pointCategories.moedas !== undefined) {
          return playerData.pointCategories.moedas
        }
  
        return 0
      }
  
      // Habilitar scroll horizontal com a roda do mouse
      function enableHorizontalMouseScroll() {
        $timeout(() => {
          const spaceScroll = document.querySelector(".space-scroll")
  
          if (spaceScroll) {
            spaceScroll.addEventListener(
              "wheel",
              (event) => {
                // Prevenir o comportamento padrão de scroll vertical
                event.preventDefault()
  
                // Determinar a quantidade de scroll (multiplicar por um fator para ajustar a velocidade)
                const scrollFactor = 2.5
                const scrollAmount = event.deltaY * scrollFactor
  
                // Aplicar o scroll horizontal
                spaceScroll.scrollLeft += scrollAmount
  
                // Adicionar efeito visual durante o scroll
                addScrollEffect(scrollAmount > 0 ? "right" : "left")
              },
              { passive: false },
            )
          }
        }, 500)
      }
  
      // Adicionar efeito visual durante o scroll
      function addScrollEffect(direction) {
        const starsContainer = document.querySelector(".stars-container")
        if (!starsContainer) return
  
        // Criar uma estrela
        const star = document.createElement("div")
        star.className = "scroll-star"
  
        // Posicionar aleatoriamente na altura
        star.style.top = Math.random() * 100 + "%"
  
        // Definir direção com base no scroll
        if (direction === "right") {
          star.style.left = "0"
          star.style.transform = "rotate(0deg)"
        } else {
          star.style.right = "0"
          star.style.transform = "rotate(180deg)"
        }
  
        // Adicionar ao container
        starsContainer.appendChild(star)
  
        // Remover após a animação
        setTimeout(() => {
          star.remove()
        }, 1000)
      }
  
      // Adicione a função para gerar dados de exemplo
      function generateDummyData(count) {
        const dummyPlayers = []
        const nomes = ["João", "Maria", "Pedro", "Ana", "Carlos", "Lúcia", "Fernando", "Beatriz", "Rafael", "Juliana"]
  
        for (let i = 1; i <= count; i++) {
          const randomIndex = Math.floor(Math.random() * nomes.length)
          const nome = nomes[randomIndex]
  
          dummyPlayers.push({
            player: `player-${i}`,
            id: `player-${i}`,
            name: `${nome} ${i}`,
            total: Math.floor(Math.random() * 1000) + 500,
            image: null,
          })
        }
  
        // Ordenar por total
        dummyPlayers.sort((a, b) => b.total - a.total)
  
        return dummyPlayers
      }
  
      // Inicializar o widget
      function initialize() {
        // Inicializar elementos de áudio
        initAudio()
  
        // Buscar dados iniciais
        fetchLeaderboard()
  
        // Configurar atualização periódica
        $interval(() => {
          fetchLeaderboard()
        }, 30000)
  
        // Habilitar scroll horizontal com o mouse
        enableHorizontalMouseScroll()
  
        // On widget load, fetch config
        fetchWhitelabelConfig();
      }
  
      // Iniciar o widget
      initialize()
    },
  ])
  
  // Bootstrap do Angular
  setTimeout(() => {
    if (typeof angular !== "undefined") {
      var element = angular.element(document.getElementById("espacial"))
      if (!element.injector()) {
        angular.bootstrap(element, ["espacial"])
      }
    } else {
      console.error("AngularJS is not loaded.")
    }
  }, 10)