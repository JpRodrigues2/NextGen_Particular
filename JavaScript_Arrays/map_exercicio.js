const pessoas = [
    { nome: "Maria", idade: 62 },
    { nome: "João", idade: 23 },
    { nome: "Eduardo", idade: 55 },
    { nome: "Leticia", idade: 19 },
    { nome: "Rosana", idade: 32 },
];

//string com nome da pessoa
// remover a chave 'nome' do objeto
//adicione uma chave id em cada objeto

const nome = pessoas.map( obj => obj.nome);
console.log(nome)



 

const removeNome = pessoas.map( obj => {           
    delete obj.nome;  
    return obj;
}); 
console.log(removeNome)

const removeNome2 = pessoas.map( obj => {           
    return {idade: obj.idade}
});
console.log(removeNome2)




const id = pessoas.map(function(obj, indice) {
   obj.id = (indice + 1)*100   
   return obj;  // esta fazendo alterações nos objetos originais
})
console.log(id)

const id2 = pessoas.map(function(obj, indice) {
    newObj = {...obj} 
    newObj.id = (indice + 1) * 100;
    return newObj;
})
console.log(id2)
