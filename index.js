const express = require('express')
const cacheManager = require("cache-manager")
const Cors = require('cors')
const Correio = require('node-correios')
const correio = new Correio
const app = express()

const cacheMemory = cacheManager.caching({
    store: "memory"
})

const PORT = 3002

app.use(Cors())

app.listen(PORT, () => console.log('Listening on port', PORT))

app.get('/', async (req, res) => {
  const {seeking} = req.query
 
  // Aqui na linha 23 eu pego o cep informado na variável "seeking" é verificar se existe no cache,
  // caso exista returna o valor, caso não returna "undefined"
  const resultCached = await cacheMemory.get(seeking);
  // Aqui na linha 25 eu verifica se tem valor, se tiver valor entra no código dentro do if.
  // caso não apenas ignora.
  if (resultCached) {
    console.log("SEARCH RESULT THE CACHE")
    return res.json(JSON.parse(resultCached));
  }

  correio.consultaCEP({ cep: seeking })
    .then(async (result) => {
        // Como não foi encontrado no cache o é feita a consulta no cep,
        // depois que o resultado é retornado eu vou armazenar no cache,
        // ponto importante aqui a primeira parâmetro da método é a chave onde
        // será usando quando você quer pegar os dados armazenados no cache
        // , o segundo parâmetro é o valor e o terceiro é o tempo de vida em segundos 
        // para aquela informação armazenada no cache. OBS: o tempo que a informação vai ser
        // cacheado vai ser algo que você define baseado na sua necessidade aqui você pode colocar 
        // até 1 hora ou mais.
        await cacheMemory.set(seeking, JSON.stringify(result), 20)
        res.send(result)
        console.log(result)
    })
    .catch (error => {
      console.log(error)
  })
})