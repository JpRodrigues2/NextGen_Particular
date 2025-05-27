;(() => {
  const API_BASE = "https://service2.funifier.com/v3/virtualgoods"
  const TOKEN =
    "Bearer eyJhbGciOiJIUzUxMiIsImNhbGciOiJHWklQIn0.H4sIAAAAAAAAAFWMzQoCIRRGXyVcu_APtfZB0LIHiDt6BUFSHKcaonfvMkHQ7uNwzvdi0PIZV3Zg1isQaJPSyiVnkgaNQvg942wOtSEpHSFeoRS-e_Q88DsjFvxtGDDBjNRACHW5je1YJvt_PIUYLEnLjJ2M42U9hXslkIEK6YzzThspOMNn24AnpKR4fwBVZB6osQAAAA.CVsg8Um8nhoIs3b0Isa5mzhZvSiG0Fgjnb2CFGEo1WuY5uovR0UGVx7iysa-lofzEImqT4reTYTPCFqYMIr11A"

  // Simplified player ID retrieval
  let PLAYER_ID = "tom" // Default fallback

  try {
    // Check if Funifier exists and try to get player ID
    if (typeof Funifier !== "undefined" && Funifier.widget && Funifier.widget.options) {
      // Try to get from widget options using the widget ID
      const widgetId = "funifier-loja-widget" // Use a fixed widget ID for simplicity

      if (Funifier.widget.options[widgetId] && Funifier.widget.options[widgetId].player) {
        PLAYER_ID = Funifier.widget.options[widgetId].player
        console.log("Found player ID in widget options:", PLAYER_ID)
      } else {
        // If not found in specific widget, try to find in any widget option
        for (const key in Funifier.widget.options) {
          if (Funifier.widget.options[key] && Funifier.widget.options[key].player) {
            PLAYER_ID = Funifier.widget.options[key].player
            console.log("Found player ID in widget options[" + key + "]:", PLAYER_ID)
            break
          }
        }
      }
    }
  } catch (err) {
    console.error("Error getting player ID:", err)
  }

  console.log("Using player ID:", PLAYER_ID)

  // Get DOM elements
  const catalogSelect = document.getElementById("funifier-catalog-select")
  const itemsContainer = document.getElementById("funifier-items-container")
  const messageBox = document.getElementById("funifier-message")

  // Check if elements exist
  if (!catalogSelect || !itemsContainer || !messageBox) {
    console.error("Required DOM elements not found!")
    return // Exit if elements don't exist
  }

  // Add player ID display for debugging
  const widgetElement = document.getElementById("funifier-loja-widget")
  if (widgetElement) {
    const playerIdDisplay = document.createElement("div")
    playerIdDisplay.className = "funifier-player-id"
    playerIdDisplay.textContent = `Player ID: ${PLAYER_ID}`
    widgetElement.insertBefore(playerIdDisplay, catalogSelect)
  }

  async function fetchAPI(endpoint, method = "GET", data = null) {
    try {
      const options = {
        method,
        headers: {
          Authorization: TOKEN,
          "Content-Type": "application/json",
        },
      }

      if (data && (method === "POST" || method === "PUT")) {
        options.body = JSON.stringify(data)
      }

      const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}/${endpoint}`
      console.log(`API Request: ${method} ${url}`, data ? data : "")

      const res = await fetch(url, options)
      const responseData = await res.json()

      console.log(`API Response:`, responseData)

      if (!res.ok) {
        console.error(`API Error: ${res.status} ${res.statusText}`, responseData)
        throw new Error(`Erro na API: ${res.status} ${res.statusText}`)
      }

      return responseData
    } catch (err) {
      console.error("API call failed:", err)
      throw err
    }
  }

  async function loadCatalogs() {
    try {
      showMessage("Carregando catálogos...", false)
      const catalogs = await fetchAPI("catalog")

      if (!catalogs || !Array.isArray(catalogs) || catalogs.length === 0) {
        showMessage("Nenhum catálogo disponível.", true)
        return
      }

      catalogSelect.innerHTML = ""
      catalogs.forEach((cat) => {
        const option = document.createElement("option")
        option.value = cat._id
        option.textContent = cat.catalog
        catalogSelect.appendChild(option)
      })

      if (catalogs.length) {
        loadItems(catalogs[0]._id)
      }
    } catch (err) {
      showMessage("Erro ao carregar catálogos: " + err.message, true)
    }
  }

  async function loadItems(catalogId) {
    try {
      if (!catalogId) {
        showMessage("ID do catálogo inválido.", true)
        return
      }

      showMessage("Carregando itens...", false)
      itemsContainer.innerHTML = ""

      const items = await fetchAPI("item")

      if (!items || !Array.isArray(items)) {
        showMessage("Erro ao carregar itens: formato inválido.", true)
        return
      }

      console.log(`Filtrando itens para catálogo: ${catalogId}`)
      console.log(`Total de itens recebidos: ${items.length}`)

      const filteredItems = items.filter((i) => i.catalogId === catalogId && i.active)
      console.log(`Itens filtrados: ${filteredItems.length}`)

      if (filteredItems.length === 0) {
        showMessage("Nenhum item disponível neste catálogo.", true)
        return
      }

      filteredItems.forEach((item) => {
        const card = document.createElement("div")
        card.className = "funifier-item-card"

        const imgUrl = item.image?.medium?.url || ""
        const img = document.createElement("img")
        img.src = imgUrl
        img.alt = item.name

        const name = document.createElement("div")
        name.className = "funifier-item-name"
        name.textContent = item.name

        let price = "-"
        let coinAmount = 0
        if (item.requires && item.requires.length > 0) {
          const moedaReq = item.requires.find((r) => r.type === 0 && r.operation === 1)
          if (moedaReq) {
            price = moedaReq.total
            coinAmount = moedaReq.total
          }
        }

        const priceDiv = document.createElement("div")
        priceDiv.className = "funifier-item-price"
        priceDiv.textContent = price

        const btn = document.createElement("button")
        btn.className = "funifier-buy-btn"
        btn.textContent = "COMPRAR"
        btn.onclick = () => purchaseItem(item._id, coinAmount, item.name)

        card.appendChild(img)
        card.appendChild(name)
        card.appendChild(priceDiv)
        card.appendChild(btn)

        itemsContainer.appendChild(card)
      })

      showMessage("")
    } catch (err) {
      console.error("Error loading items:", err)
      showMessage("Erro ao carregar itens: " + err.message, true)
    }
  }

  async function purchaseItem(itemId, price, itemName) {
    try {
      if (!itemId) {
        showMessage("ID do item inválido.", true)
        return
      }

      showMessage("Processando compra...", false)

      // Dados para a API de compra
      const purchaseData = {
        player: PLAYER_ID,
        item: itemId,
        total: 1,
      }

      console.log("Enviando compra com player ID:", PLAYER_ID)

      // Chamada à API de compra
      const result = await fetchAPI("purchase", "POST", purchaseData)

      if (result.status === "OK") {
        // Compra bem-sucedida
        showPurchaseSuccess(itemName)

        // Opcional: Recarregar os itens após a compra
        if (catalogSelect.value) {
          setTimeout(() => loadItems(catalogSelect.value), 2000)
        }
      } else if (result.status === "UNAUTHORIZED") {
        // Compra falhou
        showPurchaseError(result.restrictions)
      } else {
        // Outro erro
        showMessage("Erro desconhecido na compra.", true)
      }
    } catch (err) {
      showMessage("Erro ao processar compra: " + err.message, true)
    }
  }

  function showPurchaseSuccess(itemName) {
    // Cria um elemento de mensagem de sucesso
    const successMsg = document.createElement("div")
    successMsg.className = "funifier-purchase-success"
    successMsg.innerHTML = `
      <div class="funifier-purchase-icon">✓</div>
      <div class="funifier-purchase-text">Item "${itemName}" comprado com sucesso!</div>
    `

    showMessage("")
    messageBox.appendChild(successMsg)

    // Remove a mensagem após alguns segundos
    setTimeout(() => {
      if (messageBox.contains(successMsg)) {
        messageBox.removeChild(successMsg)
      }
    }, 3000)
  }

  function showPurchaseError(restrictions) {
    let errorMsg = "Não foi possível completar a compra:"

    if (restrictions && restrictions.length > 0) {
      if (restrictions.includes("insufficient_requirements")) {
        errorMsg = "Moedas insuficientes para esta compra."
      } else if (restrictions.includes("item_out_of_time")) {
        errorMsg = "Este item não está disponível no momento."
      } else if (restrictions.includes("limit_exceeded")) {
        errorMsg = "Você atingiu o limite de compras para este item."
      } else if (restrictions.includes("principal_not_allowed")) {
        errorMsg = "Você não tem permissão para comprar este item."
      }
    }

    showMessage(errorMsg, true)
  }

  function showMessage(msg, isError = false) {
    if (!messageBox) return

    messageBox.innerHTML = "" // Limpa mensagens anteriores
    messageBox.textContent = msg
    messageBox.style.color = isError ? "#e57373" : "#2d5d56"
  }

  // Add event listener for catalog selection
  if (catalogSelect) {
    catalogSelect.addEventListener("change", (e) => {
      loadItems(e.target.value)
    })
  }

  // Inicializa o widget
  loadCatalogs()
})()
