# Options

#### mode : `string` - `required`

Either `buy` or `sell`. This will restrict the mode to buy or sell.

#### token : `string` - `required`

A fixed `token` to `buy` in exchange for ETH (or `baseToken`) or `sell` in exchange for WETH (or `baseToken`).

#### baseToken : `string`

By default, the widget will search for trades in `'ETH'`. If you specify the string `'DAI'` for this parameter, the widget will search for `token`/`DAI` orders instead of `token`/`ETH` orders. **Note: you will likely need to run an order server until more peers on the network start making DAI orders. At the time of writing, most makers are only serving ETH orders**

#### amount : `string`

A default `amount` in the smallest unit e.g. Wei. Can be edited by the user.

#### address : `string`

A fixed `address` to query a specific counter-party for orders.

#### onCancel : `function` - `required`

A function called when the user has canceled or dismissed the widget. No arguments.

```js
function onCancel() { console.log('Canceled!'); }
```

#### onComplete : `function` - `required`

Called when the transaction sent to the blockchain has succeeded. The transaction ID is passed as an argument.

```js
function onComplete(transactionId) { console.log('Complete!', transactionId); }
```
