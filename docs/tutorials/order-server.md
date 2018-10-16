## Overview


In Part 1 of the AirSwap Developer Series, we learned about the roles of Makers and Takers. We also learned how to use the API Client Server to request orders and fill them. In Part 2, we’ll build a simple Order Server which will allow us to signal intent to trade as a Maker on the network.


## Requirements

* NodeJS 7.6 or higher.
* An Ethereum private/public key pair.
* Some test Ethereum to use on the Rinkeby network. You can get some from the [faucet](https://faucet.rinkeby.io/).
* At least 250 test AST to use on the Rinkeby network. You can get some by following Part 1 of the tutorial.
* A local copy of the AirSwap API Server from GitHub: https://github.com/airswap/developers/tree/master/api-server


## Set Up
  First, make a new folder and create a JavaScript file called `orderServer.js`

  ```bash
  mkdir airswap-maker-tutorial && cd airswap-maker-tutorial && touch orderServer.js
  ```

  We’re going to use the Express framework to power our server, so let’s start by creating a package.json file and installing Express. Run the following to output your package.json file:

  ```js
  cat > package.json <<EOF
    {
      "name": "airswap-maker-tutorial",
      "version": "1.0.0",
      "main": "orderServer.js",
      "dependencies": {
        "express": "^4.16.3"
      }
    }
    EOF
  ```

 Then, run `npm install`

 ## Coding the Order Server

 Now that we have our dependencies set up, we’re ready to write our Order Server. Let’s open `orderServer.js` in the text editor and lay the foundation.

```js

const express = require('express')
const app = express()
app.use(express.json())
app.listen(5004, () => console.log('Order server listening on port 5004!'))
app.post('/getOrder', (req, res) => {
})

```

This code sets up a simple HTTP server that listens on port 5004 for calls to the `/getOrder` route. We specify this port and route because that’s where the API Client Server forwards incoming order requests. When a taker sends a getOrder request, your API Client Server receives the request and sends it to the Order Server so you can decide how you want to respond. Inside of the getOrder route is where we’ll write our order handling logic. Let’s update the getOrder route now.

```js

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

```

We haven’t implemented any complex pricing logic. This code is simply responding to every getOrder request with an order that offers 1 test net AST for 0.001 test net ETH. This is a barebones example from which you can build whatever pricing logic you feel is appropriate. Maybe you want to offer a bulk discount if someone asks for a large number of tokens, or maybe you want to pull in live data from a centralized exchange API and base your prices off of that. The possibilities are endless!

__Note:__ If you’re wondering why we specified the `makerAmount` as “10000” and the `takerAmount` as “1000000000000000", it’s because Ethereum smart contracts require us to always write values in the smallest possible denomination. ETH and AST have 18 and 4 decimals respectively. So, if we want to offer 1 AST, we actually need to write “1” with the decimal place moved 4 places to the right. Thus, we get “10000”. The same rule applies to ETH and to every other token. You can easily look up how many decimals a token has with [Etherscan](https://etherscan.io/token/0x27054b13b1b798b345b591a4d22e6562d47ea75a).

## Putting It All Together

The last step is to run our Order Server in parallel with the API Client Server.

From the directory containing the API Client Server:

`PRIVATE_KEY=0x<YOUR_PRIVATE_KEY> MAINNET=0 node server.js`

In a new command line window, from the directory containing your new `orderServer.js`:

`node orderServer.js`

When both of these servers are running, your address will instantly serve orders to takers who request them.

That’s all for this post. Stay tuned for Part 3! In the third and final tutorial, we’ll be making a simple front end interface that allows users on the web to get tokens directly from your Order Server. We’ll also build a trading bot that periodically requests orders and executes trades if the price is right.
