The [Indexer Protocol](https://swap.tech/whitepaper#indexer-protocol) specifies how to manage your intent to trade to become discoverable by other peers on the network. To send messages to the Indexer when using the messaging system, set the `receiver` parameter to address `0x0000000000000000000000000000000000000000`.

## setIntents

Rather than adding and removing individual intent objects, you'll set the full configuration in one call.

You can set a trade intent for any ERC20 token and it will be discoverable by other peers on the network right away. This means that other traders who are connected to the AirSwap API can discover your intent to trade and request orders from you. However, new tokens must pass a quick legal review before they show up on the UI at https://airswap.io or https://instant.airswap.io. This process usually only takes a day or two.

**Parameters**

- `address`: Your **lowercased** Ethereum address.
- `intents`: A list of intent objects.

For example:

```json
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

```json
{
  "id": 2,
  "jsonrpc": "2.0",
  "result": "ok"
}
```

## getIntents

You can fetch the intent configuration for any peer to see what they've announced for trade. For an example of how to call `getIntents` on the Indexer, see the `getIntents` method in the [NodeJS library](https://github.com/airswap/developers/blob/master/api-server/lib/AirSwap.js).

**Parameters**

- `address`: A **lowercased** Ethereum address to fetch intent for.

For example:

```json
{
  "id": 3,
  "jsonrpc": "2.0",
  "method": "getIntents",
  "params": {
    "address": "0x64c5030facd9eec8ceea3520aa7a5c1e651dc879"
  }
}
```

And its response, a list of intent objects:

```json
{
  "id": 3,
  "jsonrpc": "2.0",
  "result": [
    {
      "takerToken": "0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8",
      "address": "0x64c5030facd9eec8ceea3520aa7a5c1e651dc879",
      "makerToken": "0xc778417e063141139fce010982780140aa0cd5ab",
      "role": "maker"
    }
  ]
}
```

You can now send the peer a `getOrder` call requesting an order for the indicated tokens.

## findIntents

You can search for intents by token address.

**Parameters**

- `makerTokens`: If role is `maker` this is a list of token addresses that you are looking to _buy_.
- `takerTokens`: If role is `taker` this is a list of token addresses that you would like to _sell_.
- `role`: Filter by those who have indicated that they intend to be a `maker` or `taker`.

For example:

```json
{
  "id": 4,
  "jsonrpc": "2.0",
  "method": "findIntents",
  "params": {
    "makerTokens": ["0xc778417e063141139fce010982780140aa0cd5ab"],
    "takerTokens": [],
    "role": "maker"
  }
}
```

And its response, a list of intent objects:

```json
{
  "id": 4,
  "jsonrpc": "2.0",
  "result": [
    {
      "takerToken": "0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8",
      "address": "0x64c5030facd9eec8ceea3520aa7a5c1e651dc879",
      "makerToken": "0xc778417e063141139fce010982780140aa0cd5ab",
      "role": "maker"
    }
  ]
}
```

With the `address` of each peer, you can now send that peer a `getOrder` call requesting an order for the indicated tokens.
