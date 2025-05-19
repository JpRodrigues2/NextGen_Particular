// Inicializa o aplicativo Angular
var app = angular.module("playerDashboard", [])

// Controlador principal
app.controller("PlayerStatusController", [
  "$scope",
  "$http",
  ($scope, $http) => {
    // Configuração de idiomas
    $scope.translations = {
      pt: {
        playerStatus: "STATUS DO JOGADOR",
        totalPoints: "PONTUAÇÃO TOTAL",
        level: "NÍVEL",
        coins: "MOEDAS",
        levelProgress: "Progresso de nível",
        nextLevel: "Nível",
      },
      en: {
        playerStatus: "PLAYER STATUS",
        totalPoints: "TOTAL POINTS",
        level: "LEVEL",
        coins: "COINS",
        levelProgress: "Level Progress",
        nextLevel: "Level",
      },
    }

    // Idioma padrão
    $scope.currentLang = "pt"

    // Player ID padrão (baseado no exemplo de retorno da API)
    $scope.playerId = "joao"

    // Função para traduzir
    $scope.t = (key) => $scope.translations[$scope.currentLang][key]

    // Função para alternar idioma
    $scope.toggleLanguage = () => {
      $scope.currentLang = $scope.currentLang === "pt" ? "en" : "pt"
    }

    // Função para obter a posição do nível atual
    $scope.getLevelPosition = () => {
      if (!$scope.playerData) return 1
      return $scope.playerData.level_progress && $scope.playerData.level_progress.level
        ? $scope.playerData.level_progress.level.position + 1
        : 1
    }

    // Função para obter a posição do próximo nível
    $scope.getNextLevelPosition = () => {
      if (!$scope.playerData) return 2
      return $scope.playerData.level_progress && $scope.playerData.level_progress.next_level
        ? $scope.playerData.level_progress.next_level.position + 1
        : 2
    }

    // Função para obter a porcentagem de progresso
    $scope.getProgressPercent = () => {
      if (!$scope.playerData || !$scope.playerData.level_progress) return 0
      return $scope.playerData.level_progress.percent || 0
    }

    // Função para carregar o jogador com o ID informado
    $scope.loadPlayer = () => {
      if (!$scope.playerId) {
        alert("Por favor, informe um ID de jogador")
        return
      }
      $scope.fetchPlayerData($scope.playerId)
    }

    // Função para buscar dados do jogador
    $scope.fetchPlayerData = (playerId) => {
      var req = {
        method: "GET",
        url: "https://service2.funifier.com/v3/player/" + playerId + "/status",
        headers: {
          Authorization: "Basic NjgyYTBlNmYyMzI3Zjc0ZjNhM2UwMDg5OjY4MmExMDI2MjMyN2Y3NGYzYTNlMDBjZg==",
          "Content-Type": "application/json",
        },
      }

      $http(req).then(
        (response) => {
          $scope.playerData = response.data
          console.log("Dados do jogador carregados:", $scope.playerData)
        },
        (err) => {
          console.error("Erro ao buscar dados do jogador:", err)
          alert("Erro ao carregar dados do jogador. Verifique o console para mais detalhes.")
        },
      )
    }

    // Adicionar função para obter a quantidade de moedas
    $scope.getCoins = () => {
      if (!$scope.playerData || !$scope.playerData.point_categories) return 0
      return $scope.playerData.point_categories.moedas || 0
    }

    // Adicionar função para obter o nome do nível atual
    $scope.getLevelName = () => {
      if (!$scope.playerData || !$scope.playerData.level) return ""
      return $scope.playerData.level.level || ""
    }

    // Inicializa o widget com o ID de jogador padrão
    $scope.fetchPlayerData($scope.playerId)
  },
])
