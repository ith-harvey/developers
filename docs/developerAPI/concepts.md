## Token addresses

On the Ethereum network, ERC20 tokens are smart contracts that implement functionality to define a fungible asset. As smart contracts, these tokens are referred to by their Ethereum address. The Swap Protocol [smart contract](https://github.com/airswap/contracts/blob/master/contracts/Exchange.sol) supports ERC20 tokens, but also native ETH for the `taker` side of trades. This is optional. You can address native ETH as `0x0000000000000000000000000000000000000000`.

## Makers and Takers

For the purposes of this document, a `maker` is one who constructs and signs orders, as specified in the [Swap Peer Protocol](https://swap.tech/whitepaper#peer-protocol). A `taker` likewise is an order taker. These are different than order makers and takers, which make and take markets, but may take or make orders. On the AirSwap Network, you may take the role of `maker` or `taker`.

**At time of writing, the AirSwap Indexer only supports the market `maker` role.** You must indicate the role of `maker` when announcing your intent to trade. Makers sign and send orders, takers accept and fill them. Takers have the option to fill an order, but they pay the gas to execute the Ethereum transaction and complete the trade.

## Intent to Trade

Setting "intent to trade" is how peers announce which tokens they're trading and how they can be reached. The two components of intent are `tokens` (i.e. trading X for Y) and `location` (i.e. protocol and address). Today, `location` is limited to Ethereum address, which is associated with a peer on the AirSwap messaging system as defined in the next section. You can announce an intent to sell for native ETH by setting `takerToken` to the address `0x0000000000000000000000000000000000000000`.

**Properties**

* `address`: **lowercased** Ethereum address of the announcing peer.
* `makerToken`: Token address for the `maker` side of the trade.
* `takerToken`: Token address for the `taker` side of the trade.
* `role`: Whether the intention is to be a `maker` or `taker`.

For example, the following object:

```json
{
  "address": "0x64c5030facd9eec8ceea3520fa7a5c1e651dc879",
  "makerToken": "0xc778417e063141139fce010983780140aa0cd5ab",
  "takerToken": "0xcc1cbd4f67cceb7c001be4adf98451237a193ff8",
  "role": "maker"
}
```

Would translate to "I intend to `make` orders, trading my `0xc778...` tokens for `0xcc1c...` tokens. I can be reached at address `0x64c5...`."

## Index Utility

To set your intent to trade, you must hold a minimum balance of **AirSwap Token (AST)** for each intent you hold on the Indexer. Today that amount is `250 AST` and is subject to change. Read more about the AirSwap Token on the [AirSwap Blog](https://blog.airswap.io/the-airswap-token-42855fe5e120).

## Authentication

The authentication sequence is as follows:

1. Open a WebSocket connection to `wss://sandbox.airswap-api.com/websocket` for **Rinkeby** and `wss://connect.airswap-api.com/websocket` for **Mainnet**.
2. When you connect, you will receive a frame of data, which is a unique [challenge](https://en.wikipedia.org/wiki/Challenge%E2%80%93response_authentication).
3. Sign this data using the ECDSA method found in the Signatures section.
4. Send the signed data over the socket to the server.
5. If accepted, you will receive a frame containing "ok" and are now free to send and receive RPC messages.

## Message Envelope

To send a message, construct an envelope in the following JSON format and send the string over the socket. You will not receive an acknowledgement of the messages you send but may receive a response from the receiver.

**Properties**

* `sender`: Your **lowercased** Ethereum address.
* `receiver`: The **lowercased** Ethereum address of the receiving peer.
* `message`: A stringified JSON-RPC message.

For example:

```json
{
  "sender": "0x0...",
  "receiver": "0x0...",
  "message": "{\"id\":1, ...}"
}
```
