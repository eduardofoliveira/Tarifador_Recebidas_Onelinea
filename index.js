let util = require('./util')

let executar = async () => {
  const conn = await require('./service/mysql')
  const cdrs = require('./model/cdrs')

  let tarifas = await cdrs.obterTarifasOneLinea(conn)
  let chamadas = await cdrs.obterChamadasOneLinea(conn)

  console.log(`Encontradas ${chamadas.length} chamadas`)

  let chamadasCalculadas = await util.calcularChamadas(chamadas, tarifas)
  console.log(chamadasCalculadas)

  await cdrs.atualizarChamadasOnelinea(conn, chamadasCalculadas)

  await conn.end()

  console.log('Fechar')
  process.exit(0)
}

executar()