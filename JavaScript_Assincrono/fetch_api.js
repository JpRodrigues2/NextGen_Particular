const url = 'https://dummyjson.com/products';

async function chamarApi() {
    const resp = await fetch(url);
    ///console.log(resp);   // resposta crua da API

    if (resp.status === 200) {
        const data = await resp.json();    // metodo json() para converter a resposta em json (resposta do conteudo da API)
        console.log(data);   // dados da API
    }    
}

chamarApi();