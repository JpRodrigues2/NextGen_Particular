$scope.obj = {
  _id: "global",
  background_color: "#a8d3c8",
  header_color: "#f8b37f",
  border_color: "#1bd0e1",
  font: "Roboto",
  text_color: "#2d5c5c",
  thank_you_message: "Obrigado por participar!",
  questions: [
    {
      _id: "q1",
      type: "MULTIPLE_CHOICE",
      question: "Qual sua faixa etária?",
      choices: [
        { answer: "1", label: "10 anos ou menos" },
        { answer: "2", label: "De 11 a 20 anos" },
        { answer: "3", label: "De 21 a 30 anos" },
        { answer: "4", label: "De 31 a 40 anos" },
        { answer: "5", label: "41 anos ou mais" },
      ],
      active: true,
    },
  ],
  active_questions: ["q1"],
};

$scope.newQuestion = {
  _id: "",
  type: "MULTIPLE_CHOICE",
  question: "",
  choices: [{ answer: "", label: "" }],
  active: true,
};

$scope.options = {};

// Adicionar nova pergunta
$scope.addQuestion = () => {
  if (!$scope.newQuestion._id || !$scope.newQuestion.question) return;
  $scope.newQuestion._id = $scope.newQuestion._id || "q" + Date.now();
  $scope.obj.questions.push(angular.copy($scope.newQuestion));
  $scope.newQuestion = {
    _id: "",
    type: "MULTIPLE_CHOICE",
    question: "",
    choices: [{ answer: "", label: "" }],
    active: true,
  };
};

// Remover pergunta
$scope.removeQuestion = (index) => {
  $scope.obj.questions.splice(index, 1);
  $scope.obj.active_questions = $scope.obj.active_questions.filter(
    (id) => $scope.obj.questions.find((q) => q._id === id)
  );
};

// Salvar configurações
$scope.save = () => {
  var req = {
    method: "PUT",
    url: Marketplace.auth.getService() + "/v3/database/enquete__c",
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
    url: Marketplace.auth.getService() + "/v3/database/enquete__c?strict=true&q=_id:'global'",
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
  var linkId = "dynamic-font-link-enquete-admin";
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
    url: Marketplace.auth.getService() + "/v3/database/enquete__c?q=*",
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
      thank_you_message: "Obrigado por participar!",
      questions: [
        {
          _id: "q1",
          type: "MULTIPLE_CHOICE",
          question: "Qual sua faixa etária?",
          choices: [
            { answer: "1", label: "10 anos ou menos" },
            { answer: "2", label: "De 11 a 20 anos" },
            { answer: "3", label: "De 21 a 30 anos" },
            { answer: "4", label: "De 31 a 40 anos" },
            { answer: "5", label: "41 anos ou mais" },
          ],
          active: true,
        },
      ],
      active_questions: ["q1"],
    };
    $http({
      method: "PUT",
      url: Marketplace.auth.getService() + "/v3/database/enquete__c",
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