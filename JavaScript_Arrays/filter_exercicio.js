// retorne as pessoas cujo o nome tem mais de 5 letras
//mais de 50 anos
//nome termina com a

const pessoas = [
  { nome: "Maria", idade: 62 },
  { nome: "João", idade: 23 },
  { nome: "Eduardo", idade: 55 },
  { nome: "leticia", idade: 19 },
  { nome: "Rosana", idade: 32 },
];

const maisCinco = pessoas.filter(function (obj) {
  return obj.nome.length > 5;
});
console.log(maisCinco);


const maisCinqueta = pessoas.filter(obj => obj.idade > 50)
console.log(maisCinqueta);

const terminaA = pessoas.filter( function (obj){
  return obj.nome.toLowerCase().endsWith("a");
});
console.log(terminaA);