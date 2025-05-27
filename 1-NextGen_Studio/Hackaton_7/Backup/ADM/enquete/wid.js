// JavaScript - Widget de Enquete
var angular = window.angular;
var Funifier = window.Funifier;
var Marketplace = window.Marketplace;

angular.module("enquete", []).controller("enquete", [
  "$scope",
  "$http",
  "$location",
  ($scope, $http, $location) => {
    console.log("enquete inicializado");

    // Configuração inicial
    $scope.questions = []; // Armazena todas as perguntas do banco
    $scope.currentQuestionIndex = 0; // Índice da pergunta atual
    $scope.userAnswer = null; // Resposta do usuário
    $scope.submitted = false; // Estado de submissão
    $scope.results = null; // Resultados da enquete
    $scope.thankYouMessage = "Obrigado por participar!"; // Mensagem padrão (sobrescrita pelo admin)

    // Configuração de idiomas
    $scope.translations = {
      pt: {
        enqueteTitle: "ENQUETE",
        nextQuestion: "Próxima pergunta",
        submit: "Enviar",
      },
      en: {
        enqueteTitle: "SURVEY",
        nextQuestion: "Next question",
        submit: "Submit",
      },
    };

    // Idioma padrão
    $scope.currentLang = "pt";

    // Função para traduzir
    $scope.t = (key) => $scope.translations[$scope.currentLang][key] || key;

    // Alternar idioma
    $scope.toggleLanguage = () => {
      $scope.currentLang = $scope.currentLang === "pt" ? "en" : "pt";
    };

    // --- White-label config ---
    $scope.whitelabelConfig = null;

    // Função para obter token dinâmico
    $scope.getGamificationToken = () => {
      try {
        if (Marketplace?.auth?.getAuthorization) {
          return Marketplace.auth.getAuthorization();
        }
      } catch (e) {
        console.log("Marketplace não disponível, usando token estático");
      }
      return "Basic NjgyYTBlNmYyMzI3Zjc0ZjNhM2UwMDg5OjY4MmExMDI2MjMyN2Y3NGYzYTNlMDBjZg==";
    };

    // Buscar configurações de white-label e perguntas do banco de dados
    function fetchWhitelabelConfig() {
      $http({
        method: "GET",
        url: "https://service2.funifier.com/v3/database/enquete__c?strict=true&q=_id:'global'",
        headers: {
          Authorization: $scope.getGamificationToken(),
          "Content-Type": "application/json",
          "cache-control": "no-cache",
        },
      }).then(
        (data) => {
          if (data.data && data.data[0]) {
            $scope.whitelabelConfig = data.data[0];
            $scope.thankYouMessage = $scope.whitelabelConfig.thank_you_message || $scope.thankYouMessage;
            $scope.questions = $scope.whitelabelConfig.questions || [];
            applyWhitelabelStyles();
            if ($scope.questions.length > 0) {
              $scope.currentQuestionIndex = 0; // Reinicia para a primeira pergunta
            }
          }
        },
        (err) => {
          console.log("Erro ao carregar configurações:", err);
        },
      );
    }

    // Aplicar estilos do white-label
    function applyWhitelabelStyles() {
      var cfg = $scope.whitelabelConfig;
      if (!cfg) return;

      // Cor de fundo geral
      if (cfg.background_color) {
        document.querySelector(".enquete-content").style.backgroundColor = cfg.background_color;
      } else {
        console.error("[WhiteLabel] Background color not found in DB:", {
          key: "background_color",
          config: cfg,
          reason: "No background_color found in DB.",
        });
      }

      // Cor do cabeçalho
      if (cfg.header_color) {
        document.querySelector(".enquete-header").style.backgroundColor = cfg.header_color;
      } else {
        console.error("[WhiteLabel] Header color not found in DB:", {
          key: "header_color",
          config: cfg,
          reason: "No header_color found in DB.",
        });
      }

      // Cor da borda
      if (cfg.border_color) {
        document.getElementById("enquete").style.border = "2px solid " + cfg.border_color;
      } else {
        console.error("[WhiteLabel] Border color not found in DB:", {
          key: "border_color",
          config: cfg,
          reason: "No border_color found in DB.",
        });
      }

      // Fonte
      if (cfg.font) {
        document.getElementById("enquete").style.fontFamily = cfg.font;
        $scope.loadFont(cfg.font); // Carregar fonte do Google Fonts
      } else {
        console.error("[WhiteLabel] Font not found in DB:", {
          key: "font",
          config: cfg,
          reason: "No font found in DB.",
        });
      }

      // Cor do texto
      if (cfg.text_color) {
        const style = document.createElement("style");
        style.innerHTML = `
          #enquete .question-title,
          #enquete .answer-option,
          #enquete .thank-you-message,
          #enquete .results-item {
            color: ${cfg.text_color} !important;
          }
        `;
        document.head.appendChild(style);
      } else {
        console.error("[WhiteLabel] Text color not found in DB:", {
          key: "text_color",
          config: cfg,
          reason: "No text_color found in DB.",
        });
      }
    }

    // Função para carregar Google Fonts dinamicamente
    $scope.loadFont = (fontName) => {
      if (!fontName) return;
      var formattedFont = fontName.replace(/ /g, "+");
      var linkId = "dynamic-font-link-enquete";
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

    // Submeter resposta (simula envio ao banco de dados)
    $scope.submitAnswer = () => {
      if (!$scope.userAnswer || !$scope.questions[$scope.currentQuestionIndex]) return;

      $http({
        method: "POST",
        url: "https://service2.funifier.com/v3/database/question_log",
        headers: {
          Authorization: $scope.getGamificationToken(),
          "Content-Type": "application/json",
          "cache-control": "no-cache",
        },
        data: {
          question: $scope.questions[$scope.currentQuestionIndex]._id || $scope.questions[$scope.currentQuestionIndex].title,
          answer: $scope.userAnswer,
          player: "me",
          timestamp: new Date().toISOString(),
        },
      }).then(
        () => {
          $scope.fetchResults();
          $scope.submitted = true;
        },
        (err) => {
          console.error("Erro ao submeter resposta:", err);
        },
      );
    };

    // Buscar resultados da enquete
    $scope.fetchResults = () => {
      $http({
        method: "POST",
        url: "https://service2.funifier.com/v3/database/question_log/aggregate",
        headers: {
          Authorization: $scope.getGamificationToken(),
          "Content-Type": "application/json",
          "cache-control": "no-cache",
        },
        data: [
          { "$match": { "question": $scope.questions[$scope.currentQuestionIndex]._id || $scope.questions[$scope.currentQuestionIndex].title } },
          { "$unwind": "$answer" },
          { "$group": { "_id": "$answer", "total": { "$sum": 1 } } },
          { "$sort": { "total": -1 } },
        ],
      }).then(
        (res) => {
          $scope.results = res.data;
        },
        (err) => {
          console.error("Erro ao carregar resultados:", err);
        },
      );
    };

    // Avançar para a próxima pergunta
    $scope.nextQuestion = () => {
      if ($scope.currentQuestionIndex < $scope.questions.length - 1) {
        $scope.currentQuestionIndex++;
        $scope.userAnswer = null;
        $scope.submitted = false;
        $scope.results = null;
      } else {
        $scope.currentQuestionIndex = 0; // Volta ao início
        $scope.userAnswer = null;
        $scope.submitted = false;
        $scope.results = null;
      }
    };

    // Inicializar o widget
    fetchWhitelabelConfig();
  },
]);

setTimeout(() => {
  var element = angular.element(document.getElementById("enquete"));
  if (!element.injector()) {
    angular.bootstrap(element, ["enquete"]);
  }
}, 10);