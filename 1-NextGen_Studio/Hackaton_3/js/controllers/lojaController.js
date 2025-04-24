angular.module('lojaApp', [])
  .controller('LojaController', function($scope, $http, $timeout) {
    // Inicialização das variáveis
    $scope.produtos = [];
    $scope.loading = true;
    $scope.showToast = false;
    $scope.toastMessage = '';
    $scope.toastType = 'success';
    $scope.userCoins = 0;
    $scope.isProcessingPurchase = false;
    $scope.isProcessingItem = null;
    $scope.playerId = null;
    
    // Token de autorização
    const authToken = "Bearer eyJhbGciOiJIUzUxMiIsImNhbGciOiJHWklQIn0.H4sIAAAAAAAAAD2LywoCIRRAfyXu2oWvdKZ9ELTsA-KmVxAkRZ1qiP49YWB2h8M5X8ASr7TCCczEpdfzLJW0weqgUBmpeQAGzeVCI6mE_o4pscO7xk4bekq0M3Z8YKPxoHN5efZxnW_rxb3qcEujuos8RMQRCKuP3FojBAP6lE1YSWohfn9klZ5goAAAAA.eQFVR_VP5MFh5IuWCL1fziprSm8uNxqVvAVo4ej1pDG1pWMPhqvlUr4w7cNUKQZYANXJfxyak4352boi9MXJNw";
    
    // Inicializar os dados
    init();
    
    // Função de inicialização
    function init() {
      // Recuperar ID do jogador do localStorage
      $scope.playerId = localStorage.getItem('playerId');
      
      if (!$scope.playerId) {
        showToast('ID do jogador não encontrado. Por favor, faça login novamente.', 'error');
        // Redirecionar para o login após um breve delay
        $timeout(function() {
          window.location.href = 'login.html';
        }, 2000);
        return;
      }
      
      loadUserData();
      loadProducts();
    }
    
    // Carregar dados do usuário
    function loadUserData() {
      $http({
        method: 'GET',
        url: 'https://service2.funifier.com/v3/player/current',
        headers: {
          "Authorization": authToken,
          "Content-Type": "application/json"
        }
      })
      .then(
        function(response) {
          if (response.data && response.data.point_categories) {
            $scope.userCoins = response.data.point_categories.moedas || 0;
          }
        },
        function(error) {
          console.error('Erro ao carregar dados do usuário:', error);
          showToast('Erro ao carregar seus dados. Por favor, recarregue a página.', 'error');
        }
      );
    }
    
    // Carregar produtos disponíveis
    function loadProducts() {
      $scope.loading = true;
      
      $http({
        method: 'GET',
        url: 'https://service2.funifier.com/v3/virtualgoods/item',
        headers: {
          "Authorization": authToken,
          "Content-Type": "application/json"
        }
      })
      .then(
        function(response) {
          // Verificar se a resposta está no formato esperado
          if (response.data && Array.isArray(response.data)) {
            $scope.produtos = response.data;
          } else {
            console.error('Formato de resposta inválido:', response.data);
            $scope.produtos = [];
          }
          $scope.loading = false;
        },
        function(error) {
          console.error('Erro ao carregar produtos:', error);
          showToast('Erro ao carregar os produtos. Por favor, tente novamente.', 'error');
          $scope.loading = false;
          $scope.produtos = [];
        }
      );
    }
    
    // Obter o preço de um produto (considerando que pode haver diferentes formas de requisitos)
    $scope.getProductPrice = function(produto) {
      if (produto.requires && produto.requires.length > 0) {
        for (let i = 0; i < produto.requires.length; i++) {
          const requisito = produto.requires[i];
          if (requisito.item === 'moedas') {
            return requisito.total;
          }
        }
      }
      return '?';
    };
    
    // Comprar um produto
    $scope.comprarProduto = function(produto) {
      if (produto.owned > 0) {
        showToast('Você já adquiriu este produto!', 'error');
        return;
      }
      
      const precoMoedas = $scope.getProductPrice(produto);
      
      if ($scope.userCoins < precoMoedas) {
        showToast('Moedas insuficientes para esta compra!', 'error');
        return;
      }
      
      // Impedir múltiplas compras simultâneas
      if ($scope.isProcessingPurchase) {
        return;
      }
      
      $scope.isProcessingPurchase = true;
      $scope.isProcessingItem = produto._id;
      
      $http({
        method: 'POST',
        url: 'https://service2.funifier.com/v3/virtualgoods/purchase',
        headers: {
          "Authorization": authToken,
          "Content-Type": "application/json"
        },
        data: {
          "player": $scope.playerId,
          "item": produto._id,
          "total": 1
        }
      })
      .then(
        function(response) {
          // Verificar o status da resposta
          if (response.data && response.data.status === "OK") {
            // Atualizar os dados após a compra bem-sucedida
            produto.owned = 1;
            $scope.userCoins -= precoMoedas;
            
            showToast('Produto adquirido com sucesso!', 'success');
          } else if (response.data && response.data.restrictions) {
            // Tratar restrições conhecidas
            if (response.data.restrictions.includes('insufficient_requirements')) {
              showToast('Moedas insuficientes para esta compra!', 'error');
            } else {
              showToast('Não foi possível completar a compra: ' + response.data.restrictions.join(', '), 'error');
            }
          } else if (response.data && response.data.status === "UNAUTHORIZED") {
            showToast('Compra não autorizada. Verifique seu saldo.', 'error');
          } else {
            showToast('Erro desconhecido ao processar a compra.', 'error');
          }
          
          $scope.isProcessingPurchase = false;
          $scope.isProcessingItem = null;
        },
        function(error) {
          console.error('Erro ao comprar produto:', error);
          
          if (error.data && error.data.error) {
            showToast(error.data.error, 'error');
          } else if (error.data && error.data.restrictions) {
            showToast('Restrição: ' + error.data.restrictions.join(', '), 'error');
          } else {
            showToast('Erro ao processar a compra. Por favor, tente novamente.', 'error');
          }
          
          $scope.isProcessingPurchase = false;
          $scope.isProcessingItem = null;
        }
      );
    };
    
    // Função para exibir toast de notificação
    function showToast(message, type) {
      $scope.toastMessage = message;
      $scope.toastType = type;
      $scope.showToast = true;
      
      // Esconder o toast após 3 segundos
      $timeout(function() {
        $scope.showToast = false;
      }, 3000);
    }
    
    // Função de logout
    $scope.logout = function() {
      // Limpar dados armazenados
      localStorage.removeItem('playerId');
      localStorage.removeItem('userToken');
      
      // Redirecionar para login
      window.location.href = 'login.html';
    };
  });