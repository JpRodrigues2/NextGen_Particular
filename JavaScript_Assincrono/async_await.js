function esperaAi(msg, tempo) {
    return new Promise((resolve, reject) => {    // cria a promise com seu construtor
        setTimeout(() => {
            if (typeof msg !== 'string'){
            reject('Caiu no erro');
            return;
        }

        resolve(msg)
        }, tempo);
    
    });

}


// esperaAi('frase 1', 1000)
//     .then( resposta => {
//         console.log(resposta);
//         return esperaAi('Frase 2', 2000)
//     })
//     .then(resposta => {
//         return resposta + ' - Passei no then 2'  // a resposta do then é o retorno da função anterior 
//     })
//     .then(resposta => {
//         console.log(resposta);
//     })    
//     .catch( e  => {
//         console.log("ERRO", e)                  // captura o erro do reject
//     });


async function executa(){
    try{
        const fase1 = await esperaAi('await 1', 1000)
        console.log (fase1)

        const fase2 = await esperaAi('await 2', 2000)
        console.log (fase2)

        const fase3 = await esperaAi('await 3', 3000)
        console.log (fase3)

        console.log('Terminou na fase:', fase3)

    } catch(e){
        console.log('ERRO', e)          // nao executa o que tem dps do erro
    }   
}
executa()