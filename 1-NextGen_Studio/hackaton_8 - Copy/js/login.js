var angular = window.angular // Declare angular

angular.module("bbGamificationApp", ["ngRoute"]).controller("LoginController", ($scope, $http, $window, $location) => {
  // Inicializar objeto de credenciais
  $scope.credentials = {
    username: "",
    password: "",
  }

  // Estado de carregamento
  $scope.isLoading = false

  // Mensagem de erro
  $scope.loginError = null

  // Função de login
  $scope.login = () => {
    // Resetar mensagem de erro
    $scope.loginError = null

    // Validar formulário
    if (!$scope.credentials.username || !$scope.credentials.password) {
      $scope.loginError = "Por favor, preencha todos os campos."
      return
    }

    // Definir estado de carregamento
    $scope.isLoading = true

    // Preparar requisição
    var req = {
      method: "POST",
      url: "https://service2.funifier.com/v3/auth/token",
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzUxMiIsImNhbGciOiJHWklQIn0.H4sIAAAAAAAAAE2MywrCMBBFf0Wy7qJ5dVr3gqAguHArk2QCgWBDkqIi_rtBRdwdLueeB8MUdnRnazaMwoCQVkgBHpSXKElNyrCOFTsnakomdGeMsVtdc6j0QUeRfowVDRZqH7R2Xi71G5bOwn9YCK-btBTKzdicDluzP7YhYHtwUDBMGhTvGN3Sexhl32vFny_Vwt5dsQAAAA.uzyDoag_oQ2zvRbEJtuvy6bCbEJ_fY91KK0JDHc1U-YPKd9SP_C77t-1iH3s_dt7Z8KmY8FgWT7bK2qTij14xw",
        "Content-Type": "application/json",
      },
      data: {
        apiKey: "682b723c2327f74f3a3e494b",
        grant_type: "password",
        username: $scope.credentials.username,
        password: $scope.credentials.password,
      },
    }

    // Enviar requisição
    $http(req).then(
      (response) => {
        console.log("Login bem-sucedido:", response.data)

        // Armazenar token no localStorage
        $window.localStorage.setItem("bbToken", response.data.access_token)

        // Armazenar ID do usuário se disponível
        if (response.data.user && response.data.user.id) {
          $window.localStorage.setItem("bbUserId", response.data.user.id)
        } else {
          // Usar o nome de usuário como ID se o ID não estiver disponível
          $window.localStorage.setItem("bbUserId", $scope.credentials.username)
        }

        // Redirecionar para o dashboard
        $window.location.href = "../views/dashboard.html"
      },
      (error) => {
        console.error("Erro de login:", error)

        // Resetar estado de carregamento
        $scope.isLoading = false

        // Definir mensagem de erro
        if (error.status === 401) {
          $scope.loginError = "Usuário ou senha incorretos."
        } else {
          $scope.loginError = "Erro ao fazer login. Por favor, tente novamente."
        }
      },
    )
  }

  // Verificar se o usuário já está logado
  var existingToken = $window.localStorage.getItem("bbToken")
  if (existingToken) {
    // Redirecionar para o dashboard se o token existir
    $window.location.href = "../views/dashboard.html"
  }
})
