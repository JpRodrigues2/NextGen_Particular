/* global angular */
angular.module("bbGamificationApp", ["ngRoute"]).controller("ChallengesController", ($scope, $http, $window) => {
  // Verificar se o usuário está logado
  const token = $window.localStorage.getItem("bbToken")
  const userId = $window.localStorage.getItem("bbUserId")

  if (!token) {
    // Redirecionar para login se não houver token
    $window.location.href = "login.html"
    return
  }

  // Inicializar variáveis
  $scope.challenges = []
  $scope.isLoading = true

  // Função para buscar desafios da API
  function fetchChallenges() {
    const req = {
      method: "GET",
      url: "https://service2.funifier.com/v3/challenge",
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzUxMiIsImNhbGciOiJHWklQIn0.H4sIAAAAAAAAAE2MywrCMBBFf0Wy7qJ5dVr3gqAguHArk2QCgWBDkqIi_rtBRdwdLueeB8MUdnRnazaMwoCQVkgBHpSXKElNyrCOFTsnakomdGeMsVtdc6j0QUeRfowVDRZqH7R2Xi71G5bOwn9YCK-btBTKzdicDluzP7YhYHtwUDBMGhTvGN3Sexhl32vFny_Vwt5dsQAAAA.uzyDoag_oQ2zvRbEJtuvy6bCbEJ_fY91KK0JDHc1U-YPKd9SP_C77t-1iH3s_dt7Z8KmY8FgWT7bK2qTij14xw",
        "Content-Type": "application/json",
      },
    }

    $http(req).then(
      (response) => {
        console.log("Desafios obtidos:", response.data)

        // Filtrar desafios que começam com "ADM"
        const filteredData = response.data.filter((challenge) => !challenge.challenge.startsWith("ADM"))

        $scope.challenges = filteredData
        $scope.isLoading = false
      },
      (error) => {
        console.error("Erro ao buscar desafios:", error)
        $scope.isLoading = false
        $scope.challenges = []
      },
    )
  }

  // Função para voltar ao dashboard
  $scope.goToDashboard = () => {
    $window.location.href = "dashboard.html"
  }

  // Função de logout
  $scope.logout = () => {
    // Limpar localStorage
    $window.localStorage.removeItem("bbToken")
    $window.localStorage.removeItem("bbUserId")

    // Redirecionar para login
    $window.location.href = "login.html"
  }

  // Inicializar buscando os desafios
  fetchChallenges()
})
