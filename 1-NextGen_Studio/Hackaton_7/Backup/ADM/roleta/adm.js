$scope.obj = {
  _id: "global",
  background_color: "#a8d3c8",
  header_color: "#f8b37f",
  border_color: "#1bd0e1",
  font: "Roboto",
  text_color: "#2d5c5c",
  button_color: "#ff5555",
  wheel_colors: ["#ff9999", "#ffd699", "#99ccff", "#ffcc99", "#ccffcc", "#ffcccc"],
  prizes: [
    { title: "5 Moedas", image: "https://s3.amazonaws.com/funifier/icons/coin.png", value: "5moedas", probability: 0.2 },
    { title: "20 XP", image: "https://s3.amazonaws.com/funifier/icons/xp.png", value: "20xp", probability: 0.2 },
    { title: "Boné", image: "https://s3.amazonaws.com/funifier/games/682a0e6f2327f74f3a3e0089/images/682e3ec6d2a446407c30ad84_original_Bon��.png", value: "bone", probability: 0.2 },
    { title: "Ingresso", image: "https://s3.amazonaws.com/funifier/games/682a0e6f2327f74f3a3e0089/images/682e3f1ed2a446407c30ad9d_original_Ingresso.png", value: "ingresso", probability: 0.2 },
    { title: "Não Foi Dessa Vez", image: "https://s3.amazonaws.com/funifier/games/682a0e6f2327f74f3a3e0089/images/682e3f3bd2a446407c30adb0_original_N��o foi dessa vez (1).png", value: "loose", probability: 0.2 },
    { title: "Tente Novamente", image: "https://s3.amazonaws.com/funifier/games/682a0e6f2327f74f3a3e0089/images/682e3f6dd2a446407c30adb3_original_ChatGPT Image 16 de mai. de 2025, 22_48_13.png", value: "tentenovamente", probability: 0.2 },
  ],
  participation_frequency: "daily", // Frequência de participação (daily, weekly, unlimited)
};

$scope.options = {};

// Aplicar estilo Banco do Brasil
$scope.applyBancoDoBrasilStyle = () => {
  $scope.obj.background_color = "#ffffff"; // White background
  $scope.obj.header_color = "#0066b3"; // Blue header
  $scope.obj.border_color = "#0066b3"; // Blue border
  $scope.obj.text_color = "#0066b3"; // Blue text
  $scope.obj.button_color = "#ffcd00"; // Yellow button
  $scope.obj.wheel_colors = ["#ffcd00", "#0066b3", "#ffffff", "#ffcd00", "#0066b3", "#ffffff"]; // Alternating yellow, blue, white
  $scope.save(); // Save the new configuration to the database
};

// Salvar configurações
$scope.save = () => {
  var req = {
    method: "PUT",
    url: Marketplace.auth.getService() + "/v3/database/roleta__c",
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
    url: Marketplace.auth.getService() + "/v3/database/roleta__c?strict=true&q=_id:'global'",
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
  var linkId = "dynamic-font-link-roleta";
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

// Adicionar novo prêmio
$scope.addPrize = () => {
  $scope.obj.prizes.push({
    title: "",
    image: "",
    value: "",
    probability: 0.2,
  });
};

// Remover prêmio
$scope.removePrize = (index) => {
  if ($scope.obj.prizes.length > 1) {
    $scope.obj.prizes.splice(index, 1);
  }
};

// Restaurar padrão
$scope.resetToDefault = () => {
  if (!confirm("Tem certeza que deseja restaurar o padrão? Isso apagará todas as configurações personalizadas.")) return;
  $http({
    method: "DELETE",
    url: Marketplace.auth.getService() + "/v3/database/roleta__c?q=*",
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
      button_color: "#ff5555",
      wheel_colors: ["#ff9999", "#ffd699", "#99ccff", "#ffcc99", "#ccffcc", "#ffcccc"],
      prizes: [
        { title: "5 Moedas", image: "https://s3.amazonaws.com/funifier/icons/coin.png", value: "5moedas", probability: 0.2 },
        { title: "20 XP", image: "https://s3.amazonaws.com/funifier/icons/xp.png", value: "20xp", probability: 0.2 },
        { title: "Boné", image: "https://s3.amazonaws.com/funifier/games/682a0e6f2327f74f3a3e0089/images/682e3ec6d2a446407c30ad84_original_Bon��.png", value: "bone", probability: 0.2 },
        { title: "Ingresso", image: "https://s3.amazonaws.com/funifier/games/682a0e6f2327f74f3a3e0089/images/682e3f1ed2a446407c30ad9d_original_Ingresso.png", value: "ingresso", probability: 0.2 },
        { title: "Não Foi Dessa Vez", image: "https://s3.amazonaws.com/funifier/games/682a0e6f2327f74f3a3e0089/images/682e3f3bd2a446407c30adb0_original_N��o foi dessa vez (1).png", value: "loose", probability: 0.2 },
        { title: "Tente Novamente", image: "https://s3.amazonaws.com/funifier/games/682a0e6f2327f74f3a3e0089/images/682e3f6dd2a446407c30adb3_original_ChatGPT Image 16 de mai. de 2025, 22_48_13.png", value: "tentenovamente", probability: 0.2 },
      ],
      participation_frequency: "daily",
    };
    $http({
      method: "PUT",
      url: Marketplace.auth.getService() + "/v3/database/roleta__c",
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