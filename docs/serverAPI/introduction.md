# Introduction

The AirSwap API Server aims to simplify your interaction with peers on the AirSwap network. The goal in creating this application is to abstract away some of the complexities of interacting with the Indexer over our messaging layer (https://connect.airswap-api.com/websocket). In doing so, the AirSwap API Server provides a more familiar REST API for getting/setting intents, approvals, submitting orders, etc. In addition, we have provided several reference implementations for an accompanying Order Server.

#### API Server + Order Server = Complete, one-click order maker solution

The separation of concerns between the API Server and Order Server provides a simple standard for interacting with the Indexer and allows you to focus on implementing order handling logic.

!> Warning


 Running this example allows any peer on the AirSwap network to request / receive signed orders from you. The reference implementation should not be used on mainnet without proper order handling logic. By connecting to and using the AirSwap services you accept the [AirSwap Terms of Use](https://swap.tech/airswap-terms-of-use.pdf). Please also be sure to review the [LICENSE](LICENSE.md).

#### Requirements

- Node.js v8.5 or greater
- NPM or Yarn
- An Ethereum private key
