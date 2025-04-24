angular.module('gamificacaoApp', [])
.controller('DashboardController', function($scope, $http, $window) {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');

  if (!token || !userId) {
    $window.location.href = 'login.html';
  }

  $scope.logout = function() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    $window.location.href = 'login.html';
  };

  var req = {
    method: 'GET',
    url: `https://service2.funifier.com/v3/player/${userId}/status`,
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    }
  };

  $http(req).then(
    function (response) {
      $scope.dados = response.data;
    },
    function (error) {
      console.error("Erro ao carregar dados do jogador:", error);
    }
  );
});
