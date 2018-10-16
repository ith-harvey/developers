## Using Ethereum {docsify-ignore}
Interacting with Ethereum smart contracts requires an Ethereum node, which can is accessed via JSON-RPC. See the Python [web3.py](https://github.com/ethereum/web3.py) and JavaScript [web3.js](https://github.com/ethereum/web3.js/) client libraries. If you do not plan to run an Ethereum node of your own, you can use a service like [INFURA](https://infura.io/).

The **Mainnet** Swap contract can be found at [`0x8fd3121013a07c57f0d69646e86e7a4880b467b7`](https://etherscan.io/address/0x8fd3121013a07c57f0d69646e86e7a4880b467b7) and **Rinkeby** Swap contract found at [`0x07fc7c43d8168a2730344e5cf958aaecc3b42b41`](https://rinkeby.etherscan.io/address/0x07fc7c43d8168a2730344e5cf958aaecc3b42b41)

## Signatures
Ethereum has native support for [ECDSA signatures](https://en.bitcoin.it/wiki/Elliptic_Curve_Digital_Signature_Algorithm) which take the form of the `v`, `r`, and `s` values seen in the orders above. This is how the Swap contract verifies that the order was properly signed by the maker. Both [web3.py](https://github.com/ethereum/web3.py) and [web3.js](https://github.com/ethereum/web3.js/) include signing functionality.

## Approving withdrawals

In order to fill orders on the Swap contract, you must approve it to perform ERC20 transfers on your behalf. This is the case for both making and taking orders, as the `transfer` functions are called on each token contract during the swap. [Learn more about ERC20 and the approval process here](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md).

## Filling and canceling orders
Take a look at the [contract source code](https://github.com/airswap/contracts/blob/master/contracts/Exchange.sol) and [protocol whitepaper](https://swap.tech/whitepaper/#smart-contract) for more detail.
