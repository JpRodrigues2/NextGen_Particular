angular.module("ranking_copy", []).controller("ranking_copy", [
  "$scope",
  "$http",
  "$location",
  ($scope, $http, $location) => {
    console.log("ranking_copy inicializado");

    // Configuração inicial
    $scope.all = []; // Armazena todos os leaderboards
    $scope.widget = {}; // Armazena dados do widget atual
    $scope.choices = {}; // Armazena escolhas do usuário
    $scope.playerData = {}; // Dados do jogador atual
    $scope.rankingData = []; // Dados do ranking
    $scope.displayLimit = 10; // Limite de exibição

    // Configuração de idiomas para a interface
    $scope.translations = {
      pt: {
        rankingTitle: "RANKING",
        showMore: "Mostrar mais",
        noRankingData: "Nenhum dado de ranking disponível",
        place: "lugar",
        playerStatus: "STATUS DO JOGADOR",
        totalPoints: "PONTUAÇÃO TOTAL",
        level: "NÍVEL",
        coins: "MOEDAS",
        levelProgress: "Progresso de nível",
        nextLevel: "Nível",
        year: "Ano",
        week: "Semana",
        day: "Dia",
      },
      en: {
        rankingTitle: "RANKING",
        showMore: "Show more",
        noRankingData: "No ranking data available",
        place: "place",
        playerStatus: "PLAYER STATUS",
        totalPoints: "TOTAL POINTS",
        level: "LEVEL",
        coins: "COINS",
        levelProgress: "Level Progress",
        nextLevel: "Level",
        year: "Year",
        week: "Week",
        day: "Day",
      },
    };

    // Idioma padrão
    $scope.currentLang = "pt";

    // Função para traduzir
    $scope.t = (key) => $scope.translations[$scope.currentLang][key] || key;

    // Função para formatar posições em inglês (1st, 2nd, 3rd, etc)
    $scope.formatPosition = (position) => {
      if (position % 10 == 1 && position % 100 != 11) {
        return position + "st";
      } else if (position % 10 == 2 && position % 100 != 12) {
        return position + "nd";
      } else if (position % 10 == 3 && position % 100 != 13) {
        return position + "rd";
      } else {
        return position + "th";
      }
    };

    // Função para alternar idioma
    $scope.toggleLanguage = () => {
      $scope.currentLang = $scope.currentLang === "pt" ? "en" : "pt";
    };

    // Função para mostrar mais jogadores
    $scope.showMore = () => {
      $scope.displayLimit += 10;
      $scope.getSelected(); // Recarrega o ranking com mais jogadores
    };

    // --- White-label config ---
    $scope.whitelabelConfig = null;

    // Fetch white-label config from DB
    function fetchWhitelabelConfig() {
      // Fetch global config
      $http({
        method: "GET",
        url: Funifier.config.service + "/v3/database/ranking__c?strict=true&q=_id:'global'",
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

    // Apply styles from the config to the widget
    function applyWhitelabelStyles() {
      var cfg = $scope.whitelabelConfig;
      if (!cfg) return;

      // Background color geral
      if (cfg.background_color) {
        document.querySelector(".ranking-content").style.backgroundColor = cfg.background_color;
      } else {
        console.error("[WhiteLabel] Background color not found in DB:", {
          key: "background_color",
          config: cfg,
          reason: "No background_color found in DB.",
        });
      }

      // Header color
      if (cfg.header_color) {
        document.querySelector(".ranking-header").style.backgroundColor = cfg.header_color;
      } else {
        console.error("[WhiteLabel] Header color not found in DB:", {
          key: "header_color",
          config: cfg,
          reason: "No header_color found in DB.",
        });
      }

      // Border color
      if (cfg.border_color) {
        document.getElementById("ranking_copy").style.border = "2px solid " + cfg.border_color;
      } else {
        console.error("[WhiteLabel] Border color not found in DB:", {
          key: "border_color",
          config: cfg,
          reason: "No border_color found in DB.",
        });
      }

      // Font
      if (cfg.font) {
        document.getElementById("ranking_copy").style.fontFamily = cfg.font;
      } else {
        console.error("[WhiteLabel] Font not found in DB:", {
          key: "font",
          config: cfg,
          reason: "No font found in DB.",
        });
      }

      // Text color
      if (cfg.text_color) {
        // Aplicar cor do texto principal
        const style = document.createElement("style");
        style.innerHTML = `
          #ranking_copy .player-name,
          #ranking_copy .player-position,
          #ranking_copy .score-value {
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

      // Current player highlight color
      if (cfg.current_player_color) {
        const style = document.createElement("style");
        style.innerHTML = `
          #ranking_copy .current-player {
            background-color: ${cfg.current_player_color} !important;
          }
        `;
        document.head.appendChild(style);
      } else {
        console.error("[WhiteLabel] Current player color not found in DB:", {
          key: "current_player_color",
          config: cfg,
          reason: "No current_player_color found in DB.",
        });
      }

      // First place color
      if (cfg.first_place_color) {
        const style = document.createElement("style");
        style.innerHTML = `
          #ranking_copy .player-first {
            background-color: ${cfg.first_place_color} !important;
          }
        `;
        document.head.appendChild(style);
      } else {
        console.error("[WhiteLabel] First place color not found in DB:", {
          key: "first_place_color",
          config: cfg,
          reason: "No first_place_color found in DB.",
        });
      }

      // Second place color
      if (cfg.second_place_color) {
        const style = document.createElement("style");
        style.innerHTML = `
          #ranking_copy .player-second {
            background-color: ${cfg.second_place_color} !important;
          }
        `;
        document.head.appendChild(style);
      } else {
        console.error("[WhiteLabel] Second place color not found in DB:", {
          key: "second_place_color",
          config: cfg,
          reason: "No second_place_color found in DB.",
        });
      }

      // Third place color
      if (cfg.third_place_color) {
        const style = document.createElement("style");
        style.innerHTML = `
          #ranking_copy .player-third {
            background-color: ${cfg.third_place_color} !important;
          }
        `;
        document.head.appendChild(style);
      } else {
        console.error("[WhiteLabel] Third place color not found in DB:", {
          key: "third_place_color",
          config: cfg,
          reason: "No third_place_color found in DB.",
        });
      }

      // Other players color
      if (cfg.other_players_color) {
        const style = document.createElement("style");
        style.innerHTML = `
          #ranking_copy .ranking-player:not(.player-first):not(.player-second):not(.player-third):not(.current-player) {
            background-color: ${cfg.other_players_color} !important;
          }
        `;
        document.head.appendChild(style);
      } else {
        console.error("[WhiteLabel] Other players color not found in DB:", {
          key: "other_players_color",
          config: cfg,
          reason: "No other_players_color found in DB.",
        });
      }

      // Avatar border color
      if (cfg.avatar_border_color) {
        const style = document.createElement("style");
        style.innerHTML = `
          #ranking_copy .player-avatar {
            border-color: ${cfg.avatar_border_color} !important;
          }
        `;
        document.head.appendChild(style);
      } else {
        console.error("[WhiteLabel] Avatar border color not found in DB:", {
          key: "avatar_border_color",
          config: cfg,
          reason: "No avatar_border_color found in DB.",
        });
      }

      // Visible leaderboards (filter based on user groups)
      if (cfg.visible_leaderboards && Array.isArray(cfg.visible_leaderboards)) {
        // Filter leaderboards based on configuration
        $scope.all = $scope.all.filter((leaderboard) => {
          return cfg.visible_leaderboards.includes(leaderboard._id);
        });

        // Update selected leaderboard if current one is not visible
        if ($scope.choices.leaderboard && !cfg.visible_leaderboards.includes($scope.choices.leaderboard._id)) {
          $scope.choices.leaderboard = $scope.all[0] || null;
          if ($scope.choices.leaderboard) {
            $scope.getSelected();
          }
        }
      } else {
        console.error("[WhiteLabel] Visible leaderboards not found in DB:", {
          key: "visible_leaderboards",
          config: cfg,
          reason: "No visible_leaderboards found in DB.",
        });
      }

      // Apply dynamic styles to additional elements
      const languageToggle = document.querySelector("#ranking_copy .language-toggle");
      if (languageToggle) languageToggle.classList.add("dynamic-style");
    }

    // Função para obter todos os leaderboards disponíveis
    $scope.getAll = () => {
      var req = {
        method: "GET",
        url: Funifier.config.service + "/v3/leaderboard",
        headers: {
          Authorization: typeof Funifier !== "undefined" && Funifier.auth ? Funifier.auth.getAuthorization() : null,
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
      };
      $http(req).then(
        (data) => {
          $scope.all = data.data;

          // Fetch white-label config after getting leaderboards
          fetchWhitelabelConfig();

          $scope.choices.leaderboard = $scope.all[0];
          $scope.getSelected();
        },
        (err) => {
          console.log("Erro ao obter leaderboards:", err);
        },
      );
    };

    // Função para obter a posição do jogador atual no ranking
    $scope.getPlayerPosition = () => {
      var player =
        typeof Funifier !== "undefined" &&
        Funifier.widget &&
        Funifier.widget.options &&
        Funifier.widget.options["ranking_copy"]
          ? Funifier.widget.options["ranking_copy"].player
          : null;
      $scope.choices.position = null;

      // Verifica se o jogador está no ranking atual
      var pl = $scope.rankingData || [];
      pl.forEach((el) => {
        if (el.player == player) {
          $scope.choices.position = el;
        }
      });

      // Se não encontrou no ranking, busca a posição na API
      var id = $scope.choices.leaderboard ? $scope.choices.leaderboard._id : null;
      var scale = $scope.choices.timeScale
        ? $scope.choices.timeScale
        : $scope.choices.leaderboard && $scope.choices.leaderboard.period
          ? $scope.choices.leaderboard.period.timeScale
          : null;
      var amount = 1;

      if (player && !$scope.choices.position && id) {
        var req = {
          method: "GET",
          url: Funifier.config.service + "/v3/player/" + player + "/status",
          headers: {
            Authorization: typeof Funifier !== "undefined" && Funifier.auth ? Funifier.auth.getAuthorization() : null,
            "content-type": "application/json",
            "cache-control": "no-cache",
          },
        };
        $http(req).then(
          (data) => {
            $scope.playerData = data.data;
            var o = {};
            var list = $scope.playerData.positions || [];
            list.forEach((el) => {
              if (el.boardId == id && el.period.timeAmount == amount && el.period.timeScale == scale) {
                o = el;
              }
            });
            $scope.choices.position = o;
          },
          (err) => {
            console.log("Erro ao obter posição do jogador:", err);
          },
        );
      }
    };

    // Função para obter dados do leaderboard selecionado
    $scope.getSelected = () => {
      if (!$scope.choices.leaderboard || !$scope.choices.leaderboard._id) {
        console.log("Nenhum leaderboard selecionado");
        return;
      }

      var id = $scope.choices.leaderboard._id;
      var params = "?max_results=" + $scope.displayLimit;
      if ($scope.choices.timeScale) {
        params += "&time_scale=" + $scope.choices.timeScale + "&time_amount=1";
      }
      var req = {
        method: "GET",
        url: Funifier.config.service + "/v3/leaderboard/" + id + "/leaders" + params,
        headers: {
          Authorization: typeof Funifier !== "undefined" && Funifier.auth ? Funifier.auth.getAuthorization() : null,
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
      };
      $http(req).then(
        (data) => {
          // Processa os dados do ranking e adiciona indicadores de movimento
          angular.forEach(data.data.leaders, (l) => {
            // Adiciona uma imagem padrão se a imagem não estiver definida
            if (!l.image || l.image === "") {
              l.image =
                "https://s3.amazonaws.com/funifier-widget/catalog_new/leaderboard/default/images/default-avatar.png";
            }

            if (l.position != undefined && l.previous_position != undefined) {
              if (l.previous_position == 0 && l.position > 0) {
                l.move = "keeps";
              } else {
                if (l.position == l.previous_position) {
                  l.move = "keeps";
                }
                if (l.position < l.previous_position) {
                  l.move = "up";
                }
                if (l.position > l.previous_position) {
                  l.move = "down";
                }
              }
            } else {
              l.move = "keeps";
            }
          });

          $scope.widget = data.data;
          $scope.rankingData = data.data.leaders;

          // Processar unidades de operação
          var unit = $scope.widget.operation_unit;
          if (unit && unit.title) {
            unit.string = unit.title.toLowerCase();
          } else if (unit && unit.type) {
            unit.string = unit.type.toLowerCase() + "s";
          }

          $scope.getPlayerPosition();
        },
        (err) => {
          console.log("Erro ao obter dados do leaderboard:", err);
        },
      );
    };

    // Obter nível, moedas e outros dados do jogador
    $scope.getLevelPosition = () => {
      if (!$scope.playerData) return 1;
      return $scope.playerData.level_progress && $scope.playerData.level_progress.level
        ? $scope.playerData.level_progress.level.position + 1
        : 1;
    };

    $scope.getNextLevelPosition = () => {
      if (!$scope.playerData) return 2;
      return $scope.playerData.level_progress && $scope.playerData.level_progress.next_level
        ? $scope.playerData.level_progress.next_level.position + 1
        : 2;
    };

    $scope.getProgressPercent = () => {
      if (!$scope.playerData || !$scope.playerData.level_progress) return 0;
      return $scope.playerData.level_progress.percent || 0;
    };

    $scope.getCoins = () => {
      if (!$scope.playerData || !$scope.playerData.point_categories) return 0;
      return $scope.playerData.point_categories.moedas || 0;
    };

    $scope.getLevelName = () => {
      if (!$scope.playerData || !$scope.playerData.level) return "";
      return $scope.playerData.level.level || "";
    };

    // Inicializar o widget
    $scope.getAll();
  },
]);

setTimeout(() => {
  var element = angular.element(document.getElementById("ranking_copy"));
  if (!element.injector()) {
    angular.bootstrap(element, ["ranking_copy"]);
  }
}, 10);