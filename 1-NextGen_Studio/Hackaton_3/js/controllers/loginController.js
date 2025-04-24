angular.module('gamificacaoApp', [])
.controller('LoginController', function($scope, $http, $window) {
  $scope.usuario = {};

  $scope.fazerLogin = function() {
    var req = {
      method: 'POST',
      url: 'https://service2.funifier.com/v3/auth/token',
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzUxMiIsImNhbGciOiJHWklQIn0.H4sIAAAAAAAAAD2LywoCIRRAfyVcu_A13qZ9ELTsA-KmVxAkRZ1qiP49YWB2h8M5X4YlXmllJ2aPQnkzz0orCGCCRm2VEYFx1lwuNJJK6O-YEj-8a-y0oadEO2PHBzYaDzqXl2cf1_m2XtyrDrc0qrvIQ0QcgQQzCVAgJGf0KZuwAJOQvz-L6mJRoAAAAA.QC6k8D4_NTQ_Pu_scRhHqN_gdxVO_RiEV3Fz0G8v14MDqgG9rbFWDdf1JZIzdHgUt9QUWGOjInEtkqsrGJ8vFg", // Insira o token real da Funifier
        "Content-Type": "application/json"
      },
      data: {
        apiKey: "6802d4992327f74f3a36240f",
        grant_type: "password",
        username: $scope.usuario.username,
        password: $scope.usuario.password
      }
    };

    $http(req).then(function(response) {
      console.log("Login bem-sucedido:", response.data);

      const token = response.data.access_token;
      const id = $scope.usuario.username;

      // Salva os dados no localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', id);

      // Redireciona para a página do dashboard
      $window.location.href = '../view/dashboard.html'; // <-- ajuste o caminho se necessário
    }, function(error) {
      console.error("Erro no login:", error);
      alert("CPF ou senha inválidos.");
    });
  };
});
