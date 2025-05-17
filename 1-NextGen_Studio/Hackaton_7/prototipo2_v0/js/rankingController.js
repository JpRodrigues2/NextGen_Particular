angular.module("RankingApp", []).controller("RankingController", ($scope, $http, $timeout, $window) => {
  // API Configuration
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

  // Initialize variables
  $scope.players = []
  $scope.hoveredPlayer = null
  $scope.showTooltip = false
  $scope.maxDistance = 0
  $scope.baseSpacing = 120 // Base spacing between cars
  $scope.progressiveSpacing = 20 // Additional spacing for higher positions

  // Load data from API
  $http(req).then(
    (response) => {
      const data = response.data

      // Sort by total (highest to lowest)
      data.sort((a, b) => b.total - a.total)

      // Set position (rank)
      data.forEach((player, index) => {
        player.position = index + 1

        // Assign lane (row) for F1 grid layout
        player.lane = index % 2 === 0 ? 0 : 1 // Alternating top/bottom lanes

        // Assign car color based on position
        player.carColor = getCarColorByPosition(index + 1)
      })

      $scope.players = data

      // Calculate total track width based on number of players and spacing
      $scope.maxDistance = calculateMaxDistance(data)

      // Initialize car positions with animation
      initializeCarPositions()
    },
    (error) => {
      console.error("Error fetching ranking:", error)
      // Fallback data in case API fails
      $scope.players = generateDummyData(10)
      $scope.maxDistance = calculateMaxDistance($scope.players)
      initializeCarPositions()
    },
  )

  // Calculate total track width needed
  function calculateMaxDistance(players) {
    if (!players || players.length === 0) return 1200

    // Base width + progressive spacing for each player
    let totalWidth = 600 // Base width for finish line and margins

    // Add space for each player with progressive spacing
    for (let i = 0; i < players.length; i++) {
      totalWidth += $scope.baseSpacing + ($scope.players.length - i) * $scope.progressiveSpacing
    }

    // Ensure minimum width
    return Math.max(totalWidth, 1200)
  }

  // Initialize car positions with animation
  function initializeCarPositions() {
    $timeout(() => {
      // Force browser reflow to ensure animations work
      document.querySelector(".pista").offsetHeight

      // Add animation class to cars
      document.querySelectorAll(".carro").forEach((car) => {
        car.classList.add("animated")
      })
    }, 100)
  }

  // Generate dummy data for testing or API failure
  function generateDummyData(count) {
    const dummyPlayers = []
    const carColors = ["red", "blue", "green", "yellow"]

    for (let i = 1; i <= count; i++) {
      dummyPlayers.push({
        name: `Player ${i}`,
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
    }, 200)
  }

  // Register resize event listener
  angular.element($window).on("resize", handleResize)

  // Clean up listeners when controller is destroyed
  $scope.$on("$destroy", () => {
    angular.element($window).off("resize", handleResize)
  })
})
