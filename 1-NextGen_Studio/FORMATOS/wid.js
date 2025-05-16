angular.module('FP02W5', []).controller('FP02W5', ["$scope","$http", function ($scope, $http) {
    $scope.challenges = [];
  
    const AUTH_HEADER = Funifier.auth.getAuthorization();
    const CONFIG_URL = "https://service2.funifier.com/v3/database/funpack02__c?strict=true&q=_id:'global'";
  
    // Aplica estilos customizados do banco
    function applyCustomStyle(config) {
      const container = document.getElementById('FP02W5');
      if (!container) return;
  
      // Background
      if (config.background_color) {
        container.style.backgroundColor = config.background_color;
      }
  
      // Font color
      if (config.font_color) {
        container.querySelectorAll('*').forEach(el => el.style.color = config.font_color);
      }
  
      // Border color
      if (config.border_color) {
        container.style.border = '3px solid ' + config.border_color;
      }
  
      // Font
      if (config.font) {
        const formattedFont = config.font.replace(/ /g, '+');
        const linkId = 'dynamic-font-link-widget';
        if (!document.getElementById(linkId)) {
          const link = document.createElement('link');
          link.id = linkId;
          link.rel = 'stylesheet';
          link.href = 'https://fonts.googleapis.com/css?family=' + formattedFont;
          document.head.appendChild(link);
        }
        container.style.fontFamily = config.font + ', Arial, sans-serif';
      }
  
      // Logo (opcional: usar onde quiser)
      if (config.logo) {
        $scope.logoUrl = config.logo;
      }
    }
  
    // Requisição da API de configuração
    function loadVisualConfig() {
      $http({
        method: 'GET',
        url: CONFIG_URL,
        headers: {
          "Authorization": AUTH_HEADER,
          "Content-Type": "application/json"
        }
      }).then(function(response){
        if (response.data && response.data[0]) {
          applyCustomStyle(response.data[0]);
        }
      }, function(error){
        console.error("Erro ao carregar config visual:", error);
      });
    }
  
    // Requisição da API de desafios
    $scope.list = function () {
      $http({
          method: "POST",
          url: Funifier.config.service + '/v3/database/challenge/aggregate',
          headers: {"Authorization": AUTH_HEADER, "content-type": "application/json"},
          data:[{"$sort":{ "name":1 }}]
      }).then(function(response){
          $scope.challenges = response.data;
      }, function(err){
          console.error(err);
      });
    };
  
    // Inicialização
    $scope.list();
    loadVisualConfig();
  }]);
  
  setTimeout(function () {
    const element = angular.element(document.getElementById('FP02W5'));
    if (!element.injector()) {
      angular.bootstrap(element, ['FP02W5']);
    }
  }, 10);
  