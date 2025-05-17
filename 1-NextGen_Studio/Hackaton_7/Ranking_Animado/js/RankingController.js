angular.module('gamificacaoApp', [])
.controller('RankingController', function($scope) {
  $scope.jogadores = [
    { nome: 'João', moedas: 120, xp: 50, posicao: 1, tipo: 'carro1' },
    { nome: 'Maria', moedas: 95, xp: 80, posicao: 2, tipo: 'carro2' },
    { nome: 'Carlos', moedas: 300, xp: 120, posicao: 3, tipo: 'carro3' }
  ];
});
