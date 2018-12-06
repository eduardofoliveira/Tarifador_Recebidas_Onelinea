let obterChamadasOneLinea = (conn) => {
  return new Promise(async (resolve, reject) => {

    let [chamadas] = await conn.query(`
      SELECT
        uniqueid,
        callerid,
        callednum,
        billseconds,
        callstart
      FROM
        cdrs
      WHERE
        accountid = 87 and
        type = 3 and
        debit = 0 and
        billseconds > 0 and
        callstart >= CONVERT_TZ( now(), '+00:00','+03:00') - INTERVAL 2 DAY`)
    .catch(error => {
      console.log(error)
      process.exit(0)
    })

    resolve(chamadas)

  })
}

let obterTarifasOneLinea = (conn) => {
  return new Promise(async (resolve, reject) => {

    let [result] = await conn.query(`
      SELECT
        REPLACE(REPLACE(pattern, '^', ''), '.*', '') as pattern,
        comment,
        includedseconds,
        connectcost,
        init_inc,
        inc,
        cost
      FROM
        routes
      WHERE
        pricelist_id = 33`)
    .catch(error => {
      console.log(error)
      process.exit(0)
    })

    resolve(result)
  
  })
}

let atualizarChamadasOnelinea = (conn, chamadas) => {
  return new Promise(async (resolve, reject) => {

    for(let i = 0; i < chamadas.length; i++){
      if(chamadas[i].tarifa !== null){
        await conn.query(`
          UPDATE
            cdrs
          SET
            debit = ?
          WHERE
            uniqueid = ? AND
            callstart = ?`, [chamadas[i].custo, chamadas[i].uniqueid, chamadas[i].callstart])
        .then(resut => {
          console.log(`UPDATE cdrs SET debit = ${chamadas[i].custo} WHERE uniqueid = ${chamadas[i].uniqueid}`)
        })
        .catch(error => {
          console.log(error)
          process.exit(0)
        })
        await conn.query('UPDATE accounts SET balance = balance - ? WHERE id = 87', [chamadas[i].custo])
        await new Promise((resolveTime, rejectTime) => { setInterval(() => {resolveTime()}, 2000) })
      }
    }

    console.log('Terminou')
    resolve()

  })
}

module.exports = {
  obterChamadasOneLinea,
  obterTarifasOneLinea,
  atualizarChamadasOnelinea
}