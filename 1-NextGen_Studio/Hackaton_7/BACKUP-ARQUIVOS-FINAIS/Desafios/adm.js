$scope.obj = {
  _id: "global",
  background_color: "#a8d3c8",
  header_color: "#f8b37f",
  border_color: "#1bd0e1",
  font: "Roboto",
  text_color: "#2d5c5c",
  button_color: "#ff9999",
  challenge_box_color: "#fff4e6", // Default color for challenge boxes
  items_per_page: 3,
  filters: ["type", "category"],
};

$scope.options = {};

// Aplicar estilo Banco do Brasil
$scope.applyBancoDoBrasilStyle = () => {
  $scope.obj.background_color = "#ffffff"; // White background
  $scope.obj.header_color = "#0066b3"; // Blue header
  $scope.obj.border_color = "#0066b3"; // Blue border
  $scope.obj.text_color = "#ffffff"; // White text for visibility against blue header
  $scope.obj.button_color = "#ffcd00"; // Yellow buttons
  $scope.obj.challenge_box_color = "#ffcd00"; // Yellow challenge boxes
  $scope.obj.items_per_page = 3;
  $scope.obj.filters = ["type", "category"];
  $scope.save();
};

// Salvar configurações
$scope.save = () => {
  var req = {
    method: "PUT",
    url: Marketplace.auth.getService() + "/v3/database/desafios__c",
    headers: {
      Authorization: Marketplace.auth.getAuthorization(),
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
    data: $scope.obj,
  };
  $http(req).then(
    (data) => {
      alert("Configuração salva com sucesso!");
    },
    (err) => {
      console.log(err);
    },
  );
};

// Carregar configurações
$scope.load = () => {
  $http({
    method: "GET",
    url: Marketplace.auth.getService() + "/v3/database/desafios__c?strict=true&q=_id:'global'",
    headers: {
      Authorization: Marketplace.auth.getAuthorization(),
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
  }).then(
    (data) => {
      if (data.data[0]) {
        $scope.obj = data.data[0];
        if ($scope.obj.font) {
          $scope.loadFont($scope.obj.font);
        }
      }
    },
    (err) => {
      console.log(err);
    },
  );
};

// Carregar fonte dinamicamente
$scope.loadFont = (fontName) => {
  if (!fontName) return;
  var formattedFont = fontName.replace(/ /g, "+");
  var linkId = "dynamic-font-link-desafios";
  var existingLink = document.getElementById(linkId);

  if (existingLink) {
    existingLink.href = "https://fonts.googleapis.com/css?family=" + formattedFont;
  } else {
    var link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css?family=" + formattedFont;
    document.head.appendChild(link);
  }
};

$scope.$watch("obj.font", (newVal) => {
  if (newVal) {
    $scope.loadFont(newVal);
  }
});

// Restaurar padrão
$scope.resetToDefault = () => {
  if (!confirm("Tem certeza que deseja restaurar o padrão? Isso apagará todas as configurações personalizadas.")) return;
  $http({
    method: "DELETE",
    url: Marketplace.auth.getService() + "/v3/database/desafios__c?q=*",
    headers: {
      Authorization: Marketplace.auth.getAuthorization(),
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
  }).then(() => {
    var defaultObj = {
      _id: "global",
      background_color: "#a8d3c8",
      header_color: "#f8b37f",
      border_color: "#1bd0e1",
      font: "Roboto",
      text_color: "#2d5c5c",
      button_color: "#ff9999",
      challenge_box_color: "#fff4e6",
      items_per_page: 3,
      filters: ["type", "category"],
    };
    $http({
      method: "PUT",
      url: Marketplace.auth.getService() + "/v3/database/desafios__c",
      headers: {
        Authorization: Marketplace.auth.getAuthorization(),
        "content-type": "application/json",
        "cache-control": "no-cache",
      },
      data: defaultObj,
    }).then(() => {
      $scope.load();
    });
  });
};

// Inicializar
$scope.load();