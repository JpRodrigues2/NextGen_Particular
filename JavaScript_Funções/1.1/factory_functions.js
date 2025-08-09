function criaPessoa(nome, sobrenome){
    return{
        nome, 
        sobrenome,
        fala(assunto){
            return `${this.nome} ${this.sobrenome} está ${assunto}`           
        }
    }
}

const p1 = criaPessoa('joao', 'silva');
console.log(p1.fala('falando sobre JS'));
