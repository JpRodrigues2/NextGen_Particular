const nomes = ['João', 'Maria', 'José', "remover"];

const nomes2 = nomes  // cópia da referência - oq acontece com nomes2, acontece com nomes (nao é o ideal)
const nomes3 = [...nomes];  // cópia do valor - oq acontece com nomes3, não afeta nomes

const nomeRemovido1 = nomes3.pop();  // remove o último elemento e retorna (guarda)
console.log(nomeRemovido1); 

const nomeRemovido2 = nomes3.shift();  // remove o primeiro elemento e retorna (guarda)
console.log(nomeRemovido2);


nomes2.push('Pedro');  // adiciona ao FINAL do array
nomes2.unshift('Luiza');  // adiciona ao INICIO do array
console.log(nomes2);


const nomes4 = [...nomes]
nomes4.splice(1, 3); // remove os itens de índice 1 a 3
console.log(nomes4);

const meuNome = 'João Pedro Rodrigues';
const meuNome2 = meuNome.split(' '); // divide a string em um array de palavras
console.log(meuNome2);

const meuNome3 = meuNome2.join(' '); // junta o array de volta em uma string, nesse caso juntando com espaços
console.log(meuNome3);
