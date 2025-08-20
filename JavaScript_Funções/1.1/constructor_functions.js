function Pessoa(nome, sobrenome){

    // atributos privados (não podem ser acessados fora da função)
    const ID = 1111
    const metodoInterno = function(){
        console.log('Método interno');
    }

    // atributos públicos (podem ser acessados fora da função)
    this.nome = nome;
    this.sobrenome = sobrenome;

    this.metodo = function (){
        console.log(`Seu nome é ${this.nome} ${this.sobrenome}`)
    }
    
}

const p1 = new Pessoa('joao', 'pedro'); 
p1.metodo(); 