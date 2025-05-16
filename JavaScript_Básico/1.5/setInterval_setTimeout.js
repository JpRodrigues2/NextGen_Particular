function mostraHora(){
    let data = new Date()

    return data.toLocaleTimeString('pt-BR',
        {hour12 : false
})

}

 
const timer = setInterval(function (){   // setInterval executa o trecho de codigo durante x milisegundos
    console.log(mostraHora())
}, 1000)


setTimeout(function(){
    clearInterval(timer)  //setTimeout executa o trecho de codigo depois de x milisegundos
}, 5000)