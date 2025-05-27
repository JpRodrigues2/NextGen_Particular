// JavaScript - Widget de Notificações
var angular = window.angular;
var Funifier = window.Funifier;
var Marketplace = window.Marketplace;

angular.module("notificacoes", []).controller("notificacoes", [
  "$scope",
  "$http",
  "$location",
  "$interval",
  ($scope, $http, $location, $interval) => {
    console.log("notificacoes inicializado");

    // Configuração inicial
    $scope.notifications = []; // Armazena as notificações do jogador
    $scope.player = Funifier?.widget?.options?.notificacoes?.player || "default_player"; // Fallback para jogador
    $scope.status = null; // Dados do jogador
    $scope.gamePoints = []; // Pontos do jogo
    $scope.dateFormat = "dd MMM - HH:mm"; // Formato de data

    // Configuração de idiomas
    $scope.translations = {
      pt: {
        notificationsTitle: "NOTIFICAÇÕES",
        noNotifications: "Nenhuma notificação disponível",
      },
      en: {
        notificationsTitle: "NOTIFICATIONS",
        noNotifications: "No notifications available",
      },
    };

    // Idioma padrão
    $scope.currentLang = "pt";

    // Função para traduzir
    $scope.t = (key) => $scope.translations[$scope.currentLang][key] || key;

    // Alternar idioma
    $scope.toggleLanguage = () => {
      $scope.currentLang = $scope.currentLang === "pt" ? "en" : "pt";
    };

    // Configurações padrão (serão sobrescritas pelo DB)
    $scope.config = {
      updateInterval: 30000, // 30 segundos padrão
      visibleTypes: {
        challenges: true,
        actions: true,
      },
    };

    // --- White-label config ---
    $scope.whitelabelConfig = null;
    let notificationsInterval = null;

    // Função para obter token dinâmico
    $scope.getGamificationToken = () => {
      try {
        if (Marketplace?.auth?.getAuthorization) {
          return Marketplace.auth.getAuthorization();
        }
      } catch (e) {
        console.log("Marketplace não disponível, usando token estático");
      }
      return "Basic NjgyYTBlNmYyMzI3Zjc0ZjNhM2UwMDg5OjY4MmExMDI2MjMyN2Y3NGYzYTNlMDBjZg==";
    };

    // Buscar configurações de white-label do banco de dados
    function fetchWhitelabelConfig() {
      $http({
        method: "GET",
        url: "https://service2.funifier.com/v3/database/notificacoes__c?strict=true&q=_id:'global'",
        headers: {
          Authorization: $scope.getGamificationToken(),
          "Content-Type": "application/json",
          "cache-control": "no-cache",
        },
      }).then(
        (data) => {
          if (data.data && data.data[0]) {
            $scope.whitelabelConfig = data.data[0];
            $scope.config.updateInterval = $scope.whitelabelConfig.update_interval || 30000;
            $scope.config.visibleTypes = $scope.whitelabelConfig.visible_types || {
              challenges: true,
              actions: true,
            };
            applyWhitelabelStyles();
            $scope.startAutoUpdate(); // Iniciar atualização automática após carregar config
          }
          $scope.getUserStatus();
        },
        (err) => {
          console.log("Erro ao carregar configurações:", err);
          $scope.getUserStatus(); // Continuar mesmo se houver erro
        },
      );
    }

    // Aplicar estilos do white-label
    function applyWhitelabelStyles() {
      var cfg = $scope.whitelabelConfig;
      if (!cfg) return;

      // Cor de fundo geral
      if (cfg.background_color) {
        document.querySelector(".notifications-content").style.backgroundColor = cfg.background_color;
      } else {
        console.error("[WhiteLabel] Background color not found in DB:", {
          key: "background_color",
          config: cfg,
          reason: "No background_color found in DB.",
        });
      }

      // Cor do cabeçalho
      if (cfg.header_color) {
        document.querySelector(".notifications-header").style.backgroundColor = cfg.header_color;
      } else {
        console.error("[WhiteLabel] Header color not found in DB:", {
          key: "header_color",
          config: cfg,
          reason: "No header_color found in DB.",
        });
      }

      // Cor da borda
      if (cfg.border_color) {
        document.getElementById("notificacoes").style.border = "2px solid " + cfg.border_color;
      } else {
        console.error("[WhiteLabel] Border color not found in DB:", {
          key: "border_color",
          config: cfg,
          reason: "No border_color found in DB.",
        });
      }

      // Fonte
      if (cfg.font) {
        document.getElementById("notificacoes").style.fontFamily = cfg.font;
        $scope.loadFont(cfg.font); // Carregar fonte do Google Fonts
      } else {
        console.error("[WhiteLabel] Font not found in DB:", {
          key: "font",
          config: cfg,
          reason: "No font found in DB.",
        });
      }

      // Cor do texto
      if (cfg.text_color) {
        const style = document.createElement("style");
        style.innerHTML = `
          #notificacoes .notification-title,
          #notificacoes .notification-description,
          #notificacoes .notification-date {
            color: ${cfg.text_color} !important;
          }
        `;
        document.head.appendChild(style);
      } else {
        console.error("[WhiteLabel] Text color not found in DB:", {
          key: "text_color",
          config: cfg,
          reason: "No text_color found in DB.",
        });
      }
    }

    // Função para carregar Google Fonts dinamicamente
    $scope.loadFont = (fontName) => {
      if (!fontName) return;
      var formattedFont = fontName.replace(/ /g, "+");
      var linkId = "dynamic-font-link-notificacoes";
      var existingLink = document.getElementById(linkId);

      if (existingLink) {
        existingLink.href = "https://fonts.googleapis.com/css?family=" + formattedFont;
      } else {
        var link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css?family=" + formattedFont;
        document.head.appendChild(link);
      }
    };

    // Filtrar notificações por tipo
    $scope.filterNotifications = (notifications) => {
      if (!notifications || !notifications.length) return [];

      return notifications.filter((notification) => {
        if (!notification.definition || !notification.definition.content) return false;

        var content = notification.definition.content.toLowerCase();

        if (content.includes("desafio") || content.includes("challenge")) {
          return $scope.config.visibleTypes.challenges;
        }
        if (content.includes("ação") || content.includes("action") || content.includes("completou")) {
          return $scope.config.visibleTypes.actions;
        }

        return false; // Ignorar outros tipos não especificados
      });
    };

    // Obter status do usuário
    $scope.getUserStatus = () => {
      $http({
        method: "GET",
        url: `https://service2.funifier.com/v3/player/${$scope.player}/status`,
        headers: {
          Authorization: $scope.getGamificationToken(),
          "Content-Type": "application/json",
          "cache-control": "no-cache",
        },
      }).then(
        (res) => {
          $scope.status = res.data;
          $scope.getGamePoints();
        },
        (err) => {
          console.error("Erro ao carregar status do usuário:", err);
          $scope.getGamePoints(); // Continuar mesmo se houver erro
        },
      );
    };

    // Obter pontos do jogo
    $scope.getGamePoints = () => {
      $http({
        method: "GET",
        url: "https://service2.funifier.com/v3/point/",
        headers: {
          Authorization: $scope.getGamificationToken(),
          "Content-Type": "application/json",
          "cache-control": "no-cache",
        },
      }).then(
        (res) => {
          $scope.gamePoints = res.data || [];
          $scope.getAll(true);
        },
        (err) => {
          console.error("Erro ao carregar pontos do jogo:", err);
          $scope.getAll(true); // Continuar mesmo se houver erro
        },
      );
    };

    // Obter todas as notificações
    $scope.getAll = (firstTime) => {
      $http({
        method: "GET",
        url: `https://service2.funifier.com/v3/notification?player=${$scope.player}&scope=private&published_min=-30d&max_results=100`,
        headers: {
          Authorization: $scope.getGamificationToken(),
          "Content-Type": "application/json",
          "cache-control": "no-cache",
        },
      }).then(
        (res) => {
          const data = res.data || [];
          $scope.notifications = $scope.filterNotifications(data);

          // Iniciar atualização automática na primeira execução
          if (firstTime && !notificationsInterval) {
            $scope.startAutoUpdate();
          }
        },
        (err) => {
          console.error("Erro ao carregar notificações:", err);
        },
      );
    };

    // Iniciar atualização automática
    $scope.startAutoUpdate = () => {
      if (notificationsInterval) {
        $interval.cancel(notificationsInterval);
      }
      const intervalDuration = $scope.config.updateInterval > 0 ? $scope.config.updateInterval : 0;
      if (intervalDuration > 0) {
        notificationsInterval = $interval(() => {
          $scope.getAll(false);
        }, intervalDuration);
      }
    };

    // Parar atualização automática
    $scope.stopAutoUpdate = () => {
      if (notificationsInterval) {
        $interval.cancel(notificationsInterval);
        notificationsInterval = null;
      }
    };

    // Destruir intervalo ao sair do widget
    $scope.$on("$destroy", () => {
      $scope.stopAutoUpdate();
    });

    // Inicializar o widget
    fetchWhitelabelConfig();
  },
]);

setTimeout(() => {
  var element = angular.element(document.getElementById("notificacoes"));
  if (!element.injector()) {
    angular.bootstrap(element, ["notificacoes"]);
  }
}, 10);