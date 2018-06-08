const AirSwap = require('./lib/AirSwap.js')

const config = {
  privateKey: process.env.PRIVATE_KEY,
  infuraKey: process.env.INFURA_KEY,
  networkId: 'mainnet',
}

const airswap = new AirSwap(config)

// Connect to AirSwap, then execute a callback on success
airswap
  .connect()
  .then(() => {
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
      .then(intents => airswap.getOrders(intents, 100000))
      // `orders` is an array of signed orders and/or errors. The order objects are already signed by the maker.
      // If we want to fill an order, we just have to sign the transaction and submit it to the AirSwap smart contract
      .then(orders => {
        console.log('Got orders:', orders)

        /* Warning: The example below will attempt to execute a trade for 10 AST regardless of price
         * You should always check the `takerAmount` and `makerAmount` to make sure it's a fair trade!

         const [order] = orders.filter(
           o =>
             o.code !== -1 && o.makerAddress.toLowerCase() !== airswap.wallet.address.toLowerCase(),
         )
         if (order) {
           airswap
             .fillOrder(order, { value: order.takerAmount })
             .then(r => {
               console.log('Order fill success:', r.hash)
             })
             .catch(e => console.error('Order fill failure:', e))
        */

        airswap.disconnect()
      })
      .catch(e => {
        throw e
      })

    // Publish an array of trade intents to the indexer
    airswap
      .setIntents([
        {
          makerToken: '0x27054b13b1b798b345b591a4d22e6562d47ea75a',
          takerToken: '0x0000000000000000000000000000000000000000',
          role: 'maker',
        },
      ])
      .then(
        r => (r === 'ok' ? console.log('setIntents sucess') : console.log('setIntents failure')),
      )
      .catch(e => {
        throw e
      })

    // Implement your own methods to handle RPC calls from other peers
    // This getOrder example is hardcoded to offer 1 AST for 0.001 ETH
    airswap.RPC_METHOD_ACTIONS.getOrder = msg => {
      const {
        makerAddress,
        makerAmount,
        makerToken,
        takerAddress,
        takerAmount,
        takerToken,
      } = msg.params
      const nonce = String(Math.round(Math.random() * Date.now()))
      const expiration = Date.now() + 30000

      const signedOrder = airswap.signOrder({
        makerAddress: airswap.wallet.address.toLowerCase(),
        makerAmount: '10000',
        makerToken,
        takerAddress,
        takerAmount: '1000000000000000',
        takerToken,
        nonce,
        expiration,
      })
      airswap.call(
        takerAddress, // send order to address who requested it
        { id: msg.id, jsonrpc: '2.0', result: signedOrder }, // response id should match their `msg.id`
      )
    }
  })
  .catch(e => {
    throw e
  })
