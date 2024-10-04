# Safe Subgraph

This Subgraph dynamically tracks activity on any Safe{Wallet} deployed through the factory (current support for versions 1.1.1, 1.3.0, 1.4.0 and 1.4.1).

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

#### L1 and L2 Safes

There are two versions of the Safe contract, the original Safe and the [SafeL2](https://github.com/safe-global/safe-smart-account/blob/main/contracts/SafeL2.sol#L10). This subgraph supports both versions, via the same subgraph, but with two different data sources. The L1 data source is named `Safe` and the L2 data source is named `SafeL2`. The L2 data source is more efficient due to the use of events, so we try to use the L2 data source whenever possible. However, there are some cases where an L2 safe may be detected as an L1 safe, for example, if a new L2 singleton is deployed that this subgraph does not know about. In these cases, we will use the L1 data source for the L2 Safe. This is not a problem as L2 Safes can still be indexed via the call handler rather than the event handler, it's just less efficient.

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

## Testing

Requires [Docker](https://docs.docker.com/get-docker/) to be installed.

```
$ graph test -d
```

## Deployment

```
$ ./script/deploy.sh [--network (from above list)] [--access-token xxxxxxxxxxxx] [--debug xxxxxxxxxxxx]
```

- `--network -n` select a target network (from above list) [optional, default: mainnet]
- `--access-token -a` access token to deploy the subgraph [optional, default: env variable $THEGRAPH_ACCESS_TOKEN]
- `--debug -d` ID of a remote subgraph which will be [used to seed the new subgraph](https://thegraph.com/docs/en/cookbook/subgraph-debug-forking/) [optional, default: none]

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

