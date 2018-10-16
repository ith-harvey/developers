## Overview

We launched AirSwap for Developers in May of this year. Since then, our community of passionate developers have built volume trackers, custom trading interfaces, desktop applications, and much more. Seeing all of this happen in just under three months has been awe-inspiring for the team. We want to enable more developers and traders, so today we’re re-launching our developers repository and kicking off a three part guided tutorial to teach you everything you need to know about building on AirSwap.

## Makers and Takers {docsify-ignore}

The [Swap protocol](https://swap.tech/whitepaper/) is a peer-to-peer system. This means that every trade happens directly between two peers — a maker and a taker. One common misconception we see is the notion that a maker is a “seller” and a taker is a “buyer”. This is incorrect.

The maker — let’s call him Bob — is the peer who tells AirSwap that he wants to __make__ a trade. Alice, our fictional taker, then visits AirSwap and searches for trades. She finds Bob’s intent to make orders, so she asks him for one. Bob then makes an order, signs it, and sends it to Alice. At this point, it’s up to Alice whether or not she wants to __take__ the trade.

Now that we’ve gotten that out of the way, let’s dive into the code. The rest of the tutorial will show you the basics of the AirSwap [API Server](https://github.com/airswap/developers/tree/master/api-server), which is your primary resource as a developer in the ecosystem.

## Requirements

* NodeJS 7.6 or higher.
* An Ethereum private/public key pair. Generate one using the command line or your favorite tool. I recommend [MetaMask](https://metamask.io/).
* Some test Ethereum to use on the Rinkeby network. You can get some from the [faucet](https://faucet.rinkeby.io/).
* A local copy of the AirSwap API Server from GitHub: https://github.com/airswap/developers/tree/master/api-server

## Up and Running

* Open a new command line window and change directory to the freshly cloned repository.
* Run `npm install` on the command line.
* Open a new terminal window and start the server with two required environment variables: `PRIVATE_KEY` (prepended with “0x”) and MAINNET(0=testnet, 1=mainnet).

`PRIVATE_KEY=0x00000000000000 MAINNET=0 node server.js`

You should see the following message printed:

```
Authentication successful
API client server listening on port 5005!
```

Our API Client Server has successfully connected to AirSwap and Ethereum on the Rinkeby test net! Here is a brief taste of what’s possible now that our local API server is up and running. You can follow along on the command line by pasting the following cURL commands, or you can use your favorite programming language to make HTTP requests. We’re going to make a few POST calls to acquire some test net AST. This test AST doesn’t have any value and we’ll be using it for demonstration purposes only in the next two parts of this educational series.

## Find All Makers Trading AST

```bash
curl -X POST \
  http://localhost:5005/findIntents \
  -H 'Content-Type: application/json' \
  -d '{
    "makerTokens": ["0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8"],
    "takerTokens": ["0x0000000000000000000000000000000000000000"]
  }'
  ```

  ## Get an Order for 250 AST from a Maker

  ```bash
  curl -X POST \
  http://localhost:5005/getOrder \
  -H 'Content-Type: application/json' \
  -d '{
    "makerAddress": "0x6cc47be912a07fbe9cebe68c9e103fdf123b7269",
    "params": {
      "makerAmount": "2500000",
      "makerToken": "0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8",
      "takerToken": "0x0000000000000000000000000000000000000000"
    }
  }'
  ```

  If the maker is online, it should return an object that looks something like this


```json
{
  "makerAddress": "0x6cc47be912a07fbe9cebe68c9e103fdf123b7269",
  "makerAmount": "2500000",
  "makerToken": "0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8",
  "takerAddress": YOUR_ETHEREUM_ADDRESS,
  "takerAmount": "75624999999999995",
  "takerToken": "0x0000000000000000000000000000000000000000",
  "expiration": 1532472860,
  "nonce": "87334985",
  "v": 28,
  "r": "0x7d9683f06db87623aebe0efe80ce5bb3f76169cb9499aaaa2542d6fe9c3b63fd",
  "s": "0x3b98025bacbac5b28d2b9340d626dbe68518d229e550c3f705c56df852615d78"
}
```

You’ll need to copy the entire object into the `order` parameter on the next step. You’ll also need to copy the `takerAmount` value into the `config` parameter.

## Take the Order

```bash
curl -X POST \
  http://localhost:5005/fillOrder \
  -H 'Content-Type: application/json' \
  -d '{
   "order": <PASTE ORDER OBJECT HERE>,
   "config": {"value": <PASTE takerAmount VALUE HERE>}
  }'
  ```

This call should return an object like so:

```json
{
  "nonce": 41,
  "gasPrice": {
    "_bn": "9502f9000"
  },
  "gasLimit": {
    "_bn": "27100"
  },
  "to": "0x07fC7c43D8168a2730344E5CF958aaecc3B42B41",
  "value": {
    "_bn": "10cac896d238ffb"
  },
  "data": ...,
  "v": 44,
  "r": "0x3d89bab993b49a057afaf0fd64e2ee25585e737ed62e43536a38ef54d52fc5f2",
  "s": "0x4ab90c9b74a1598d4a77dc40e7ac5ddd3b91b3deddf198a8d8b8f69da7327fe9",
  "chainId": 4,
  "from": "YOUR_ETHEREUM_ADDRESS",
  "hash": "0x3b69625feeb2b3ab82850fec945d2e3b6584f435f5091ed266a2015c2069153d"
}
```

The hash key in this object is the transaction hash for your order. You can look up that hash on https://rinkeby.etherscan.io to see the result.

## Congratulations 🎉
You now own 250 test net AST. Make sure to hang onto it — you’ll need it for Part 2. The [API methods](https://github.com/airswap/developers/tree/master/api-server#api) referenced in this tutorial can be leveraged to build powerful applications like automated market makers and trading bots. In fact, that’s exactly what we’ll be doing in Part 2 and Part 3 of this tutorial series. Stay tuned!
