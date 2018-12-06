let calcularTarifa = (connectionTime, connectionCost, initialIncrement, increment, valor, duracao) => {
  return new Promise((resolve, reject) => {
    let duracaoCobranca = 0
    let custo = 0

    for(let i = 0; i <= duracao; i++){
      if(i <= initialIncrement){
        duracaoCobranca = initialIncrement
      }
      if(i > duracaoCobranca){
        duracaoCobranca = duracaoCobranca + increment
      }
    }

    if(!(duracao <= connectionTime)){
      if(duracao <= initialIncrement){
        custo = (initialIncrement/60)*valor
      }else{
        custo = (duracaoCobranca/60)*valor
      }
    }else{
      custo = connectionCost
    }

    resolve(custo)
  })
}

module.exports = {
  calcularTarifa
}