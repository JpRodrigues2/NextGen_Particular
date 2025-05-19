// Criar o módulo Angular com dependência do angular-translate
angular
  .module("RankingApp", ["pascalprecht.translate"])
  // Configurar o provedor de tradução
  .config([
    "$translateProvider",
    ($translateProvider) => {
      // Definir as traduções para português
      $translateProvider.translations("pt", {
        SPACE_STATION: "Estação Espacial",
        PLAYER_SHIP: "Nave do Jogador",
        PLAYER_PHOTO: "Foto do jogador",
        PLAYER_NAME: "Nome do Jogador",
        POINTS: "pts",
        SCORE: "Pontuação",
        SHIP: "Nave",
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
        TV_MODE_CONFIRM: "Detectamos uma tela grande. Ativar modo TV (sem interação)?",
        ORIENTATION_MESSAGE: "Por favor, gire seu dispositivo para visualizar melhor",
      })

      // Definir as traduções para inglês
      $translateProvider.translations("en", {
        SPACE_STATION: "Space Station",
        PLAYER_SHIP: "Player Ship",
        PLAYER_PHOTO: "Player Photo",
        PLAYER_NAME: "Player Name",
        POINTS: "pts",
        SCORE: "Score",
        SHIP: "Ship",
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
        TV_MODE_CONFIRM: "We detected a large screen. Activate TV mode (no interaction)?",
        ORIENTATION_MESSAGE: "Please rotate your device for a better view",
      })

      // Definir o idioma padrão
      $translateProvider.preferredLanguage("pt")
      $translateProvider.useSanitizeValueStrategy("escape")
    },
  ])
  .controller("RankingController", ($scope, $http, $timeout, $window, $interval, $translate) => {
    // Initialize variables
    $scope.players = []
    $scope.previousPlayers = [] // Store previous state to detect position changes
    $scope.maxDistance = 0
    $scope.baseSpacing = 120 // Base spacing between ships
    $scope.progressiveSpacing = 20 // Additional spacing for higher positions
    $scope.connectionStatus = "connected" // Default status
    $scope.isTVMode = false // TV mode flag (no interaction)
    $scope.isFirstLoad = true // Flag for first load (no animations)
    $scope.firstPlaceId = null // Track first place player ID
    $scope.currentLang = "pt" // Idioma atual
    $scope.isUpdating = false // Flag para indicar atualização em andamento

    // Referência ao wrapper de scroll
    let scrollWrapper = null

    // Variável para armazenar a posição do scroll
    let lastScrollPosition = 0
    let scrollRestorationAttempts = 0
    const MAX_RESTORATION_ATTEMPTS = 5

    // Função para alternar o idioma
    $scope.changeLanguage = (langKey) => {
      $scope.currentLang = langKey
      $translate.use(langKey)

      // Atualizar textos na sidebar que não são atualizados automaticamente
      updateSidebarTranslations()
    }

    // Função para atualizar traduções na sidebar
    function updateSidebarTranslations() {
      // Obter o jogador selecionado
      const selectedShip = document.querySelector(".nave.selected")
      if (selectedShip) {
        const playerId = selectedShip.getAttribute("data-player-id")
        const player = $scope.players.find((p) => (p.id || p.name) === playerId)

        if (player) {
          // Atualizar textos traduzidos
          updateSidebarForPlayer(player)
        }
      }
    }

    // Audio elements
    let warpSound
    let thrusterSound

    // Initialize audio elements
    function initAudio() {
      // Warp sound for first place change - Corrigido para bell.mp3
      warpSound = new Audio("audio/bell.mp3")
      warpSound.volume = 0.7

      // Thruster sound for position changes
      thrusterSound = new Audio("audio/thruster.mp3")
      thrusterSound.volume = 0.5
      thrusterSound.loop = false
    }

    // Check if we're in TV mode (based on URL parameter or screen size)
    function checkTVMode() {
      // Check URL parameter
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.has("tv") && urlParams.get("tv") === "true") {
        $scope.isTVMode = true
        document.body.classList.add("tv-mode")
      }

      // Check screen size (optional, for auto-detection)
      if (window.innerWidth >= 1920 && window.innerHeight >= 1080) {
        // Likely a TV or large display
        $translate("TV_MODE_CONFIRM").then((translation) => {
          const isTV = confirm(translation)
          if (isTV) {
            $scope.isTVMode = true
            document.body.classList.add("tv-mode")
          }
        })
      }
    }

    // Force landscape mode on mobile
    function forceLandscapeOnMobile() {
      // Check if it's a mobile device
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // Add landscape class to body
        document.body.classList.add("force-landscape")

        // Check orientation and show message if needed
        checkOrientation()

        // Listen for orientation changes
        window.addEventListener("orientationchange", checkOrientation)
        window.addEventListener("resize", checkOrientation)
      }
    }

    // Check device orientation and show message if needed
    function checkOrientation() {
      const orientationMessage = document.getElementById("orientation-message")

      if (window.innerHeight > window.innerWidth) {
        // Portrait mode
        if (orientationMessage) {
          orientationMessage.style.display = "flex"
        } else {
          // Create orientation message if it doesn't exist
          $translate("ORIENTATION_MESSAGE").then((translation) => {
            const message = document.createElement("div")
            message.id = "orientation-message"
            message.innerHTML = `
              <div class="orientation-content">
                <div class="phone-icon">📱</div>
                <p>${translation}</p>
              </div>
            `
            document.body.appendChild(message)
          })
        }
      } else {
        // Landscape mode
        if (orientationMessage) {
          orientationMessage.style.display = "none"
        }
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
      // Para depuração - remover em produção
      console.log("Player image data:", player.image)

      // Check if player has image object with small version
      if (player && player.image && typeof player.image === "object" && player.image.small && player.image.small.url) {
        console.log("Using small image:", player.image.small.url)
        return player.image.small.url
      }

      // Check if player has image as string (backward compatibility)
      if (player && player.image && typeof player.image === "string") {
        console.log("Using string image:", player.image)
        return player.image
      }

      // Default image if no player image is available
      console.log("Using default image")
      return "img/default-player.png"
    }

    // Função para restaurar a posição do scroll com múltiplas tentativas
    function restoreScrollPosition() {
      if (!scrollWrapper || lastScrollPosition <= 0 || scrollRestorationAttempts >= MAX_RESTORATION_ATTEMPTS) {
        scrollRestorationAttempts = 0
        return
      }

      console.log(`Tentativa ${scrollRestorationAttempts + 1} de restaurar posição do scroll:`, lastScrollPosition)

      // Restaurar a posição do scroll
      scrollWrapper.scrollLeft = lastScrollPosition

      // Verificar se a restauração funcionou
      if (Math.abs(scrollWrapper.scrollLeft - lastScrollPosition) < 10) {
        console.log("Posição do scroll restaurada com sucesso!")
        scrollRestorationAttempts = 0
      } else {
        // Tentar novamente após um pequeno delay
        scrollRestorationAttempts++
        $timeout(restoreScrollPosition, 100)
      }
    }

    // Fetch leaderboard data
    function fetchLeaderboard() {
      // Marcar que uma atualização está em andamento
      $scope.isUpdating = true

      // Salvar a posição atual do scroll antes de atualizar
      if (scrollWrapper) {
        lastScrollPosition = scrollWrapper.scrollLeft
        console.log("Salvando posição do scroll:", lastScrollPosition)
      }

      $scope.connectionStatus = "connecting"

      const req = {
        method: "POST",
        url: "https://service2.funifier.com/v3/leaderboard/EVJsbyw/leader/aggregate?period=&live=true",
        headers: {
          Authorization:
            "Basic NjgyYTBlNmYyMzI3Zjc0ZjNhM2UwMDg5OjY4MmExMDI2MjMyN2Y3NGYzYTNlMDBjZg==",
          "Content-Type": "application/json",
        },
        data: [],
      }

      $http(req).then(
        (response) => {
          $scope.connectionStatus = "connected"
          processLeaderboardData(response.data)
        },
        (error) => {
          console.error("Error fetching ranking:", error)
          $scope.connectionStatus = "disconnected"
          $scope.isUpdating = false

          // Fallback data in case API fails
          if ($scope.players.length === 0) {
            $scope.players = generateDummyData(10)
            $scope.maxDistance = calculateMaxDistance($scope.players)
            initializeShipPositions()
          }

          // Try again after a delay
          $timeout(() => {
            fetchLeaderboard()
          }, 5000)
        },
      )
    }

    // Process leaderboard data
    function processLeaderboardData(data) {
      if (!data || !Array.isArray(data)) {
        console.error("Invalid data format:", data)
        $scope.isUpdating = false
        return
      }

      // Store previous state before updating
      $scope.previousPlayers = [...$scope.players]

      // Sort by total (highest to lowest)
      data.sort((a, b) => b.total - a.total)

      // Set position (rank)
      data.forEach((player, index) => {
        player.position = index + 1
        player.id = player.id || player.name // Use ID if available, otherwise name as identifier

        // Assign lane (row) for F1 grid layout
        player.lane = index % 2 === 0 ? 0 : 1 // Alternating top/bottom lanes

        // Assign ship color based on position
        player.shipColor = getShipColorByPosition(index + 1)
      })

      // Check for first place change
      const newFirstPlace = data.length > 0 ? data[0].id : null

      if ($scope.firstPlaceId !== null && newFirstPlace !== $scope.firstPlaceId) {
        // First place has changed, play warp sound
        if (warpSound && !$scope.isFirstLoad) {
          warpSound.play().catch((e) => console.log("Could not play sound:", e))
        }
      }

      // Update first place ID
      $scope.firstPlaceId = newFirstPlace

      // Update players array
      $scope.players = data

      // Calculate total track width based on number of players and spacing
      $scope.maxDistance = calculateMaxDistance(data)

      // Ajustar a largura da seção espacial com base na distância máxima
      const spaceSection = document.querySelector(".space-section")
      if (spaceSection) {
        spaceSection.style.width = $scope.maxDistance + 500 + "px"
      }

      // Initialize ship positions with animation
      if ($scope.isFirstLoad) {
        // First load - no animations
        $scope.isFirstLoad = false
        initializeShipPositions(false)
      } else {
        // Subsequent loads - animate position changes
        animatePositionChanges()
      }

      // Após atualizar os players, reconfigurar os event listeners
      setupShipEventListeners()

      // Restaurar a posição do scroll após a atualização
      $timeout(() => {
        if (scrollWrapper && lastScrollPosition > 0) {
          scrollWrapper.scrollLeft = lastScrollPosition
        }
        $scope.isUpdating = false // Marcar que a atualização foi concluída
      }, 100)
    }

    // Animate position changes
    function animatePositionChanges() {
      if ($scope.previousPlayers.length === 0) return

      // Create a map of previous positions by player ID
      const prevPositions = {}
      $scope.previousPlayers.forEach((player) => {
        prevPositions[player.id] = player.position
      })

      // Check which players changed positions
      const changedPlayers = $scope.players.filter((player) => {
        return prevPositions[player.id] !== undefined && prevPositions[player.id] !== player.position
      })

      if (changedPlayers.length > 0) {
        // Play thruster sound for position changes
        if (thrusterSound) {
          thrusterSound.play().catch((e) => console.log("Could not play sound:", e))
        }

        // Add animation classes to changed players
        $timeout(() => {
          changedPlayers.forEach((player) => {
            const shipElement = document.querySelector(`.nave[data-player-id="${player.id}"]`)
            if (shipElement) {
              // Add animation class based on direction of change
              if (player.position < prevPositions[player.id]) {
                // Moved up in ranking
                shipElement.classList.add("position-improved")
                $timeout(() => shipElement.classList.remove("position-improved"), 1000)
              } else {
                // Moved down in ranking
                shipElement.classList.add("position-lost")
                $timeout(() => shipElement.classList.remove("position-lost"), 1000)
              }
            }
          })
        }, 100)
      }

      // Initialize ship positions after checking changes
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
    function initializeShipPositions(animate = true) {
      $timeout(() => {
        // Se for a primeira carga, mostrar os primeiros colocados
        // Caso contrário, não alterar a posição do scroll (será restaurada em processLeaderboardData)
        if ($scope.isFirstLoad && scrollWrapper) {
          // Encontrar o elemento que contém os primeiros colocados
          const firstPlaceShip = document.querySelector('.nave[data-player-id="' + $scope.firstPlaceId + '"]')

          if (firstPlaceShip) {
            // Calcular a posição do primeiro colocado
            const rect = firstPlaceShip.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2

            // Centralizar a visualização no primeiro colocado
            scrollWrapper.scrollLeft = Math.max(0, centerX - window.innerWidth / 2)
          }
        }

        // Add animation class to ships if animating
        if (animate) {
          document.querySelectorAll(".nave").forEach((ship) => {
            ship.classList.add("animated")
          })
        }
      }, 100)
    }

    // Generate dummy data for testing or API failure
    function generateDummyData(count) {
      const dummyPlayers = []
      const shipColors = ["red", "blue", "green", "yellow"]

      for (let i = 1; i <= count; i++) {
        dummyPlayers.push({
          name: `Player ${i}`,
          id: `player-${i}`,
          total: Math.floor(Math.random() * 1000) + 500,
          position: i,
          image: null,
          lane: i % 2 === 0 ? 0 : 1, // Alternating top/bottom lanes
          shipColor: shipColors[i % shipColors.length],
        })
      }

      // Sort by total
      dummyPlayers.sort((a, b) => b.total - a.total)

      // Update positions after sorting
      dummyPlayers.forEach((player, index) => {
        player.position = index + 1
      })

      return dummyPlayers
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

    // Calculate ship position in F1 grid style
    $scope.getShipStyle = (index, total) => {
      const player = $scope.players[index]
      const position = player.position

      // Calculate horizontal position (right to left)
      // First place is rightmost, with progressive spacing
      const baseSpacing = $scope.baseSpacing
      const progressiveSpacing = $scope.progressiveSpacing

      // Calculate total distance from right edge
      let distanceFromRight = 150 // Base distance from finish line

      // Add progressive spacing for each position
      for (let i = 1; i < position; i++) {
        distanceFromRight += baseSpacing + i * progressiveSpacing
      }

      // Calculate right position (from right edge)
      const rightPosition = distanceFromRight

      // Determine vertical position based on F1 grid style
      // Even positions on top row, odd positions on bottom row
      let rowOffset = 0

      // F1 grid style: staggered positions
      // First place at the front-right
      // Second place behind and below first place
      // Third place behind second but on same row as first
      // And so on...
      if (position % 2 === 0) {
        // Even positions (2nd, 4th, etc.) - bottom row
        rowOffset = 60 // Lower row
      } else {
        // Odd positions (1st, 3rd, etc.) - top row
        rowOffset = 0 // Upper row
      }

      // Z-index based on position (higher positions appear on top)
      const zIndex = 100 - position

      return {
        right: rightPosition + "px",
        top: "calc(50% + " + rowOffset + "px)",
        transform: "translateY(-50%)",
        zIndex: zIndex,
      }
    }

    // Get ship image based on position and color
    $scope.getShipImage = (position) => {
      // Special ships for top 3 positions
      if (position === 1) return "img/nave-ouro.png"
      if (position === 2) return "img/nave-prata.png"
      if (position === 3) return "img/nave-bronze.png"

      // For other positions, use color-based ships
      const colors = ["red", "blue", "green", "yellow"]
      const colorIndex = (position - 1) % colors.length
      return `img/nave${colorIndex + 1}.png`
    }

    // Função para centralizar a visualização no primeiro colocado
    $scope.focusOnFirstPlace = () => {
      if (!scrollWrapper) return

      const firstPlaceShip = document.querySelector('.nave[data-player-id="' + $scope.firstPlaceId + '"]')
      if (firstPlaceShip) {
        // Calcular a posição do primeiro colocado
        const rect = firstPlaceShip.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2

        // Centralizar a visualização no primeiro colocado com animação suave
        scrollWrapper.scrollTo({
          left: Math.max(0, centerX - window.innerWidth / 2),
          behavior: "smooth",
        })
      }
    }

    // Configurar navegação horizontal com mouse wheel - Implementação baseada no código da corrida de carros
    function setupHorizontalScroll() {
      // Verificar se o wrapper de scroll existe
      if (!scrollWrapper) return

      // Adicionar evento de roda do mouse para scroll horizontal
      scrollWrapper.addEventListener(
        "wheel",
        function (event) {
          // Prevenir o comportamento padrão (scroll vertical)
          event.preventDefault()

          // Determinar a quantidade de scroll (multiplicar por um fator para ajustar a velocidade)
          const scrollFactor = 2.5
          const scrollAmount = event.deltaY * scrollFactor

          // Aplicar o scroll horizontal
          this.scrollLeft += scrollAmount

          // Adicionar efeito visual durante o scroll
          addScrollEffect(scrollAmount > 0 ? "right" : "left")

          // Atualizar a posição do scroll
          lastScrollPosition = this.scrollLeft
        },
        { passive: false }
      )

      // Adicionar evento de teclado para navegação
      document.addEventListener("keydown", (event) => {
        const scrollStep = 200

        if (event.key === "ArrowLeft") {
          scrollWrapper.scrollLeft -= scrollStep
          addScrollEffect("left")
          lastScrollPosition = scrollWrapper.scrollLeft
        } else if (event.key === "ArrowRight") {
          scrollWrapper.scrollLeft += scrollStep
          addScrollEffect("right")
          lastScrollPosition = scrollWrapper.scrollLeft
        }
      })

      // Adicionar evento para monitorar mudanças no scroll
      scrollWrapper.addEventListener("scroll", function () {
        // Atualizar a posição do scroll sempre que o usuário rolar manualmente
        lastScrollPosition = this.scrollLeft
      })

      console.log("Horizontal scroll setup complete")
    }

    // Event listeners for ship selection
    function setupShipEventListeners() {
      console.log("Setting up ship event listeners with event delegation")

      // Remover event listeners anteriores para evitar duplicação
      const spaceSection = document.querySelector(".space-section")
      if (spaceSection) {
        // Usar delegação de eventos para lidar com elementos dinâmicos
        spaceSection.addEventListener("click", (event) => {
          // Verificar se o clique foi em uma nave ou em um elemento filho da nave
          const shipElement = event.target.closest(".nave")
          if (shipElement) {
            console.log("Ship clicked via delegation:", shipElement)

            // Remover classe selected de todas as naves
            document.querySelectorAll(".nave.selected").forEach((ship) => {
              ship.classList.remove("selected")
            })

            // Adicionar classe selected à nave clicada
            shipElement.classList.add("selected")

            // Obter o ID do jogador
            const playerId = shipElement.getAttribute("data-player-id")
            console.log("Player ID:", playerId)

            // Encontrar o jogador correspondente
            const player = $scope.players.find((p) => (p.id || p.name) === playerId)

            if (player) {
              console.log("Player found:", player)
              // Mostrar a sidebar com as informações do jogador
              showPlayerSidebar(player)
              $scope.$apply() // Atualizar a UI
            } else {
              console.log("Player not found for ID:", playerId)
            }
          }
        })

        console.log("Event delegation setup complete on space-section")
      } else {
        console.error("Could not find .space-section element for event delegation")
      }

      // Fechar a sidebar quando clicar fora das naves
      document.addEventListener("click", (event) => {
        if (!event.target.closest(".nave") && !event.target.closest(".player-sidebar")) {
          document.getElementById("player-sidebar").classList.remove("active")
          document.querySelectorAll(".nave.selected").forEach((ship) => {
            ship.classList.remove("selected")
          })
          $scope.$apply()
        }
      })
    }

    // Função para mostrar a sidebar do jogador
    function showPlayerSidebar(player) {
      $scope.showPlayerSidebar(player)
    }

    // Função para atualizar a sidebar com informações do jogador
    function updateSidebarForPlayer(player) {
      // Atualizar informações na sidebar
      document.getElementById("sidebar-name").textContent = player.name

      // Padronizar a exibição da posição para todas as posições
      if ($scope.currentLang === "pt") {
        // Em português, usar "º Lugar" para todas as posições
        document.getElementById("sidebar-position").textContent = player.position + "º Lugar"
      } else {
        // Em inglês, usar o formato ordinal correto + "Place"
        const ordinal = getOrdinalSuffix(player.position)
        document.getElementById("sidebar-position").textContent = player.position + ordinal + " Place"
      }

      // Obter a tradução para "pts"
      $translate("POINTS").then((translation) => {
        document.getElementById("sidebar-points").textContent = player.total + " " + translation
      })

      // Definir o tipo de nave com base na posição
      let shipTypeKey = ""
      if (player.position === 1) shipTypeKey = "SHIP_TYPES.GOLD"
      else if (player.position === 2) shipTypeKey = "SHIP_TYPES.SILVER"
      else if (player.position === 3) shipTypeKey = "SHIP_TYPES.BRONZE"
      else shipTypeKey = "SHIP_TYPES.REGULAR"

      $translate(shipTypeKey).then((translation) => {
        document.getElementById("sidebar-ship").textContent = translation
      })

      // Atualizar a foto do jogador
      document.getElementById("sidebar-photo").src = $scope.getPlayerImageUrl(player)
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

    // Inicialização
    function init() {
      console.log("Initializing Space Race...")

      // Initialize audio
      initAudio()

      // Check TV mode
      checkTVMode()

      // Force landscape on mobile
      forceLandscapeOnMobile()

      // Obter referência ao wrapper de scroll
      scrollWrapper = document.getElementById("scroll-wrapper")
      console.log("Scroll wrapper:", scrollWrapper)

      // Configurar scroll horizontal
      setupHorizontalScroll()

      // Fetch leaderboard data
      fetchLeaderboard()

      // Fetch leaderboard data every 10 seconds
      $interval(fetchLeaderboard, 10000)

      // Adicionar listener para redimensionamento da janela
      window.addEventListener("resize", handleWindowResize)
    }

    // Função para lidar com o redimensionamento da janela
    function handleWindowResize() {
      // Verificar orientação em dispositivos móveis
      checkOrientation()

      // Ajustar layout responsivo
      adjustResponsiveLayout()
    }

    // Função para ajustar o layout responsivo
    function adjustResponsiveLayout() {
      // Detectar tipo de dispositivo
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isTV = window.innerWidth >= 1920 && window.innerHeight >= 1080

      // Aplicar classes específicas para cada tipo de dispositivo
      document.body.classList.toggle("mobile-device", isMobile)
      document.body.classList.toggle("tv-device", isTV)

      // Ajustar tamanho das naves e informações com base no dispositivo
      const naves = document.querySelectorAll(".nave")
      naves.forEach((nave) => {
        if (isMobile) {
          nave.classList.add("mobile-size")
        } else if (isTV) {
          nave.classList.add("tv-size")
        } else {
          nave.classList.add("desktop-size")
        }
      })
    }

    // Adicionar esta função ao escopo para que possa ser chamada de qualquer lugar
    $scope.showPlayerSidebar = (player) => {
      updateSidebarForPlayer(player)

      // Mostrar a sidebar
      document.getElementById("player-sidebar").classList.add("active")
    }

    // Adicionar esta função ao escopo para que possa ser chamada de qualquer lugar
    $scope.hidePlayerSidebar = () => {
      document.getElementById("player-sidebar").classList.remove("active")

      // Remover classe selected de todas as naves
      document.querySelectorAll(".nave.selected").forEach((ship) => {
        ship.classList.remove("selected")
      })
    }

    // Initialize the app
    $timeout(init, 100)

    // Função auxiliar para obter o sufixo ordinal correto
    function getOrdinalSuffix(num) {
      if (num === 1) return "st"
      if (num === 2) return "nd"
      if (num === 3) return "rd"
      if (num >= 4 && num <= 20) return "th"

      const lastDigit = num % 10
      if (lastDigit === 1) return "st"
      if (lastDigit === 2) return "nd"
      if (lastDigit === 3) return "rd"
      return "th"
    }
  })