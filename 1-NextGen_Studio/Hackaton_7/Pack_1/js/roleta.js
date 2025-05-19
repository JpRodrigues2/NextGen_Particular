// Inicializa o aplicativo Angular
var app = angular.module("roletaApp", [])

// Controlador principal
app.controller("RoletaController", [
  "$scope",
  "$http",
  "$timeout",
  ($scope, $http, $timeout) => {
    // Configuração de idiomas
    $scope.translations = {
      pt: {
        roletaTitle: "ROLETA DA SORTE",
        premiosTitle: "PRÊMIOS",
        moedas: "MOEDAS",
        girar: "GIRAR",
        superGirar: "SUPER GIRO",
        carregando: "Carregando...",
        erro: "Erro ao carregar a roleta",
        semSaldo: "Saldo insuficiente! Você precisa de 20 moedas para girar a roleta.",
        parabens: "PARABÉNS!",
        voceGanhou: "Você ganhou:",
        tentarNovamente: "TENTE NOVAMENTE",
        naoFoi: "NÃO FOI DESSA VEZ!",
        tenteNovamente: "Tente novamente mais tarde.",
        fechar: "FECHAR",
        carregar: "Carregar",
        premioEntregue: "Prêmio entregue com sucesso!",
        erroEntrega: "Erro ao entregar o prêmio. Tente novamente.",
      },
      en: {
        roletaTitle: "WHEEL OF FORTUNE",
        premiosTitle: "PRIZES",
        moedas: "COINS",
        girar: "SPIN",
        superGirar: "SUPER SPIN",
        carregando: "Loading...",
        erro: "Error loading the wheel",
        semSaldo: "Insufficient balance! You need 20 coins to spin the wheel.",
        parabens: "CONGRATULATIONS!",
        voceGanhou: "You won:",
        tentarNovamente: "TRY AGAIN",
        naoFoi: "NOT THIS TIME!",
        tenteNovamente: "Try again later.",
        fechar: "CLOSE",
        carregar: "Load",
        premioEntregue: "Prize delivered successfully!",
        erroEntrega: "Error delivering the prize. Please try again.",
      },
    }

    // Idioma padrão
    $scope.currentLang = "pt"

    // Player ID padrão
    $scope.playerId = "joao"

    // Função para traduzir
    $scope.t = (key) => $scope.translations[$scope.currentLang][key]

    // Função para alternar idioma
    $scope.toggleLanguage = () => {
      $scope.currentLang = $scope.currentLang === "pt" ? "en" : "pt"
    }

    // Estado da roleta
    $scope.isSpinning = false
    $scope.showResultado = false
    $scope.errorMessage = null
    $scope.resultadoTitle = ""
    $scope.resultadoDescription = ""
    $scope.resultadoImage = ""
    $scope.mysteryBoxId = "682a16a02327f74f3a3e01e5" // ID da Mystery Box

    // Dados da roleta
    $scope.roletaData = {
      title: "",
      options: [],
    }

    // Função para obter uma imagem padrão para opções sem imagem
    $scope.getDefaultImage = (option) => {
      if (option.title.toLowerCase().includes("moeda")) {
        return "https://cdn-icons-png.flaticon.com/512/217/217853.png"
      } else if (option.title.toLowerCase().includes("não foi")) {
        return "https://cdn-icons-png.flaticon.com/512/6134/6134090.png"
      } else if (option.title.toLowerCase().includes("drone")) {
        return "https://cdn-icons-png.flaticon.com/512/3576/3576923.png"
      } else if (option.title.toLowerCase().includes("celular")) {
        return "https://cdn-icons-png.flaticon.com/512/545/545245.png"
      } else if (option.title.toLowerCase().includes("amazon")) {
        return "https://cdn-icons-png.flaticon.com/512/5968/5968217.png"
      } else {
        return "https://cdn-icons-png.flaticon.com/512/4213/4213958.png"
      }
    }

    // Função para encurtar o título para exibição na roleta
    $scope.getShortTitle = (title) => {
      if (title.length > 15) {
        return title.substring(0, 12) + "..."
      }
      return title
    }

    // Função para calcular o estilo de cada item da roleta
    $scope.getItemStyle = (index, total) => {
      const angle = 360 / total
      const rotation = index * angle
      const backgroundColor = $scope.getItemColor(index)

      return {
        transform: `rotate(${rotation}deg)`,
        backgroundColor: backgroundColor,
      }
    }

    // Função para obter a cor de cada item
    $scope.getItemColor = (index) => {
      const colors = [
        "#f8c8a0", // Laranja claro
        "#ffeaaa", // Amarelo claro
        "#e8f4f0", // Verde claro
        "#f8b37f", // Laranja
        "#a8d3c8", // Verde água
        "#e74c3c", // Vermelho
        "#f1c40f", // Amarelo
        "#3498db", // Azul
      ]
      return colors[index % colors.length]
    }

    // Função para carregar dados da roleta
    $scope.loadRoleta = () => {
      var req = {
        method: "GET",
        url: "https://service2.funifier.com/v3/mystery",
        headers: {
          Authorization: "Basic NjgyYTBlNmYyMzI3Zjc0ZjNhM2UwMDg5OjY4MmExMDI2MjMyN2Y3NGYzYTNlMDBjZg==",
          "Content-Type": "application/json",
        },
      }

      $http(req).then(
        (response) => {
          if (response.data && response.data.length > 0) {
            $scope.roletaData = response.data[0]
            $scope.mysteryBoxId = $scope.roletaData._id || "682a16a02327f74f3a3e01e5"
            console.log("Dados da roleta carregados:", $scope.roletaData)
          } else {
            $scope.errorMessage = $scope.t("erro")
            console.error("Nenhum dado de roleta encontrado")
            // Usar dados de exemplo em caso de erro
            $scope.loadExampleData()
          }
        },
        (err) => {
          $scope.errorMessage = $scope.t("erro")
          console.error("Erro ao buscar dados da roleta:", err)
          // Usar dados de exemplo em caso de erro
          $scope.loadExampleData()
        },
      )
    }

    // Função para carregar dados de exemplo (caso a API falhe)
    $scope.loadExampleData = () => {
      $scope.roletaData = {
        title: "Roleta de itens",
        options: [
          {
            image: "https://s3.amazonaws.com/funifier_node/540f14d70ffeeb8c2fe11767/f53244112871ad5873b5.",
            title: "parte 1/2 do drone",
            value: "1_drone",
            probability: 0.06,
          },
          {
            image: "https://s3.amazonaws.com/funifier_node/540f14d70ffeeb8c2fe11767/b51f90f071cb42c8a82f.",
            title: "parte 2/2 do drone",
            value: "2_drone",
            probability: 0.06,
          },
          {
            image: "https://s3.amazonaws.com/funifier_node/540f14d70ffeeb8c2fe11767/22fd8ee361f055734d21.",
            title: "20 Moedas",
            value: "20_moedas",
            probability: 0.15,
          },
          {
            image: "https://s3.amazonaws.com/funifier_node/540f14d70ffeeb8c2fe11767/671d0c16811c0d6b56c1.",
            title: "10 Moedas",
            value: "10_moedas",
            probability: 0.25,
          },
          {
            image: "https://s3.amazonaws.com/funifier_node/540f14d70ffeeb8c2fe11767/e5ca282bb6236cb462f8.",
            title: "Gift card Amazon",
            value: "gift_amazon",
            probability: 0.15,
          },
          {
            image: "https://s3.amazonaws.com/funifier_node/540f14d70ffeeb8c2fe11767/4c35716e254d8cb967f5.",
            title: "parte 1/3 Desconto Celular",
            value: "1_celular",
            probability: 0.02,
          },
          {
            title: "parte 2/3 Desconto Celular",
            value: "2_celular",
            probability: 0.02,
          },
          {
            image: "https://s3.amazonaws.com/funifier_node/540f14d70ffeeb8c2fe11767/bb6c41441cc35c362c70.",
            title: "parte 3/3 Desconto Celular",
            value: "3_celular",
            probability: 0.02,
          },
          {
            image: "https://s3.amazonaws.com/funifier_node/540f14d70ffeeb8c2fe11767/46a532f4a045b8af5e4e.",
            title: "Não foi dessa vez!",
            value: "perdeu",
            probability: 0.27,
          },
        ],
      }
    }

    // Função para carregar o jogador
    $scope.loadPlayer = () => {
      if (!$scope.playerId) {
        alert("Por favor, informe um ID de jogador")
        return
      }
      // Recarregar a roleta após definir o jogador
      $scope.loadRoleta()
    }

    // Função para girar a roleta
    $scope.girarRoleta = () => {
      if ($scope.isSpinning) return

      $scope.isSpinning = true
      $scope.errorMessage = null

      // Executar a roleta na API
      var req = {
        method: "GET",
        url: `https://service2.funifier.com/v3/mystery/execute/${$scope.mysteryBoxId}?player=${$scope.playerId}`,
        headers: {
          Authorization: "Basic NjgyYTBlNmYyMzI3Zjc0ZjNhM2UwMDg5OjY4MmExMDI2MjMyN2Y3NGYzYTNlMDBjZg==",
          "Content-Type": "application/json",
        },
      }

      // Fazer a requisição à API
      $http(req).then(
        (response) => {
          console.log("Resultado da roleta:", response.data)

          // Animação da roleta
          const wheel = document.getElementById("roleta-outer")
          const optionsCount = $scope.roletaData.options.length

          // Determinar o resultado com base na resposta da API
          // Como a API não retorna diretamente o prêmio ganho, vamos usar um valor aleatório
          // Em uma implementação real, você precisaria extrair o resultado da resposta da API
          const randomIndex = Math.floor(Math.random() * optionsCount)
          const selectedOption = $scope.roletaData.options[randomIndex]

          // Calcular os graus para girar até o resultado
          const baseRotation = 1080 // 3 voltas completas
          const targetRotation = baseRotation + (360 - randomIndex * (360 / optionsCount))

          // Aplicar a animação
          wheel.style.transform = `rotate(${targetRotation}deg)`

          // Aguardar o fim da animação para mostrar o resultado
          $timeout(() => {
            $scope.isSpinning = false
            $scope.mostrarResultado(selectedOption)
          }, 4000) // Tempo da animação
        },
        (err) => {
          console.error("Erro ao executar a roleta:", err)
          $scope.errorMessage = $scope.t("erro")
          $scope.isSpinning = false
        },
      )
    }

    // Função para mostrar o resultado
    $scope.mostrarResultado = (option) => {
      // Definir os dados do resultado
      if (option.value === "perdeu") {
        $scope.resultadoTitle = $scope.t("naoFoi")
        $scope.resultadoDescription = $scope.t("tenteNovamente")
      } else {
        $scope.resultadoTitle = $scope.t("parabens")
        $scope.resultadoDescription = `${$scope.t("voceGanhou")} ${option.title}`
      }

      $scope.resultadoImage = option.image || $scope.getDefaultImage(option)
      $scope.showResultado = true
    }

    // Função para fechar o modal de resultado
    $scope.fecharResultado = () => {
      $scope.showResultado = false
      // Resetar a posição da roleta após fechar o resultado
      const wheel = document.getElementById("roleta-outer")
      wheel.style.transition = "none"
      wheel.style.transform = "rotate(0deg)"

      // Reativar a transição após um pequeno delay
      $timeout(() => {
        wheel.style.transition = "transform 4s cubic-bezier(0.17, 0.67, 0.21, 0.99)"
      }, 50)
    }

    // Inicializar a roleta
    $scope.loadRoleta()
  },
])
