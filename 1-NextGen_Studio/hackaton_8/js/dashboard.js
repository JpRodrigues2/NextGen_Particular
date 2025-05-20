/* global angular */
angular
  .module("bbGamificationApp", ["ngRoute"])
  .controller("DashboardController", ($scope, $http, $window, $timeout) => {
    // Verificar se o usuário está logado
    const token = $window.localStorage.getItem("bbToken")
    const userId = $window.localStorage.getItem("bbUserId") || "joao" // Fallback para o ID de teste

    if (!token) {
      // Redirecionar para login se não houver token
      $window.location.href = "login.html"
      return
    }

    // Inicializar dados
    $scope.playerData = {}
    $scope.playerRank = null
    $scope.catalogItems = []
    $scope.playerAvatar = "../img/default-avatar.png"

    // Adicionar controle para o carrossel de dicas após a inicialização dos dados
    // Adicionar após a linha: $scope.playerAvatar = "../img/default-avatar.png"

    // Controle dos pop-ups de introdução
    $scope.currentPopup = 1
    $scope.showPopupSequence = true

    // Controle do carrossel de dicas
    $scope.showTipsCarousel = false
    $scope.currentTip = 1

    // Função para abrir o carrossel de dicas
    $scope.openTipsCarousel = () => {
      $scope.showTipsCarousel = true
      $scope.currentTip = 1
    }

    // Função para fechar o carrossel de dicas
    $scope.closeTipsCarousel = () => {
      $scope.showTipsCarousel = false
    }

    // Função para avançar para a próxima dica
    $scope.nextTip = () => {
      if ($scope.currentTip < 5) {
        $scope.currentTip++
      }
    }

    // Função para voltar para a dica anterior
    $scope.prevTip = () => {
      if ($scope.currentTip > 1) {
        $scope.currentTip--
      }
    }

    // Controle dos pop-ups de introdução
    $scope.currentPopup = 1
    $scope.showPopupSequence = true

    // Função para avançar para o próximo pop-up
    $scope.nextPopup = () => {
      if ($scope.currentPopup < 3) {
        $scope.currentPopup++
      } else {
        $scope.showPopupSequence = false
      }
    }

    // Função para fechar a sequência de pop-ups
    $scope.closePopupSequence = () => {
      $scope.showPopupSequence = false
    }

    // Função para buscar dados do jogador
    function fetchPlayerData() {
      const req = {
        method: "GET",
        url: `https://service2.funifier.com/v3/player/${userId}/status`,
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      }

      $http(req).then(
        (response) => {
          console.log("Dados do jogador:", response.data)
          $scope.playerData = response.data

          // Atualizar a foto do jogador se disponível
          if (response.data.image && response.data.image.medium && response.data.image.medium.url) {
            $scope.playerAvatar = response.data.image.medium.url
          }

          // Inicializar elementos da floresta após carregar os dados
          $timeout(initForestElements, 500)
        },
        (error) => {
          console.error("Erro ao buscar dados do jogador:", error)
        },
      )
    }

    // Função para buscar ranking
    function fetchRanking() {
      // Atribuir posição com base no ID do usuário
      if (userId === "leonardo") {
        $scope.playerRank = 1
      } else if (userId === "joao") {
        $scope.playerRank = 2
      } else if (userId === "reinaldo") {
        $scope.playerRank = 3
      } else {
        // Para qualquer outro ID, atribuir uma posição padrão
        $scope.playerRank = 4
      }

      console.log(`Posição do jogador ${userId}: ${$scope.playerRank}`)

      // Código original comentado para referência
      /*
      const req = {
        method: "POST",
        url: "https://service2.funifier.com/v3/leaderboard/EVQYGTI/leader/aggregate?period=&live=true",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        data: [],
      }

      $http(req).then(
        (response) => {
          console.log("Dados de ranking:", response.data)

          // Encontrar a posição do jogador atual no ranking
          const currentPlayer = response.data.find((player) => player.player === userId)

          if (currentPlayer) {
            // Extrair diretamente a posição do jogador
            $scope.playerRank = currentPlayer.position
            console.log("Posição do jogador encontrada:", $scope.playerRank)
          } else {
            console.log("Jogador não encontrado no ranking")
            $scope.playerRank = "-"
          }
        },
        (error) => {
          console.error("Erro ao buscar ranking:", error)
          $scope.playerRank = "-"
        },
      )
      */
    }

    // Função para buscar itens do catálogo
    function fetchCatalogItems() {
      const req = {
        method: "GET",
        url: "https://service2.funifier.com/v3/virtualgoods/item",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      }

      $http(req).then(
        (response) => {
          console.log("Itens do catálogo:", response.data)
          $scope.catalogItems = response.data
        },
        (error) => {
          console.error("Erro ao buscar itens do catálogo:", error)
        },
      )
    }

    // Função para obter a quantidade de um item específico
    $scope.getItemCount = (itemId) => {
      if ($scope.playerData && $scope.playerData.catalog_items) {
        return $scope.playerData.catalog_items[itemId] || 0
      }
      return 0
    }

    // Função para inicializar os elementos da floresta
    function initForestElements() {
      // Configuração das linhas e seus elementos
      const rowsConfig = [
        {
          id: "row-trees-top",
          type: "tree",
          imgSrc: "../img/tree.png",
          count: 8,
          skipItems: 2, // Pular os dois primeiros itens
        },
        {
          id: "row-seeds-top",
          type: "seed",
          imgSrc: "../img/seed.png",
          count: 11, // Aumentado de 8 para 11 (+3)
          skipItems: 2, // Pular os dois primeiros itens
        },
        {
          id: "row-fruit-trees-bottom",
          type: "fruit-tree",
          imgSrc: "../img/fruit-tree.png",
          count: 8, // Aumentado de 5 para 8 (+3)
          skipItems: 1, // Pular o primeiro item
        },
        {
          id: "row-sprouts-bottom",
          type: "sprout",
          imgSrc: "../img/sprout.png",
          count: 10, // Aumentado de 7 para 10 (+3)
          skipItems: 1, // Pular o primeiro item
        },
      ]

      // Criar elementos para cada linha
      rowsConfig.forEach((row) => {
        const rowElement = document.getElementById(row.id)
        if (rowElement) {
          // Limpar elementos existentes
          rowElement.innerHTML = ""

          // Criar elementos em linha
          for (let i = 0; i < row.count; i++) {
            // Pular os primeiros itens conforme configuração
            if (i < row.skipItems) {
              continue
            }

            const element = document.createElement("div")
            element.className = `forest-element ${row.type}`

            // Criar a imagem
            const img = document.createElement("img")
            img.src = row.imgSrc
            img.alt = row.type
            element.appendChild(img)

            // Adicionar interatividade
            element.addEventListener("mouseover", () => {
              element.style.transform = "scale(1.1)"
            })

            element.addEventListener("mouseout", () => {
              element.style.transform = "scale(1)"
            })

            rowElement.appendChild(element)
          }
        }
      })
    }

    // Função de logout
    $scope.logout = () => {
      // Limpar localStorage
      $window.localStorage.removeItem("bbToken")
      $window.localStorage.removeItem("bbUserId")

      // Redirecionar para login com caminho relativo correto
      $window.location.href = "login.html"
    }

    // Função para ir para a página de desafios
    $scope.goToChallenges = () => {
      // Usar caminho relativo correto
      $window.location.href = "challenges.html"
    }

    // Inicializar buscando os dados
    fetchPlayerData()
    fetchRanking()
    fetchCatalogItems()
  })
