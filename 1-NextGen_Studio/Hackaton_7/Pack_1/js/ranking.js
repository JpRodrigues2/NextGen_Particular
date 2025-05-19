// Inicializa o aplicativo Angular
var app = angular.module("playerRankingApp", [])

// Controlador principal
app.controller("RankingController", [
  "$scope",
  "$http",
  ($scope, $http) => {
    // Configuração de idiomas
    $scope.translations = {
      pt: {
        rankingTitle: "RANKING DE JOGADORES",
        noRankingData: "Nenhum dado de ranking disponível",
        loading: "Carregando...",
        error: "Erro ao carregar o ranking",
        showMore: "Mostrar mais",
        place: "lugar",
      },
      en: {
        rankingTitle: "PLAYER RANKING",
        noRankingData: "No ranking data available",
        loading: "Loading...",
        error: "Error loading ranking",
        showMore: "Show more",
        place: "place", // Mantemos isso para compatibilidade, mas não será usado
      },
    }

    // Idioma padrão
    $scope.currentLang = "pt"

    // Número de jogadores a exibir inicialmente
    $scope.displayLimit = 3

    // Função para traduzir
    $scope.t = (key) => $scope.translations[$scope.currentLang][key]

    // Função para obter o sufixo ordinal correto em inglês
    $scope.getEnglishOrdinal = (position) => {
      if (position % 100 >= 11 && position % 100 <= 13) {
        return "th" // 11th, 12th, 13th
      }

      switch (position % 10) {
        case 1:
          return "st" // 1st, 21st, etc.
        case 2:
          return "nd" // 2nd, 22nd, etc.
        case 3:
          return "rd" // 3rd, 23rd, etc.
        default:
          return "th" // 4th, 5th, etc.
      }
    }

    // Função para formatar a posição com base no idioma atual
    $scope.formatPosition = (position) => {
      if ($scope.currentLang === "en") {
        return `${position}${$scope.getEnglishOrdinal(position)}`
      } else {
        return `${position}º`
      }
    }

    // Função para alternar idioma
    $scope.toggleLanguage = () => {
      $scope.currentLang = $scope.currentLang === "pt" ? "en" : "pt"
    }

    // Função para mostrar mais jogadores
    $scope.showMore = () => {
      $scope.displayLimit += 5
      if ($scope.displayLimit > $scope.rankingData.length) {
        $scope.displayLimit = $scope.rankingData.length
      }
    }

    // Dados do ranking
    $scope.rankingData = []

    // Função para carregar dados do ranking
    $scope.loadRanking = () => {
      // Reset do limite de exibição
      $scope.displayLimit = 3

      // URL da API para obter o ranking
      var req = {
        method: "POST",
        url: "https://service2.funifier.com/v3/leaderboard/EVJsbyw/leader/aggregate?period=&live=true",
        headers: {
          Authorization: "Basic NjgyYTBlNmYyMzI3Zjc0ZjNhM2UwMDg5OjY4MmExMDI2MjMyN2Y3NGYzYTNlMDBjZg==",
          "Content-Type": "application/json",
        },
        data: [],
      }

      $http(req).then(
        (response) => {
          // Dados reais da API - incluirá automaticamente novos jogadores
          $scope.rankingData = response.data
          console.log("Dados do ranking carregados:", $scope.rankingData)
        },
        (err) => {
          console.error("Erro ao buscar dados do ranking:", err)
          // Usar dados de exemplo em caso de erro
          $scope.loadExampleData()
        },
      )
    }

    // Função para carregar dados de exemplo (caso a API falhe)
    $scope.loadExampleData = () => {
      // Dados de exemplo baseados no retorno da API fornecido
      // Estes dados são usados APENAS se a API falhar
      $scope.rankingData = [
        {
          _id: "joao_EVKIAsN",
          total: 410,
          position: 1,
          move: "up",
          player: "joao",
          name: "João Pedro",
          image: "https://randomuser.me/api/portraits/men/32.jpg",
          extra: {
            cache: "EVKIAsN",
          },
          boardId: "EVJsbyw",
        },
        {
          _id: "lucas_EVKIAsN",
          total: 310,
          position: 2,
          move: "up",
          player: "lucas",
          name: "Lucas Justino",
          image: "https://randomuser.me/api/portraits/men/44.jpg",
          extra: {
            cache: "EVKIAsN",
          },
          boardId: "EVJsbyw",
        },
        {
          _id: "julia_EVKIAsN",
          total: 310,
          position: 3,
          move: "up",
          player: "julia",
          name: "Júlia dos Reis",
          image: "https://randomuser.me/api/portraits/women/68.jpg",
          extra: {
            cache: "EVKIAsN",
          },
          boardId: "EVJsbyw",
        },
        {
          _id: "arthur_EVKIAsN",
          total: 55,
          position: 4,
          move: "up",
          player: "arthur",
          name: "Arthur Leles",
          image: "https://randomuser.me/api/portraits/men/22.jpg",
          extra: {
            cache: "EVKIAsN",
          },
          boardId: "EVJsbyw",
        },
        {
          _id: "gabriel_EVKIAsN",
          total: 55,
          position: 5,
          move: "up",
          player: "gabriel",
          name: "Gabriel",
          image: "https://randomuser.me/api/portraits/men/55.jpg",
          extra: {
            cache: "EVKIAsN",
          },
          boardId: "EVJsbyw",
        },
      ]
    }

    // Carrega o ranking inicial
    $scope.loadRanking()
  },
])
