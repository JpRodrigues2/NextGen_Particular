try{
    console.log(naoExisto) // variavel nao declarada
} catch(err){              // err armazena o erro

    console.log('naoExiste não existe')
}



function soma(x,y){
    if (typeof x !== 'number' || typeof y !== 'number'){
        throw('x e y precisam ser números')
    }
    return x + y
}


try{
    console.log(soma(1,2))
    console.log(soma('1',2))
}catch(err){
    console.log(err)
}