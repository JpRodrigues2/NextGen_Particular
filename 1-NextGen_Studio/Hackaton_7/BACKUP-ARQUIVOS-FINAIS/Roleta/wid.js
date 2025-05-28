angular.module("roleta", []).controller("roleta", [
  "$scope",
  "$http",
  "$location",
  ($scope, $http, $location) => {
    console.log("roleta inicializado");

    // Configuração inicial
    $scope.prizes = [];
    $scope.winChart = [];
    $scope.playerData = {};
    $scope.playerCoins = 0;
    $scope.isSpinning = false;
    $scope.result = null;
    $scope.spinCost = 20;
    $scope.wheelRotation = 0;

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

    $scope.currentLang = "pt";

    $scope.t = (key) => $scope.translations[$scope.currentLang][key] || key;

    $scope.toggleLanguage = () => {
      $scope.currentLang = $scope.currentLang === "pt" ? "en" : "pt";
    };

    $scope.whitelabelConfig = null;

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

    function applyWhitelabelStyles() {
      var cfg = $scope.whitelabelConfig;
      if (!cfg) return;

      if (cfg.background_color) {
        document.querySelector(".wheel-content").style.backgroundColor = cfg.background_color;
      } else {
        console.error("[WhiteLabel] Background color not found in DB:", {
          key: "background_color",
          config: cfg,
          reason: "No background_color found in DB.",
        });
      }

      if (cfg.header_color) {
        document.querySelector(".wheel-header").style.backgroundColor = cfg.header_color;
      } else {
        console.error("[WhiteLabel] Header color not found in DB:", {
          key: "header_color",
          config: cfg,
          reason: "No header_color found in DB.",
        });
      }

      if (cfg.border_color) {
        document.getElementById("roleta").style.border = "2px solid " + cfg.border_color;
      } else {
        console.error("[WhiteLabel] Border color not found in DB:", {
          key: "border_color",
          config: cfg,
          reason: "No border_color found in DB.",
        });
      }

      if (cfg.font) {
        document.getElementById("roleta").style.fontFamily = cfg.font;
      } else {
        console.error("[WhiteLabel] Font not found in DB:", {
          key: "font",
          config: cfg,
          reason: "No font found in DB.",
        });
      }

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

      if (cfg.button_color) {
        const style = document.createElement("style");
        style.innerHTML = `
          #roleta .spin-button {
            background-color: ${cfg.button_color} !important;
          }
          #roleta .spin-button:hover:not(.spinning) {
            background-color: ${lightenDarkenColor(cfg.button_color, -20)} !important;
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

      // Apply dynamic styles to additional elements
      const languageToggle = document.querySelector("#roleta .language-toggle");
      if (languageToggle) languageToggle.classList.add("dynamic-style");
    }

    // Função auxiliar para ajustar a cor do botão ao hover
    function lightenDarkenColor(col, amt) {
      let usePound = false;
      if (col[0] === "#") {
        col = col.slice(1);
        usePound = true;
      }
      const num = parseInt(col, 16);
      let r = (num >> 16) + amt;
      let g = ((num >> 8) & 0x00ff) + amt;
      let b = (num & 0x0000ff) + amt;
      if (r > 255) r = 255;
      else if (r < 0) r = 0;
      if (g > 255) g = 255;
      else if (g < 0) g = 0;
      if (b > 255) b = 255;
      else if (b < 0) b = 0;
      return (usePound ? "#" : "") + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
    }

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
            fetchWhitelabelConfig();
          }
        },
        (err) => {
          console.log("Erro ao obter prêmios:", err);
        },
      );
    };

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

    $scope.spinWheel = () => {
      if ($scope.isSpinning) return;

      if ($scope.playerCoins < $scope.spinCost) {
        alert($scope.t("noCoins"));
        return;
      }

      $scope.isSpinning = true;
      $scope.result = null;

      const sectionAngle = 360 / $scope.prizes.length;

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

            const achievements = data.data.achievements || [];
            let wonPrize = null;
            let winningIndex = -1;

            $scope.winChart.forEach((chart) => {
              const rewardItem = chart.reward?.item;
              const rewardType = chart.reward?.type;
              const combinationValue = chart.combination[0];

              if (achievements.some((ach) => ach.item === rewardItem)) {
                wonPrize = $scope.prizes.find((prize) => prize.value === combinationValue);
                if (wonPrize) {
                  winningIndex = $scope.prizes.findIndex((prize) => prize.value === combinationValue);
                }
              }
            });

            if (!wonPrize && achievements.length > 0) {
              const firstAchievementItem = achievements[0].item;
              wonPrize = $scope.prizes.find((prize) => prize.value === firstAchievementItem);
              if (wonPrize) {
                winningIndex = $scope.prizes.findIndex((prize) => prize.value === firstAchievementItem);
              }
            }

            if (!wonPrize) {
              winningIndex = Math.floor(Math.random() * $scope.prizes.length);
              wonPrize = $scope.prizes[winningIndex];
            }

            const baseAngle = winningIndex * sectionAngle;
            const randomOffset = Math.random() * sectionAngle * 0.8 - (sectionAngle * 0.4);
            const finalAngle = baseAngle + randomOffset;

            const totalRotations = 3 * 360;
            $scope.wheelRotation = totalRotations + finalAngle;

            const style = document.createElement("style");
            style.innerHTML = `
              @keyframes spin {
                0% { transform: rotate(0deg); }
                60% { transform: rotate(900deg); }
                80% { transform: rotate(1080deg); }
                90% { transform: rotate(${1080 + (finalAngle * 0.3)}deg); }
                97% { transform: rotate(${1080 + (finalAngle * 0.6)}deg); }
                100% { transform: rotate(${1080 + finalAngle}deg); }
              }
            `;
            document.head.appendChild(style);

            $scope.result = wonPrize.title;

            $scope.playerCoins -= $scope.spinCost;
            $scope.getPlayerData();
          },
          (err) => {
            $scope.isSpinning = false;
            alert($scope.t("errorMessage"));
            console.log("Erro ao executar giro:", err);
          },
        );
      }, 100);
    };

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