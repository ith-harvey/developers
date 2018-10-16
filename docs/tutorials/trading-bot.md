## Overview

In the previous tutorial, we learned how to publish trade intents on the AirSwap network and programmatically serve orders to takers. Now that we’ve learned how to make liquidity on AirSwap, let’s talk about building applications that take liquidity.


## Requirements

* NodeJS 7.6 or higher.
* An Ethereum private/public key pair.
* Some test Ethereum to use on the Rinkeby network. You can get some from the [faucet](https://faucet.rinkeby.io/).
* At least 250 test AST to use on the Rinkeby network. You can get some by following Part 1 of the tutorial.
* A local copy of the AirSwap API Server from GitHub: https://github.com/airswap/developers/tree/master/api-server

## Source Code

Full source code for this tutorial is available here: https://github.com/airswap/developers/tree/master/tutorials/airswap-taker-bot-tutorial

## Set Up

First, make a new folder and create a JavaScript file called` takerBot.js`

```bash
mkdir airswap-taker-bot-tutorial && cd airswap-taker-bot-tutorial && touch takerBot.js
```

We’re going to use two dependencies: Axios for HTTP calls and BigNumber for handling very large numbers that normally [can’t be used in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER). Let’s create our package.json now:

```bash
cat > package.json <<EOF
{
  "name": "airswap-maker-tutorial",
  "version": "1.0.0",
  "main": "orderServer.js",
  "dependencies": {
    "axios": "^0.18.0",
    "bignumber.js": "^7.2.1"
  }
}
EOF
```

Then, run `npm install`

## Coding the Trading Bot

Open `takerBot.js` in your code editor and follow along. In the first few lines of the file, we are setting up some important constant values. Ethereum transactions require that we always use the smallest possible denomination for ETH and ERC20 tokens when specifying quantity. ETH has 18 decimals, which means that 1 ETH needs to be written as “1000000000000000000" in our code. AST has 4 decimals, so 10 AST is written as “100000”. Instead of entering these values by hand, we’re going to compute them.

```js

const axios = require('axios')
const BN = require('bignumber.js')
const host = 'http://localhost:5005'

// which token should the bot request orders for?
const tokenContractAddress = '0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8'

// how many decimals does this token have? (you can check the contract on etherscan)
const tokenDecimals = 4

// how many tokens is the bot trying to buy
let tokenAmount = 100

// how much ETH should the bot be willing to spend
let ethAmount = 0.01

// get the token multiplier based on number of decimal places
const tokenMultiplier = (() => {
  if (tokenDecimals === 1) return 1
  let num = '1'
  for (let i = 0; i < tokenDecimals; i++) {
    num += '0'
  }
  return num
})()

// convert amount of tokens to smallest denomination
tokenAmount = BN(tokenAmount).times(BN(tokenMultiplier))
// convert amount of ETH to smallest denomination
ethAmount = BN(ethAmount).times(BN('1000000000000000000'))
```

Now that we have our values ready to go, let’s add the application logic. First, some pseudocode to understand what’s going on at a high level:

1. Call AirSwap to get a list of makers who have signaled intent to trade.
2. For each maker in the list, request an order.
3. Filter orders to remove irrelevant responses (like network time outs).
4. Find the cheapest order in the list and compare its price with our specified price.
5. If the price is right, make the trade! Otherwise, repeat the cycle.

```js

async function init() {
  try {
  // get intents from makers who are trading our desired token
  const intentsRes = await axios.post(`${host}/findIntents`, {
    makerTokens: [tokenContractAddress],
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

  // if best order is cheaper than specified amount, make the buy
  if (bestOrderAmount.lt(ethAmount)) {
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
```

## Putting It All Together

From the directory containing the API Client Server:

`PRIVATE_KEY=0x<YOUR_PRIVATE_KEY> MAINNET=0 node server.js`

In a new command line window, from the directory containing your new `takerBot.js`:

`node takerBot.js`

Your bot will now check for orders every minute! You can adjust the `ethAmount` and `tokenAmount` variables or layer on more features to build on this foundation.

This is just a simple example of what’s possible with AirSwap. You can build many different types of applications using our [toolkit](https://github.com/airswap/developers). If you wanted to build a more sophisticated trading bot, you could pull in external API data and write a dynamic pricing algorithm. You could also build a simple web front end that distributes tokens to anyone on the internet. You could even operate the full stack and distribute tokens yourself by running an [Order Server](https://medium.com/fluidity/airswap-developer-series-part-2-building-an-order-server-e5f4753ad68a). The possibilities are endless!
