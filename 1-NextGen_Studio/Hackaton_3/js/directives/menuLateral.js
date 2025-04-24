angular.module('rankingApp')
.directive('menuLateral', function() {
  return {
    restrict: 'E',
    template: `
      <div class="menu-lateral">
        <ul>
          <li><a href="dashboard.html">Dashboard</a></li>
          <li><a href="ranking.html" class="ativo">Ranking</a></li>
          <li><a href="desafios.html">Desafios</a></li>
          <li><a href="loja.html">Loja Virtual</a></li>
          <li><a href="#" ng-click="logout()">Logout</a></li>
        </ul>
      </div>
    `,
    controller: function($scope) {
      $scope.logout = function() {
        localStorage.clear();
        window.location.href = "login.html";
      };
    }
  };
});
