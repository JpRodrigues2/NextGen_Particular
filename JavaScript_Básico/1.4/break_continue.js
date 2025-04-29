const numeros = [1,2,3,4,5,6,7,8,9,10,11,12]

for (let i of numeros){

    if(i === 2){
        console.log('Pulei o 2')
        continue;
        
    }

    if(i === 7){
        console.log('Parei no 7')
        break;
    }

    console.log(i)
}