$scope.obj = {
  _id: "global",
  background_color: "#0288d1",
  border_color: "#0288d1",
  font: "Roboto",
  font_color: "#ffffff",
  sky_image: null,
  bell_sound_enabled: true,
}

$scope.options = {}

$scope.save = () => {
  var req = {
    method: "PUT",
    url: Marketplace.auth.getService() + "/v3/database/barcos__c",
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
    url: Marketplace.auth.getService() + "/v3/database/barcos__c?strict=true&q=_id:'global'",
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

$scope.setSkyImage = (image) => {
  $scope.obj.sky_image = image.original.url
}

$scope.removeSkyImage = () => {
  $scope.obj.sky_image = null
}

$scope.loadFont = (fontName) => {
  if (!fontName) return
  var formattedFont = fontName.replace(/ /g, "+")
  var linkId = "dynamic-font-link-barcos"
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

// Boat options (hardcoded from widget)
$scope.boatOptions = [
  { value: "red", label: "Vermelho (Red)" },
  { value: "blue", label: "Azul (Blue)" },
  { value: "green", label: "Verde (Green)" },
  { value: "yellow", label: "Amarelo (Yellow)" },
]
$scope.selectedBoat = ""
$scope.boatImageUrl = ""
$scope.registeredBoats = []

// Set boat image from image-picker
$scope.setBoatImage = (image) => {
  $scope.boatImageUrl = image.original.url
}

// Save or update boat image in DB
$scope.saveBoatImage = () => {
  if (!$scope.selectedBoat || !$scope.boatImageUrl) return
  var boatObj = {
    _id: "boat_" + $scope.selectedBoat,
    type: "boat",
    boat: $scope.selectedBoat,
    image: $scope.boatImageUrl,
  }
  $http({
    method: "PUT",
    url: Marketplace.auth.getService() + "/v3/database/barcos__c",
    headers: {
      Authorization: Marketplace.auth.getAuthorization(),
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
    data: boatObj,
  }).then(() => {
    $scope.selectedBoat = ""
    $scope.boatImageUrl = ""
    $scope.fetchRegisteredBoats()
  })
}

// Fetch all registered boats from DB
$scope.fetchRegisteredBoats = () => {
  $http({
    method: "GET",
    url: Marketplace.auth.getService() + "/v3/database/barcos__c?strict=true&q=type:'boat'",
    headers: {
      Authorization: Marketplace.auth.getAuthorization(),
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
  }).then((data) => {
    $scope.registeredBoats = (data.data || []).map((boat) => {
      var found = $scope.boatOptions.find((opt) => opt.value === boat.boat)
      return {
        value: boat.boat,
        label: found ? found.label : boat.boat,
        image: boat.image,
        _id: boat._id,
      }
    })
  })
}

// Remove boat image from DB
$scope.removeBoatImage = (boatValue) => {
  var q = encodeURIComponent("_id:'boat_" + boatValue + "'")
  $http({
    method: "DELETE",
    url: Marketplace.auth.getService() + "/v3/database/barcos__c?q=" + q,
    headers: {
      Authorization: Marketplace.auth.getAuthorization(),
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
  }).then(() => {
    $scope.fetchRegisteredBoats()
  })
}

// Reset to default config (clear DB and insert default)
$scope.resetToDefault = () => {
  if (!confirm("Tem certeza que deseja restaurar o padrão? Isso apagará todas as configurações personalizadas.")) return
  // Remove all entries
  $http({
    method: "DELETE",
    url: Marketplace.auth.getService() + "/v3/database/barcos__c?q=*",
    headers: {
      Authorization: Marketplace.auth.getAuthorization(),
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
  }).then(() => {
    // Insert default global config
    var defaultObj = {
      _id: "global",
      background_color: "#0288d1",
      border_color: "#0288d1",
      font: "Roboto",
      font_color: "#ffffff",
      sky_image: null,
      bell_sound_enabled: true,
    }
    $http({
      method: "PUT",
      url: Marketplace.auth.getService() + "/v3/database/barcos__c",
      headers: {
        Authorization: Marketplace.auth.getAuthorization(),
        "content-type": "application/json",
        "cache-control": "no-cache",
      },
      data: defaultObj,
    }).then(() => {
      // Insert all default boat images
      var baseUrl =
        "https://raw.githubusercontent.com/JpRodrigues2/NextGen_Particular/main/1-NextGen_Studio/assets/barcos/"
      var defaultBoats = [
        { _id: "boat_red", type: "boat", boat: "red", image: baseUrl + "boat-red.png" },
        { _id: "boat_blue", type: "boat", boat: "blue", image: baseUrl + "boat-blue.png" },
        { _id: "boat_green", type: "boat", boat: "green", image: baseUrl + "boat-green.png" },
        { _id: "boat_yellow", type: "boat", boat: "yellow", image: baseUrl + "boat-yellow.png" },
      ]
      $http({
        method: "POST",
        url: Marketplace.auth.getService() + "/v3/database/barcos__c/bulk",
        headers: {
          Authorization: Marketplace.auth.getAuthorization(),
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
        data: defaultBoats,
      }).then(() => {
        $scope.load()
        $scope.fetchRegisteredBoats()
      })
    })
  })
}

// On load, fetch boats as well
var origLoad = $scope.load
$scope.load = () => {
  origLoad()
  $scope.fetchRegisteredBoats()
}
$scope.load()
