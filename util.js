let { calcularTarifa } = require('./calculador')

let searchRate = (tarifas, origin, destination) => {
  let tamanhoOrigin = origin.length
  let tarifaChamada = null

  for(let i = 0; i < tamanhoOrigin; i++){
    origin = origin.substring(0, origin.length - 1)
    for(let a = 0; a < tarifas.length; a ++){
      //console.log(tarifas[a].pattern, origin)
      if(tarifas[a].pattern === origin){
        return tarifaChamada = tarifas[a]
      }
    }
  }

  let tamanhoDestination = destination.length
  for(let i = 0; i < tamanhoDestination; i++){
    destination = destination.substring(0, destination.length - 1)
    for(let a = 0; a < tarifas.length; a ++){
      //console.log(tarifas[a].pattern, destination)
      if(tarifas[a].pattern === destination){
        return tarifaChamada = tarifas[a]
      }
    }
  }

  return tarifaChamada
}

let calcularChamadas = async (chamadas, tarifas) => {
  return new Promise((resolve, reject) => {
    chamadas.map(item => {
      item.callerid = item.callerid.match(/<(.*)>/)[1]
      item.tarifa = searchRate(tarifas, item.callerid.toString(), item.callednum.toString())
      return item
    })
  
    chamadas.map(async item => {
      if(item.tarifa !== null){
        let custo = await calcularTarifa(item.tarifa.includedseconds, item.tarifa.connectcost, item.tarifa.init_inc, item.tarifa.inc, item.tarifa.cost, item.billseconds)
        item.custo = custo
      }
      return item
    })

    resolve(chamadas)
  })
}

module.exports = {
  searchRate,
  calcularChamadas
}