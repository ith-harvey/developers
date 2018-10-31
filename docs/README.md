![alt text](./assets/logo/AirSwap-Developer-Tools-Logo.png)

## What is AirSwap?

[AirSwap](https://airswap.io/) is a peer-to-peer network for trading Ethereum tokens. Peers discover each other through search and connect to make trades. The AirSwap APIs follow the [Swap Protocol](https://swap.tech/whitepaper). Learn more by visiting the [AirSwap website](https://airswap.io/). The AirSwap developers offering currently consists of two main components: the Widget and the API Server.

!> Warning - Read Terms of Use.

## Terms of Use

The following APIs are in use in production on the AirSwap network. We are sharing these APIs and code samples publicly with our community to build and iterate on them. By connecting to and using the AirSwap services you accept the [AirSwap Terms of Use](https://swap.tech/airswap-terms-of-use.pdf). Please also be sure to review the [LICENSE](LICENSE.md).

## Start with the Rinkeby sandbox

An important part of our developer system is the Rinkeby sandbox. By connecting, you can make trades without spending real ether. By default the Widget API will connect to the **Rinkeby** sandbox which loads the frontend located at https://sandbox.airswap.io/. To set your widget to make trades on **Mainnet** set the `env` parameter to `production`.

For the messaging system the **Rinkeby** WebSocket server can be reached at `wss://sandbox.airswap-api.com/websocket` and **Mainnet** at `wss://connect.airswap-api.com/websocket`.

## Join the Conversation

Be sure to join the AirSwap Developers Telegram group at https://t.me/airswapdevs or the AirSwap Community at https://t.me/airswap.
