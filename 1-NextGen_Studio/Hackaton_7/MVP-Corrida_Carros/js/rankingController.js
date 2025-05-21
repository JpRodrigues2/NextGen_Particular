// Criar o módulo Angular com dependência do angular-translate
angular
  .module("RankingApp", ["pascalprecht.translate"])
  // Configurar o provedor de tradução
  .config([
    "$translateProvider",
    ($translateProvider) => {
      // Definir as traduções para português
      $translateProvider.translations("pt", {
        GRANDSTAND: "Arquibancada",
        PLAYER_CAR: "Carro do Jogador",
        PLAYER_PHOTO: "Foto do jogador",
        PLAYER_NAME: "Nome do Jogador",
        POINTS: "pts",
        SCORE: "Pontuação",
        CAR: "Carro",
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
        CAR_TYPES: {
          GOLD: "Ouro",
          SILVER: "Prata",
          BRONZE: "Bronze",
          REGULAR: "Regular",
        },
        TV_MODE_CONFIRM: "Detectamos uma tela grande. Ativar modo TV (sem interação)?",
        ORIENTATION_MESSAGE: "Por favor, gire seu dispositivo para visualizar melhor",
      })

      // Definir as traduções para inglês
      $translateProvider.translations("en", {
        GRANDSTAND: "Grandstand",
        PLAYER_CAR: "Player Car",
        PLAYER_PHOTO: "Player Photo",
        PLAYER_NAME: "Player Name",
        POINTS: "pts",
        SCORE: "Score",
        CAR: "Car",
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
        CAR_TYPES: {
          GOLD: "Gold",
          SILVER: "Silver",
          BRONZE: "Bronze",
          REGULAR: "Regular",
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
    $scope.baseSpacing = 120 // Base spacing between cars
    $scope.progressiveSpacing = 20 // Additional spacing for higher positions
    $scope.connectionStatus = "connected" // Default status
    $scope.isTVMode = false // TV mode flag (no interaction)
    $scope.isFirstLoad = true // Flag for first load (no animations)
    $scope.firstPlaceId = null // Track first place player ID
    $scope.currentLang = "pt" // Idioma atual

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
      const selectedCar = document.querySelector(".carro.selected")
      if (selectedCar) {
        const playerId = selectedCar.getAttribute("data-player-id")
        const player = $scope.players.find((p) => (p.id || p.name) === playerId)

        if (player) {
          // Atualizar textos traduzidos
          updateSidebarForPlayer(player)
        }
      }
    }

    // Audio elements
    let bellSound
    let engineSound

    // Initialize audio elements
    function initAudio() {
      // Bell sound for first place change
      bellSound = new Audio("audio/bell.mp3")
      bellSound.volume = 0.7

      // Engine sound for position changes
      engineSound = new Audio("audio/engine.mp3")
      engineSound.volume = 0.5
      engineSound.loop = false
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

    // Fetch leaderboard data
    function fetchLeaderboard() {
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

          // Fallback data in case API fails
          if ($scope.players.length === 0) {
            $scope.players = generateDummyData(10)
            $scope.maxDistance = calculateMaxDistance($scope.players)
            initializeCarPositions()
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

        // Assign car color based on position
        player.carColor = getCarColorByPosition(index + 1)
      })

      // Check for first place change
      const newFirstPlace = data.length > 0 ? data[0].id : null

      if ($scope.firstPlaceId !== null && newFirstPlace !== $scope.firstPlaceId) {
        // First place has changed, play bell sound
        if (bellSound && !$scope.isFirstLoad) {
          bellSound.play().catch((e) => console.log("Could not play sound:", e))
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

      // Initialize car positions with animation
      if ($scope.isFirstLoad) {
        // First load - no animations
        $scope.isFirstLoad = false
        initializeCarPositions(false)
      } else {
        // Subsequent loads - animate position changes
        animatePositionChanges()
      }

      // Após atualizar os players, reconfigurar os event listeners
      setupCarEventListeners()
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
        // Play engine sound for position changes
        if (engineSound) {
          engineSound.play().catch((e) => console.log("Could not play sound:", e))
        }

        // Add animation classes to changed players
        $timeout(() => {
          changedPlayers.forEach((player) => {
            const carElement = document.querySelector(`.carro[data-player-id="${player.id}"]`)
            if (carElement) {
              // Add animation class based on direction of change
              if (player.position < prevPositions[player.id]) {
                // Moved up in ranking
                carElement.classList.add("position-improved")
                $timeout(() => carElement.classList.remove("position-improved"), 1000)
              } else {
                // Moved down in ranking
                carElement.classList.add("position-lost")
                $timeout(() => carElement.classList.remove("position-lost"), 1000)
              }
            }
          })
        }, 100)
      }

      // Initialize car positions after checking changes
      initializeCarPositions(true)
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

    // Initialize car positions with animation
    function initializeCarPositions(animate = true) {
      $timeout(() => {
        // Force browser reflow to ensure animations work
        if (document.querySelector(".pista")) {
          document.querySelector(".pista").offsetHeight
        }

        // Add animation class to cars if animating
        if (animate) {
          document.querySelectorAll(".carro").forEach((car) => {
            car.classList.add("animated")
          })
        }
      }, 100)
    }

    // Generate dummy data for testing or API failure
    function generateDummyData(count) {
      const dummyPlayers = []
      const carColors = ["red", "blue", "green", "yellow"]

      for (let i = 1; i <= count; i++) {
        dummyPlayers.push({
          name: `Player ${i}`,
          id: `player-${i}`,
          total: Math.floor(Math.random() * 1000) + 500,
          position: i,
          image: null,
          lane: i % 2 === 0 ? 0 : 1, // Alternating top/bottom lanes
          carColor: carColors[i % carColors.length],
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

    // Get car color based on position
    function getCarColorByPosition(position) {
      // First 3 positions get special colors
      if (position === 1) return "gold"
      if (position === 2) return "silver"
      if (position === 3) return "bronze"

      // Other positions get rotating colors
      const colors = ["red", "blue", "green", "yellow"]
      return colors[(position - 1) % colors.length]
    }

    // Calculate car position in F1 grid style
    $scope.getCarStyle = (index, total) => {
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
        additionalSpacing = (4 - position) * 30; // 90px for 1st, 60px for 2nd, 30px for 3rd
      }

      // Add progressive spacing for each position
      for (let i = 1; i < position; i++) {
        // Add extra spacing for positions 1-3 when calculating distance
        let positionSpacing = baseSpacing + i * progressiveSpacing;
        
        // Add additional spacing for top positions
        if (i <= 3) {
          positionSpacing += (4 - i) * 30;
        }
        
        distanceFromRight += positionSpacing;
      }

      // Add the additional spacing for the current position
      distanceFromRight += additionalSpacing;

      // Calculate right position (from right edge)
      const rightPosition = distanceFromRight

      let rowOffset = 0

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

    $scope.getCarImage = (position) => {
      // Special cars for top 3 positions
      if (position === 1) return "img/carro-ouro.png"
      if (position === 2) return "img/carro-prata.png"
      if (position === 3) return "img/carro-bronze.png" 

      // For other positions, use color-based cars
      const colors = ["red", "blue", "green", "yellow"]
      const colorIndex = (position - 1) % colors.length
      return `img/carro${colorIndex + 1}.png`
    }

    function setupHorizontalScroll() {
    
    }

    function setupShipEventListeners() {
      
    }

    function shipClickHandler(event) {
      
    }

    function showPlayerSidebar(player) {
      // $scope.showPlayerSidebar(player)
    }

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

      $translate("POINTS").then((translation) => {
        document.getElementById("sidebar-points").textContent = player.total + " " + translation
      })

     

      document.getElementById("sidebar-photo").src = $scope.getPlayerImageUrl(player)
    }

    function addScrollEffect(direction) {
      
    }

   
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

    // Handle window resize
    function handleResize() {
      $timeout(() => {
        // Recalculate layout on window resize
        $scope.maxDistance = calculateMaxDistance($scope.players)

        // Check if we should enter TV mode
        if (window.innerWidth >= 1920 && window.innerHeight >= 1080 && !$scope.isTVMode) {
          // Only suggest TV mode if not already in it and on a large screen
          $translate("TV_MODE_CONFIRM").then((translation) => {
            if (confirm(translation)) {
              $scope.isTVMode = true
              document.body.classList.add("tv-mode")
            }
          })
        }

        // Check orientation on mobile
        checkOrientation()
      }, 200)
    }

    // Set up periodic refresh
    function setupPeriodicRefresh() {
      // Refresh data every 30 seconds
      $interval(() => {
        fetchLeaderboard()
      }, 30000)
    }

    // Adicionar função para mostrar a aba lateral com informações do jogador
    $scope.showPlayerSidebar = (player) => {
      updateSidebarForPlayer(player)

      // Mostrar a sidebar
      document.getElementById("player-sidebar").classList.add("active")
    }

    // Adicionar função para esconder a aba lateral
    $scope.hidePlayerSidebar = () => {
      document.getElementById("player-sidebar").classList.remove("active")
    }

    // Função para configurar os event listeners dos carros
    function setupCarEventListeners() {
      $timeout(() => {
        // Usar delegação de eventos para lidar com elementos dinâmicos
        document.querySelector(".pista").addEventListener("click", (event) => {
          // Verificar se o clique foi em um carro ou em um elemento filho do carro
          const carElement = event.target.closest(".carro")
          if (carElement) {
            // Remover classe selected de todos os carros
            document.querySelectorAll(".carro.selected").forEach((car) => {
              car.classList.remove("selected")
            })

            // Adicionar classe selected ao carro clicado
            carElement.classList.add("selected")

            // Obter o ID do jogador
            const playerId = carElement.getAttribute("data-player-id")

            // Encontrar o jogador correspondente
            const player = $scope.players.find((p) => (p.id || p.name) === playerId)

            if (player) {
              // Mostrar a sidebar com as informações do jogador
              $scope.showPlayerSidebar(player)
              $scope.$apply() // Atualizar a UI
            }
          }
        })

        // Fechar a sidebar quando clicar fora dos carros
        document.addEventListener("click", (event) => {
          if (!event.target.closest(".carro") && !event.target.closest(".player-sidebar")) {
            $scope.hidePlayerSidebar()
            $scope.$apply()
          }
        })
      }, 500)
    }

    // Adicionar função para habilitar o scroll horizontal com a roda do mouse
    function enableHorizontalMouseScroll() {
      const pistaScroll = document.querySelector(".pista-scroll")

      if (pistaScroll) {
        pistaScroll.addEventListener(
          "wheel",
          (event) => {
            // Prevenir o comportamento padrão de scroll vertical
            event.preventDefault()

            // Determinar a quantidade de scroll (multiplicar por um fator para ajustar a velocidade)
            const scrollFactor = 2.5
            const scrollAmount = event.deltaY * scrollFactor

            // Aplicar o scroll horizontal
            pistaScroll.scrollLeft += scrollAmount
          },
          { passive: false },
        )

        console.log("Horizontal mouse scroll enabled")
      }
    }

    // Initialize the application
    function initialize() {
      // Initialize audio elements
      initAudio()

      // Check if we're in TV mode
      checkTVMode()

      // Force landscape on mobile
      forceLandscapeOnMobile()

      // Fetch initial data
      fetchLeaderboard()

      // Set up periodic refresh
      setupPeriodicRefresh()

      // Adicionar event listeners para os carros
      setupCarEventListeners()

      // Habilitar scroll horizontal com o mouse
      enableHorizontalMouseScroll()

      // Register resize event listener
      angular.element($window).on("resize", handleResize)
    }

    // Start the application
    initialize()

    // Clean up listeners when controller is destroyed
    $scope.$on("$destroy", () => {
      angular.element($window).off("resize", handleResize)
      window.removeEventListener("orientationchange", checkOrientation)
      window.removeEventListener("resize", checkOrientation)
    })

    // Função auxiliar para obter o sufixo ordinal correto em inglês
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