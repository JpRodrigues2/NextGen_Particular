// JavaScript - Widget de Roleta da Sorte
angular.module("roleta", []).controller("roleta", [
  "$scope",
  "$http",
  "$location",
  ($scope, $http, $location) => {
    console.log("roleta inicializado");

    // Configuração inicial
    $scope.prizes = []; // Armazena os prêmios da roleta
    $scope.winChart = []; // Armazena o win_chart para mapear prêmios
    $scope.playerData = {}; // Dados do jogador
    $scope.playerCoins = 0; // Moedas do jogador
    $scope.isSpinning = false; // Estado da roleta (girando ou não)
    $scope.result = null; // Resultado do giro
    $scope.spinCost = 20; // Custo do giro (fixo em 20 moedas)

    // Configuração de idiomas
    $scope.translations = {
      pt: {
        wheelTitle: "ROLETA DA SORTE",
        prizesTitle: "PRÊMIOS",
        spinButton: "GIRO",
        spinning: "Girando...",
        noCoins: "Moedas insuficientes!",
        winMessage: "Você ganhou: ",
        errorMessage: "Erro ao girar a roleta.",
        coinBalance: "Suas Moedas",
      },
      en: {
        wheelTitle: "WHEEL OF FORTUNE",
        prizesTitle: "PRIZES",
        spinButton: "SPIN",
        spinning: "Spinning...",
        noCoins: "Not enough coins!",
        winMessage: "You won: ",
        errorMessage: "Error spinning the wheel.",
        coinBalance: "Your Coins",
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
        url: Funifier.config.service + "/v3/database/roleta__c?strict=true&q=_id:'global'",
        headers: {
          Authorization: typeof Funifier !== "undefined" && Funifier.auth ? Funifier.auth.getAuthorization() : null,
          "Content-Type": "application/json",
          "cache-control": "no-cache",
        },
      }).then((data) => {
        if (data.data && data.data[0]) {
          $scope.whitelabelConfig = data.data[0];
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
        document.querySelector(".wheel-content").style.backgroundColor = cfg.background_color;
      } else {
        console.error("[WhiteLabel] Background color not found in DB:", {
          key: "background_color",
          config: cfg,
          reason: "No background_color found in DB.",
        });
      }

      // Cor do cabeçalho
      if (cfg.header_color) {
        document.querySelector(".wheel-header").style.backgroundColor = cfg.header_color;
      } else {
        console.error("[WhiteLabel] Header color not found in DB:", {
          key: "header_color",
          config: cfg,
          reason: "No header_color found in DB.",
        });
      }

      // Cor da borda
      if (cfg.border_color) {
        document.getElementById("roleta").style.border = "2px solid " + cfg.border_color;
      } else {
        console.error("[WhiteLabel] Border color not found in DB:", {
          key: "border_color",
          config: cfg,
          reason: "No border_color found in DB.",
        });
      }

      // Fonte
      if (cfg.font) {
        document.getElementById("roleta").style.fontFamily = cfg.font;
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
          #roleta .prize-title,
          #roleta .result-message,
          #roleta .coin-balance {
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

      // Cor do botão de giro
      if (cfg.button_color) {
        const style = document.createElement("style");
        style.innerHTML = `
          #roleta .spin-button {
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

      // Cores da roleta
      if (cfg.wheel_colors && Array.isArray(cfg.wheel_colors)) {
        const style = document.createElement("style");
        let css = "";
        cfg.wheel_colors.forEach((color, index) => {
          css += `
            #roleta .wheel-section:nth-child(${index + 1}) {
              background-color: ${color} !important;
            }
          `;
        });
        style.innerHTML = css;
        document.head.appendChild(style);
      } else {
        console.error("[WhiteLabel] Wheel colors not found in DB:", {
          key: "wheel_colors",
          config: cfg,
          reason: "No wheel_colors found in DB.",
        });
      }
    }

    // Função para obter os prêmios da roleta via API
    $scope.getPrizes = () => {
      var req = {
        method: "GET",
        url: "https://service2.funifier.com/v3/mystery",
        headers: {
          Authorization: "Basic NjgyYTBlNmYyMzI3Zjc0ZjNhM2UwMDg5OjY4MmExMDI2MjMyN2Y3NGYzYTNlMDBjZg==",
          "Content-Type": "application/json",
        },
      };
      $http(req).then(
        (data) => {
          if (data.data && data.data[0]) {
            $scope.prizes = data.data[0].options || [];
            $scope.winChart = data.data[0].win_chart || [];
            // Buscar configurações de white-label após carregar os prêmios
            fetchWhitelabelConfig();
          }
        },
        (err) => {
          console.log("Erro ao obter prêmios:", err);
        },
      );
    };

    // Função para obter dados do jogador (moedas)
    $scope.getPlayerData = () => {
      var player =
        typeof Funifier !== "undefined" &&
        Funifier.widget &&
        Funifier.widget.options &&
        Funifier.widget.options["roleta"]
          ? Funifier.widget.options["roleta"].player
          : null;

      if (player) {
        var req = {
          method: "GET",
          url: `https://service2.funifier.com/v3/player/${player}/status`,
          headers: {
            Authorization: "Basic NjgyYTBlNmYyMzI3Zjc0ZjNhM2UwMDg5OjY4MmExMDI2MjMyN2Y3NGYzYTNlMDBjZg==",
            "Content-Type": "application/json",
          },
        };
        $http(req).then(
          (data) => {
            $scope.playerData = data.data;
            $scope.playerCoins = $scope.playerData.point_categories?.moedas || 0;
          },
          (err) => {
            console.log("Erro ao obter dados do jogador:", err);
          },
        );
      }
    };

    // Função para girar a roleta
    $scope.spinWheel = () => {
      if ($scope.isSpinning) return;

      // Verificar moedas
      if ($scope.playerCoins < $scope.spinCost) {
        alert($scope.t("noCoins"));
        return;
      }

      $scope.isSpinning = true;
      $scope.result = null;

      // Simular animação de giro (5 segundos)
      setTimeout(() => {
        var player =
          typeof Funifier !== "undefined" &&
          Funifier.widget &&
          Funifier.widget.options &&
          Funifier.widget.options["roleta"]
            ? Funifier.widget.options["roleta"].player
            : "tom";

        var req = {
          method: "GET",
          url: `https://service2.funifier.com/v3/mystery/execute/682a16a02327f74f3a3e01e5?player=${player}`,
          headers: {
            Authorization: "Basic NjgyYTBlNmYyMzI3Zjc0ZjNhM2UwMDg5OjY4MmExMDI2MjMyN2Y3NGYzYTNlMDBjZg==",
            "Content-Type": "application/json",
          },
        };
        $http(req).then(
          (data) => {
            $scope.isSpinning = false;

            // Deducir o prêmio ganho com base no win_chart e nas conquistas (achievements)
            const achievements = data.data.achievements || [];
            let wonPrize = null;

            // Procurar no win_chart para mapear o prêmio
            $scope.winChart.forEach((chart) => {
              const rewardItem = chart.reward?.item;
              const rewardType = chart.reward?.type;
              const combinationValue = chart.combination[0]; // Valor da combinação (ex: "bone", "ingresso")

              // Verificar se o achievement corresponde a algum item do win_chart
              if (achievements.some((ach) => ach.item === rewardItem)) {
                // Encontrar o prêmio correspondente na lista de prêmios
                wonPrize = $scope.prizes.find((prize) => prize.value === combinationValue);
              }
            });

            if (wonPrize) {
              $scope.result = wonPrize.title;
              // Atualizar moedas do jogador (deduzir o custo do giro)
              $scope.playerCoins -= $scope.spinCost;

              // O prêmio já foi creditado pelo backend (via win_chart), mas podemos confirmar os dados do jogador
              $scope.getPlayerData(); // Atualizar dados do jogador para refletir moedas e itens ganhos
            } else {
              // Caso não seja possível determinar o prêmio (fallback)
              const randomPrize = $scope.prizes[Math.floor(Math.random() * $scope.prizes.length)];
              $scope.result = randomPrize.title;
              $scope.getPlayerData(); // Atualizar dados do jogador
            }
          },
          (err) => {
            $scope.isSpinning = false;
            alert($scope.t("errorMessage"));
            console.log("Erro ao executar giro:", err);
          },
        );
      }, 5000); // 5 segundos de animação
    };

    // Inicializar o widget
    $scope.getPrizes();
    $scope.getPlayerData();
  },
]);

setTimeout(() => {
  var element = angular.element(document.getElementById("roleta"));
  if (!element.injector()) {
    angular.bootstrap(element, ["roleta"]);
  }
}, 10);