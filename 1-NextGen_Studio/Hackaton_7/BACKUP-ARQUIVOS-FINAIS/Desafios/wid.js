angular.module("desafios", []).controller("desafios", [
  "$scope",
  "$http",
  "$location",
  ($scope, $http, $location) => {
    console.log("desafios inicializado");

    // Configuração inicial
    $scope.challenges = [];
    $scope.itemsPerPage = 3;
    $scope.currentPage = 1;

    // Configuração de idiomas
    $scope.translations = {
      pt: {
        challengesTitle: "DESAFIOS",
      },
      en: {
        challengesTitle: "CHALLENGES",
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

    // --- White-label config ---
    $scope.whitelabelConfig = null;

    // Buscar configurações de white-label do banco de dados
    function fetchWhitelabelConfig() {
      $http({
        method: "GET",
        url: Funifier.config.service + "/v3/database/desafios__c?strict=true&q=_id:'global'",
        headers: {
          Authorization: typeof Funifier !== "undefined" && Funifier.auth ? Funifier.auth.getAuthorization() : null,
          "Content-Type": "application/json",
          "cache-control": "no-cache",
        },
      }).then((data) => {
        if (data.data && data.data[0]) {
          $scope.whitelabelConfig = data.data[0];
          $scope.itemsPerPage = $scope.whitelabelConfig.items_per_page || 3;
          applyWhitelabelStyles();
        }
      });
    }

    // Aplicar estilos do white-label
    function applyWhitelabelStyles() {
      var cfg = $scope.whitelabelConfig;
      if (!cfg) return;

      // Cor de fundo geral
      if (cfg.background_color) {
        document.querySelector(".challenges-content").style.backgroundColor = cfg.background_color;
      } else {
        console.error("[WhiteLabel] Background color not found in DB:", {
          key: "background_color",
          config: cfg,
          reason: "No background_color found in DB.",
        });
      }

      // Cor do cabeçalho
      if (cfg.header_color) {
        document.querySelector(".challenges-header").style.backgroundColor = cfg.header_color;
      } else {
        console.error("[WhiteLabel] Header color not found in DB:", {
          key: "header_color",
          config: cfg,
          reason: "No header_color found in DB.",
        });
      }

      // Cor da borda
      if (cfg.border_color) {
        document.getElementById("desafios").style.border = "2px solid " + cfg.border_color;
      } else {
        console.error("[WhiteLabel] Border color not found in DB:", {
          key: "border_color",
          config: cfg,
          reason: "No border_color found in DB.",
        });
      }

      // Fonte
      if (cfg.font) {
        document.getElementById("desafios").style.fontFamily = cfg.font;
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
          #desafios .challenges-header,
          #desafios .challenge-title,
          #desafios .challenge-description,
          #desafios .challenge-points,
          #desafios .pagination span {
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

      // Cor dos botões
      if (cfg.button_color) {
        const style = document.createElement("style");
        style.innerHTML = `
          #desafios .pagination button {
            background-color: ${cfg.button_color} !important;
          }
        `;
        document.head.appendChild(style);
      } else {
        console.error("[WhiteLabel] Button color not found in DB:", {
          key: "button_color",
          config: cfg,
          reason: "No button_color found in DB.",
        });
      }

      // Cor dos boxes de desafios
      if (cfg.challenge_box_color) {
        const style = document.createElement("style");
        style.innerHTML = `
          #desafios .challenge-card {
            background-color: ${cfg.challenge_box_color} !important;
          }
        `;
        document.head.appendChild(style);
      } else {
        console.error("[WhiteLabel] Challenge box color not found in DB:", {
          key: "challenge_box_color",
          config: cfg,
          reason: "No challenge_box_color found in DB.",
        });
      }

      // Apply dynamic styles to additional elements
      const languageToggle = document.querySelector("#desafios .language-toggle");
      if (languageToggle) languageToggle.classList.add("dynamic-style");

      const paginationButtons = document.querySelectorAll("#desafios .pagination button");
      paginationButtons.forEach((button) => button.classList.add("dynamic-style"));
    }

    // Função para obter os desafios via API
    $scope.getChallenges = () => {
      var req = {
        method: "GET",
        url: "https://service2.funifier.com/v3/challenge",
        headers: {
          Authorization: "Basic NjgyYTBlNmYyMzI3Zjc0ZjNhM2UwMDg5OjY4MmExMDI2MjMyN2Y3NGYzYTNlMDBjZg==",
          "Content-Type": "application/json",
        },
      };
      $http(req).then(
        (data) => {
          if (data.data) {
            $scope.challenges = data.data.filter((challenge) => challenge.active);
            fetchWhitelabelConfig();
          }
        },
        (err) => {
          console.log("Erro ao obter desafios:", err);
        },
      );
    };

    // Paginação
    $scope.getDisplayedChallenges = () => {
      const startIndex = ($scope.currentPage - 1) * $scope.itemsPerPage;
      const endIndex = startIndex + $scope.itemsPerPage;
      return $scope.challenges.slice(startIndex, endIndex);
    };

    $scope.totalPages = () => {
      return Math.ceil($scope.challenges.length / $scope.itemsPerPage);
    };

    $scope.setPage = (page) => {
      if (page >= 1 && page <= $scope.totalPages()) {
        $scope.currentPage = page;
      }
    };

    // Inicializar o widget
    $scope.getChallenges();
  },
]);

setTimeout(() => {
  var element = angular.element(document.getElementById("desafios"));
  if (!element.injector()) {
    angular.bootstrap(element, ["desafios"]);
  }
}, 10);