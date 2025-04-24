angular.module('spaceRaceApp', [])
  .controller('RankingController', function($scope, $http) {
    const token = "Bearer SEU_TOKEN_AQUI"; // insira o token real

    let playersInfo = {};

    // Primeiro: buscar todos os dados dos jogadores
    $http({
      method: 'GET',
      url: 'https://service2.funifier.com/v3/player',
      headers: {
        "Authorization": token
      }
    }).then(function(response) {
      response.data.forEach(player => {
        playersInfo[player._id] = {
          name: player.name,
          cor: player.extra?.cor || 'white',
          foto: player.image?.medium?.url || 'https://via.placeholder.com/40'
        };
      });

      // Depois: buscar os dados de ranking
      $http({
        method: 'POST',
        url: 'https://service2.funifier.com/v3/leaderboard/ETnxIAo/leader/aggregate?period=&live=true',
        headers: {
          "Authorization": token
        },
        data: []
      }).then(function(rankingResponse) {
        $scope.players = rankingResponse.data.map(rank => {
          const info = playersInfo[rank.player] || {};
          return {
            name: info.name || rank.name,
            total: rank.total,
            position: rank.position,
            cor: info.cor,
            foto: info.foto
          };
        });
      });
    });
  });
