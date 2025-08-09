function retornaFuncao(nome){
    return function() {
        return nome;
    }
}

const funcao = retornaFuncao('Joao')
const funcao2 = retornaFuncao('Pedro')

console.log(funcao(), funcao2());
 