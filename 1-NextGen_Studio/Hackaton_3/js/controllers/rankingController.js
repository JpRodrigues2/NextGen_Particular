angular.module('rankingApp', [])
.controller('RankingController', ['$scope', '$http', function($scope, $http) {
    $scope.loading = false;
    $scope.ranking = [];

    $scope.loadRanking = function() {
        $scope.loading = true;

        var req = {
            method: 'POST',
            url: 'https://service2.funifier.com/v3/leaderboard/ESZzbSj/leader/aggregate?period=&live=true',
            headers: {
                "Authorization": "Bearer eyJhbGciOiJIUzUxMiIsImNhbGciOiJHWklQIn0.H4sIAAAAAAAAAD2LywoCIRRAfyVcu_A13qZ9ELTsA-KmVxAkRZ1qiP49YWB2h8M5X4YlXmllJ2aPQnkzz0orCGCCRm2VEYFx1lwuNJJK6O-YEj-8a-y0oadEO2PHBzYaDzqXl2cf1_m2XtyrDrc0qrvIQ0QcgQQzCVAgJGf0KZuwAJOQvz-L6mJRoAAAAA.QC6k8D4_NTQ_Pu_scRhHqN_gdxVO_RiEV3Fz0G8v14MDqgG9rbFWDdf1JZIzdHgUt9QUWGOjInEtkqsrGJ8vFg",
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

    // Carrega o ranking assim que o controller inicia
    $scope.loadRanking();
}]);
