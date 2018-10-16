# Getting and Providing Orders

The [Swap Peer Protocol](https://swap.tech/whitepaper#peer-protocol) specifies an RFQ-style interaction between order makers and takers to communicate orders for specific amounts and token pairs. Orders are filled on the swap contract by the taker.

#getOrder {docsify-ignore}

To fill the role of `maker` on the network, you must implement the `getOrder` method. As a `taker` you will call this method on other peers. For an example of how to sign orders, see the `signOrder` method in the [NodeJS library](https://github.com/airswap/developers/blob/master/api-server/lib/AirSwap.js).

**Parameters**  
All parameters are strings. Amounts must be in the base unit of the asset, e.g. `wei` rather than `ether`.

* `makerAmount`: Amount to be transferred from maker to taker for a `sell` trade. This param must be set if `takerAmount` is unset.
* `makerToken`: Address of the token to be transferred from `maker` to `taker`.
* `takerAmount`: Amount to be transferred from taker to maker for a `buy` trade. This param must be set if `makerAmount` is unset.
* `takerToken`: Address of the token to be transferred from `taker` to `maker`.
* `takerAddress`: Address of the taker sending the `getOrder` request.

For example, peer `0x7e83c5583731653bee2fa7d2562b24a59d172dd6` calls `getOrder` to buy 10000 of your token `0x27054b13b1b798b345b591a4d22e6562d47ea75b` in exchange for their token `0x6810e776880c02933d47db1b9fc05908e5386b97`:

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "getOrder",
  "params": {
    "makerAmount": "10000",
    "makerToken": "0x27054b13b1b798b345b591a4d22e6562d47ea75b",
    "takerToken": "0x6810e776880c02933d47db1b9fc05908e5386b97",
    "takerAddress": "0x7e83c5583731653bee2fa7d2562b24a59d172dd6"
  }
}
```

And its response, as matched by `id`:

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "expiration": 1524506409,
    "makerAddress": "0x6cc47be912a07fbe9cebe68c9e103fdf123b7269",
    "makerAmount": "10000",
    "makerToken": "0x27054b13b1b798b345b591a4d22e6562d47ea75b",
    "nonce": "71161637",
    "r": "0x8b7a43d9b882a244a82c1e8b94661f41af40b30bc8297241111b2697edc66a79",
    "s": "0x6d9a9c6c7ea655b8cbfb3a17f2183d9de977d99de69f01a98c537a1a29b484c2",
    "takerAddress": "0x7e83c5583731653bee2fa7d2562b24a59d172dd6",
    "takerAmount": "579639999999999",
    "takerToken": "0x6810e776880c02933d47db1b9fc05908e5386b97",
    "v": "27"
  }
}
```

The following are error codes in the [JSON-RPC specification](http://www.jsonrpc.org/specification#error_object):

* `-32700` Parse error
* `-32600` Invalid Request
* `-32601` Method not found
* `-32602` Invalid params
* `-32603` Internal error
* `-32000 to -32099` Reserved for implementation-defined server-errors.

We have allocated the following range for Swap Protocol errors:

* `-33600` Cannot provide this order
* `-33601` Unsupported `makerToken` `takerToken` pair
* `-33602` The specified `takerAmount` or `makerAmount` is too low
* `-33603` The specified `takerAmount` or `makerAmount` is too high
* `-33604` Improperly formatted `makerToken`, `takerToken`, or `takerAddress` address
* `-33605` Rate limit exceeded
* `-33700 to -33799` Reserved for implementation defined trading errors.
