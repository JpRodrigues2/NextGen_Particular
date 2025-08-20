const numeros = [5,50,80,1,2,3,5,8,7,11,15,22,27];

// function callbackMap(valor, indice, array)
function callbackMap(valor) {
    return valor * 2;
}

const numerosDobro = numeros.map(callbackMap);
console.log(numerosDobro); 

