const WebSocket = require('ws')
const ethers = require('ethers')

const { Wallet, utils, providers } = ethers

const TIMEOUT = 12000
const INDEXER_ADDRESS = '0x0000000000000000000000000000000000000000'

class AirSwap {
  // `privateKey`: string - ethereum private key with `"0x"` prepended
  // `infuraKey`: string - infura API key
  // `nodeAddress`: string - optionally specify a geth/parity node instead of using infura
  // `rpcActions`: Object - user defined methods; called by peers via JSON-RPC
  // `networkId`: string - which ethereum network is used; `'rinkeby'` or `'mainnet'`
  constructor(config) {
    const { privateKey, infuraKey, nodeAddress, rpcActions = {}, networkId = 'rinkeby' } = config
    let provider
    if (infuraKey) {
      provider = new providers.InfuraProvider(networkId === 'mainnet' ? 'homestead' : 'rinkeby', infuraKey)
    }
    if (nodeAddress) {
      provider = new providers.JsonRpcProvider(nodeAddress, networkId === 'mainnet' ? 'homestead' : 'rinkeby')
    }
    this.privKey = privateKey
    this.isAuthenticated = false
    this.wallet = new Wallet(privateKey, provider)
    this.socketUrl =
      networkId === 'mainnet' ? 'wss://connect.airswap-api.com/websocket' : 'wss://sandbox.airswap-api.com/websocket'

    // Promise resolvers/rejectors and timeouts for each call
    this.RESOLVERS = {}
    this.REJECTORS = {}
    this.TIMEOUTS = {}

    // User defined methods that will be invoked by peers on the JSON-RPC
    this.RPC_METHOD_ACTIONS = rpcActions

    this.getOrders = this.getOrders.bind(this)
  }

  // Prepare a formatted query to be submitted as a JSON-RPC call
  static makeRPC(method, params = {}, id = Date.now()) {
    return {
      jsonrpc: '2.0',
      method,
      params,
      id,
    }
  }

  // Connect to AirSwap. The sequence:
  // 1. Open a websocket connection
  // 2. Receive a challenge (some random data to sign)
  //  3. Sign the data and send it back over the wire
  // 4. Receive an "ok" and start sending and receiving RPC
  // Optionally pass an `onSuccess` function
  connect(onSuccess) {
    this.socket = new WebSocket(this.socketUrl)

    // Received a message
    this.socket.onmessage = event => {
      // We are authenticating.
      if (!this.isAuthenticated) {
        switch (event.data) {
          // We have completed the challenge.
          case 'ok':
            this.isAuthenticated = true
            if (typeof onSuccess === 'function') {
              onSuccess()
            }
            break
          case 'not authorized':
            console.error('Address is not authorized.')
            break
          default:
            // We have been issued a challenge.
            const signature = this.wallet.signMessage(event.data)
            this.socket.send(signature)
        }
      } else if (this.isAuthenticated) {
        // We are already authenticated and are receiving an RPC.
        let payload
        let message

        try {
          payload = JSON.parse(event.data)
          message = payload.message && JSON.parse(payload.message)
        } catch (e) {
          console.error('Error parsing payload', e, payload)
        }

        if (!payload || !message) {
          return
        }

        if (message.method) {
          // Another peer is invoking a method.
          if (this.RPC_METHOD_ACTIONS[message.method]) {
            console.log('Invoking method', message.method)
            this.RPC_METHOD_ACTIONS[message.method](message)
          }
        } else if (message.id) {
          // We have received a response from a method call.
          const isError = Object.prototype.hasOwnProperty.call(message, 'error')

          if (!isError && message.result) {
            // Resolve the call if a resolver exists.
            if (typeof this.RESOLVERS[message.id] === 'function') {
              this.RESOLVERS[message.id](message.result)
            }
          } else if (isError) {
            // Reject the call if a resolver exists.
            if (typeof this.REJECTORS[message.id] === 'function') {
              this.REJECTORS[message.id](message.error)
            }
          }

          // Call lifecycle finished; tear down resolver, rejector, and timeout
          delete this.RESOLVERS[message.id]
          delete this.REJECTORS[message.id]
          clearTimeout(this.TIMEOUTS[message.id])
        }
      }
    }

    // There was an error on the connection
    this.socket.onerror = event => {
      console.error('socket error', event)
    }

    // The connection was closed
    this.socket.onclose = () => {
      console.log('socket closed')
    }
  }

  // Send a JSON-RPC `message` to a `receiver` address
  call(receiver, message, resolve, reject) {
    const messageString = JSON.stringify({
      sender: this.wallet.address.toLowerCase(),
      receiver,
      message: JSON.stringify(message),
      id: Date.now(),
    })
    this.socket.send(messageString)

    // Set the promise resolvers and rejectors for this call
    if (typeof resolve === 'function') {
      this.RESOLVERS[message.id] = resolve
    }
    if (typeof reject === 'function') {
      this.REJECTORS[message.id] = reject
    }

    // Set a timeout for this call
    this.TIMEOUTS[message.id] = setTimeout(() => {
      if (typeof reject === 'function') {
        reject({ message: `Request timed out. [${message.id}]`, code: -1 })
      }
    }, TIMEOUT)
  }

  // Query the indexer for trade intents.
  // Returns a promise which is resolved with an array of `intents`
  findIntents(makerTokens, takerTokens, role = 'maker') {
    if (!makerTokens || !takerTokens) {
      return
    }
    const payload = AirSwap.makeRPC('findIntents', {
      makerTokens,
      takerTokens,
      role,
    })

    return new Promise((resolve, reject) => this.call(INDEXER_ADDRESS, payload, resolve, reject))
  }

  // Call `setIntents` on the indexer with an array of trade `intent` objects
  setIntents(intents) {
    const payload = AirSwap.makeRPC('setIntents', {
      address: this.wallet.address.toLowerCase(),
      intents,
    })
    return new Promise((resolve, reject) => this.call(INDEXER_ADDRESS, payload, resolve, reject))
  }

  // Make a JSON-RPC `getOrder` call for each `intent`
  getOrders(intents, makerAmount = '100000') {
    if (!intents) {
      return
    }
    return Promise.all(
      intents.map(({ address, makerToken, takerToken }) => {
        const payload = AirSwap.makeRPC('getOrder', {
          makerToken,
          takerToken,
          takerAddress: this.wallet.address.toLowerCase(),
          makerAmount,
        })
        // `Promise.all` will return a complete array of resolved promises, or just the first rejection if a promise fails.
        // To mitigate this, we `catch` errors on individual promises so that `Promise.all` always returns a complete array
        return new Promise((resolve, reject) => this.call(address, payload, resolve, reject)).catch(e => e)
      }),
    )
  }

  // Sign an order for a taker to fill
  signOrder({ makerAddress, makerAmount, makerToken, takerAddress, takerAmount, takerToken, nonce, expiration }) {
    const types = [
      'address', // makerAddress
      'uint256', // makerAmount
      'address', // makerToken
      'address', // takerAddress
      'uint256', // takerAmount
      'address', // takertoken
      'uint256', // nonce
      'uint256', // expiration
    ]
    const hashedOrder = utils.solidityKeccak256(types, [
      makerAddress,
      makerAmount,
      makerToken,
      takerAddress,
      takerAmount,
      takerToken,
      nonce,
      expiration,
    ])

    const signature = this.wallet.signMessage(ethers.utils.arrayify(hashedOrder))
    const walletSignature = signature.substr(2, signature.length)

    return {
      expiration,
      makerAddress,
      makerAmount,
      makerToken,
      nonce,
      takerAddress,
      takerAmount,
      takerToken,
      r: `0x${walletSignature.substr(0, 64)}`,
      s: `0x${walletSignature.substr(64, 64)}`,
      v: parseFloat(walletSignature.substr(128, 2)) + 27,
    }
  }
}

module.exports = AirSwap
