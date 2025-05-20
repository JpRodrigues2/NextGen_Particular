angular.module('ENQ01', ['pascalprecht.translate'])

  .config(['$translateProvider', function($translateProvider) {
    $translateProvider.determinePreferredLanguage();
    $translateProvider.fallbackLanguage('pt-br');

    $translateProvider.translations('en', {});
    $translateProvider.translations('pt-br', {});
  }])

  .controller('ENQ01', ['$scope', '$http', '$translate', function($scope, $http, $translate) {

    $scope.obj = {};
    $scope.log = {};

    $scope.currentLang = $translate.use() === 'pt_BR' ? 'pt-br' : '' || 'pt-br';
    debugger;

    $scope.setLanguage = function(lang) {
      $translate.use(lang);
      $scope.currentLang = lang;
    };

    $scope.load = function(){
      var req = {
        method: "POST", 
        url: Funifier.config.service + "/v3/database/enquete__c/aggregate", 
        headers: {
          "Authorization": Funifier.auth.getAuthorization(), 
          "content-type": "application/json", 
          "cache-control": "no-cache"
        },
        data: [
          {"$match": {"active": true}},
          {"$sort": {"created": -1}},
          {"$limit": 1}
        ]
      };
      $http(req).then(function(data){
        $scope.obj = data.data[0];
        $scope.loadResults();
      }, function(err){
        console.log(err);
      });
    };
    $scope.load();

    $scope.getLabel = function(key) {
      const lang = ($scope.currentLang || 'en').toLowerCase();
      const translations = ($scope.obj.i18n && $scope.obj.i18n[lang]) || {};
      return translations[key] || key;
    };

    let votes = [0, 0];

    $scope.vote = function() {
      const selected = document.querySelector('input[name="optionPoll"]:checked');
      const selectedValue = selected ? selected.value : null;

      console.log("Selected answer:", selectedValue);

      if (selectedValue) {
        $scope.log = {
          "userId": Funifier.widget.options["ENQ01"].player,
          "actionId": "ansswer_poll",
          "attributes": {
            "answer": selectedValue,
            "idPoll": $scope.obj._id
          }
        };

        $scope.registerLogVote();
        
        //mostrar resultados apos votar
        if($scope.obj.seeResultAfterVote){
        	$scope.showResults();
        } else {
          alert("Obrigado por participar.");
          selected.checked = false;
        }

        // Limpa a seleção após votar
        selected.checked = false;

      } else {
        alert("Por favor, selecione uma alternativa.");
      }
    };

    $scope.registerLogVote = function(){
      var req = {
        method: "POST", 
        url: Funifier.config.service + "/v3/action/log", 
        headers: {
          "Authorization": Funifier.auth.getAuthorization(), 
          "content-type": "application/json", 
          "cache-control": "no-cache"
        },
        data: $scope.log     
      };
      $http(req).then(function(data){
        // sucesso
        $scope.loadResults();
      }, function(err){
        console.log(err);
      });
    };

    $scope.loadResults = function(){
      var req = {
        method: "POST", 
        url: Funifier.config.service + "/v3/database/action_log/aggregate", 
        headers: {
          "Authorization": Funifier.auth.getAuthorization(), 
          "content-type": "application/json", 
          "cache-control": "no-cache"
        },
        data: [
          {
            "$match": {
              "actionId": "ansswer_poll",
              "attributes.idPoll": $scope.obj._id
            }
          },
          {
            "$group": {
              "_id": "$attributes.answer",
              "total": { "$sum": 1 }
            }
          },
          {
            "$sort": { "total": -1 }
          }
        ]

      };
      $http(req).then(function(data){
        $scope.resultPoll = data.data;

        $scope.totalVotes = $scope.resultPoll.reduce((sum, item) => sum + item.total, 0);

        $scope.resultPoll.forEach(function(item) {
          item.percent = (($scope.totalVotes ? (item.total / $scope.totalVotes) : 0) * 100).toFixed(2);
        });
      }, function(err){
        console.log(err);
      });
    };

    $scope.showResults = function() {
      /*const total = votes[0] + votes[1];
      const percent0 = total ? ((votes[0] / total) * 100).toFixed(2) : "0.00";
      const percent1 = total ? ((votes[1] / total) * 100).toFixed(2) : "0.00";

      document.getElementById("bar0").style.width = percent0 + "%";
      document.getElementById("bar1").style.width = percent1 + "%";
      document.getElementById("bar0").textContent = percent0 + "%";
      document.getElementById("bar1").textContent = percent1 + "%";
      document.getElementById("totalVotes").textContent = total;*/

      document.getElementById("poll").style.display = "none";
      document.getElementById("results").style.display = "block";
    };

    $scope.goBack = function() {
      document.getElementById("results").style.display = "none";
      document.getElementById("poll").style.display = "block";

      // Limpa seleção do rádio ao voltar
      const selected = document.querySelector('input[name="optionPoll"]:checked');
      if (selected) {
        selected.checked = false;
      }
    };

  }]);

setTimeout(function () {
  var element = angular.element(document.getElementById('ENQ01'));
  if (!element.injector()) {
    angular.bootstrap(element, ['ENQ01']);
  }
}, 10);
