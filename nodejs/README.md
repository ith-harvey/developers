## Requirements

- Node.js v8.5 or greater
- NPM or Yarn
- [Infura](https://infura.io/) API Key or a Geth/Parity node
- An Ethereum private key

## Documentation

We highly recommend reading the annotated source in the `docs/` directory before running any code.

## Getting Started

This repository has two main files. `AirSwap.js` exports the API library, and `example.js` uses the library to demonstrate some common use cases.

If you run `example.js` without changing anything, you will see a list of trade intents and orders logged to the console. If your Ethereum address holds at least 250 AST, it will also set a trade intent for AST on the indexer. This means that your address will show up whenever someone calls `findIntents` for AST. And, because `airswap.RPC_METHOD_ACTIONS.getOrder` is implemented, your maker will serve orders to any peer who requests one.

**Be careful with how you adjust the values**. Once you sign an order, the taker who requested it can execute the trade on the AirSwap smart contract.

### Running the Example

1.  `npm install` or `yarn install`
2.  `PRIVATE_KEY=XXXXXX INFURA_KEY=XXXXX node example.js` — don't forget to prepend the private key with "0x"

The `example.js` script demonstrates the following API functionalities:

- Calling `findIntents` on the indexer to get a list of makers who published a trade intent to the indexer
- Calling `getOrder` on a peer to get a quote for a given asset
- Calling `setIntents` on the indexer to make your trade intent known (address must hold 250 AST per intent)
- Implementing `getOrder` so that other peers can request quotes from you
- Using `signOrder` to authorize a quote so that a taker may fill it
