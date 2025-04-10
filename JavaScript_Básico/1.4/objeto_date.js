 // const tresHoras = 60 *60 * 3 * 1000  --> 60 seg , 60 min , 3horas, 1000 ms

// const data = new Data(2019, 3) a, m, d, h, min, s, ms

// const data = new Date('2019-04-20 20:20');  // formato do objeto data

const datas = new Date('2020-04-20 20:15:59')

console.log('Dia', datas.getDate())
console.log('mes', datas.getMonth() + 1) //começa no 0
console.log('ano', datas.getFullYear())
console.log('hora', datas.getHours())
console.log('minutos', datas.getMinutes())
console.log('segundos', datas.getSeconds())
console.log('milisegundos', datas.getMilliseconds())
console.log('Dia da semana', datas.getDay()) // 0 é domingo, 6 é sábado
console.log(datas.toString()); 

function zeroAEsquerda(num){
    return num >= 10 ? num : `0${num}`
}

function formataData(data){
    const dia = zeroAEsquerda(data.getDate())
    const mes = zeroAEsquerda(data.getMonth() + 1)
    const ano = zeroAEsquerda(data.getFullYear())
    const hora = zeroAEsquerda(data.getHours())
    const min = zeroAEsquerda(data.getMinutes())
    const seg = zeroAEsquerda(data.getSeconds())

    return `${dia}/${mes}/${ano} ${hora}:${min}:${seg}`
}

const data = new Date()
const dataHoje= (formataData(data))
console.log(dataHoje)