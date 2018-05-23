import json

from time import time
from random import random
from web3.auto import w3
from util.signatures import ecdsa

EXPIRATION_TIME = 300000

# The following example shows how to sign an order, which can be then
# delivered to a taker for submission to the Ethereum smart contract.

def sign_order(maker_amount, maker_token, taker_token, taker_address, pub_key, priv_key):
    taker_amount = 100
    nonce = str(round(random() * 100 * time()))

    order = {
        'makerAddress': pub_key,
        'makerAmount': maker_amount,
        'makerToken': maker_token,
        'takerAddress': taker_address,
        'takerAmount': taker_amount,
        'takerToken': taker_token,
        'nonce': nonce,
        'expiration': time() + EXPIRATION_TIME
    }

    [v, r, s] = ecdsa(order, priv_key)

    order['v'] = v
    order['r'] = r
    order['s'] = s

    return order


if __name__ == '__main__':
    random_acc = w3.eth.account.create()
    order = sign_order(
        maker_amount=100,
        maker_token="0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8",
        taker_token="0x0000000000000000000000000000000000000000",
        taker_address='0x47316df453e8c9f7c942f5dcbfdf66d518d61f2d',
        pub_key=random_acc.address.lower(),
        priv_key=random_acc.privateKey.hex()
    )

    print('signed order:\n{}\n'.format(json.dumps(order, indent=4, sort_keys=True)))
