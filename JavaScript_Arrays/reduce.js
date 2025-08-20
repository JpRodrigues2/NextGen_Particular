const numeros = [5,50,80,1,2,3,5,8,7,11,15,22,27];

                 // acumulador, valor, indice, array
function soma(acumulador, valor) {
    acumulador += valor
    return acumulador
}
    

const total = numeros.reduce(soma , 0 );

const pessoas = [
  { nome: "Maria", idade: 62 },
  { nome: "João", idade: 23 },
  { nome: "Eduardo", idade: 55 },
  { nome: "leticia", idade: 19 },
  { nome: "Rosana", idade: 32 },
];

const maisVelha = pessoas.reduce((acumulador, pessoa) => {
  if (acumulador.idade > pessoa.idade) return acumulador;
  return pessoa;
});
console.log(maisVelha);
