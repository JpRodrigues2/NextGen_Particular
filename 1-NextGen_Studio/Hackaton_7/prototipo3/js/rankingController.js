angular.module("RankingApp", []).controller("RankingController", ($scope, $http, $timeout, $window, $interval) => {
  // Initialize variables
  $scope.players = []
  $scope.previousPlayers = [] // Store previous state to detect position changes
  $scope.hoveredPlayer = null
  $scope.showTooltip = false
  $scope.maxDistance = 0
  $scope.baseSpacing = 120 // Base spacing between cars
  $scope.progressiveSpacing = 20 // Additional spacing for higher positions
  $scope.connectionStatus = "connected" // Default status
  $scope.isTVMode = false // TV mode flag (no interaction)
  $scope.isFirstLoad = true // Flag for first load (no animations)
  $scope.firstPlaceId = null // Track first place player ID

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
      const isTV = confirm("Detectamos uma tela grande. Ativar modo TV (sem interação)?")
      if (isTV) {
        $scope.isTVMode = true
        document.body.classList.add("tv-mode")
      }
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
        const message = document.createElement("div")
        message.id = "orientation-message"
        message.innerHTML = `
          <div class="orientation-content">
            <div class="phone-icon">📱</div>
            <p>Por favor, gire seu dispositivo para visualizar melhor</p>
          </div>
        `
        document.body.appendChild(message)
      }
    } else {
      // Landscape mode
      if (orientationMessage) {
        orientationMessage.style.display = "none"
      }
    }
  }

  // Fetch leaderboard data
  function fetchLeaderboard() {
    $scope.connectionStatus = "connecting"

    const req = {
      method: "POST",
      url: "https://service2.funifier.com/v3/leaderboard/EVyQhTw/leader/aggregate?period=&live=true",
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzUxMiIsImNhbGciOiJHWklQIn0.H4sIAAAAAAAAAE2MywrCMBBFf0Wy7qJ5mIzuhYJLP0AmyQQKxYYkVYv47w4VxN3hcu55CczjmVZxFBaUlYBeaeWSM0mjjso7JzpRw5yJlUIYrzhN3e5RxkZfjDTRj7Ghx0r8wRDm5da2sEyWbPoL-xCDZWmpVNg4XdYh3GceRuSHdMYZue8BOkHPvA3QywMAvD8fkQagsQAAAA.DPmbZz38uxqUIK32MU38nE9jwGzaae3DgkKmsCWfiLEA-i37ngXkN6h3M9OcNlnFgtSthaHLSOfyFr63RDPmRw",
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

    // Initialize car positions with animation
    if ($scope.isFirstLoad) {
      // First load - no animations
      $scope.isFirstLoad = false
      initializeCarPositions(false)
    } else {
      // Subsequent loads - animate position changes
      animatePositionChanges()
    }
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

  // Get car image based on position and color
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

  // Handle window resize
  function handleResize() {
    $timeout(() => {
      // Recalculate layout on window resize
      $scope.maxDistance = calculateMaxDistance($scope.players)

      // Check if we should enter TV mode
      if (window.innerWidth >= 1920 && window.innerHeight >= 1080 && !$scope.isTVMode) {
        // Only suggest TV mode if not already in it and on a large screen
        if (confirm("Detectamos uma tela grande. Ativar modo TV (sem interação)?")) {
          $scope.isTVMode = true
          document.body.classList.add("tv-mode")
        }
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

  // Initialize the application
  function init() {
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

    // Register resize event listener
    angular.element($window).on("resize", handleResize)
  }

  // Start the application
  init()

  // Clean up listeners when controller is destroyed
  $scope.$on("$destroy", () => {
    angular.element($window).off("resize", handleResize)
    window.removeEventListener("orientationchange", checkOrientation)
    window.removeEventListener("resize", checkOrientation)
  })
})
