// JavaScript - Widget de Loja Virtual com White-label
angular.module("loja", []).controller("loja", [
  "$scope",
  "$http",
  "$timeout",
  ($scope, $http, $timeout) => {
    console.log("Loja virtual inicializada")

    // Configuração inicial
    $scope.items = []
    $scope.playerCoins = 0
    $scope.playerData = {}
    $scope.loading = false
    $scope.message = ""
    $scope.messageType = ""

    // Configuração de idiomas para a interface
    $scope.translations = {
      pt: {
        storeTitle: "LOJA VIRTUAL",
        currentBalance: "SALDO ATUAL DE MOEDAS:",
        availableItems: "Itens Disponíveis",
        buyButton: "COMPRAR",
        loading: "Carregando...",
        noItems: "Nenhum item disponível",
        purchaseSuccess: "Item comprado com sucesso!",
        insufficientBalance: "Moedas insuficientes para esta compra.",
        purchaseError: "Erro ao processar compra.",
        coins: "moedas",
      },
      en: {
        storeTitle: "VIRTUAL STORE",
        currentBalance: "CURRENT COIN BALANCE:",
        availableItems: "Available Items",
        buyButton: "BUY",
        loading: "Loading...",
        noItems: "No items available",
        purchaseSuccess: "Item purchased successfully!",
        insufficientBalance: "Insufficient coins for this purchase.",
        purchaseError: "Error processing purchase.",
        coins: "coins",
      },
    }

    // Idioma padrão
    $scope.currentLang = "pt"

    // Função para traduzir
    $scope.t = (key) => $scope.translations[$scope.currentLang][key] || key

    // Função para alternar idioma
    $scope.toggleLanguage = () => {
      $scope.currentLang = $scope.currentLang === "pt" ? "en" : "pt"
    }

    // --- White-label config ---
    $scope.whitelabelConfig = null

    // Fetch white-label config from DB
    function fetchWhitelabelConfig() {
      $http({
        method: "GET",
        url:
          typeof Funifier !== "undefined"
            ? Funifier.config.service + "/v3/database/loja__c?strict=true&q=_id:'global'"
            : null,
        headers: {
          Authorization: typeof Funifier !== "undefined" && Funifier.auth ? Funifier.auth.getAuthorization() : null,
          "Content-Type": "application/json",
          "cache-control": "no-cache",
        },
      }).then((data) => {
        if (data.data && data.data[0]) {
          $scope.whitelabelConfig = data.data[0]
          applyWhitelabelStyles()
        }
      })
    }

    // Apply styles from the config to the widget
    function applyWhitelabelStyles() {
      var cfg = $scope.whitelabelConfig
      if (!cfg) return

      // Buy button color
      if (cfg.buy_button_color) {
        const style = document.createElement("style")
        style.innerHTML = `
          #loja .buy-button {
            background-color: ${cfg.buy_button_color} !important;
          }
        `
        document.head.appendChild(style)
      } else {
        console.error("[WhiteLabel] Buy button color not found in DB:", {
          key: "buy_button_color",
          config: cfg,
          reason: "No buy_button_color found in DB.",
        })
      }

      // Buy button hover color
      if (cfg.buy_button_hover_color) {
        const style = document.createElement("style")
        style.innerHTML = `
          #loja .buy-button:hover {
            background-color: ${cfg.buy_button_hover_color} !important;
          }
        `
        document.head.appendChild(style)
      } else {
        console.error("[WhiteLabel] Buy button hover color not found in DB:", {
          key: "buy_button_hover_color",
          config: cfg,
          reason: "No buy_button_hover_color found in DB.",
        })
      }

      // Insufficient balance message color
      if (cfg.insufficient_balance_color) {
        const style = document.createElement("style")
        style.innerHTML = `
          #loja .error-message {
            color: ${cfg.insufficient_balance_color} !important;
          }
        `
        document.head.appendChild(style)
      } else {
        console.error("[WhiteLabel] Insufficient balance color not found in DB:", {
          key: "insufficient_balance_color",
          config: cfg,
          reason: "No insufficient_balance_color found in DB.",
        })
      }
    }

    // Função para obter dados do jogador (moedas)
    $scope.getPlayerData = () => {
      var player =
        typeof Funifier !== "undefined" && Funifier.widget && Funifier.widget.options && Funifier.widget.options["loja"]
          ? Funifier.widget.options["loja"].player
          : "tom"

      var req = {
        method: "GET",
        url: typeof Funifier !== "undefined" ? Funifier.config.service + "/v3/player/" + player + "/status" : null,
        headers: {
          Authorization: typeof Funifier !== "undefined" && Funifier.auth ? Funifier.auth.getAuthorization() : null,
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
      }

      $http(req).then(
        (data) => {
          $scope.playerData = data.data
          $scope.playerCoins = data.data.point_categories ? data.data.point_categories.moedas || 0 : 0
          console.log("Dados do jogador carregados:", $scope.playerData)
          console.log("Moedas do jogador:", $scope.playerCoins)
        },
        (err) => {
          console.error("Erro ao obter dados do jogador:", err)
          $scope.playerCoins = 0
        },
      )
    }

    // Função para obter itens da loja
    $scope.getItems = () => {
      $scope.loading = true
      $scope.message = $scope.t("loading")

      var req = {
        method: "GET",
        url: "https://service2.funifier.com/v3/virtualgoods/item",
        headers: {
          Authorization: typeof Funifier !== "undefined" && Funifier.auth ? Funifier.auth.getAuthorization() : null,
          "Content-Type": "application/json",
        },
      }

      $http(req).then(
        (data) => {
          console.log("Itens recebidos:", data.data)

          // Filtrar apenas itens ativos
          let filteredItems = data.data.filter((item) => item.active)

          // Apply white-label item filtering if config exists
          if (
            $scope.whitelabelConfig &&
            $scope.whitelabelConfig.disabled_items &&
            Array.isArray($scope.whitelabelConfig.disabled_items)
          ) {
            filteredItems = filteredItems.filter((item) => !$scope.whitelabelConfig.disabled_items.includes(item._id))
          }

          // Processar itens para extrair preço
          $scope.items = filteredItems.map((item) => {
            let price = 0
            if (item.requires && item.requires.length > 0) {
              const moedaReq = item.requires.find((r) => r.type === 0 && r.operation === 1 && r.item === "moedas")
              if (moedaReq) {
                price = moedaReq.total
              }
            }

            return {
              ...item,
              price: price,
              imageUrl: item.image && item.image.medium ? item.image.medium.url : null,
            }
          })

          $scope.loading = false
          $scope.message = ""

          if ($scope.items.length === 0) {
            $scope.message = $scope.t("noItems")
          }
        },
        (err) => {
          console.error("Erro ao obter itens:", err)
          $scope.loading = false
          $scope.message = "Erro ao carregar itens"
          $scope.messageType = "error"
        },
      )
    }

    // Função para comprar item
    $scope.buyItem = (item) => {
      if ($scope.playerCoins < item.price) {
        $scope.showMessage($scope.t("insufficientBalance"), "error")
        return
      }

      var player =
        typeof Funifier !== "undefined" && Funifier.widget && Funifier.widget.options && Funifier.widget.options["loja"]
          ? Funifier.widget.options["loja"].player
          : "tom"

      var req = {
        method: "POST",
        url: "https://service2.funifier.com/v3/virtualgoods/purchase",
        headers: {
          Authorization: typeof Funifier !== "undefined" && Funifier.auth ? Funifier.auth.getAuthorization() : null,
          "Content-Type": "application/json",
        },
        data: {
          player: player,
          item: item._id,
          total: 1,
        },
      }

      $scope.loading = true
      $scope.message = "Processando compra..."

      $http(req).then(
        (data) => {
          console.log("Resposta da compra:", data.data)

          if (data.data.status === "OK") {
            $scope.showMessage($scope.t("purchaseSuccess"), "success")
            // Atualizar saldo de moedas
            $scope.getPlayerData()
          } else {
            $scope.showMessage($scope.t("purchaseError"), "error")
          }

          $scope.loading = false
        },
        (err) => {
          console.error("Erro na compra:", err)
          $scope.loading = false

          // Verificar se é erro de saldo insuficiente
          if (err.data && err.data.restrictions && err.data.restrictions.includes("insufficient_requirements")) {
            $scope.showMessage($scope.t("insufficientBalance"), "error")
          } else {
            $scope.showMessage($scope.t("purchaseError"), "error")
          }
        },
      )
    }

    // Função para mostrar mensagens
    $scope.showMessage = (msg, type) => {
      $scope.message = msg
      $scope.messageType = type

      // Limpar mensagem após 3 segundos
      $timeout(() => {
        $scope.message = ""
        $scope.messageType = ""
      }, 3000)
    }

    // Verificar se jogador tem moedas suficientes
    $scope.canBuy = (item) => {
      return $scope.playerCoins >= item.price
    }

    // Inicializar o widget
    function initialize() {
      // Fetch white-label config first
      fetchWhitelabelConfig()
      // Carregar dados do jogador
      $scope.getPlayerData()
      // Carregar itens da loja
      $scope.getItems()
    }

    // Iniciar o widget
    initialize()
  },
])

setTimeout(() => {
  var element = angular.element(document.getElementById("loja"))
  if (!element.injector()) {
    angular.bootstrap(element, ["loja"])
  }
}, 10)
