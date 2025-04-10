const numeros = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000]
const [primeiro, segundo, ...resto] = numeros

console.log(primeiro,segundo)
console.log(resto)
console.log('----------------------------------------------------------------')
console.log()



const numeros2 = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000]
const [um, , tres, , cinco] = numeros2

console.log(um,tres,cinco)
console.log('----------------------------------------------------------------')
console.log()



const numeros3 = [ [1,2,3], [4,5,6 ], [7,8,9]]
const [lista1, lista2, lista3] = numeros3
console.log(lista2[2])

