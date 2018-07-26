# AirSwap Order Server

## Introduction

The Order Server is a user-implemented HTTP server that handles all of your order and pricing logic as an order maker. When you run the API Server and set a trade intent, you become discoverable by potential takers who are interested in trading. They will issue a `getOrder` request which gets forwarded by the API Server to your Order Server as an HTTP POST request. This directory contains a number of Order Server reference implementations to help you get started.

## API

The API that your Order Server must implement is pretty straight forward and can be satisfied by any programming language with an HTTP interface. Create and run an HTTP server with the following specifications.

- Host: `localhost`
- Port: `5005`
- Route: `/getOrder`
- Method: `POST`
- Headers: `application/json`

The server must handle JSON objects in the following format:

```
{
  makerAddress: string
  takerAddress: string
  makerToken: string
  takerToken: string
  takerAmount: string (optional)
  makerAmount: string (optional)
}
```

The server must respond with a JSON object in the following format:

```
{
  makerToken: string
  takerToken: string
  makerAmount: string
  takerAmount: string
  expiration: number
  nonce: string | number
}
```