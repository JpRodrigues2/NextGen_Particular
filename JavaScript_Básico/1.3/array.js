//                 0       1       2
const alunos = ['Luiz', 'Joao', 'Maria']

console.log(alunos.length)  //tamanho do array

alunos[0] = 'Pedro' //mudando nome na posicao 0
alunos[3] = 'Eduardo' // adicionando nome na posição 3
console.log(alunos)

console.log(alunos[0]) // retorna conteudo da posição 0
console.log(alunos[2]) // retorna conteudo da posição 2

alunos.push('Luiza') // adiciona no FIM do array
alunos.unshift('Julia') //adiciona no inicio do array
console.log(alunos)

alunos.pop() //remove do final do array
alunos.shift() // remove do inicio do array
console.log(alunos) 

delete alunos[1] //remove serm alterar o indice
console.log(alunos)

console.log(alunos.slice(0,3)) // Fatia o array
console.log(alunos.slice(0,-1))