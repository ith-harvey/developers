# Example

1. In this example, we will make orders for AST/ETH. Setting an intent using the Indexer requires your wallet to hold 250 AST per token pair. To purchase AST on the Rinkeby network, head to the [Sandbox](https://sandbox.airswap.io/).

2.  Start the Client Server in Rinkeby mode with a private key:

    - `npm install`
    - `PRIVATE_KEY=0x000000000 MAINNET=0 node server.js`

2.  Set a trade intent for the token pair we plan to trade.

    ```bash
    curl -X POST \
      http://localhost:5005/setIntents \
      -H 'Content-Type: application/json' \
      -d '[{
      "makerToken": "0x27054b13b1b798b345b591a4d22e6562d47ea75a",
      "takerToken": "0x0000000000000000000000000000000000000000",
      "role": "maker"
    }]'
    ```

3.  Approve the AirSwap smart contract to move AST on our behalf. This call must be made _only once_ for each token you intend to trade.

    ```bash
    curl -X POST \
      http://localhost:5005/approveTokenForTrade \
      -H 'Content-Type: application/json' \
      -d '{
      "tokenContractAddr": "0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8"
    }'
    ```

4.  The Ethereum address corresponding to the private key from step 1 is now ready to serve orders for the AST/ETH pair. Now, it's time to implement your own order handling logic to serve incoming `getOrder` requests. Head over to the `order-server-examples/` directory to get started.
