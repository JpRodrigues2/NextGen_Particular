angular.module('RankingApp', [])
.controller('RankingController', function($scope, $http, $timeout, $window) {
  // Configuração para requisição à API
  const req = {
    method: 'POST',
    url: 'https://service2.funifier.com/v3/leaderboard/EVyQhTw/leader/aggregate?period=&live=true',
    headers: {
      "Authorization": "Bearer eyJhbGciOiJIUzUxMiIsImNhbGciOiJHWklQIn0.H4sIAAAAAAAAAE2MywrCMBBFf0Wy7qJ5mIzuhYJLP0AmyQQKxYYkVYv47w4VxN3hcu55CczjmVZxFBaUlYBeaeWSM0mjjso7JzpRw5yJlUIYrzhN3e5RxkZfjDTRj7Ghx0r8wRDm5da2sEyWbPoL-xCDZWmpVNg4XdYh3GceRuSHdMYZue8BOkHPvA3QywMAvD8fkQagsQAAAA.DPmbZz38uxqUIK32MU38nE9jwGzaae3DgkKmsCWfiLEA-i37ngXkN6h3M9OcNlnFgtSthaHLSOfyFr63RDPmRw",
      "Content-Type": "application/json"
    },
    data: []
  };

  // Inicialização das variáveis
  $scope.players = [];
  $scope.hoveredPlayer = null;
  $scope.showTooltip = false;
  $scope.maxDistance = 0;
  $scope.minSpacing = 80; // Espaçamento mínimo entre carros
  $scope.adaptiveScale = 1; // Escala adaptativa para distribuição de carros
  
  // Continue com o carregamento dos dados
  $http(req).then(
    function(response) {
      const data = response.data;

      // Ordena do maior para o menor total (posição na corrida)
      data.sort((a, b) => b.total - a.total);

      // Define posição (rank)
      data.forEach((player, index) => {
        player.position = index + 1;
      });
      
      $scope.players = data;
      $scope.minSpacing = 120; // Aumentamos o espaçamento para evitar sobreposições
      
      // Calculamos a largura total da pista com base no número de jogadores
      $scope.maxDistance = calculateMaxDistance(data, null, $scope.minSpacing);
    },
    function(error) {
      console.error("Erro ao buscar ranking:", error);
      // Dados de exemplo para caso de falha na API
      $scope.players = generateDummyData(10);
      $scope.minSpacing = 120;
      $scope.maxDistance = calculateMaxDistance($scope.players, null, $scope.minSpacing);
    }
  );
  
  // Função para calcular a largura total necessária para a pista
  function calculateMaxDistance(players, scale, minSpacing) {
    if (!players || players.length === 0) return 1000;
    
    // Agora calculamos baseado no número de jogadores para um espaçamento uniforme
    const baseWidth = players.length * $scope.minSpacing;
    // Adicionar espaço extra para garantir visualização adequada
    return baseWidth + 600; // 600px extra para margem e linha de chegada
  }
  
  // Gerar dados de exemplo para testes ou falha na API
  function generateDummyData(count) {
    const dummyPlayers = [];
    for (let i = 1; i <= count; i++) {
      dummyPlayers.push({
        name: `Jogador ${i}`,
        total: Math.floor(Math.random() * 1000) + 500,
        position: i,
        image: null
      });
    }
    
    // Ordenar pelo total
    dummyPlayers.sort((a, b) => b.total - a.total);
    
    // Atualizar posições após ordenação
    dummyPlayers.forEach((player, index) => {
      player.position = index + 1;
    });
    
    return dummyPlayers;
  }
  
  // Função para resolver sobreposições de carros
  function resolveOverlaps() {
    // Organizamos os carros por faixas para evitar sobreposições
    const lanes = [[], [], [], []]; // 4 faixas disponíveis
    
    // Distribuir jogadores nas faixas
    $scope.players.forEach((player, index) => {
      // Coloca na faixa com menos jogadores para balancear
      const laneIndex = index % 4;
      lanes[laneIndex].push(player);
    });
    
    // Aplicar posicionamento nas faixas
    lanes.forEach((lanePlayers, laneIndex) => {
      lanePlayers.forEach((player) => {
        player.lane = laneIndex;
      });
    });
    
    // Forçar atualização da view
    $scope.$apply();
  }
  
  // Função para retornar estilo CSS com posição em fila única
  $scope.getCarStyle = function(index, total) {
    // Calculamos a posição baseada apenas na classificação (posição)
    // O primeiro colocado estará mais à direita
    const totalWidth = $scope.maxDistance - 200; // Reservamos espaço para a linha de chegada
    const position = $scope.players.length - index;
    
    // Distribuímos uniformemente com base no total de jogadores
    // Primeiro colocado mais à direita, último mais à esquerda
    const baseLeft = totalWidth - (position * $scope.minSpacing);
    
    // Todos os carros na mesma altura (centro vertical da pista)
    const topPosition = '50%';
    
    // Z-index baseado na posição para que o primeiro colocado fique visualmente acima
    const zIndex = 100 - index;
    
    return {
      left: baseLeft + 'px',
      top: topPosition,
      transform: 'translateY(-50%)',
      zIndex: zIndex
    };
  };
  
  // Selecionar imagem do carro com base na posição
  $scope.getCarImage = function(position) {
    // Podemos ter carros especiais para os três primeiros
    if (position === 1) return 'img/carro-ouro.png';
    if (position === 2) return 'img/carro-prata.png';
    if (position === 3) return 'img/carro-bronze.png';
    
    // Para os demais, usamos o carro padrão ou um conjunto de variações
    // Se não existirem as imagens personalizadas, usamos o carro padrão
    return 'img/carro1.png';
  };
  
  // Função para lidar com redimensionamento da janela
  function handleResize() {
    // Recalcular layout quando a janela for redimensionada
    $timeout(function() {
      resolveOverlaps();
    }, 200);
  }
  
  // Registrar event listener para redimensionamento
  angular.element($window).on('resize', handleResize);
  
  // Limpar listeners quando o controlador for destruído
  $scope.$on('$destroy', function() {
    angular.element($window).off('resize', handleResize);
  });
});