$scope.obj = {
  _id: "global",
  background_color: "#a8d3c8",
  header_color: "#f9b87f",
  border_color: "#ffffff",
  font: "Roboto",
  text_color: "#2d5d56",
  card_score_color: "#ffeaaa",
  card_level_color: "#e8f4f0",
  card_achievements_color: "#f8c8a0",
  progress_bar_color: "#e57373",
  progress_background_color: "#d4a574",
  show_avatar: true,
  show_name: true,
  show_total_score: true,
  show_xp: true,
  show_level: true,
  show_coins: true,
  show_challenges: true,
  show_items: true,
  show_progress: true,
}

$scope.options = {}

// Get count of visible attributes
$scope.getVisibleAttributesCount = () => {
  const attributes = [
    "show_avatar",
    "show_name",
    "show_total_score",
    "show_xp",
    "show_level",
    "show_coins",
    "show_challenges",
    "show_items",
    "show_progress",
  ]
  return attributes.filter((attr) => $scope.obj[attr]).length
}

$scope.save = () => {
  var req = {
    method: "PUT",
    url: Marketplace.auth.getService() + "/v3/database/dashboard__c",
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
    url: Marketplace.auth.getService() + "/v3/database/dashboard__c?strict=true&q=_id:'global'",
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

$scope.loadFont = (fontName) => {
  if (!fontName) return
  var formattedFont = fontName.replace(/ /g, "+")
  var linkId = "dynamic-font-link-dashboard"
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

// Reset to default config (clear DB and insert default)
$scope.resetToDefault = () => {
  if (!confirm("Tem certeza que deseja restaurar o padrão? Isso apagará todas as configurações personalizadas.")) return
  // Remove all entries
  $http({
    method: "DELETE",
    url: Marketplace.auth.getService() + "/v3/database/dashboard__c?q=*",
    headers: {
      Authorization: Marketplace.auth.getAuthorization(),
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
  }).then(() => {
    // Insert default global config
    var defaultObj = {
      _id: "global",
      background_color: "#a8d3c8",
      header_color: "#f9b87f",
      border_color: "#ffffff",
      font: "Roboto",
      text_color: "#2d5d56",
      card_score_color: "#ffeaaa",
      card_level_color: "#e8f4f0",
      card_achievements_color: "#f8c8a0",
      progress_bar_color: "#e57373",
      progress_background_color: "#d4a574",
      show_avatar: true,
      show_name: true,
      show_total_score: true,
      show_xp: true,
      show_level: true,
      show_coins: true,
      show_challenges: true,
      show_items: true,
      show_progress: true,
    }
    $http({
      method: "PUT",
      url: Marketplace.auth.getService() + "/v3/database/dashboard__c",
      headers: {
        Authorization: Marketplace.auth.getAuthorization(),
        "content-type": "application/json",
        "cache-control": "no-cache",
      },
      data: defaultObj,
    }).then(() => {
      $scope.load()
    })
  })
}

// Initialize
$scope.load()
