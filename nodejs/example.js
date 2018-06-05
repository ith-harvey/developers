const AirSwap = require('./AirSwap.js')

const config = {
  privateKey: process.env.PRIVATE_KEY,
  infuraKey: process.env.INFURA_KEY,
  networkId: 'mainnet',
}

const airswap = new AirSwap(config)

// Connect to AirSwap, then execute a callback on success
airswap.connect(() => {
  // Query the indexer for trade intents
  airswap
    .findIntents(
      ['0x27054b13b1b798b345b591a4d22e6562d47ea75a'], // AST
      ['0x0000000000000000000000000000000000000000'], // ETH
      'maker', // role
    )
    .then(intents => {
      console.log('Got Intents:', intents)
      return intents
    })
    // Request orders from peers whose trade intents were found on the indexer
    .then(airswap.getOrders)
    // `orders` is an array of signed orders and/or errors. The order objects are already signed by the maker.
    // If we want to fill an order, we just have to sign the transaction and submit it to the AirSwap smart contract
    .then(orders => {
      console.log('Got Orders:', orders)
    })
    .catch(console.error)

  // Publish an array of trade intents to the indexer
  airswap
    .setIntents([
      {
        makerToken: '0x27054b13b1b798b345b591a4d22e6562d47ea75a',
        takerToken: '0x0000000000000000000000000000000000000000',
        role: 'maker',
      },
    ])
    .then(console.log)
    .catch(console.error)

  // Implement your own methods to handle RPC calls from other peers
  airswap.RPC_METHOD_ACTIONS.getOrder = msg => {
    const { makerAddress, makerAmount, makerToken, takerAddress, takerAmount, takerToken } = msg.params
    const nonce = Math.round(Math.random() * Date.now())
    const expiration = Date.now() + 30000

    const signedOrder = airswap.signOrder({
      makerAddress: airswap.wallet.address.toLowerCase(),
      makerAmount: '100',
      makerToken,
      takerAddress,
      takerAmount: '100000',
      takerToken,
      nonce,
      expiration,
    })

    airswap.call(takerAddress, { id: msg.id, jsonrpc: '2.0', result: signedOrder })
  }
})
