const express = require('express')

const app = express()
app.use(express.json())
app.listen(5004, () => console.log('Order server listening on port 5004!'))

app.post('/getOrder', (req, res) => {
  const {
    makerAddress, // eslint-disable-line
    makerAmount, // eslint-disable-line
    makerToken,
    takerAddress, // eslint-disable-line
    takerAmount, // eslint-disable-line
    takerToken,
  } = req.body

  // Expiration in _seconds_ since the epoch (Solidity uses seconds not ms)
  const expiration = Math.round(new Date().getTime() / 1000) + 300
  const nonce = String((Math.random() * 100000).toFixed())

  const order = {
    makerAmount: '10000',
    makerToken,
    takerAmount: '1000000000000000',
    takerToken,
    expiration,
    nonce,
  }
  console.log('sending order', order)
  res.send(order)
})
