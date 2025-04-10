const pessoa = {
    nome: 'Luiz',
    sobrenome: 'Miranda',
    idade:30,
    endereco:{
        rua: 'AV Brasil',
        numero: 320
    }
}


// atribuiçao via desestruturação
const{nome='nao_existe'} = pessoa // nas chaves deve conter o nome da chave, caso a chave não exista retona oq ta entre aspas
console.log(nome)   

console.log('-------------------')
const {sobrenome: sec_name='nao_existe'} = pessoa  // da outra nome a chave do objeto
console.log(sec_name)

console.log('-------------------')
const {endereco: {rua: r, numero}} = pessoa
console.log(r)
console.log(numero)

console.log('-------------------')
const{idade, ...resto}= pessoa
console.log(idade)
console.log(resto)
