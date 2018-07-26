import logging
import time
import random

from flask import Flask, jsonify, request

app = Flask(__name__)


@app.route("/getOrder", methods=["POST"])
def get_order():
    req = request.get_json()
    logging.info("Received getOrder: {req}".format(req=req))

    # These parameters will be forwarded from the client server
    maker_address = req["makerAddress"]
    taker_address = req["takerAddress"]
    maker_token = req["makerToken"]
    taker_token = req["takerToken"]

    # Only one or the other should be set
    # Takers will usually request a makerAmount
    # In this example, we're assuming they're requesting a makerAmount
    maker_amount = int(req.get("makerAmount", 0))
    taker_amount = int(req.get("takerAmount", 0))

    # Set 5-minute expiration on this order
    expiration = str(int(time.time()) + 300)
    nonce = random.randint(0, 99999)

    price = 0.5
    taker_amount = int(maker_amount * price)

    order = {
        "makerToken": maker_token,
        "takerToken": taker_token,
        "makerAmount": str(maker_amount),
        "takerAmount": str(taker_amount),
        "expiration": expiration,
        "nonce": nonce
    }
    logging.info("Sending order: {order}".format(order=order))
    return jsonify(order)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5004)
