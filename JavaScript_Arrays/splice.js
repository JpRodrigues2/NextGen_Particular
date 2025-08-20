const nomes = ["Maria", "João", "Eduardo", "Gabriel", "Júlia"];

// nomes.splice(indice, delete, elemento1, elemento2 );

const removido = nomes.splice(3, 2); //retorna um array com o elemento removido
console.log(nomes, removido);

const add = nomes.splice(3, 0, "Luiza", "Fernanda"); //adiciona sem remover
console.log(nomes, add);
