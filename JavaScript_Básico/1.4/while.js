const nome = 'Luiz'
let i = 0

while (i < nome.length){
    console.log(nome[i])
    i++
}
console.log('-------------\n')





function random(min,max){
    const r = Math.random() * (max - min) + min
    return Math.floor(r) 
}

const min = 1
const max = 50
let rand = random(min,max)

while(rand != 10){
    rand = random(min, max)
    console.log(rand)
}
console.log('------')

do{
    console.log(rand); // do while executa ao menos uma vez, mesmo que a primeira execução seja falsa
}while (rand != 10);