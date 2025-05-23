angular
  .module("BoatRaceApp", ["pascalprecht.translate"])
  .config([
    "$translateProvider",
    ($translateProvider) => {
      $translateProvider.translations("pt", {
        BOAT_RACE_TITLE: "Corrida de Barcos",
        PLAYER_BOAT: "Barco do Jogador",
        PLAYER_PHOTO: "Foto do Jogador",
        PLAYER_NAME: "Nome do Jogador",
        POINTS: "pts",
        SCORE: "Pontuação",
        YOUR_SCORE: "Sua Pontuação",
        CURRENT_LEVEL: "Nível Atual",
        BOAT: "Barco",
        AVATAR_EDITOR: "Editor de Avatar",
        CONNECTION_STATUS: { CONNECTED: "Conectado", CONNECTING: "Conectando...", DISCONNECTED: "Desconectado" },
        POSITIONS: { FIRST: "1º Lugar", SECOND: "2º Lugar", THIRD: "3º Lugar", FOURTH: "4º Lugar", OTHER: "Posição" },
        BOAT_TYPES: { GOLD: "Iate de Luxo", SILVER: "Veleiro Avançado", BRONZE: "Barco Padrão", REGULAR: "Barco Básico" },
      });
      $translateProvider.translations("en", {
        BOAT_RACE_TITLE: "Boat Race",
        PLAYER_BOAT: "Player Boat",
        PLAYER_PHOTO: "Player Photo",
        PLAYER_NAME: "Player Name",
        POINTS: "pts",
        SCORE: "Score",
        YOUR_SCORE: "Your Score",
        CURRENT_LEVEL: "Current Level",
        BOAT: "Boat",
        AVATAR_EDITOR: "Avatar Editor",
        CONNECTION_STATUS: { CONNECTED: "Connected", CONNECTING: "Connecting...", DISCONNECTED: "Disconnected" },
        POSITIONS: { FIRST: "1st Place", SECOND: "2nd Place", THIRD: "3rd Place", FOURTH: "4th Place", OTHER: "Position" },
        BOAT_TYPES: { GOLD: "Luxury Yacht", SILVER: "Advanced Sailboat", BRONZE: "Standard Boat", REGULAR: "Basic Boat" },
      });
      $translateProvider.preferredLanguage("pt");
      $translateProvider.useSanitizeValueStrategy("escape");
    },
  ])
  .controller("BoatRaceController", ($scope, $http, $timeout, $interval, $translate) => {
    $scope.players = [];
    $scope.previousPlayers = [];
    $scope.maxDistance = 0;
    $scope.baseSpacing = 120;
    $scope.progressiveSpacing = 20;
    $scope.connectionStatus = "connected";
    $scope.isTVMode = false;
    $scope.isFirstLoad = true;
    $scope.firstPlaceId = null;
    $scope.currentLang = "pt";
    $scope.isUpdating = false;
    $scope.userScore = 140;
    $scope.currentLevel = "Nível 1";

    let scrollWrapper = null;
    let lastScrollPosition = 0;
    let scrollRestorationAttempts = 0;
    const MAX_RESTORATION_ATTEMPTS = 5;

    let bellSound;
    let waveSound;

    function initAudio() {
      bellSound = new Audio("audio/bell.mp3");
      bellSound.volume = 0.7;
      waveSound = new Audio("audio/wave.mp3");
      waveSound.volume = 0.5;
    }

    $scope.changeLanguage = (langKey) => {
      $scope.currentLang = langKey;
      $translate.use(langKey);
      updateSidebarTranslations();
    };

    function updateSidebarTranslations() {
      const selectedBoat = document.querySelector(".boat.selected");
      if (selectedBoat) {
        const playerId = selectedBoat.getAttribute("data-player-id");
        const player = $scope.players.find((p) => (p.id || p.name) === playerId);
        if (player) updateSidebarForPlayer(player);
      }
    }

    function checkTVMode() {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("tv") && urlParams.get("tv") === "true") {
        $scope.isTVMode = true;
        document.body.classList.add("tv-mode");
      }
    }

    $scope.getPositionClass = (position) => {
      if (position === 1) return "pos-1";
      if (position === 2) return "pos-2";
      if (position === 3) return "pos-3";
      if (position === 4) return "pos-4";
      return "pos-other";
    };

    $scope.getPlayerImageUrl = (player) => {
      if (player && player.image && typeof player.image === "object" && player.image.small && player.image.small.url) {
        return player.image.small.url;
      }
      if (player && player.image && typeof player.image === "string") {
        return player.image;
      }
      return "img/default-player.png";
    };

    $scope.editAvatar = () => {
      alert("Funcionalidade de edição de avatar ainda não implementada. Use a imagem padrão por enquanto.");
    };

    function fetchLeaderboard() {
      $scope.isUpdating = true;
      if (scrollWrapper) lastScrollPosition = scrollWrapper.scrollLeft;
      $scope.connectionStatus = "connecting";

      const req = {
        method: "POST",
        url: "https://service2.funifier.com/v3/leaderboard/EVJsbyw/leader/aggregate?period=&live=true",
        headers: {
          Authorization: "Basic NjgyYTBlNmYyMzI3Zjc0ZjNhM2UwMDg5OjY4MmExMDI2MjMyN2Y3NGYzYTNlMDBjZg==",
          "Content-Type": "application/json",
        },
        data: [],
      };

      $http(req).then(
        (response) => {
          $scope.connectionStatus = "connected";
          processLeaderboardData(response.data);
        },
        (error) => {
          console.error("Error fetching ranking:", error);
          $scope.connectionStatus = "disconnected";
          $scope.isUpdating = false;
          if ($scope.players.length === 0) {
            $scope.players = generateDummyData(10);
            $scope.maxDistance = calculateMaxDistance($scope.players);
            initializeBoatPositions();
          }
          $timeout(fetchLeaderboard, 5000);
        }
      );
    }

    function processLeaderboardData(data) {
      if (!data || !Array.isArray(data)) {
        console.error("Invalid data format:", data);
        $scope.isUpdating = false;
        return;
      }

      $scope.previousPlayers = [...$scope.players];
      data.sort((a, b) => b.total - a.total);
      data.forEach((player, index) => {
        player.position = index + 1;
        player.id = player.id || player.player || player.name;
        player.lane = index % 2 === 0 ? 0 : 1;
      });

      const newFirstPlace = data.length > 0 ? data[0].id : null;
      if ($scope.firstPlaceId !== null && newFirstPlace !== $scope.firstPlaceId && !$scope.isFirstLoad) {
        bellSound.play().catch((e) => console.log("Could not play sound:", e));
      }
      $scope.firstPlaceId = newFirstPlace;
      $scope.players = data.reverse(); // Inverte para o primeiro estar à direita
      $scope.maxDistance = calculateMaxDistance($scope.players);

      const oceanSection = document.querySelector(".ocean-section");
      if (oceanSection) oceanSection.style.width = $scope.maxDistance + 500 + "px";

      if ($scope.isFirstLoad) {
        $scope.isFirstLoad = false;
        initializeBoatPositions(false);
      } else {
        animatePositionChanges();
      }

      setupBoatEventListeners();
      $timeout(() => {
        if (scrollWrapper && lastScrollPosition > 0) scrollWrapper.scrollLeft = lastScrollPosition;
        $scope.isUpdating = false;
      }, 100);
    }

    function animatePositionChanges() {
      if ($scope.previousPlayers.length === 0) return;

      const prevPositions = {};
      $scope.previousPlayers.forEach((player) => {
        prevPositions[player.id] = player.position;
      });

      const changedPlayers = $scope.players.filter((player) => {
        return prevPositions[player.id] !== undefined && prevPositions[player.id] !== player.position;
      });

      if (changedPlayers.length > 0) {
        waveSound.play().catch((e) => console.log("Could not play sound:", e));
        $timeout(() => {
          changedPlayers.forEach((player) => {
            const boatElement = document.querySelector(`.boat[data-player-id="${player.id}"]`);
            if (boatElement) {
              boatElement.classList.add(player.position < prevPositions[player.id] ? "position-improved" : "position-lost");
              $timeout(() => boatElement.classList.remove("position-improved", "position-lost"), 1000);
            }
          });
        }, 100);
      }

      initializeBoatPositions(true);
    }

    function calculateMaxDistance(players) {
      if (!players || players.length === 0) return 1200;
      let totalWidth = 600;
      for (let i = 0; i < players.length; i++) {
        totalWidth += $scope.baseSpacing + (players.length - i) * $scope.progressiveSpacing;
      }
      return Math.max(totalWidth, 1200);
    }

    function initializeBoatPositions(animate = true) {
      $timeout(() => {
        if ($scope.isFirstLoad && scrollWrapper) {
          const firstPlaceBoat = document.querySelector(`.boat[data-player-id="${$scope.firstPlaceId}"]`);
          if (firstPlaceBoat) {
            const rect = firstPlaceBoat.getBoundingClientRect();
            scrollWrapper.scrollLeft = Math.max(0, rect.right - window.innerWidth);
          }
        }
        if (animate) {
          document.querySelectorAll(".boat").forEach((boat) => boat.classList.add("animated"));
        }
      }, 100);
    }

    function generateDummyData(count) {
      const dummyPlayers = [];
      for (let i = 1; i <= count; i++) {
        dummyPlayers.push({
          name: `Player ${i}`,
          id: `player-${i}`,
          total: Math.floor(Math.random() * 1000) + 500,
          position: i,
          image: null,
          lane: i % 2 === 0 ? 0 : 1,
        });
      }
      dummyPlayers.sort((a, b) => b.total - a.total);
      dummyPlayers.forEach((player, index) => player.position = index + 1);
      return dummyPlayers.reverse();
    }

    $scope.getBoatStyle = (index, total) => {
      const player = $scope.players[index];
      const position = player.position;
      let distanceFromRight = 150;
      for (let i = 1; i < position; i++) {
        distanceFromRight += $scope.baseSpacing + i * $scope.progressiveSpacing;
      }
      const rowOffset = position % 2 === 0 ? 60 : 0;
      const zIndex = 100 - position;
      return {
        right: distanceFromRight + "px",
        top: `calc(50% + ${rowOffset}px)`,
        transform: "translateY(-50%)",
        zIndex: zIndex,
      };
    };

    $scope.getBoatImage = (position) => {
      const colors = ["red", "green", "yellow", "blue"];
      return `img/boat-${colors[(position - 1) % colors.length]}.png`;
    };

    function setupBoatEventListeners() {
      const oceanSection = document.querySelector(".ocean-section");
      if (oceanSection) {
        oceanSection.addEventListener("click", (event) => {
          const boatElement = event.target.closest(".boat");
          if (boatElement) {
            document.querySelectorAll(".boat.selected").forEach((boat) => boat.classList.remove("selected"));
            boatElement.classList.add("selected");
            const playerId = boatElement.getAttribute("data-player-id");
            const player = $scope.players.find((p) => (p.id || p.name) === playerId);
            if (player) {
              $scope.showPlayerSidebar(player);
              $scope.$apply();
            }
          }
        });
      }
      document.addEventListener("click", (event) => {
        if (!event.target.closest(".boat") && !event.target.closest(".player-sidebar")) {
          document.getElementById("player-sidebar").classList.remove("active");
          document.querySelectorAll(".boat.selected").forEach((boat) => boat.classList.remove("selected"));
          $scope.$apply();
        }
      });
    }

    $scope.showPlayerSidebar = (player) => {
      updateSidebarForPlayer(player);
      document.getElementById("player-sidebar").classList.add("active");
    };

    $scope.hidePlayerSidebar = () => {
      document.getElementById("player-sidebar").classList.remove("active");
      document.querySelectorAll(".boat.selected").forEach((boat) => boat.classList.remove("selected"));
    };

    function updateSidebarForPlayer(player) {
      document.getElementById("sidebar-name").textContent = player.name;
      document.getElementById("sidebar-position").textContent = $scope.currentLang === "pt" 
        ? player.position + "º Lugar" 
        : player.position + getOrdinalSuffix(player.position) + " Place";
      $translate("POINTS").then((translation) => {
        document.getElementById("sidebar-points").textContent = player.total + " " + translation;
      });
      const boatTypeKey = player.position === 1 ? "BOAT_TYPES.GOLD" : 
                         player.position === 2 ? "BOAT_TYPES.SILVER" : 
                         player.position === 3 ? "BOAT_TYPES.BRONZE" : "BOAT_TYPES.REGULAR";
      $translate(boatTypeKey).then((translation) => {
        document.getElementById("sidebar-boat").textContent = translation;
      });
      document.getElementById("sidebar-photo").src = $scope.getPlayerImageUrl(player);
    }

    function getOrdinalSuffix(num) {
      if (num === 1) return "st";
      if (num === 2) return "nd";
      if (num === 3) return "rd";
      return "th";
    }

    function init() {
      initAudio();
      checkTVMode();
      scrollWrapper = document.getElementById("scroll-wrapper");
      fetchLeaderboard();
      $interval(fetchLeaderboard, 30000);
    }

    $timeout(init, 100);
  });