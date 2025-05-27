$scope.obj = {
  _id: "global",
  buy_button_color: "#e57373",
  buy_button_hover_color: "#d32f2f",
  insufficient_balance_color: "#d32f2f",
  disabled_items: [],
}

$scope.options = {}
$scope.availableItems = []

// Fetch available items from the virtual goods API
$scope.fetchItems = () => {
  $http({
    method: "GET",
    url: "https://service2.funifier.com/v3/virtualgoods/item",
    headers: {
      Authorization: Marketplace.auth.getAuthorization(),
      "Content-Type": "application/json",
    },
  })
    .then((itemResponse) => {
      const items = itemResponse.data || []

      // Process items
      $scope.availableItems = items
        .filter((item) => item.active)
        .map((item) => {
          let price = 0
          if (item.requires && item.requires.length > 0) {
            const moedaReq = item.requires.find((r) => r.type === 0 && r.operation === 1 && r.item === "moedas")
            if (moedaReq) {
              price = moedaReq.total
            }
          }

          return {
            _id: item._id,
            name: item.name,
            price: price,
            disabled: $scope.obj.disabled_items.includes(item._id),
          }
        })
    })
    .catch((err) => {
      console.error("Error fetching items:", err)
    })
}

// Update disabled items array
$scope.updateDisabledItems = () => {
  $scope.obj.disabled_items = $scope.availableItems.filter((item) => item.disabled).map((item) => item._id)
}

// Get count of disabled items
$scope.getDisabledItemsCount = () => {
  return $scope.availableItems.filter((item) => item.disabled).length
}

$scope.save = () => {
  var req = {
    method: "PUT",
    url: Marketplace.auth.getService() + "/v3/database/loja__c",
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
    url: Marketplace.auth.getService() + "/v3/database/loja__c?strict=true&q=_id:'global'",
    headers: {
      Authorization: Marketplace.auth.getAuthorization(),
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
  }).then(
    (data) => {
      if (data.data[0]) {
        $scope.obj = data.data[0]
        // Update item selections after loading config
        $scope.fetchItems()
      } else {
        // If no config exists, fetch items anyway
        $scope.fetchItems()
      }
    },
    (err) => {
      console.log(err)
      // If error, still fetch items
      $scope.fetchItems()
    },
  )
}

// Reset to default config (clear DB and insert default)
$scope.resetToDefault = () => {
  if (!confirm("Tem certeza que deseja restaurar o padrão? Isso apagará todas as configurações personalizadas.")) return
  // Remove all entries
  $http({
    method: "DELETE",
    url: Marketplace.auth.getService() + "/v3/database/loja__c?q=*",
    headers: {
      Authorization: Marketplace.auth.getAuthorization(),
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
  }).then(() => {
    // Insert default global config
    var defaultObj = {
      _id: "global",
      buy_button_color: "#e57373",
      buy_button_hover_color: "#d32f2f",
      insufficient_balance_color: "#d32f2f",
      disabled_items: [],
    }
    $http({
      method: "PUT",
      url: Marketplace.auth.getService() + "/v3/database/loja__c",
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
