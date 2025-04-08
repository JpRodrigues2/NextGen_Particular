let num1 = 9.54578

let num2 = Math.floor(num1)  // arredonda pra baixo
console.log(num2) 

let num3 = Math.ceil(num1)  // arredonda pra cima
console.log(num3)

let num4 = Math.round(num1)  // arredonda para o mais perto
console.log(num4)

console.log(Math.max(1,3,45,67,112,0)) // retorna o maior numero
console.log(Math.min(1,3,45,67,112)) // retorna o menor numero

const aleatorio = Math.random() * (10 - 5) + 5  // gera um numero aleatorio entre 0 e 1, passa * o max e min + min para o intervalo desejado
console.log(aleatorio)

console.log(Math.PI)

console.log(Math.pow(2, 10)) // Potência

console.log(num1 ** 0.5)  //Raiz quadrada