# AirSwap Trading API
Python examples to connect and interact with other peers on the AirSwap network. Requires **Python 3.6** or above.

## Installation
```
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
```

## Basic example
This performs an authentication handshake and fetches a list of makers that are trading on the **Rinkeby** sandbox:

```
python3 indexer_example.py
```

## Signing a Swap order
This performs a simple order signature to respond to `getOrder` requests:

```
python3 sign_order.py
```
