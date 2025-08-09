const nome = "Luiz"

function falaNome(){
    console.log(nome);
}

function usaFalaNome(funcao){
    const nome = "otavio"   // nao muda nada
    falaNome()              // lembra de quando foi declarada e busca a ariavel em seu pai  
} 
usaFalaNome()
