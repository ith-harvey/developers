
# AirSwap for Developers
[AirSwap](https://airswap.io/) is a peer-to-peer Ethereum token marketplace. Peers discover each other through search and connect to make trades. The AirSwap APIs follow the [Swap Protocol](https://swap.tech/whitepaper). Learn more by visiting the [AirSwap website](https://airswap.io/).

## :warning: Warning

### Read the terms of use.
This is a developer preview and subject to change. The following APIs are in use in production on the AirSwap network. We are sharing these APIs and code samples publicly with our community to build and iterate on them. By connecting to and using the AirSwap services you accept the [AirSwap Terms of Use](https://swap.tech/airswap-terms-of-use.pdf). Please also be sure to review the [LICENSE](LICENSE).

### Start with the Rinkeby sandbox.
An important part of our developer system is the Rinkeby sandbox. By connecting, you can make trades without spending real ether. By default the Widget API will connect to the **Rinkeby** sandbox which loads the frontend located at https://sandbox.airswap.io/. To set your widget to make trades on **Mainnet** set the `env` parameter to `production`.

For the messaging system the **Rinkeby** WebSocket server can be reached at `wss://sandbox.airswap-api.com/websocket` and **Mainnet** at `wss://connect.airswap-api.com/websocket`.

### Join the conversation.
Be sure to join the AirSwap Developers Telegram group at https://t.me/airswapdevs or the AirSwap Community at https://t.me/airswap.

## AirSwap Widget API
The AirSwap trading widget can be embedded in any webpage with just a few lines of code. See live examples on [Bounty0x](https://alpha.bounty0x.io/bounties) and [AdChain](https://publisher.adchain.com/domains). To add token trading to your web app, simply drop in the `JavaScript` library into your webpage and try out the examples found in the [widget](widget) folder.

## AirSwap Trading API
The AirSwap Trading API is an implementation of the [Swap Protocol](https://swap.tech/whitepaper).

* [Introduction](#introduction)
* [Concepts](#concepts)
  * [Token addresses](#token-addresses)
  * [Makers and takers](#makers-and-takers)
  * [Intent to trade](#intent-to-trade)
  * [Index utility](#index-utility)
  * [Remote procedure calls](#remote-procedure-calls)
* [Using the messaging system](#using-the-messaging-system)
* [Getting and providing orders](#getting-and-providing-orders)
  * [getOrder](#getorder)
  * [Error codes](#error-codes)
* [Using the Indexer](#using-the-indexer)
  * [setIntents](#setintents)
  * [getIntents](#getintents)
  * [findIntents](#findintents)
* [Using Ethereum](#using-ethereum)
  * [Signatures](#signatures)
  * [Approving withdrawals](#approving-withdrawals)
  * [Filling and canceling orders](#filling-and-canceling-orders)
* [Getting support](#getting-support)

## Introduction
The [Swap Protocol](https://swap.tech/whitepaper) outlines peer-to-peer protocols for trading Ethereum-based assets that conform to the [ERC-20](https://en.wikipedia.org/wiki/ERC20) token standard. The protocol whitepaper does not specify the transports or data formats to be used in order to remain flexible. However, our implementation, [AirSwap](https://airswap.io/), does conform to the specifications described below.

### Quick start
For a quick start, take a look at the `Python` or `Node.js` examples found in the [python](python) or [nodejs](nodejs) folders.

### Concepts

#### Token addresses

On the Ethereum network, ERC20 tokens are smart contracts that implement functionality to define a fungible asset. As smart contracts, these tokens are referred to by their Ethereum address. The Swap Protocol [smart contract](https://github.com/airswap/contracts/blob/master/contracts/Exchange.sol) supports ERC20 tokens, but also native ETH for the `taker` side of trades. This is optional. You can address native ETH as `0x0000000000000000000000000000000000000000`.

#### Makers and takers

For the purposes of this document, a `maker` is one who constructs and signs orders, as specified in the [Swap Peer Protocol](https://swap.tech/whitepaper#peer-protocol). A `taker` likewise is an order taker. These are different than market makers and market takers, which make and take markets, but may take or make orders. On the AirSwap Network, you may take the role of `maker` or `taker`.

**At time of writing, the AirSwap Indexer only supports the market `maker` role.** You must indicate the role of `maker` when announcing your intent to trade. Makers sign and send orders, takers accept and fill them. Takers have the option to fill an order, but they pay the gas to execute the Ethereum transaction and complete the trade.

#### Intent to trade

Setting "intent to trade" is how peers announce which tokens they're trading and how they can be reached. The two components of intent are `tokens` (i.e. trading X for Y) and `location` (i.e. protocol and address). Today, `location` is limited to Ethereum address, which is associated with a peer on the AirSwap messaging system as defined in the next section. You can announce an intent to sell for native ETH by setting `takerToken` to the address `0x0000000000000000000000000000000000000000`.

**Properties**

* `address`: **lowercased** Ethereum address of the announcing peer.
* `makerToken`: Token address for the `maker` side of the trade.
* `takerToken`: Token address for the `taker` side of the trade.
* `role`: Whether the intention is to be a `maker` or `taker`.

For example, the following object:

```
{
  "address": "0x64c5030facd9eec8ceea3520fa7a5c1e651dc879",
  "makerToken": "0xc778417e063141139fce010983780140aa0cd5ab",
  "takerToken": "0xcc1cbd4f67cceb7c001be4adf98451237a193ff8",
  "role": "maker"
}
```

Would translate to "I intend to `make` orders, trading my `0xc778...` tokens for `0xcc1c...` tokens. I can be reached at address `0x64c5...`."

#### Index utility

To set your intent to trade, you must hold a minimum balance of **AirSwap Token (AST)** for each intent you hold on the Indexer. Today that amount is `250 AST` and is subject to change. Read more about the AirSwap Token on the [AirSwap Blog](https://blog.airswap.io/the-airswap-token-42855fe5e120).

#### Remote procedure calls

To invoke methods on other peers and services on the network, messages take the form of [JSON-RPC 2.0](http://www.jsonrpc.org/specification). These JSON structures can be sent over a variety of transports like WebSockets and HTTP.

## Using the messaging system

The messaging system is used as a convenience for peers to connect and communicate with other peers and network services like the Indexer. The interface to the messaging system is a WebSocket, for which many [client libraries](https://github.com/facundofarias/awesome-websockets) exist in most programming languages. For an example of how to use the messaging system with the Indexer API, see [indexer_example.py](python/indexer_example.py).

#### Authentication

The authentication sequence is as follows:

1. Open a WebSocket connection to `wss://sandbox.airswap-api.com/websocket` for **Rinkeby** and `wss://connect.airswap-api.com/websocket` for **Mainnet**.
2. When you connect, you will receive a frame of data, which is a unique [challenge](https://en.wikipedia.org/wiki/Challenge%E2%80%93response_authentication).
3. Sign this data using the ECDSA method found in the [Signatures](#signatures) section.
4. Send the signed data over the socket to the server.
5. If accepted, you will receive a frame containing "ok" and are now free to send and receive RPC messages.

#### Message envelope

To send a message, construct an envelope in the following JSON format and send the string over the socket. You will not receive an acknowledgement of the messages you send but may receive a response from the receiver.

**Properties**

* `sender`: Your **lowercased** Ethereum address.
* `receiver`: The **lowercased** Ethereum address of the receiving peer.
* `message`: A stringified JSON-RPC message.

For example:

```
{
  "sender": "0x0..."
  "receiver": "0x0..."
  "message": "{\"id\":1, ...}"
}
```

## Getting and providing orders

The [Swap Peer Protocol](https://swap.tech/whitepaper#peer-protocol) specifies an RFQ-style interaction between order makers and takers to communicate orders for specific amounts and token pairs. Orders are filled on the [swap contract](#filling-and-canceling-orders) by the taker.

### getOrder

To fill the role of `maker` on the network, you must implement the `getOrder` method. As a `taker` you will call this method on other peers. For an example of how to sign orders, see the [sign_order.py](python/sign_order.py) example.

**Parameters**  
All parameters are strings. Amounts must be in the base unit of the asset, e.g. `wei` rather than `ether`.

* `makerAmount`: Amount to be transferred from maker to taker for a `sell` trade. This param must be set if `takerAmount` is unset.
* `makerToken`: Address of the token to be transferred from `maker` to `taker`.
* `takerAmount`: Amount to be transferred from taker to maker for a `buy` trade. This param must be set if `makerAmount` is unset.
* `takerToken`: Address of the token to be transferred from `taker` to `maker`.
* `takerAddress`: Address of the taker sending the `getOrder` request.

For example, peer `0x7e83c5583731653bee2fa7d2562b24a59d172dd6` calls `getOrder` to buy 10000 of your token `0x27054b13b1b798b345b591a4d22e6562d47ea75b` in exchange for their token `0x6810e776880c02933d47db1b9fc05908e5386b97`:

```
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "getOrder",
  "params": {
    "makerAmount": "10000",
    "makerToken": "0x27054b13b1b798b345b591a4d22e6562d47ea75b",
    "takerToken": "0x6810e776880c02933d47db1b9fc05908e5386b97",
    "takerAddress": "0x7e83c5583731653bee2fa7d2562b24a59d172dd6"
  }
}
```

And its response, as matched by `id`:
```
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "expiration": 1524506409,
    "makerAddress": "0x6cc47be912a07fbe9cebe68c9e103fdf123b7269",
    "makerAmount": "10000",
    "makerToken": "0x27054b13b1b798b345b591a4d22e6562d47ea75b",
    "nonce": "71161637",
    "r": "0x8b7a43d9b882a244a82c1e8b94661f41af40b30bc8297241111b2697edc66a79",
    "s": "0x6d9a9c6c7ea655b8cbfb3a17f2183d9de977d99de69f01a98c537a1a29b484c2",
    "takerAddress": "0x7e83c5583731653bee2fa7d2562b24a59d172dd6",
    "takerAmount": "579639999999999",
    "takerToken": "0x6810e776880c02933d47db1b9fc05908e5386b97",
    "v": "27"
  }
}
```

### Error codes

The above call may have thrown an error, matched by `id`:
```
{
  "id": 1,
  "jsonrpc": "2.0",
  "error": {
    "code": -33605,
    "message": "Rate limit exceeded"
  }
}
```

The following are error codes in the [JSON-RPC specification](http://www.jsonrpc.org/specification#error_object):

* `-32700` Parse error
* `-32600` Invalid Request
* `-32601` Method not found
* `-32602` Invalid params
* `-32603` Internal error
* `-32000 to -32099` Reserved for implementation-defined server-errors.

We have allocated the following range for Swap Protocol errors:

* `-33600` Cannot provide this order
* `-33601` Unsupported `makerToken` `takerToken` pair
* `-33602` The specified `takerAmount` or `makerAmount` is too low
* `-33603` The specified `takerAmount` or `makerAmount` is too high
* `-33604` Improperly formatted `makerToken`, `takerToken`, or `takerAddress` address
* `-33605` Rate limit exceeded
* `-33700 to -33799` Reserved for implementation defined trading errors.

## Using the Indexer

The [Indexer Protocol](https://swap.tech/whitepaper#indexer-protocol) specifies how to manage your intent to trade to become discoverable by other peers on the network. To send messages to the Indexer when using the messaging system, set the `receiver` parameter to address `0x0000000000000000000000000000000000000000`.

### setIntents
Rather than adding and removing individual intent objects, you'll set the full configuration in one call.

**Parameters**
* `address`: Your **lowercased** Ethereum address.
* `intents`: A list of [intent objects](#intent-to-trade).

For example:

```
{
  "id": 2,
  "jsonrpc": "2.0",
  "method": "setIntents",
  "params": {
    "address": "0x64c5030facd9eec8ceea3520aa7a5c1e651dc879",
    "intents": [
      {
        "makerToken": "0xc778417e063141139fce010982780140aa0cd5ab",
        "takerToken": "0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8",
        "role": "maker"
      }
    ]
  }
}
```

And its response, simply an "ok" if all goes well:

```
{
  "id": 2,
  "jsonrpc": "2.0",
  "result": "ok"
}
```

### getIntents
You can fetch the intent configuration for any peer to see what they've announced for trade. For an example of how to call `getIntents` on the Indexer, see [indexer_example.py](python/indexer_example.py) or [example.js](nodejs/example.js).

**Parameters**
* `address`: A **lowercased** Ethereum address to fetch intent for.

For example:

```
{
  "id": 3,
  "jsonrpc": "2.0",
  "method":"getIntents",
  "params": {
    "address": "0x64c5030facd9eec8ceea3520aa7a5c1e651dc879"
  }
}
```

And its response, a list of intent objects:

```
{
  "id": 3,
  "jsonrpc": "2.0",
  "result": [{
    "takerToken": "0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8",
    "address": "0x64c5030facd9eec8ceea3520aa7a5c1e651dc879",
    "makerToken": "0xc778417e063141139fce010982780140aa0cd5ab",
    "role": "maker"
  }]
}
```

You can now send the peer a `getOrder` call requesting an order for the indicated tokens.

### findIntents
You can search for intents by token address.

**Parameters**

* `makerTokens`: If role is `maker` this is a list of token addresses that you are looking to _buy_.
* `takerTokens`: If role is `taker` this is a list of token addresses that you would like to _sell_.
* `role`: Filter by those who have indicated that they intend to be a `maker` or `taker`.

For example:

```
{
  "id": 4,
  "jsonrpc": "2.0",
  "method": "findIntents",
  "params": {
    "makerTokens": [
      "0xc778417e063141139fce010982780140aa0cd5ab"
    ],
    "takerTokens": [],
    "role": "maker"
  }
}
```

And its response, a list of intent objects:

```
{
  "id": 4,
  "jsonrpc": "2.0",
  "result": [{
    "takerToken": "0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8",
    "address": "0x64c5030facd9eec8ceea3520aa7a5c1e651dc879",
    "makerToken": "0xc778417e063141139fce010982780140aa0cd5ab",
    "role": "maker"
  }]
}
```

With the `address` of each peer, you can now send that peer a `getOrder` call requesting an order for the indicated tokens.

## Using Ethereum
Interacting with Ethereum smart contracts requires an Ethereum node, which can is accessed via JSON-RPC. See the Python [web3.py](https://github.com/ethereum/web3.py) and JavaScript [web3.js](https://github.com/ethereum/web3.js/) client libraries. If you do not plan to run an Ethereum node of your own, you can use a service like [INFURA](https://infura.io/).

The **Mainnet** Swap contract can be found at [`0x8fd3121013a07c57f0d69646e86e7a4880b467b7`](https://etherscan.io/address/0x8fd3121013a07c57f0d69646e86e7a4880b467b7) and **Rinkeby** Swap contract found at [`0x07fc7c43d8168a2730344e5cf958aaecc3b42b41`](https://rinkeby.etherscan.io/address/0x07fc7c43d8168a2730344e5cf958aaecc3b42b41)

### Signatures
Ethereum has native support for [ECDSA signatures](https://en.bitcoin.it/wiki/Elliptic_Curve_Digital_Signature_Algorithm) which take the form of the `v`, `r`, and `s` values seen in the orders above. This is how the Swap contract verifies that the order was properly signed by the maker. Both [web3.py](https://github.com/ethereum/web3.py) and [web3.js](https://github.com/ethereum/web3.js/) include signing functionality.

### Approving withdrawals

In order to fill orders on the Swap contract, you must approve it to perform ERC20 transfers on your behalf. This is the case for both making and taking orders, as the `transfer` functions are called on each token contract during the swap. [Learn more about ERC20 and the approval process here](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md).

### Filling and canceling orders
Take a look at the [contract source code](https://github.com/airswap/contracts/blob/master/contracts/Exchange.sol) and [protocol whitepaper](https://swap.tech/whitepaper/#smart-contract) for more detail.
