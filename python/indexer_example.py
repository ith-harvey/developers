import json
import uuid

import tornado.gen
import tornado.ioloop
import tornado.websocket
from web3.auto import w3

import util.signatures as signatures

# The following example connects to the messaging system and calls the
# Indexer API. It shows how to connect to the WebSocket, respond to
# an authentication challenge, and perform a JSON-RPC call.

# This example calls `findIntents`, but any Indexer or Peer API call
# can be made over the messaging system once connected.

@tornado.gen.coroutine
def handshake(sender_address, sender_priv_key, conn):
    print('establishing handshake using pub_key:\n{}\n'.format(sender_address))

    # Receive an authentication challenge
    challenge = yield conn.read_message()
    print('received challenge:\n{}\n'.format(challenge))

    # Sign the challenge with our private key
    signed = signatures.sign(challenge, sender_priv_key)

    # Send your challenge response back over the WebSocket
    yield conn.write_message(signed)
    print('sent signed message:\n{}\n'.format(signed))

    # Wait for an "ok" from the host
    response = yield conn.read_message()
    print('received response:\n{}\n'.format(response))
    assert(response == "ok")


@tornado.gen.coroutine
def find_intents(sender_address, indexer_address, taker_token, conn):
    call_id = uuid.uuid4().hex

    # Construct the `findIntents` query
    jsonrpc = {
        'id': call_id,
        'jsonrpc': '2.0',
        'method': 'findIntents',
        'params': {
            "makerTokens": [],
            "takerTokens": [taker_token],
            "role": []
        },
    }

    # Wrap the message in an envelop for delivery to the receipient
    envelope = {
        'sender': sender_address,
        'receiver': indexer_address,
        'message': json.dumps(jsonrpc)
    }

    request = json.dumps(envelope, indent=4)
    print('sent request:\n{}\n'.format(request))
    conn.write_message(request)

    res = yield conn.read_message()
    response = json.loads(res)
    jsonrpc_response = json.loads(response['message'])
    assert jsonrpc_response['id'] == call_id
    return jsonrpc_response['result']


@tornado.gen.coroutine
def indexer_example(url, sender_address, sender_priv_key):

    indexer_address = "0x0000000000000000000000000000000000000000"
    token_address = "0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8"

    # Open a connection to the WebSocket
    conn = yield tornado.websocket.websocket_connect(url)

    # Perform the authentication handshake
    yield handshake(sender_address, sender_priv_key, conn)

    # Query the Indexer to find counter parties trading `token_address`
    intents = yield find_intents(sender_address, indexer_address, token_address, conn)
    print('found intents:\n{}\n'.format(json.dumps(intents, indent=4)))

    return intents


if __name__ == '__main__':
    url = 'wss://sandbox.airswap-api.com/websocket'

    # Create a new account for the example
    random_acc = w3.eth.account.create()
    sender_address = random_acc.address.lower()
    sender_priv_key = random_acc.privateKey.hex()

    ioloop = tornado.ioloop.IOLoop.current()
    ioloop.run_sync(lambda: indexer_example(url, sender_address, sender_priv_key), 10)
