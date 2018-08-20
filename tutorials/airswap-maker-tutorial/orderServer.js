const express = require('express')
const app = express()
app.use(express.json())
app.listen(5004, () => console.log('Order server listening on port 5004!'))
app.post('/getOrder', (req, res) => {
  const {
    makerAddress,
    makerAmount,
    makerToken,
    takerAddress,
    takerAmount,
    takerToken,
  } = req.body
  // How many seconds should this order be good for?
  const expiration = Math.round(new Date().getTime() / 1000) + 300
  // A unique piece of data to identify our order
  const nonce = String((Math.random() * 100000).toFixed())
  const order = {
    makerAmount: '10000',
    makerToken,
    takerAmount: '1000000000000000',
    takerToken,
    expiration,
    nonce,
  }
  res.send(order)
})
