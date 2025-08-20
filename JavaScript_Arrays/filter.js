// filtrar valores maior que 10
const numeros = [5,50,80,1,2,3,5,8,7,11,15,22,27]

//function callbackFilter (valor, indice, array)
function callbackFilter (valor) {
    return valor > 10;
}


// podia ser uma funcao anonima, uma arrow function, uma funcao de unica linha (valor => valor > 10)
const numerosFiltrados = numeros.filter(callbackFilter);  
console.log(numerosFiltrados); 