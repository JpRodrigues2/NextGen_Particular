// Inicializa o aplicativo Angular
var app = angular.module("challengesApp", [])

// Controlador principal
app.controller("ChallengesController", [
  "$scope",
  "$http",
  ($scope, $http) => {
    // Configuração de idiomas para a interface
    $scope.translations = {
      pt: {
        challengesTitle: "DESAFIOS",
        noChallengesData: "Nenhum desafio disponível",
        loading: "Carregando...",
        error: "Erro ao carregar os desafios",
        xp: "XP",
        moedas: "Moedas",
      },
      en: {
        challengesTitle: "CHALLENGES",
        noChallengesData: "No challenges available",
        loading: "Loading...",
        error: "Error loading challenges",
        xp: "XP",
        moedas: "Coins",
      },
    }

    // Mapeamento direto entre descrições em português e inglês
    $scope.descriptionTranslations = {
      "Ao completar a primeira venda de um produto, o jogador conquista este desafio.":
        "By completing the first sale of a product, the player completes this challenge.",
      "Faça vendas e acumule pontos!": "Make sales and accumulate points!",
      "Complete este desafio fazendo uma venda no valor acima de R$100":
        "Complete this challenge by making a sale worth over R$100",
      "Complete este desafio fazendo uma venda no valor acima de R$1000":
        "Complete this challenge by making a sale worth over R$1000",
      "Complete este desafio fazendo uma venda no valor acima de R$500":
        "Complete this challenge by making a sale worth over R$500",
      "Preencher um formulário por completo": "Complete a form in full",
      "Suba no nível de pontuação": "Level up in the scoring system",
      "Finalize uma venda": "Complete a sale",
    }

    // Idioma padrão
    $scope.currentLang = "pt"

    // Função para traduzir elementos da interface
    $scope.t = (key) => $scope.translations[$scope.currentLang][key]

    // Função para alternar idioma
    $scope.toggleLanguage = () => {
      $scope.currentLang = $scope.currentLang === "pt" ? "en" : "pt"
    }

    // Função para obter o nome traduzido do tipo de pontuação
    $scope.getPointTypeName = (category) => $scope.t(category)

    // Função para traduzir a descrição do desafio
    $scope.getTranslatedDescription = (challenge) => {
      var originalDescription = challenge.description

      // Se o idioma for português, retorna a descrição original
      if ($scope.currentLang === "pt") {
        return originalDescription
      }

      // Se o idioma for inglês, busca a tradução no mapeamento
      if ($scope.currentLang === "en" && $scope.descriptionTranslations[originalDescription]) {
        return $scope.descriptionTranslations[originalDescription]
      }

      // Se não encontrar tradução, retorna a descrição original
      return originalDescription
    }

    // Função para obter o ícone do desafio
    $scope.getChallengeIcon = (challenge) => {
      // Aqui você pode implementar uma lógica para retornar ícones diferentes
      // com base no título ou descrição do desafio
      if (challenge.challenge.toLowerCase().includes("venda")) {
        return "https://cdn-icons-png.flaticon.com/512/2331/2331966.png"
      } else if (challenge.challenge.toLowerCase().includes("nível")) {
        return "https://cdn-icons-png.flaticon.com/512/1603/1603847.png"
      } else if (challenge.challenge.toLowerCase().includes("formulário")) {
        return "https://cdn-icons-png.flaticon.com/512/3135/3135692.png"
      } else {
        return "https://cdn-icons-png.flaticon.com/512/3176/3176366.png"
      }
    }

    // Dados dos desafios
    $scope.challengesData = []

    // Função para carregar dados dos desafios
    $scope.loadChallenges = () => {
      // URL da API para obter os desafios
      var req = {
        method: "GET",
        url: "https://service2.funifier.com/v3/challenge",
        headers: {
          Authorization: "Basic NjgyYTBlNmYyMzI3Zjc0ZjNhM2UwMDg5OjY4MmExMDI2MjMyN2Y3NGYzYTNlMDBjZg==",
          "Content-Type": "application/json",
        },
      }

      $http(req).then(
        (response) => {
          $scope.challengesData = response.data
          console.log("Dados dos desafios carregados:", $scope.challengesData)
        },
        (err) => {
          console.error("Erro ao buscar dados dos desafios:", err)
          // Usar dados de exemplo em caso de erro
          $scope.loadExampleData()
        },
      )
    }

    // Função para carregar dados de exemplo (caso a API falhe)
    $scope.loadExampleData = () => {
      // Dados de exemplo baseados no retorno da API fornecido
      $scope.challengesData = [
        {
          challenge: "Primeira venda",
          description: "Ao completar a primeira venda de um produto, o jogador conquista este desafio.",
          range: 0,
          active: true,
          rules: [
            {
              actionId: "vender",
              position: 0,
              operator: 5,
              timeAmount: 0,
              timeScale: 0,
              outOfTime: false,
              everyAmount: 0,
              everyScale: 0,
              total: 1,
            },
          ],
          teamChallenge: false,
          limitTotal: 0,
          limitPerType: 0,
          limitTimeAmount: 0,
          limitTimeScale: 0,
          techniques: ["GT35"],
          hideUntilEarned: false,
          points: [
            {
              total: 30,
              category: "xp",
              operation: 0,
              perPlayer: false,
            },
            {
              total: 5,
              category: "moedas",
              operation: 0,
              perPlayer: false,
            },
          ],
          notifications: [
            {
              event: 0,
              type: 0,
              scope: 1,
              content: "{{player.name}} complete {{item.name}}",
            },
          ],
          extra: {},
          rewards: [],
          i18n: {},
          created: 1747587867743,
          updated: 1747587989506,
          _id: "EVJxK8N",
        },
        {
          challenge: "Preencher um formulário",
          description: "Preencher um formulário por completo",
          range: 0,
          active: true,
          points: [
            {
              total: 20,
              category: "xp",
              operation: 0,
              perPlayer: false,
            },
            {
              total: 3,
              category: "moedas",
              operation: 0,
              perPlayer: false,
            },
          ],
          _id: "EVJxS5H",
        },
        {
          challenge: "Suba de nível",
          description: "Suba no nível de pontuação",
          range: 0,
          active: true,
          points: [
            {
              total: 50,
              category: "xp",
              operation: 0,
              perPlayer: false,
            },
            {
              total: 10,
              category: "moedas",
              operation: 0,
              perPlayer: false,
            },
          ],
          _id: "EVJyuXj",
        },
        {
          challenge: "Venda de R$100",
          description: "Complete este desafio fazendo uma venda no valor acima de R$100",
          range: 0,
          active: true,
          points: [
            {
              total: 15,
              category: "xp",
              operation: 0,
              perPlayer: false,
            },
            {
              total: 2,
              category: "moedas",
              operation: 0,
              perPlayer: false,
            },
          ],
          _id: "EVJyFFw",
        },
        {
          challenge: "Venda de R$500",
          description: "Complete este desafio fazendo uma venda no valor acima de R$500",
          range: 0,
          active: true,
          points: [
            {
              total: 25,
              category: "xp",
              operation: 0,
              perPlayer: false,
            },
            {
              total: 5,
              category: "moedas",
              operation: 0,
              perPlayer: false,
            },
          ],
          _id: "EVJycLg",
        },
      ]
    }

    // Carrega os desafios iniciais
    $scope.loadChallenges()
  },
])
