function esperaAi(msg, tempo) {
    return new Promise((resolve, reject) => {    // cria a promise com seu construtor
        if (typeof msg !== 'string') reject('Bad Value')
           

        setTimeout(() => {
            resolve(msg)
        }, tempo);
    
    });

}

esperaAi('frase 1', 1000)
    .then( resposta => {
        console.log(resposta);
        return esperaAi('Frase 2', 2000)
    })
    .then(resposta => {
        return resposta + ' - Passei no then 2'  // a resposta do then é o retorno da função anterior 
    })
    .then(resposta => {
        console.log(resposta);
    })    
    .catch( e  => {
        console.log("ERRO", e)                  // captura o erro do reject
    });