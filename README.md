
# Safe subgraph

This Subgraph dynamically tracks activity on any Safe{Wallet} deployed through the factory (current support for versions 1.1.1, 1.3.0, 1.4.0 and 1.4.1)

### Subgraphs

All networks which are supported by Eternal Safe and The Graph network are supported by this subgraph. For any CLI parameters, you must use the network name as defined in parentheses below.

- Mainnet (`mainnet`): TODO
- Gnosis Chain (`gnosis`): TODO
- Polygon (`matic`): TODO
- BNB Chain (`bsc`): TODO
- Arbitrum (`arbitrum`): TODO
- Optimism (`optimism`): TODO
- Base (`base`): TODO
- Celo (`celo`): TODO
- Avalanche (`avalanche`): TODO

As of writing, the following networks are not supported by the [decentralized network](https://thegraph.com/docs/en/developing/supported-networks/):
- Polygon zkEVM
- zkSync Era
- Aurora
- Sepolia

## Prerequiste

- yarn
- graph-cli

```
$ yarn global add @graphprotocol/graph-cli
```

## Getting started

Install the dependencies

```
$ yarn install
```

Build

```
$ ./script/build.sh [--reset] [--code-gen] [--network (from above list)]
```

- `--reset -r` deletes the build and generated code folders [optional, default: false]
- `--code-gen -c` (re)generate code from schema [optional, default: false]
- `--network -n` select a target network (from the above list) [optional, default: mainnet]


## Deployment

```
$ ./script/deploy.sh [--network (from above list)] [--access-token xxxxxxxxxxxx]
```

- `--network -n` select a target network (from above list) [optional, default: mainnet]
- `--access-token -t` access token to deploy the subgraph [optional, default: env variable $THEGRAPH_ACCESS_TOKEN]


## Model

- Wallet
    -  Transaction

## Query samples

### Get Wallet details 

```graphql
{
  wallet(id: "0x12312312.....") {
    id
    version
    creator
    network
    stamp
    hash
    factory
    mastercopy
    version
    owners
    threshold
    currentNonce
    transactions {
      id
      stamp
      hash
      status
      value
      destination
      data
      signatures
      nonce
      operation
      estimatedSafeTxGas
      estimatedBaseGas
      estimatedGasPrice
      gasToken
      refundReceiver
      gasUsed
      gasPrice
    }
  }
}

```

