// app/barcos.js
if (typeof angular !== "undefined") {
  angular.module("barcos", []).controller("barcos", [
    "$scope",
    "$http",
    "$timeout",
    "$interval",
    ($scope, $http, $timeout, $interval) => {
      console.log("Barcos widget inicializado")

      // Configuração inicial
      $scope.players = []
      $scope.previousPlayers = []
      $scope.maxDistance = 0
      $scope.baseSpacing = 120
      $scope.progressiveSpacing = 20
      $scope.connectionStatus = "connecting"
      $scope.isFirstLoad = true
      $scope.firstPlaceId = null
      $scope.selectedPlayer = {}
      $scope.audioEnabled = true
      $scope.audioLoaded = false
      $scope.isUpdating = false
      $scope.bellSoundEnabled = true // Flag para controlar o som de sino especificamente

      // Configuração de idiomas para a interface
      $scope.translations = {
        pt: {
          BOAT_RACE_TITLE: "Corrida de Barcos",
          PLAYER_BOAT: "Barco do Jogador",
          PLAYER_PHOTO: "Foto do Jogador",
          PLAYER_NAME: "Nome do Jogador",
          POINTS: "pts",
          SCORE: "Pontuação",
          BOAT: "Barco",
          PLACE: "lugar",
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
          BOAT_TYPES: {
            GOLD: "Iate de Luxo",
            SILVER: "Veleiro Avançado",
            BRONZE: "Barco Padrão",
            REGULAR: "Barco Básico",
          },
        },
        en: {
          BOAT_RACE_TITLE: "Boat Race",
          PLAYER_BOAT: "Player Boat",
          PLAYER_PHOTO: "Player Photo",
          PLAYER_NAME: "Player Name",
          POINTS: "pts",
          SCORE: "Score",
          BOAT: "Boat",
          PLACE: "place",
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
          BOAT_TYPES: {
            GOLD: "Luxury Yacht",
            SILVER: "Advanced Sailboat",
            BRONZE: "Standard Boat",
            REGULAR: "Basic Boat",
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
      $scope.changeLanguage = (langKey) => {
        $scope.currentLang = langKey
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
          "https://raw.githubusercontent.com/JpRodrigues2/NextGen_Particular/main/1-NextGen_Studio/assets/barcos/"

        // Log para depuração
        console.log(`Carregando asset: ${baseUrl}${filename}`)

        return baseUrl + filename
      }

      // Elementos de áudio
      let bellSound
      let waveSound

      // Inicializar elementos de áudio
      function initAudio() {
        try {
          // Som de sino para mudança de primeiro lugar
          bellSound = new Audio()
          bellSound.src = $scope.getAssetUrl("bell.mp3")
          bellSound.volume = 0.7
          bellSound.preload = "auto"

          // Som de ondas para background
          waveSound = new Audio()
          waveSound.src = $scope.getAssetUrl("wave.mp3")
          waveSound.volume = 0.3 // Volume reduzido
          waveSound.preload = "auto"
          waveSound.loop = true // Loop contínuo

          // Verificar se os áudios carregaram
          bellSound.addEventListener("canplaythrough", () => {
            console.log("Som de sino carregado com sucesso")
            $scope.audioLoaded = true
          })

          waveSound.addEventListener("canplaythrough", () => {
            console.log("Som de ondas carregado com sucesso")
            // Iniciar o som de ondas automaticamente
            waveSound.play().catch((e) => {
              console.error("Erro ao tocar o som de ondas:", e)
              $scope.audioEnabled = false
            })
          })

          // Verificar se os áudios carregaram corretamente
          bellSound.addEventListener("error", (e) => {
            console.error("Erro ao carregar o som de sino:", e)
            console.log("URL do sino:", bellSound.src)
            $scope.audioEnabled = false
          })

          waveSound.addEventListener("error", (e) => {
            console.error("Erro ao carregar o som de ondas:", e)
            console.log("URL das ondas:", waveSound.src)
            $scope.audioEnabled = false
          })

          console.log("Áudios inicializados com as URLs:", {
            bell: bellSound.src,
            wave: waveSound.src,
          })

          // Tentar carregar os áudios manualmente
          bellSound.load()
          waveSound.load()
        } catch (e) {
          console.error("Erro ao inicializar áudios:", e)
          $scope.audioEnabled = false
        }
      }

      // Função para tocar o som do sino com tratamento de erros
      function playBellSound() {
        // Verificar se o som de sino está habilitado
        if (!$scope.bellSoundEnabled) {
          console.log("Som de sino desabilitado pela configuração")
          return
        }

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

      // Get player image URL (using small version when available)
      $scope.getPlayerImageUrl = (player) => {
        if (!player) return $scope.getAssetUrl("default-player.png")

        // Check if player has image object with small version
        if (
          player &&
          player.image &&
          typeof player.image === "object" &&
          player.image.small &&
          player.image.small.url
        ) {
          return player.image.small.url
        }

        // Check if player has image as string (backward compatibility)
        if (player && player.image && typeof player.image === "string") {
          return player.image
        }

        // Default image if no player image is available
        return $scope.getAssetUrl("default-player.png")
      }

      // Obter o tipo de barco com base na posição
      $scope.getBoatType = (position) => {
        if (!position) return $scope.t("BOAT_TYPES.REGULAR")

        if (position === 1) return $scope.t("BOAT_TYPES.GOLD")
        if (position === 2) return $scope.t("BOAT_TYPES.SILVER")
        if (position === 3) return $scope.t("BOAT_TYPES.BRONZE")
        return $scope.t("BOAT_TYPES.REGULAR")
      }

      // Fetch leaderboard data
      function fetchLeaderboard() {
        $scope.isUpdating = true
        $scope.connectionStatus = "connecting"
        console.log("Iniciando busca de leaderboard...")

        // Usar a URL exata fornecida pelo usuário
        const apiUrl = "https://service2.funifier.com/v3/leaderboard/EVJsbyw/leader/aggregate?period=&live=true"
        console.log("Usando URL exata:", apiUrl)

        const req = {
          method: "POST",
          url: apiUrl,
          headers: {
            Authorization: typeof Funifier !== "undefined" && Funifier.auth ? Funifier.auth.getAuthorization() : null,
            "Content-Type": "application/json",
          },
          data: [], // Corpo vazio, pois os parâmetros estão na URL
        }

        $http(req)
          .then(
            (response) => {
              console.log("Resposta da API:", response)

              if (response.data && response.data.errorCode) {
                console.error("Erro retornado pela API:", response.data)
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
          .finally(() => {
            $timeout(() => {
              $scope.isUpdating = false
            }, 1000)
          })
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

          // Atribuir pista (linha) para layout de grid
          player.lane = index % 3 // Distribuir em 3 linhas
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

        // Inicializar posições dos barcos com animação
        if ($scope.isFirstLoad) {
          // Primeira carga - sem animações
          $scope.isFirstLoad = false
          initializeBoatPositions(false)
        } else {
          // Cargas subsequentes - animar mudanças de posição
          animatePositionChanges()
        }

        // Configurar event listeners para os barcos
        setupBoatEventListeners()
      }

      // Animate position changes - MELHORADA
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
          // Adicionar classes de animação aos jogadores que mudaram
          $timeout(() => {
            changedPlayers.forEach((player) => {
              const boatElement = document.querySelector(`.boat[data-player-id="${player.id}"]`)
              if (boatElement) {
                console.log(`Animando barco do jogador ${player.name} (ID: ${player.id})`)

                // Remover classes de animação anteriores
                boatElement.classList.remove("position-improved", "position-lost")

                // Forçar reflow para garantir que a animação seja aplicada
                void boatElement.offsetWidth

                // Adicionar classe de animação com base na direção da mudança
                if (player.position < prevPositions[player.id]) {
                  // Subiu no ranking
                  console.log(`${player.name} subiu de ${prevPositions[player.id]} para ${player.position}`)
                  boatElement.classList.add("position-improved")

                  // Remover a classe após a animação terminar
                  $timeout(() => {
                    boatElement.classList.remove("position-improved")
                  }, 1500)
                } else {
                  // Desceu no ranking
                  console.log(`${player.name} desceu de ${prevPositions[player.id]} para ${player.position}`)
                  boatElement.classList.add("position-lost")

                  // Remover a classe após a animação terminar
                  $timeout(() => {
                    boatElement.classList.remove("position-lost")
                  }, 1500)
                }
              } else {
                console.warn(`Elemento do barco não encontrado para o jogador ${player.name} (ID: ${player.id})`)
              }
            })
          }, 100)
        }

        // Inicializar posições dos barcos após verificar mudanças
        initializeBoatPositions(true)
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

      // Initialize boat positions with animation
      function initializeBoatPositions(animate) {
        $timeout(() => {
          // Force browser reflow to ensure animations work
          const oceanSection = document.querySelector(".ocean-section")
          if (oceanSection) {
            oceanSection.style.width = $scope.maxDistance + 500 + "px"
            oceanSection.offsetHeight
          }

          // Add animation class to boats if animating
          if (animate) {
            document.querySelectorAll(".boat").forEach((boat) => {
              boat.style.transition = "right 1s ease-in-out, top 1s ease-in-out"
              boat.classList.add("animated")
            })
          }
        }, 100)
      }

      // Calculate boat position in grid style
      $scope.getBoatStyle = (index, total) => {
        const player = $scope.players[index]
        const position = player.position

        // Calculate horizontal position (right to left)
        // First place is rightmost, with progressive spacing
        const baseSpacing = $scope.baseSpacing
        const progressiveSpacing = $scope.progressiveSpacing

        // Calculate total distance from right edge
        let distanceFromRight = 350 // Aumentado de 150 para 350 para afastar da linha de chegada

        // Add progressive spacing for each position
        for (let i = 1; i < position; i++) {
          distanceFromRight += baseSpacing + i * progressiveSpacing
        }

        // Calculate vertical position based on lane
        // Ajustado para posicionar os barcos mais acima na área do oceano
        // Distribuir em 3 linhas, mas mais próximas do topo da área do oceano
        const laneOffset = player.lane * 40 - 40 // Reduzido de 60 para 40 e subtraído 40 para elevar

        // Z-index based on position (higher positions appear on top)
        const zIndex = 100 - position

        return {
          right: distanceFromRight + "px",
          top: `calc(50% + ${laneOffset}px)`,
          transform: "translateY(-50%)",
          zIndex: zIndex,
        }
      }

      // --- White-label config ---
      $scope.whitelabelConfig = null
      $scope.whitelabelBoats = []

      // Fetch white-label config and boat images from DB
      function fetchWhitelabelConfig() {
        // Fetch global config
        $http({
          method: "GET",
          url: Funifier.config.service + "/v3/database/barcos__c?strict=true&q=_id:'global'",
          headers: {
            Authorization: typeof Funifier !== "undefined" && Funifier.auth.getAuthorization(),
            "Content-Type": "application/json",
            "cache-control": "no-cache",
          },
        }).then((data) => {
          if (data.data && data.data[0]) {
            $scope.whitelabelConfig = data.data[0]
            applyWhitelabelStyles()
          }
        })
        // Fetch boat images
        $http({
          method: "GET",
          url: Funifier.config.service + "/v3/database/barcos__c?strict=true&q=type:'boat'",
          headers: {
            Authorization: typeof Funifier !== "undefined" && Funifier.auth.getAuthorization(),
            "Content-Type": "application/json",
            "cache-control": "no-cache",
          },
        }).then((data) => {
          $scope.whitelabelBoats = data.data || []
          console.log("[WhiteLabel] Loaded boat images from DB:", $scope.whitelabelBoats)
        })
      }

      // Apply styles from the config to the widget
      function applyWhitelabelStyles() {
        var cfg = $scope.whitelabelConfig
        if (!cfg) return

        // Background color for ocean
        if (cfg.background_color) {
          document.querySelector(".wave-layer").style.background = cfg.background_color
        } else {
          console.error("[WhiteLabel] Background color not found in DB:", {
            key: "background_color",
            config: cfg,
            reason: "No background_color found in DB.",
          })
        }

        // Border color
        if (cfg.border_color) {
          document.getElementById("barcos").style.border = "2px solid " + cfg.border_color
        } else {
          console.error("[WhiteLabel] Border color not found in DB:", {
            key: "border_color",
            config: cfg,
            reason: "No border_color found in DB.",
          })
        }

        // Font
        if (cfg.font) {
          document.getElementById("barcos").style.fontFamily = cfg.font
        } else {
          console.error("[WhiteLabel] Font not found in DB:", {
            key: "font",
            config: cfg,
            reason: "No font found in DB.",
          })
        }

        // Font color
        if (cfg.font_color) {
          document.getElementById("barcos").style.color = cfg.font_color
        } else {
          console.error("[WhiteLabel] Font color not found in DB:", {
            key: "font_color",
            config: cfg,
            reason: "No font_color found in DB.",
          })
        }

        // Sky background image (specific to boats widget)
        if (cfg.sky_image) {
          const skyLayer = document.querySelector(".sky-layer")
          if (skyLayer) {
            skyLayer.style.backgroundImage = `url(${cfg.sky_image})`
            skyLayer.style.backgroundSize = "cover"
            skyLayer.style.backgroundPosition = "center"
          }
        } else if ("sky_image" in cfg) {
          // If key exists but is empty, use default
          const skyLayer = document.querySelector(".sky-layer")
          if (skyLayer) {
            skyLayer.style.backgroundImage = ""
          }
        } else {
          console.error("[WhiteLabel] Sky image not found in DB:", {
            key: "sky_image",
            config: cfg,
            reason: "No sky_image found in DB.",
          })
        }

        // Bell sound enabled/disabled
        if ("bell_sound_enabled" in cfg) {
          $scope.bellSoundEnabled = cfg.bell_sound_enabled
          console.log("[WhiteLabel] Bell sound enabled:", $scope.bellSoundEnabled)
        } else {
          console.error("[WhiteLabel] Bell sound setting not found in DB:", {
            key: "bell_sound_enabled",
            config: cfg,
            reason: "No bell_sound_enabled found in DB.",
          })
        }
      }

      // Helper to get boat image by key
      function getWhitelabelBoatImage(key) {
        console.log("[WhiteLabel] getWhitelabelBoatImage called with key:", key)
        var found = $scope.whitelabelBoats.find((boat) => boat.boat === key)
        if (found && found.image) {
          console.log("[WhiteLabel] Found boat image for key:", key, found.image)
          return found.image
        }
        // No fallback: log error and return empty string
        console.error("[WhiteLabel] Boat image not found:", {
          searchedKey: key,
          whitelabelBoats: $scope.whitelabelBoats,
          reason: "No boat image found in DB for this key.",
        })
        return ""
      }

      // Override getBoatImage to use DB boat images
      $scope.getBoatImage = (position) => {
        console.log("[WhiteLabel] getBoatImage called for position:", position)
        // Special boats for top 3 positions
        if (position === 1) return getWhitelabelBoatImage("red")
        if (position === 2) return getWhitelabelBoatImage("blue")
        if (position === 3) return getWhitelabelBoatImage("green")
        // For other positions, use color-based boats
        const colors = ["yellow", "red", "blue", "green"]
        const colorKey = colors[(position - 1) % colors.length]
        return getWhitelabelBoatImage(colorKey)
      }

      // Setup event listeners for boats
      function setupBoatEventListeners() {
        $timeout(() => {
          const oceanSection = document.querySelector(".ocean-section")
          if (oceanSection) {
            // Remover event listeners anteriores
            const oldBoats = document.querySelectorAll(".boat")
            oldBoats.forEach((boat) => {
              boat.removeEventListener("click", handleBoatClick)
            })

            // Adicionar novos event listeners
            const boats = document.querySelectorAll(".boat")
            boats.forEach((boat) => {
              boat.addEventListener("click", handleBoatClick)
            })
          }
        }, 500)
      }

      // Handler para clique nos barcos
      function handleBoatClick(event) {
        const boatElement = event.currentTarget

        // Remover seleção anterior
        document.querySelectorAll(".boat.selected").forEach((boat) => {
          boat.classList.remove("selected")
        })

        // Adicionar seleção ao barco clicado
        boatElement.classList.add("selected")

        // Obter dados do jogador
        const playerId = boatElement.getAttribute("data-player-id")
        const player = $scope.players.find((p) => p.id === playerId)

        if (player) {
          // Atualizar scope e mostrar sidebar
          $scope.$apply(() => {
            $scope.showPlayerSidebar(player)
          })
        }
      }

      // Mostrar a sidebar com informações do jogador
      $scope.showPlayerSidebar = (player) => {
        $scope.selectedPlayer = player
        document.getElementById("player-sidebar").classList.add("active")
      }

      // Esconder a sidebar
      $scope.hidePlayerSidebar = () => {
        document.getElementById("player-sidebar").classList.remove("active")
        document.querySelectorAll(".boat.selected").forEach((boat) => {
          boat.classList.remove("selected")
        })
      }

      // Habilitar scroll horizontal com a roda do mouse
      function enableHorizontalMouseScroll() {
        $timeout(() => {
          const scrollWrapper = document.getElementById("scroll-wrapper")

          if (scrollWrapper) {
            scrollWrapper.addEventListener(
              "wheel",
              (event) => {
                // Prevenir o comportamento padrão de scroll vertical
                event.preventDefault()

                // Determinar a quantidade de scroll (multiplicar por um fator para ajustar a velocidade)
                const scrollFactor = 2.5
                const scrollAmount = event.deltaY * scrollFactor

                // Aplicar o scroll horizontal
                scrollWrapper.scrollLeft += scrollAmount
              },
              { passive: false },
            )
          }
        }, 500)
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
            lane: (i - 1) % 3,
          })
        }

        // Ordenar por total
        dummyPlayers.sort((a, b) => b.total - a.total)

        // Atribuir posições
        dummyPlayers.forEach((player, index) => {
          player.position = index + 1
        })

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

        // Iniciar animação de nuvens
        startCloudAnimation()

        // On widget load, fetch config
        fetchWhitelabelConfig()
      }

      // Função para animar as nuvens
      function startCloudAnimation() {
        $timeout(() => {
          // Configurar as nuvens com as URLs corretas
          const clouds = document.querySelectorAll(".cloud")

          if (clouds.length >= 3) {
            clouds[0].style.backgroundImage = `url("https://raw.githubusercontent.com/JpRodrigues2/NextGen_Particular/main/1-NextGen_Studio/assets/barcos/nuvem.png")`
            clouds[1].style.backgroundImage = `url("https://raw.githubusercontent.com/JpRodrigues2/NextGen_Particular/main/1-NextGen_Studio/assets/barcos/nuvem2.png")`
            clouds[2].style.backgroundImage = `url("https://raw.githubusercontent.com/JpRodrigues2/NextGen_Particular/main/1-NextGen_Studio/assets/barcos/nuvem.png")`

            // Garantir que as nuvens estejam visíveis
            clouds.forEach((cloud) => {
              cloud.style.opacity = "0.8"
            })
          }
        }, 500)
      }

      // Iniciar o widget
      initialize()
    },
  ])
} else {
  console.error("AngularJS is not loaded.")
}

// Bootstrap do Angular
setTimeout(() => {
  if (typeof angular !== "undefined") {
    var element = angular.element(document.getElementById("barcos"))
    if (!element.injector()) {
      angular.bootstrap(element, ["barcos"])
    }
  } else {
    console.error("AngularJS is not loaded.")
  }
}, 10)
