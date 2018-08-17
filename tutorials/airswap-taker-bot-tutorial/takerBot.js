const axios = require('axios')
const BN = require('bignumber.js')

const host = 'http://localhost:5005'

const { ETH_AMOUNT, TOKEN_AMOUNT, TOKEN_DECIMALS } = process.env

const tokenMultiplier = (() => {
  if (TOKEN_DECIMALS === 1) return 1
  let num = '1'
  for (let i = 0; i < TOKEN_DECIMALS; i++) {
    num += '0'
  }
  return num
})()

const tokenAmount = BN(TOKEN_AMOUNT).times(BN(tokenMultiplier))
const ethAmount = BN(ETH_AMOUNT).times(BN('1000000000000000000'))

async function init() {
  try {
    // get intents from makers who are trading our desired token
    const intentsRes = await axios.post(`${host}/findIntents`, {
      makerTokens: ['0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8'],
      takerTokens: ['0x0000000000000000000000000000000000000000'],
    })

    // ask each maker for an order
    const ordersRes = await axios.post(`${host}/getOrders`, {
      intents: intentsRes.data,
      makerAmount: tokenAmount,
    })

    // filter out timeout responses (from makers who aren't online)
    const orders = ordersRes.data.filter(order => order.code !== -1)

    // find the order with the cheapest price
    const bestOrder = orders.reduce((a, b) => {
      if (BN(a.takerAmount).lt(BN(b.takerAmount))) {
        return a
      }
      return b
    })

    const bestOrderAmount = bestOrder ? BN(bestOrder.takerAmount) : null

    // if the best order is cheaper than the ETH amount we specified, make the buy
    if (bestOrderAmount.lt(ethAmount)) {
      console.log('best order is cheaper than specified price. placing order!')
      const placedOrder = await axios.post(`${host}/fillOrder`, {
        order: bestOrder,
        config: { value: bestOrderAmount },
      })

      if (placedOrder.data && placedOrder.data.hash) {
        console.log(`Order filled! Tx Hash: ${placedOrder.data.hash}`)
      } else {
        console.error(`Something went wrong: ${placedOrder}`)
      }

      console.log('bye')
      process.exit(0)
    } else {
      // otherwise, keep polling
      setTimeout(() => {
        init()
      }, 60000)
    }
  } catch (error) {
    console.error(error)
  }
}

init()
