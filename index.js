let calculadora = require('./calculador')

/*calculadora.processar(0,0,30,6,0.60,50)
  .then(custo => {
    console.log(custo)
  })*/

let searchRate = (tarifas, origin) => {
  let tamanho = origin.length
  let tarifaChamada = null

  for(let i = 0; i < tamanho; i++){
    origin = origin.substring(0, origin.length - 1)
    for(let a = 0; a < tarifas.length; a ++){
      if(tarifas[a].pattern === origin){
        tarifaChamada = tarifas[a]
        break
      }
    }
  }

  return tarifaChamada
}

let executar = async () => {
  const db = await require('./db')

  let [tarifas] = await db.query("SELECT REPLACE(REPLACE(pattern, '^', ''), '.*', '') as pattern, comment, includedseconds, connectcost, init_inc, inc, cost FROM routes WHERE pricelist_id = 33")
  let [chamadas] = await db.query("SELECT uniqueid, callerid, callednum, billseconds FROM cdrs WHERE accountid = 87 and type = 3 and debit = 0")
  
  chamadas.map(item => {
    item.callerid = item.callerid.match(/<(.*)>/)[1]
    item.tarifa = searchRate(tarifas, item.callerid.toString())
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