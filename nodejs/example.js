const AirSwap = require('./lib/AirSwap.js')
const ethers = require('ethers')

const { utils } = ethers
const config = {
  privateKey: process.env.PRIVATE_KEY,
  infuraKey: process.env.INFURA_KEY,
  networkId: 'rinkeby',
}
const tokenContract =
  config.networkId === 'mainnet'
    ? '0x27054b13b1b798b345b591a4d22e6562d47ea75a' // mainnet AST
    : '0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8' // rinkeby AST

const airswap = new AirSwap(config)

// Connect to AirSwap, then execute a callback on success
airswap
  .connect()
  .then(() => {
    // Taker Example
    // ----------------
    // **Takers request orders from Makers and then execute the trade if they like the order.**

    // Query the indexer for trade intents
    airswap
      .findIntents(
        [tokenContract], // AST
        ['0x0000000000000000000000000000000000000000'], // ETH
        'maker', // role
      )
      .then(intents => {
        console.log('Got Intents:', intents)
        return intents
      })
      // Request orders from peers whose trade intents were found on the indexer
      .then(intents => airswap.getOrders(intents, 10000))
      // `orders` is an array of signed orders and/or errors. The order objects are already signed by the maker.
      // If we want to fill an order, we just have to sign the transaction and submit it to the AirSwap smart contract
      // (the `AirSwap.prototype.fillOrder` method accomplishes this)
      .then(orders => {
        let exampleFill = null // eslint-disable-line
        console.log('Got orders:', orders.filter(o => o.code !== -1))

        /* Warning: Uncommenting the example below will attempt to execute a trade for 1 AST regardless of price
         * You should add some logic to check `takerAmount` and `makerAmount` to make sure it's a fair trade!

        exampleFill = () => {
          const [order] = orders.filter(
            o =>
              o.code !== -1 &&
              o.makerAddress.toLowerCase() !== airswap.wallet.address.toLowerCase(),
          )
          if (order) {
            console.log(`filling order from ${order.makerAddress}`)
            airswap
              .fillOrder(order, {
                value: order.takerAmount,
                gasLimit: 160000,
                gasPrice: utils.parseEther('0.000000040'),
              })
              .then(r => {
                console.log('Order fill success:', r.hash)
                airswap.disconnect()
              })
              .catch(e => {
                console.error('Order fill failure:', e)
                airswap.disconnect()
              })
          } else {
            console.log('no valid orders found', orders)
            airswap.disconnect()
          }
        }
        */
        if (typeof exampleFill === 'function') {
          exampleFill()
        } else {
          airswap.disconnect()
        }
      })
      .catch(console.error)

    // Maker Example
    // ----------------
    // **Makers publish intent to trade specific tokens on AirSwap, and then send signed orders to Takers who request them.**

    // Publish an array of trade intents to the indexer
    airswap
      .setIntents([
        {
          makerToken: tokenContract,
          takerToken: '0x0000000000000000000000000000000000000000',
          role: 'maker',
        },
      ])
      .then(
        r => (r === 'ok' ? console.log('setIntents sucess') : console.log('setIntents failure')),
      )
      .catch(console.error)

    // Approve the AirSwap smart contract to move AST tokens on our behalf.
    // This block is commented out by default so users don't needlessly call `approve` over and over again.
    // * You only have to do this once per token that you want to trade on AirSwap.
    // * if you want to swap an ERC20 for another peer's ETH, you must `approve` AirSwap to move the ERC20 on your behalf
    // * if you want to swap ETH for another peer's ERC20, you do not have to approve anything, because you are simply sending ETH
    // * Learn More: https://theethereum.wiki/w/index.php/ERC20_Token_Standard#Approve_And_TransferFrom_Token_Balance

    /*
    airswap
      .approveTokenForTrade(tokenContract)
      .then(r => console.log('approved', r))
    */

    // This is where you handle order requests from takers and respond with signed orders.
    // You should implement your own pricing logic. This `getOrder` example is hardcoded to offer 1 AST for 0.001 ETH.
    airswap.RPC_METHOD_ACTIONS.getOrder = msg => {
      const {
        makerAddress, // eslint-disable-line
        makerAmount, // eslint-disable-line
        makerToken,
        takerAddress,
        takerAmount, // eslint-disable-line
        takerToken,
      } = msg.params

      // Expiration in _seconds_ since the epoch (Solidity uses seconds not ms)
      const expiration = Math.round(new Date().getTime() / 1000) + 300
      const nonce = String((Math.random() * 100000).toFixed())

      const signedOrder = airswap.signOrder({
        makerAddress: airswap.wallet.address,
        makerAmount: '10000',
        makerToken,
        takerAddress,
        takerAmount: utils.parseEther('0.001').toString(),
        takerToken,
        expiration,
        nonce,
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
