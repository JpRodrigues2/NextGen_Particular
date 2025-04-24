angular.module('gamificacaoApp', [])
.controller('CadastroController', function($scope, $http) {
  $scope.novoUsuario = {};

  $scope.fazerCadastro = function() {
    var req = {
      method: 'POST',
      url: 'https://service2.funifier.com/v3/player',
      headers: {
        "Authorization": "Basic NjgwMmQ0OTkyMzI3Zjc0ZjNhMzYyNDBmOjY4MDNjNzFlMjMyN2Y3NGYzYTM2MzVkYQ==",
        "Content-Type": "application/json"
      },
      data: {
        _id: $scope.novoUsuario._id,
        name: $scope.novoUsuario.name,
        email: $scope.novoUsuario.email,
        password: $scope.novoUsuario.password,
        extra: {
          country: $scope.novoUsuario.telefone
        }
      }
    };

    $http(req).then(function(response) {
      console.log("Cadastro realizado:", response.data);
      // Apenas após o sucesso do cadastro
      window.location.href = "login.html";
    }, function(error) {
      console.error("Erro no cadastro:", error);
    });
  };
});
