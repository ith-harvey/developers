const AirSwap = require('./lib/AirSwap.js')
const express = require('express')
const rp = require('request-promise')

if (!process.env.PRIVATE_KEY || !process.env.MAINNET) {
  throw new Error('must set PRIVATE_KEY and MAINNET environment variables')
}

const app = express()
const airswap = new AirSwap({
  privateKey: process.env.PRIVATE_KEY,
  networkId: parseInt(process.env.MAINNET, 10) ? 'mainnet' : 'rinkeby',
})
app.use(express.json())

const sendResponse = (res, data) => {
  res.status(200).send(data)
}

const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// Relay getOrder requests to the order server
airswap.RPC_METHOD_ACTIONS.getOrder = msg => {
  const { params } = msg
  params.makerAddress = airswap.wallet.address
  rp({
    method: 'POST',
    uri: 'http://localhost:5004/getOrder',
    json: true,
    body: params,
  }).then(orderParams => {
    const signedOrder = airswap.signOrder({
      ...orderParams,
      makerAddress: airswap.wallet.address,
      takerAddress: params.takerAddress,
    })
    airswap.call(
      params.takerAddress, // send order to address who requested it
      { id: msg.id, jsonrpc: '2.0', result: signedOrder }, // response id should match their `msg.id`
    )
  })
}

// Connect to AirSwap and listen for POSTs
airswap.connect().then(() => {
  app.post(
    '/findIntents',
    asyncMiddleware(async (req, res) => {
      const { makerTokens, takerTokens, role = 'maker' } = req.body
      const intents = await airswap.findIntents(makerTokens, takerTokens, role)
      sendResponse(res, intents)
    }),
  )

  app.post(
    '/getIntents',
    asyncMiddleware(async (req, res) => {
      const { address } = req.body
      const intents = await airswap.getIntents(address)
      sendResponse(res, intents)
    }),
  )

  app.post(
    '/setIntents',
    asyncMiddleware(async (req, res) => {
      const intents = req.body.length ? req.body : null
      const data = await airswap.setIntents(intents)
      sendResponse(res, data)
    }),
  )

  app.post(
    '/getOrder',
    asyncMiddleware(async (req, res) => {
      const { makerAddress, params } = req.body
      const order = await airswap.getOrder(makerAddress, params)
      sendResponse(res, order)
    }),
  )

  app.post(
    '/getOrders',
    asyncMiddleware(async (req, res) => {
      const { intents, makerAmount } = req.body
      const orders = await airswap.getOrders(intents, makerAmount)
      sendResponse(res, orders)
    }),
  )

  app.post('/signOrder', (req, res) => {
    const { makerAddress, makerAmount, makerToken, takerAddress, takerAmount, takerToken, expiration, nonce } = req.body
    sendResponse(
      res,
      airswap.signOrder({
        makerAddress,
        makerAmount,
        makerToken,
        takerAddress,
        takerAmount,
        takerToken,
        expiration,
        nonce,
      }),
    )
  })

  app.post(
    '/fillOrder',
    asyncMiddleware(async (req, res) => {
      const { order, config } = req.body
      const tx = await airswap.fillOrder(order, config)
      sendResponse(res, tx)
    }),
  )

  app.post(
    '/unwrapWeth',
    asyncMiddleware(async (req, res) => {
      const { amount, config } = req.body
      const tx = await airswap.unwrapWeth(amount, config)
      sendResponse(res, tx)
    }),
  )

  app.post(
    '/approveTokenForTrade',
    asyncMiddleware(async (req, res) => {
      const { tokenContractAddr, config } = req.body
      const tx = await airswap.approveTokenForTrade(tokenContractAddr, config)
      sendResponse(res, tx)
    }),
  )

  app.listen(5005, () => console.log('API client server listening on port 5005!'))
})
