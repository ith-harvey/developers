## AirSwap Widget API

![AirSwap Widget](http://g.recordit.co/uf9740sONS.gif 'airswap gif')

The AirSwap Widget is an embeddable trading frontend that lets your users make ERC20 trades without leaving your application. The `demo.html` file shows usage of the Widget API on the **Rinkeby** sandbox. Keep in mind there may not be active peers using the sandbox at any given time. Join the AirSwap Developers Telegram group at https://t.me/airswapdevs or the AirSwap Community at https://t.me/airswap for conversation and support.

To try the demo, run the following:

```
python3 -m http.server
```

And navigate to http://localhost:8000/demo.html.

## Basic example

```html
<head>
...
    <script src="https://cdn.airswap.io/gallery/airswap-trader.js"></script>
...
</head>
```

```JavaScript
AirSwap.Trader.render({
    onComplete: function(transactionId) {
        console.info('Trade complete. Thank you, come again.');
    }
}, 'body');
```

## Environments

By default your widget will connect to the AirSwap `sandbox` environment which loads the frontend located at https://sandbox.airswap.io/. To set your widget to make trades on mainnet, set the `env` parameter to `production`.

## With options

```JavaScript
AirSwap.Trader.render({
    mode: 'buy',
    amount: '10000',
    token: '0x0...',
    onCancel: function () {
        console.info('Trade was canceled.');
    },
    onComplete: function(transactionId) {
        console.info('Trade complete. Thank you, come again.');
    }
}, 'body');
```

### JavaScript API

```JavaScript
AirSwap.Trader.render(options, parent)
```

The `options` argument is an object with parameters listed below. The `parent` argument is a DOM node that lives on the page, optimally the `body` element. Once the widget is closed the element is removed from the DOM.

### Options

#### `required` `string` mode

Either `buy` or `sell`. This will restrict the mode to buy or sell.

#### `required` `string` token

A fixed `token` to `buy` in exchange for ETH or `sell` in exchange for WETH.

#### `string` amount

A default `amount` in the smallest unit e.g. Wei. Can be edited by the user.

#### `string` address

A fixed `address` to query a specific counter-party for orders.

#### `required` `function` onCancel

A function called when the user has canceled or dismissed the widget. No arguments.

```
function onCancel() { console.log('Canceled!'); }
```

#### `required` `function` onComplete

Called when the transaction sent to the blockchain has succeeded. The transaction ID is passed as an argument.

```
function onComplete(transactionId) { console.log('Complete!', transactionId); }
```

## Adding New Tokens

You can add an intent to trade any token to the indexer, as long as the token associated with an intent isn’t blacklisted.
The [AirSwap UI](https://www.airswap.io/trade) is powered by [this metadata endpoint](https://token-metadata.airswap.io/tokens). Tokens will automatically be added to this metadata endpoint when they are posted to the indexer (on a half hour cron). The `airswapUI` flag on the token will be changed from `new` to `yes` after a check by us to make sure newly listed tokens aren’t blacklisted.

[Rinkeby tokens can be found here](https://token-metadata.airswap.io/rinkebyTokens). New Rinkeby tokens are added on request.
