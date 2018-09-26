let calculadora = require('./calculador')

/*calculadora.processar(0,0,60,60,0.0203,142)
  .then(custo => {
    console.log(custo)
  })*/

let searchRate = (tarifas, origin) => {
  let tamanho = origin.length
  let tarifaChamada = null

  for(let i = 0; i < tamanho; i++){
    origin = origin.substring(0, origin.length - 1)
    for(let a = 0; a < tarifas.length; a ++){
      //console.log(tarifas[a].pattern, origin)
      if(tarifas[a].pattern === origin){
        return tarifaChamada = tarifas[a]
      }
    }
  }

  return tarifaChamada
}

let executar = async () => {
  const db = await require('./db')

  let [tarifas] = await db.query("SELECT REPLACE(REPLACE(pattern, '^', ''), '.*', '') as pattern, comment, includedseconds, connectcost, init_inc, inc, cost FROM routes WHERE pricelist_id = 33")
  let [chamadas] = await db.query("SELECT uniqueid, callerid, callednum, billseconds FROM cdrs WHERE accountid = 87 and type = 3 and debit = 0 and billseconds > 0 and callstart >= CONVERT_TZ( now(), '+00:00','+03:00') - INTERVAL 1 HOUR")
  
  chamadas.map(item => {
    item.callerid = item.callerid.match(/<(.*)>/)[1]
    item.tarifa = searchRate(tarifas, item.callerid.toString())
    //console.log(item.tarifa)
    return item
  })

  await chamadas.map(async item => {
    if(item.tarifa !== null){
      let custo = await calculadora.processar(item.tarifa.includedseconds, item.tarifa.connectcost, item.tarifa.init_inc, item.tarifa.inc, item.tarifa.cost, item.billseconds)
      item.custo = custo
    }
    return item
  })

  for(let i = 0; i < chamadas.length; i++){
    if(chamadas[i].tarifa !== null){
      await db.query('UPDATE cdrs SET debit = ? WHERE uniqueid = ?', [chamadas[i].custo, chamadas[i].uniqueid])
      await db.query('UPDATE accounts SET balance = balance - ? WHERE id = 87', [chamadas[i].custo])
      await new Promise((resolve, reject) => { setInterval(() => {resolve()}, 2000) })
    }
  }

  db.end()
  process.exit(0)
}

executar()