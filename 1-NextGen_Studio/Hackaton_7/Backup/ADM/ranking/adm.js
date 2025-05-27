$scope.obj = {
  _id: "global",
  background_color: "#a8d3c8",
  header_color: "#f8b37f",
  border_color: "#1bd0e1",
  font: "Roboto",
  text_color: "#2d5c5c",
  current_player_color: "#1bd0e1",
  first_place_color: "#ffeaaa",
  second_place_color: "#e8f4f0",
  third_place_color: "#f8c8a0",
  avatar_border_color: "#ffffff",
  visible_leaderboards: [],
}

$scope.options = {}
$scope.availableLeaderboards = []

// Fetch available leaderboards
$scope.fetchLeaderboards = () => {
  $http({
    method: "GET",
    url: Marketplace.auth.getService() + "/v3/leaderboard",
    headers: {
      Authorization: Marketplace.auth.getAuthorization(),
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
  }).then((data) => {
    $scope.availableLeaderboards = (data.data || []).map((leaderboard) => ({
      ...leaderboard,
      selected: $scope.obj.visible_leaderboards.includes(leaderboard._id),
    }))
  })
}

// Update visible leaderboards array
$scope.updateVisibleLeaderboards = () => {
  $scope.obj.visible_leaderboards = $scope.availableLeaderboards.filter((lb) => lb.selected).map((lb) => lb._id)
}

// Get count of selected leaderboards
$scope.getSelectedLeaderboardsCount = () => {
  return $scope.availableLeaderboards.filter((lb) => lb.selected).length
}

$scope.save = () => {
  var req = {
    method: "PUT",
    url: Marketplace.auth.getService() + "/v3/database/ranking__c",
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
    url: Marketplace.auth.getService() + "/v3/database/ranking__c?strict=true&q=_id:'global'",
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
        // Update leaderboard selections after loading config
        $scope.fetchLeaderboards()
      } else {
        // If no config exists, fetch leaderboards anyway
        $scope.fetchLeaderboards()
      }
    },
    (err) => {
      console.log(err)
      // If error, still fetch leaderboards
      $scope.fetchLeaderboards()
    },
  )
}

$scope.loadFont = (fontName) => {
  if (!fontName) return
  var formattedFont = fontName.replace(/ /g, "+")
  var linkId = "dynamic-font-link-ranking"
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
    url: Marketplace.auth.getService() + "/v3/database/ranking__c?q=*",
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
      header_color: "#f8b37f",
      border_color: "#1bd0e1",
      font: "Roboto",
      text_color: "#2d5c5c",
      current_player_color: "#1bd0e1",
      first_place_color: "#ffeaaa",
      second_place_color: "#e8f4f0",
      third_place_color: "#f8c8a0",
      avatar_border_color: "#ffffff",
      visible_leaderboards: [],
    }
    $http({
      method: "PUT",
      url: Marketplace.auth.getService() + "/v3/database/ranking__c",
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
