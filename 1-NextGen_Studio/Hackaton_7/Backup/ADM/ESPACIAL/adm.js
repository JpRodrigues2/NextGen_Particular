$scope.obj = {
    _id: "global",
    background_color: "#CCCCCC",
    border_color: "#FFD700",
    font: "Roboto"
};

$scope.options = {};

$scope.save = function () {
    var req = {
        method: 'PUT',
        url: Marketplace.auth.getService() + '/v3/database/espacial__c',
        headers: {
            "Authorization": Marketplace.auth.getAuthorization(),
            "content-type": "application/json",
            "cache-control": "no-cache"
        },
        data: $scope.obj
    };
    $http(req).then(function (data) {
        alert("Configuração salva com sucesso!");
    }, function (err) {
        console.log(err);
    });
};

$scope.load = function () {
    $http({
        method: 'GET',
        url: Marketplace.auth.getService() + "/v3/database/espacial__c?strict=true&q=_id:'global'",
        headers: {
            "Authorization": Marketplace.auth.getAuthorization(),
            "content-type": "application/json",
            "cache-control": "no-cache"
        }
    }).then(function (data) {
        if (data.data[0]) {
            $scope.obj = data.data[0];
            if ($scope.obj.font) {
                $scope.loadFont($scope.obj.font);
            }
        }
    }, function (err) {
        console.log(err);
    });
};

$scope.setLogo = function (image) {
    $scope.obj.logo = image.original.url;
};

$scope.setBackground = function (image) {
    $scope.obj.background_image = image.original.url;
};

$scope.removeLogo = function () {
    $scope.obj.logo = null;
};

$scope.removeBackground = function () {
    $scope.obj.background_image = null;
};

$scope.loadFont = function (fontName) {
    if (!fontName) return;
    var formattedFont = fontName.replace(/ /g, '+');
    var linkId = 'dynamic-font-link';
    var existingLink = document.getElementById(linkId);

    if (existingLink) {
        existingLink.href = 'https://fonts.googleapis.com/css?family=' + formattedFont;
    } else {
        var link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css?family=' + formattedFont;
        document.head.appendChild(link);
    }
};

$scope.$watch('obj.font', function (newVal) {
    if (newVal) {
        $scope.loadFont(newVal);
    }
});

// Car options (hardcoded from widget)
$scope.carOptions = [
    { value: 'gold', label: 'Ouro (Gold)' },
    { value: 'silver', label: 'Prata (Silver)' },
    { value: 'bronze', label: 'Bronze' },
    { value: 'red', label: 'Vermelha (Red)' },
    { value: 'blue', label: 'Azul (Blue)' },
    { value: 'green', label: 'Verde (Green)' },
    { value: 'yellow', label: 'Amarela (Yellow)' }
];
$scope.selectedCar = '';
$scope.carImageUrl = '';
$scope.registeredCars = [];

// Set car image from image-picker
$scope.setCarImage = function(image) {
    $scope.carImageUrl = image.original.url;
};

// Save or update car image in DB
$scope.saveCarImage = function() {
    if (!$scope.selectedCar || !$scope.carImageUrl) return;
    var carObj = {
        _id: 'car_' + $scope.selectedCar,
        type: 'car',
        car: $scope.selectedCar,
        image: $scope.carImageUrl
    };
    $http({
        method: 'PUT',
        url: Marketplace.auth.getService() + '/v3/database/espacial__c',
        headers: {
            "Authorization": Marketplace.auth.getAuthorization(),
            "content-type": "application/json",
            "cache-control": "no-cache"
        },
        data: carObj
    }).then(function() {
        $scope.selectedCar = '';
        $scope.carImageUrl = '';
        $scope.fetchRegisteredCars();
    });
};

// Fetch all registered cars from DB
$scope.fetchRegisteredCars = function() {
    $http({
        method: 'GET',
        url: Marketplace.auth.getService() + "/v3/database/espacial__c?strict=true&q=type:'car'",
        headers: {
            "Authorization": Marketplace.auth.getAuthorization(),
            "content-type": "application/json",
            "cache-control": "no-cache"
        }
    }).then(function(data) {
        $scope.registeredCars = (data.data || []).map(function(car) {
            var found = $scope.carOptions.find(function(opt) { return opt.value === car.car; });
            return {
                value: car.car,
                label: found ? found.label : car.car,
                image: car.image,
                _id: car._id
            };
        });
    });
};

// Remove car image from DB
$scope.removeCarImage = function(carValue) {
    var q = encodeURIComponent("_id:'car_" + carValue + "'");
    $http({
        method: 'DELETE',
        url: Marketplace.auth.getService() + '/v3/database/espacial__c?q=' + q,
        headers: {
            "Authorization": Marketplace.auth.getAuthorization(),
            "content-type": "application/json",
            "cache-control": "no-cache"
        }
    }).then(function() {
        $scope.fetchRegisteredCars();
    });
};

// Reset to default config (clear DB and insert default)
$scope.resetToDefault = function() {
    if (!confirm('Tem certeza que deseja restaurar o padrão? Isso apagará todas as configurações personalizadas.')) return;
    // Remove all entries
    $http({
        method: 'DELETE',
        url: Marketplace.auth.getService() + '/v3/database/espacial__c?q=*',
        headers: {
            "Authorization": Marketplace.auth.getAuthorization(),
            "content-type": "application/json",
            "cache-control": "no-cache"
        }
    }).then(function() {
        // Insert default global config
        var defaultObj = {
            _id: "global",
            background_color: "#3a1c71",
            border_color: "#FFD700",
            font: "Orbitron",
            font_color: "#ffffff",
            logo: null,
            background_image: null
        };
        $http({
            method: 'PUT',
            url: Marketplace.auth.getService() + '/v3/database/espacial__c',
            headers: {
                "Authorization": Marketplace.auth.getAuthorization(),
                "content-type": "application/json",
                "cache-control": "no-cache"
            },
            data: defaultObj
        }).then(function() {
            // Insert all default car images
            var baseUrl = "https://raw.githubusercontent.com/JpRodrigues2/NextGen_Particular/main/1-NextGen_Studio/assets/espacial/";
            var defaultCars = [
                { _id: "car_gold", type: "car", car: "gold", image: baseUrl + "nave-ouro.png" },
                { _id: "car_silver", type: "car", car: "silver", image: baseUrl + "nave-prata.png" },
                { _id: "car_bronze", type: "car", car: "bronze", image: baseUrl + "nave-bronze.png" },
                { _id: "car_red", type: "car", car: "red", image: baseUrl + "nave1.png" },
                { _id: "car_blue", type: "car", car: "blue", image: baseUrl + "nave2.png" },
                { _id: "car_green", type: "car", car: "green", image: baseUrl + "nave3.png" },
                { _id: "car_yellow", type: "car", car: "yellow", image: baseUrl + "nave4.png" }
            ];
            $http({
                method: 'POST',
                url: Marketplace.auth.getService() + '/v3/database/espacial__c/bulk',
                headers: {
                    "Authorization": Marketplace.auth.getAuthorization(),
                    "content-type": "application/json",
                    "cache-control": "no-cache"
                },
                data: defaultCars
            }).then(function() {
                $scope.load();
                $scope.fetchRegisteredCars();
            });
        });
    });
};

// On load, fetch cars as well
var origLoad = $scope.load;
$scope.load = function() {
    origLoad();
    $scope.fetchRegisteredCars();
};
$scope.load();