from web3 import Web3
from eth_utils import address as eth_address
from eth_utils import hexadecimal
import logging


def address(val):
    try:
        return eth_address.to_canonical_address(val)
    except ValueError as e:
        logging.warning('Could not convert address {0}: {1}'.format(val, e))
        raise


def uint(val):
    try:
        hexed = Web3.toHex(int(val))
        return hexadecimal.decode_hex('0x' + hexed[2:].zfill(64))
    except TypeError as e:
        logging.warning('Could not convert uint {0}: {1}'.format(val, e))
        raise
