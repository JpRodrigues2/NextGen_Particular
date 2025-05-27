// JavaScript - Widget de Dashboard com White-label
angular.module("dashboard", []).controller("dashboard", [
  "$scope",
  "$http",
  "$timeout",
  ($scope, $http, $timeout) => {
    console.log("Dashboard inicializado")

    // Configuração inicial
    $scope.playerData = {}
    $scope.loading = false
    $scope.message = ""
    $scope.messageType = ""

    // Configuração de idiomas para a interface
    $scope.translations = {
      pt: {
        dashboardTitle: "STATUS DO JOGADOR",
        totalScore: "PONTUAÇÃO TOTAL",
        level: "NÍVEL",
        achievements: "CONQUISTAS",
        levelProgress: "Progresso de nível",
        loading: "Carregando...",
        error: "Erro ao carregar dados",
        xp: "XP",
        coins: "Moedas",
        challenges: "Desafios",
        items: "Itens",
        nextLevel: "Próximo Nível",
      },
      en: {
        dashboardTitle: "PLAYER STATUS",
        totalScore: "TOTAL SCORE",
        level: "LEVEL",
        achievements: "ACHIEVEMENTS",
        levelProgress: "Level progress",
        loading: "Loading...",
        error: "Error loading data",
        xp: "XP",
        coins: "Coins",
        challenges: "Challenges",
        items: "Items",
        nextLevel: "Next Level",
      },
    }

    // Idioma padrão
    $scope.currentLang = "pt"

    // Função para traduzir
    $scope.t = (key) => $scope.translations[$scope.currentLang][key] || key

    // Função para alternar idioma\
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
            ? Funifier.config.service + "/v3/database/dashboard__c?strict=true&q=_id:'global'"
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

      // Background color
      if (cfg.background_color) {
        document.querySelector(".dashboard-content").style.backgroundColor = cfg.background_color
      } else {
        console.error("[WhiteLabel] Background color not found in DB:", {
          key: "background_color",
          config: cfg,
          reason: "No background_color found in DB.",
        })
      }

      // Header color
      if (cfg.header_color) {
        document.querySelector(".dashboard-header").style.backgroundColor = cfg.header_color
      } else {
        console.error("[WhiteLabel] Header color not found in DB:", {
          key: "header_color",
          config: cfg,
          reason: "No header_color found in DB.",
        })
      }

      // Border color
      if (cfg.border_color) {
        document.getElementById("dashboard").style.border = "2px solid " + cfg.border_color
      } else {
        console.error("[WhiteLabel] Border color not found in DB:", {
          key: "border_color",
          config: cfg,
          reason: "No border_color found in DB.",
        })
      }

      // Font
      if (cfg.font) {
        document.getElementById("dashboard").style.fontFamily = cfg.font
      } else {
        console.error("[WhiteLabel] Font not found in DB:", {
          key: "font",
          config: cfg,
          reason: "No font found in DB.",
        })
      }

      // Text color
      if (cfg.text_color) {
        const style = document.createElement("style")
        style.innerHTML = `
          #dashboard .dashboard-title,
          #dashboard .player-name,
          #dashboard .card-title,
          #dashboard .card-value,
          #dashboard .progress-text {
            color: ${cfg.text_color} !important;
          }
        `
        document.head.appendChild(style)
      } else {
        console.error("[WhiteLabel] Text color not found in DB:", {
          key: "text_color",
          config: cfg,
          reason: "No text_color found in DB.",
        })
      }

      // Card colors
      if (cfg.card_score_color) {
        const style = document.createElement("style")
        style.innerHTML = `
          #dashboard .card-score {
            background-color: ${cfg.card_score_color} !important;
          }
        `
        document.head.appendChild(style)
      } else {
        console.error("[WhiteLabel] Card score color not found in DB:", {
          key: "card_score_color",
          config: cfg,
          reason: "No card_score_color found in DB.",
        })
      }

      if (cfg.card_level_color) {
        const style = document.createElement("style")
        style.innerHTML = `
          #dashboard .card-level {
            background-color: ${cfg.card_level_color} !important;
          }
        `
        document.head.appendChild(style)
      } else {
        console.error("[WhiteLabel] Card level color not found in DB:", {
          key: "card_level_color",
          config: cfg,
          reason: "No card_level_color found in DB.",
        })
      }

      if (cfg.card_achievements_color) {
        const style = document.createElement("style")
        style.innerHTML = `
          #dashboard .card-achievements {
            background-color: ${cfg.card_achievements_color} !important;
          }
        `
        document.head.appendChild(style)
      } else {
        console.error("[WhiteLabel] Card achievements color not found in DB:", {
          key: "card_achievements_color",
          config: cfg,
          reason: "No card_achievements_color found in DB.",
        })
      }

      // Progress bar colors
      if (cfg.progress_bar_color) {
        const style = document.createElement("style")
        style.innerHTML = `
          #dashboard .progress-fill {
            background-color: ${cfg.progress_bar_color} !important;
          }
        `
        document.head.appendChild(style)
      } else {
        console.error("[WhiteLabel] Progress bar color not found in DB:", {
          key: "progress_bar_color",
          config: cfg,
          reason: "No progress_bar_color found in DB.",
        })
      }

      if (cfg.progress_background_color) {
        const style = document.createElement("style")
        style.innerHTML = `
          #dashboard .progress-bar {
            background-color: ${cfg.progress_background_color} !important;
          }
        `
        document.head.appendChild(style)
      } else {
        console.error("[WhiteLabel] Progress background color not found in DB:", {
          key: "progress_background_color",
          config: cfg,
          reason: "No progress_background_color found in DB.",
        })
      }
    }

    // Função para obter dados do jogador
    $scope.getPlayerData = () => {
      $scope.loading = true
      $scope.message = $scope.t("loading")

      var player =
        typeof Funifier !== "undefined" &&
        Funifier.widget &&
        Funifier.widget.options &&
        Funifier.widget.options["dashboard"]
          ? Funifier.widget.options["dashboard"].player
          : "joao"

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
          console.log("Dados do jogador carregados:", data.data)
          $scope.playerData = data.data
          $scope.loading = false
          $scope.message = ""
        },
        (err) => {
          console.error("Erro ao obter dados do jogador:", err)
          $scope.loading = false
          $scope.message = $scope.t("error")
          $scope.messageType = "error"
          // Usar dados de exemplo em caso de erro
          $scope.loadExampleData()
        },
      )
    }

    // Função para carregar dados de exemplo (caso a API falhe)
    $scope.loadExampleData = () => {
      $scope.playerData = {
        name: "João Pedro",
        image: {
          medium: {
            url: "https://s3.amazonaws.com/funifier_node/540f14d70ffeeb8c2fe11767/080f62c9f9da2220bd41.png",
          },
        },
        total_challenges: 5,
        total_points: 261,
        point_categories: {
          moedas: 56,
          xp: 205,
        },
        total_catalog_items: 0,
        level_progress: {
          level: {
            level: "Aprendiz",
            position: 0,
          },
          percent_completed: 70,
          next_points: 45,
          next_level: {
            level: "Júnior",
            position: 1,
          },
          percent: 70,
        },
      }
    }

    // Funções para obter dados específicos com white-label filtering
    $scope.getPlayerName = () => {
      if (!$scope.whitelabelConfig || $scope.whitelabelConfig.show_name !== false) {
        return $scope.playerData.name || "Jogador"
      }
      return "Jogador"
    }

    $scope.getPlayerImage = () => {
      if (!$scope.whitelabelConfig || $scope.whitelabelConfig.show_avatar !== false) {
        return $scope.playerData.image && $scope.playerData.image.medium
          ? $scope.playerData.image.medium.url
          : "https://via.placeholder.com/150/7fbfb3/2d5d56?text=👤"
      }
      return "https://via.placeholder.com/150/7fbfb3/2d5d56?text=👤"
    }

    $scope.getTotalScore = () => {
      if (!$scope.whitelabelConfig || $scope.whitelabelConfig.show_total_score !== false) {
        return $scope.playerData.total_points || 0
      }
      return null
    }

    $scope.getXP = () => {
      if (!$scope.whitelabelConfig || $scope.whitelabelConfig.show_xp !== false) {
        return $scope.playerData.point_categories ? $scope.playerData.point_categories.xp || 0 : 0
      }
      return null
    }

    $scope.getCoins = () => {
      if (!$scope.whitelabelConfig || $scope.whitelabelConfig.show_coins !== false) {
        return $scope.playerData.point_categories ? $scope.playerData.point_categories.moedas || 0 : 0
      }
      return null
    }

    $scope.getChallenges = () => {
      if (!$scope.whitelabelConfig || $scope.whitelabelConfig.show_challenges !== false) {
        return $scope.playerData.total_challenges || 0
      }
      return null
    }

    $scope.getItems = () => {
      if (!$scope.whitelabelConfig || $scope.whitelabelConfig.show_items !== false) {
        return $scope.playerData.total_catalog_items || 0
      }
      return null
    }

    $scope.getCurrentLevel = () => {
      if (!$scope.whitelabelConfig || $scope.whitelabelConfig.show_level !== false) {
        return $scope.playerData.level_progress && $scope.playerData.level_progress.level
          ? $scope.playerData.level_progress.level.level
          : "N/A"
      }
      return null
    }

    $scope.getLevelPosition = () => {
      if (!$scope.whitelabelConfig || $scope.whitelabelConfig.show_level !== false) {
        return $scope.playerData.level_progress && $scope.playerData.level_progress.level
          ? $scope.playerData.level_progress.level.position + 1
          : 1
      }
      return null
    }

    $scope.getLevelProgress = () => {
      if (!$scope.whitelabelConfig || $scope.whitelabelConfig.show_progress !== false) {
        return $scope.playerData.level_progress ? $scope.playerData.level_progress.percent || 0 : 0
      }
      return null
    }

    $scope.getNextLevel = () => {
      if (!$scope.whitelabelConfig || $scope.whitelabelConfig.show_progress !== false) {
        return $scope.playerData.level_progress && $scope.playerData.level_progress.next_level
          ? $scope.playerData.level_progress.next_level.level
          : "Máximo"
      }
      return null
    }

    // Verificar se deve mostrar um atributo
    $scope.shouldShow = (attribute) => {
      if (!$scope.whitelabelConfig) return true
      return $scope.whitelabelConfig[attribute] !== false
    }

    // Inicializar o widget
    function initialize() {
      // Fetch white-label config first
      fetchWhitelabelConfig()
      // Carregar dados do jogador
      $scope.getPlayerData()
    }

    // Iniciar o widget
    initialize()
  },
])

setTimeout(() => {
  var element = angular.element(document.getElementById("dashboard"))
  if (!element.injector()) {
    angular.bootstrap(element, ["dashboard"])
  }
}, 10)
