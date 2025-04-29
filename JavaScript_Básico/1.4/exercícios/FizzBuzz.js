function fb (number){
    if(typeof number !== 'number') return numero
    if(number % 3 === 0 || number % 5 === 0) return "FizzBuzz"
    if(number % 3 === 0) return "Fizz"
    if(number % 5 === 0) return "Buzz"
    return 'Não é divisível'
}

for (let i = 0; i<=100; i++){
    console.log(i, fb(i))
}