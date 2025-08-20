function* geradora(){
    yield 0;
    console.log('primeiro')

    yield 1 ;
    console.log('segundo')

    yield 2;
    console.log('terceiro')
}

const g1 = geradora();

console.log(g1.next().value);
console.log(g1.next().value);
console.log(g1.next().value);


