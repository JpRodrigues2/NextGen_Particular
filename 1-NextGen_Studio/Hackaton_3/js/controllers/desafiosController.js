angular.module('desafiosApp')
.controller('DesafiosController', ['$scope', '$http', '$window', function($scope, $http, $window) {
  // Verifica se o usuário está autenticado
  const token = localStorage.getItem('authToken');
  if (!token) {
    $window.location.href = 'login.html';
    return;
  }

  $scope.desafios = [];

  // Função auxiliar para extrair pontos por categoria
  $scope.getReward = function(challenge, category) {
    const p = (challenge.points || []).find(pt => pt.category === category);
    return p ? p.total : 0;
  };

  // Carrega os desafios da API
  $scope.loadDesafios = function() {
    $http({
      method: 'GET',
      url: 'https://service2.funifier.com/v3/challenge',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    }).then(function(response) {
      $scope.desafios = response.data;
    }).catch(function(error) {
      console.error('Erro ao carregar desafios:', error);
      alert('Não foi possível carregar os desafios.');
    });
  };

  // Inicializa carregando
  $scope.loadDesafios();
}]);
