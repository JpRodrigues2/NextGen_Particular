// JavaScript - Widget de Enquete
var angular = window.angular;
var Funifier = window.Funifier;
var Marketplace = window.Marketplace;

angular.module("enquete", []).controller("enquete", [
  "$scope",
  "$http",
  ($scope, $http) => {
    console.log("enquete inicializado");

    // Configuração inicial
    $scope.questions = []; // Armazena perguntas ativas
    $scope.currentQuestionIndex = 0; // Índice da pergunta atual
    $scope.userAnswer = null; // Resposta do usuário (não será salva)
    $scope.submitted = false; // Estado para mensagem final
    $scope.thankYouMessage = "Obrigado por participar!"; // Mensagem padrão

    // Configuração de idiomas
    $scope.currentLang = "pt";
    $scope.translations = {
      pt: { enqueteTitle: "ENQUETE", submit: "Enviar" },
      en: { enqueteTitle: "SURVEY", submit: "Submit" },
    };
    $scope.t = (key) => $scope.translations[$scope.currentLang][key] || key;
    $scope.toggleLanguage = () => {
      $scope.currentLang = $scope.currentLang === "pt" ? "en" : "pt";
    };

    // Função para obter token
    $scope.getGamificationToken = () => {
      try {
        return Marketplace?.auth?.getAuthorization() || "Basic NjgyYTBlNmYyMzI3Zjc0ZjNhM2UwMDg5OjY4MmExMDI2MjMyN2Y3NGYzYTNlMDBjZg==";
      } catch (e) {
        return "Basic NjgyYTBlNmYyMzI3Zjc0ZjNhM2UwMDg5OjY4MmExMDI2MjMyN2Y3NGYzYTNlMDBjZg==";
      }
    };

    // Buscar perguntas do banco
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
            $scope.questions = ($scope.whitelabelConfig.questions || []).filter(q => $scope.whitelabelConfig.active_questions.includes(q._id));
            applyWhitelabelStyles();
            $scope.currentQuestionIndex = $scope.questions.length > 0 ? 0 : -1;
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
      if (cfg.background_color) document.querySelector(".enquete-content").style.backgroundColor = cfg.background_color;
      if (cfg.header_color) document.querySelector(".enquete-header").style.backgroundColor = cfg.header_color;
      if (cfg.border_color) document.getElementById("enquete").style.border = "2px solid " + cfg.border_color;
      if (cfg.font) {
        document.getElementById("enquete").style.fontFamily = cfg.font;
        var formattedFont = cfg.font.replace(/ /g, "+");
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css?family=" + formattedFont;
        document.head.appendChild(link);
      }
      if (cfg.text_color) {
        const style = document.createElement("style");
        style.innerHTML = `
          #enquete .question-title,
          #enquete .answer-option,
          #enquete .thank-you-message {
            color: ${cfg.text_color} !important;
          }
        `;
        document.head.appendChild(style);
      }
    }

    // Avançar para a próxima pergunta
    $scope.submitAnswer = () => {
      if ($scope.currentQuestionIndex < 0 || !$scope.userAnswer) return;

      if ($scope.currentQuestionIndex === $scope.questions.length - 1) {
        $scope.submitted = true; // Mostra mensagem de agradecimento
      } else {
        $scope.currentQuestionIndex++; // Avança para a próxima pergunta
        $scope.userAnswer = null; // Reseta a resposta
      }
    };

    // Reiniciar o questionário
    $scope.restart = () => {
      $scope.currentQuestionIndex = 0;
      $scope.submitted = false;
      $scope.userAnswer = null;
    };

    // Inicializar
    fetchWhitelabelConfig();
  },
]);

setTimeout(() => {
  angular.bootstrap(document.getElementById("enquete"), ["enquete"]);
}, 10);