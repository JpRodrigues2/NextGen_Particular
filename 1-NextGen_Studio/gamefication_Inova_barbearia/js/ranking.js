angular.module('rankingApp', [])
.controller('RankingController', ['$scope', '$http', function($scope, $http) {
    $scope.loading = false;
    $scope.ranking = [];
    
    // Função para carregar o ranking
    $scope.loadRanking = function() {
        $scope.loading = true;
        
        var req = {
            method: 'POST',
            url: 'https://service2.funifier.com/v3/leaderboard/ESDA9GB/leader/aggregate?period=&live=true',
            headers: {
                "Authorization": "Bearer eyJhbGciOiJIUzUxMiIsImNhbGciOiJHWklQIn0.H4sIAAAAAAAAAD2LuwoCMRAAf0VSp9nLy9gLgqUfIGuygUAwR5JTD_HfXRSuG4aZt8A5n2kVB2Fdii4pmNTkktNJoTIWTBJS9FBn4qQRxiuWInfPlgf9MVKhjXHgDTvxgyHU5T74Ol7WU3g0dkuntonKIiMH4LTeezDgpaDX_BNGe6vAf75wa-2doAAAAA.WvObwKwaUZPz89rWVtZIUV7ceUdnmFk3BhyJP_geV7H-994PF_HVtXOzHhklLGGDUFrVN9oEqX91-iMLQZdncA",
                "Content-Type": "application/json"
            },
            data: []
        };
        
        $http(req).then(
            function(response) {
                $scope.ranking = response.data;
                $scope.loading = false;
            },
            function(error) {
                console.error('Erro ao carregar ranking:', error);
                $scope.loading = false;
                alert('Erro ao carregar o ranking. Por favor, tente novamente.');
            }
        );
    };
    
    // Carrega o ranking quando a página é aberta
    $scope.loadRanking();
}]);