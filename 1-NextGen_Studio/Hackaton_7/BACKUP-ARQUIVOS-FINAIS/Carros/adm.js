$scope.obj = {
  _id: "global",
  background_color: "#0a0a14",
  border_color: "#ff4d4d",
  font: "Roboto",
  font_color: "#ffffff",
  grandstand_image: null,
  bell_sound_enabled: true,
}

$scope.options = {}

$scope.save = () => {
  var req = {
    method: "PUT",
    url: Marketplace.auth.getService() + "/v3/database/carros__c",
    headers: {
      Authorization: Marketplace.auth.getAuthorization(),
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
    data: $scope.obj,
  }
  $http(req).then(
    (data) => {
      alert("Configuração salva com sucesso!")
    },
    (err) => {
      console.log(err)
    },
  )
}

$scope.load = () => {
  $http({
    method: "GET",
    url: Marketplace.auth.getService() + "/v3/database/carros__c?strict=true&q=_id:'global'",
    headers: {
      Authorization: Marketplace.auth.getAuthorization(),
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
  }).then(
    (data) => {
      if (data.data[0]) {
        $scope.obj = data.data[0]
        if ($scope.obj.font) {
          $scope.loadFont($scope.obj.font)
        }
      }
    },
    (err) => {
      console.log(err)
    },
  )
}

$scope.setGrandstandImage = (image) => {
  $scope.obj.grandstand_image = image.original.url
}

$scope.removeGrandstandImage = () => {
  $scope.obj.grandstand_image = null
}

$scope.loadFont = (fontName) => {
  if (!fontName) return
  var formattedFont = fontName.replace(/ /g, "+")
  var linkId = "dynamic-font-link-carros"
  var existingLink = document.getElementById(linkId)

  if (existingLink) {
    existingLink.href = "https://fonts.googleapis.com/css?family=" + formattedFont
  } else {
    var link = document.createElement("link")
    link.id = linkId
    link.rel = "stylesheet"
    link.href = "https://fonts.googleapis.com/css?family=" + formattedFont
    document.head.appendChild(link)
  }
}

$scope.$watch("obj.font", (newVal) => {
  if (newVal) {
    $scope.loadFont(newVal)
  }
})

// Car options (hardcoded from widget)
$scope.carOptions = [
  { value: "gold", label: "Ouro (Gold)" },
  { value: "silver", label: "Prata (Silver)" },
  { value: "bronze", label: "Bronze" },
  { value: "red", label: "Vermelho (Red)" },
  { value: "blue", label: "Azul (Blue)" },
  { value: "green", label: "Verde (Green)" },
  { value: "yellow", label: "Amarelo (Yellow)" },
]
$scope.selectedCar = ""
$scope.carImageUrl = ""
$scope.registeredCars = []

// Set car image from image-picker
$scope.setCarImage = (image) => {
  $scope.carImageUrl = image.original.url
}

// Save or update car image in DB
$scope.saveCarImage = () => {
  if (!$scope.selectedCar || !$scope.carImageUrl) return
  var carObj = {
    _id: "car_" + $scope.selectedCar,
    type: "car",
    car: $scope.selectedCar,
    image: $scope.carImageUrl,
  }
  $http({
    method: "PUT",
    url: Marketplace.auth.getService() + "/v3/database/carros__c",
    headers: {
      Authorization: Marketplace.auth.getAuthorization(),
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
    data: carObj,
  }).then(() => {
    $scope.selectedCar = ""
    $scope.carImageUrl = ""
    $scope.fetchRegisteredCars()
  })
}

// Fetch all registered cars from DB
$scope.fetchRegisteredCars = () => {
  $http({
    method: "GET",
    url: Marketplace.auth.getService() + "/v3/database/carros__c?strict=true&q=type:'car'",
    headers: {
      Authorization: Marketplace.auth.getAuthorization(),
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
  }).then((data) => {
    $scope.registeredCars = (data.data || []).map((car) => {
      var found = $scope.carOptions.find((opt) => opt.value === car.car)
      return {
        value: car.car,
        label: found ? found.label : car.car,
        image: car.image,
        _id: car._id,
      }
    })
  })
}

// Remove car image from DB
$scope.removeCarImage = (carValue) => {
  var q = encodeURIComponent("_id:'car_" + carValue + "'")
  $http({
    method: "DELETE",
    url: Marketplace.auth.getService() + "/v3/database/carros__c?q=" + q,
    headers: {
      Authorization: Marketplace.auth.getAuthorization(),
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
  }).then(() => {
    $scope.fetchRegisteredCars()
  })
}

// Reset to default config (clear DB and insert default)
$scope.resetToDefault = () => {
  if (!confirm("Tem certeza que deseja restaurar o padrão? Isso apagará todas as configurações personalizadas.")) return
  // Remove all entries
  $http({
    method: "DELETE",
    url: Marketplace.auth.getService() + "/v3/database/carros__c?q=*",
    headers: {
      Authorization: Marketplace.auth.getAuthorization(),
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
  }).then(() => {
    // Insert default global config
    var defaultObj = {
      _id: "global",
      background_color: "#0a0a14",
      border_color: "#ff4d4d",
      font: "Roboto",
      font_color: "#ffffff",
      grandstand_image: null,
      bell_sound_enabled: true,
    }
    $http({
      method: "PUT",
      url: Marketplace.auth.getService() + "/v3/database/carros__c",
      headers: {
        Authorization: Marketplace.auth.getAuthorization(),
        "content-type": "application/json",
        "cache-control": "no-cache",
      },
      data: defaultObj,
    }).then(() => {
      // Insert all default car images
      var baseUrl =
        "https://raw.githubusercontent.com/JpRodrigues2/NextGen_Particular/main/1-NextGen_Studio/assets/carros/"
      var defaultCars = [
        { _id: "car_gold", type: "car", car: "gold", image: baseUrl + "carro-ouro.png" },
        { _id: "car_silver", type: "car", car: "silver", image: baseUrl + "carro-prata.png" },
        { _id: "car_bronze", type: "car", car: "bronze", image: baseUrl + "carro-bronze.png" },
        { _id: "car_red", type: "car", car: "red", image: baseUrl + "carro1.png" },
        { _id: "car_blue", type: "car", car: "blue", image: baseUrl + "carro2.png" },
        { _id: "car_green", type: "car", car: "green", image: baseUrl + "carro3.png" },
        { _id: "car_yellow", type: "car", car: "yellow", image: baseUrl + "carro4.png" },
      ]
      $http({
        method: "POST",
        url: Marketplace.auth.getService() + "/v3/database/carros__c/bulk",
        headers: {
          Authorization: Marketplace.auth.getAuthorization(),
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
        data: defaultCars,
      }).then(() => {
        $scope.load()
        $scope.fetchRegisteredCars()
      })
    })
  })
}

// On load, fetch cars as well
var origLoad = $scope.load
$scope.load = () => {
  origLoad()
  $scope.fetchRegisteredCars()
}
$scope.load()
