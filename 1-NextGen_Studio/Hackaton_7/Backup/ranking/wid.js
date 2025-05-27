// JavaScript - Correção do Widget de Ranking

angular.module("ranking_copy", []).controller("ranking_copy", [
  "$scope",
  "$http",
  "$location",
  function ($scope, $http, $location) {
    console.log("ranking_copy inicializado");
    
    // Configuração inicial
    $scope.all = [];        // Armazena todos os leaderboards
    $scope.widget = {};     // Armazena dados do widget atual
    $scope.choices = {};    // Armazena escolhas do usuário
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
        day: "Dia"
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
        day: "Day"
      },
    }

    // Idioma padrão
    $scope.currentLang = "pt"

    // Função para traduzir
    $scope.t = function(key) {
      return $scope.translations[$scope.currentLang][key] || key;
    }

    // Função para formatar posições em inglês (1st, 2nd, 3rd, etc)
    $scope.formatPosition = function(position) {
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
    $scope.toggleLanguage = function() {
      $scope.currentLang = $scope.currentLang === "pt" ? "en" : "pt"
    }

    // Função para mostrar mais jogadores
    $scope.showMore = function() {
      $scope.displayLimit += 10;
      $scope.getSelected(); // Recarrega o ranking com mais jogadores
    }

    // Função para obter todos os leaderboards disponíveis
    $scope.getAll = function(){
      var req = {
          method: "GET", 
          url: Funifier.config.service+"/v3/leaderboard", 
          headers: {"Authorization": Funifier.auth.getAuthorization(), "content-type": "application/json", "cache-control": "no-cache"}
      };
      $http(req).then(function(data){
          $scope.all = data.data;
          $scope.choices.leaderboard = $scope.all[0];
          $scope.getSelected();
      }, function(err){
          console.log("Erro ao obter leaderboards:", err);
      });
    };

    // Função para obter a posição do jogador atual no ranking
    $scope.getPlayerPosition = function(){
      var player = Funifier.widget.options["ranking_copy"].player;
      $scope.choices.position = null;
      
      // Verifica se o jogador está no ranking atual
      var pl = $scope.rankingData || [];
      pl.forEach(function(el){
          if(el.player==player){
              $scope.choices.position = el;
          }
      });

      // Se não encontrou no ranking, busca a posição na API
      var id = $scope.choices.leaderboard ? $scope.choices.leaderboard._id : null;
      var scale = $scope.choices.timeScale ? $scope.choices.timeScale : 
                  ($scope.choices.leaderboard && $scope.choices.leaderboard.period ? 
                   $scope.choices.leaderboard.period.timeScale : null);
      var amount = 1;
      
      if(player && !$scope.choices.position && id) {
          var req = {
              method: "GET", 
              url: Funifier.config.service+"/v3/player/" + player + "/status", 
              headers: {"Authorization": Funifier.auth.getAuthorization(), "content-type": "application/json", "cache-control": "no-cache"}
          };
          $http(req).then(function(data){
              $scope.playerData = data.data;
              var o = {};
              var list = $scope.playerData.positions || [];
              list.forEach(function(el){
                  if(el.boardId==id && el.period.timeAmount==amount && el.period.timeScale==scale){
                      o = el;
                  }
              });
              $scope.choices.position = o;
          }, function(err){
              console.log("Erro ao obter posição do jogador:", err);
          });
      }
    };

    // Função para obter dados do leaderboard selecionado
    $scope.getSelected = function(){
      if (!$scope.choices.leaderboard || !$scope.choices.leaderboard._id) {
          console.log("Nenhum leaderboard selecionado");
          return;
      }
      
      var id = $scope.choices.leaderboard._id;
      var params = "?max_results=" + $scope.displayLimit;
      if($scope.choices.timeScale) {
          params += "&time_scale=" + $scope.choices.timeScale + "&time_amount=1";
      }
      var req = {
          method: "GET", 
          url: Funifier.config.service+"/v3/leaderboard/" + id + "/leaders" + params, 
          headers: {"Authorization": Funifier.auth.getAuthorization(), "content-type": "application/json", "cache-control": "no-cache"}
      };
      $http(req).then(function(data){
          // Processa os dados do ranking e adiciona indicadores de movimento
          angular.forEach(data.data.leaders, function(l){
              // Adiciona uma imagem padrão se a imagem não estiver definida
              if (!l.image || l.image === '') {
                  l.image = 'https://s3.amazonaws.com/funifier-widget/catalog_new/leaderboard/default/images/default-avatar.png';
              }
              
              if (l.position != undefined && l.previous_position != undefined) {
                  if (l.previous_position == 0 && l.position > 0) {
                      l.move = 'keeps';
                  } else {
                      if (l.position == l.previous_position) {
                          l.move = 'keeps';
                      }
                      if (l.position < l.previous_position) {
                          l.move = 'up';
                      }
                      if (l.position > l.previous_position) {
                          l.move = 'down';
                      }
                  }    
              } else {
                  l.move = 'keeps';
              }
          });
          
          $scope.widget = data.data;
          $scope.rankingData = data.data.leaders;
          
          // Processar unidades de operação
          var unit = $scope.widget.operation_unit;
          if(unit && unit.title) {
              unit.string = unit.title.toLowerCase();
          } else if (unit && unit.type) {
              unit.string = unit.type.toLowerCase() + "s";
          }
          
          $scope.getPlayerPosition();
      }, function(err){
          console.log("Erro ao obter dados do leaderboard:", err);
      });
    };

    // Obter nível, moedas e outros dados do jogador
    $scope.getLevelPosition = function() {
      if (!$scope.playerData) return 1
      return $scope.playerData.level_progress && $scope.playerData.level_progress.level
        ? $scope.playerData.level_progress.level.position + 1
        : 1
    }

    $scope.getNextLevelPosition = function() {
      if (!$scope.playerData) return 2
      return $scope.playerData.level_progress && $scope.playerData.level_progress.next_level
        ? $scope.playerData.level_progress.next_level.position + 1
        : 2
    }

    $scope.getProgressPercent = function() {
      if (!$scope.playerData || !$scope.playerData.level_progress) return 0
      return $scope.playerData.level_progress.percent || 0
    }

    $scope.getCoins = function() {
      if (!$scope.playerData || !$scope.playerData.point_categories) return 0
      return $scope.playerData.point_categories.moedas || 0
    }

    $scope.getLevelName = function() {
      if (!$scope.playerData || !$scope.playerData.level) return ""
      return $scope.playerData.level.level || ""
    }
    
    // Inicializar o widget
    $scope.getAll();
  },
]);

setTimeout(function () {
    var element = angular.element(document.getElementById('ranking_copy'));
    if (!element.injector()) {
        angular.bootstrap(element, ['ranking_copy']);
    }
}, 10);