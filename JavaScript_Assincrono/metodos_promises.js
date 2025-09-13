// Promise.all  -- resolve todas as promises, se uma de errado, rejeita todas
// Promise.race  -- retorna a primeira promise que for resolvida
// Promise.resolve  -- cria uma promise resolvida
// Promise.reject  -- contrario do resolve, cai no catch direto


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


const promises = [
    
    esperaAi('Promise 1', 3000),
    esperaAi('Promise 2', 500),
    esperaAi('Promise 3', 1000),
    esperaAi(1000, 4000),
    
]



Promise.all(promises)
    .then( valor => {
        console.log(valor , ' - promise.all')
    })
    .catch(e => {
        console.log('erro:', e)
    })




Promise.race(promises)
    .then( valor => {
        console.log(valor, ' - promise.race')
    })
    .catch(e => {
        console.log('erro:', e)
    })



    
function baixaPagina() {
    const emCache = false;
    
    if (emCache){
        return Promise.resolve('Página em cache')
    } else{
        return esperaAi('Baixei a página', 3000)
    }
}

baixaPagina()
    .then(valor => {
        console.log(valor, ' - promise.resolve')
    })
    .catch( e => console.log(e) )




