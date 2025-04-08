const pessoa1 = {
    nome: 'Joao',
    sobrenome: 'Rodrigues',
    idade: 19,


    fala() {
        console.log(`Meu nome é ${this.nome} ${this.sobrenome}`)
    },

    idadeAnoQueVem(){
        console.log(`Ano que vem eu terei ${++this.idade} anos`)
    }
};
pessoa1.fala()
pessoa1.idadeAnoQueVem()

