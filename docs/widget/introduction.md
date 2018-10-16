# Introduction

The AirSwap Widget is an embeddable trading frontend that lets your users make ERC20 trades without leaving your application. The `demo.html` file shows usage of the Widget API on the **Rinkeby** sandbox. Keep in mind there may not be active peers using the sandbox at any given time. Join the AirSwap Developers Telegram group at https://t.me/airswapdevs or the AirSwap Community at https://t.me/airswap for conversation and support.

To try the demo, run the following:

```
python3 -m http.server
```

And navigate to http://localhost:8000/demo.html.

## Basic Example

```html
<head>
...
    <script src="https://cdn.airswap.io/gallery/airswap-trader.js"></script>
...
</head>
```

```js
AirSwap.Trader.render({
    onComplete: function(transactionId) {
        console.info('Trade complete. Thank you, come again.');
    }
}, 'body');
```

## Environments

By default your widget will connect to the AirSwap `sandbox` environment which loads the frontend located at https://sandbox.airswap.io/. To set your widget to make trades on mainnet, set the `env` parameter to `production`.

## With Options

```js
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

## JavaScript API

```js
AirSwap.Trader.render(options, parent);
```

The `options` argument is an object with parameters listed below. The `parent` argument is a DOM node that lives on the page, optimally the `body` element. Once the widget is closed the element is removed from the DOM.

## Add New Token

You can add an intent to trade any token to the indexer, as long as the token associated with an intent isn’t blacklisted.
The [AirSwap UI](https://www.airswap.io) is powered by [this metadata endpoint](https://token-metadata.airswap.io/tokens). Tokens will automatically be added to this metadata endpoint when they are posted to the indexer (on a half hour cron). The `airswapUI` flag on the token will be changed from `new` to `yes` after a check by us to make sure newly listed tokens aren’t blacklisted.

[Rinkeby tokens can be found here](https://token-metadata.airswap.io/rinkebyTokens). New Rinkeby tokens are added on request.
