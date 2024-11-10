# Safe Subgraph

This Subgraph dynamically tracks activity on any Safe{Wallet} deployed through the factory (current support for versions 1.1.1, 1.3.0, 1.4.0 and 1.4.1).

### Subgraphs

All L1 and L2 networks which are supported by Eternal Safe and The Graph network are supported by this subgraph. For any CLI parameters, you must use the network name as defined in parentheses below.

- Mainnet (`mainnet`): TODO
- Gnosis Chain (`gnosis`): TODO
- Polygon (`matic`): TODO
- BNB Chain (`bsc`): TODO
- Arbitrum One (`arbitrum-one`): TODO
- Optimism (`optimism`): TODO
- Base (`base`): TODO
- Celo (`celo`): TODO
- Avalanche (`avalanche`): TODO

As of writing, the following networks supported by Eternal Safe are not supported by [The Graph's decentralized network](https://thegraph.com/docs/en/developing/supported-networks/):

- Polygon zkEVM
- zkSync Era
- Aurora
- Sepolia

All of the network specific data source parameters are defined in the `networks.json` file.

#### v1.1.1 Factory

The v1.1.1 factory is not deployed correctly on all networks. For such networks, we have used the null address (`0x0000000000000000000000000000000000000000`) in the `networks.json`, so that the built `subgraph.yaml` will be valid for all networks.

#### v1.3.0 Factory

There are two commonly used deployments of the v1.3.0 factory. Both are indexed. One is known as the "canonical" deployment and the other as the ["eip155" deployment](https://github.com/safe-global/safe-deployments/blob/main/src/assets/v1.3.0/proxy_factory.json).

#### L2 Safes

On any L2, it's possible that there is both the original (in a sense that it is the same as the original contract deployed to L1) [Safe](https://github.com/safe-global/safe-smart-account/blob/main/contracts/Safe.sol) contract and the [SafeL2](https://github.com/safe-global/safe-smart-account/blob/main/contracts/SafeL2.sol#L10) contract. This subgraph supports both contracts, via the same instance, but with two different data sources. This means you can query `Safe` and `SafeL2` wallets in the same way with the same GraphQL queries against one endpoint, even though they are indexed differently in _The Graph_.

The data sources are defined in [subgraph.yaml](subgraph.yaml) as `templates` and are named accordingly `Safe` and `SafeL2`. The `SafeL2` data source is more efficient because it reads the data from events emitted from the corresponding contract, whereas the `Safe` data source must rely on call handlers in lieu of the contract not emitting events. The subgraph will automatically detect whether the new safe is of a `Safe` or `SafeL2` instance based on the known `SafeL2` singleton deployment address. However, if a new `SafeL2` singleton is deployed that this subgraph does not know about, the subgraph will fall back to using `Safe` data source and its call handler to ensure it reads all the information from the safe, no matter whether it emits events or not. This is not a problem as `SafeL2` safes can still be indexed via the call handler rather than the event handler, it's just less efficient.

#### Call Handlers Unsupported Networks

Certain networks are not backed by RPC nodes which support `trace_filter` and therefore do not support call handlers. Namely, the following networks: `optimism`, `base`, `celo` and `avalanche`. For these networks, only event handlers are supported and therefore Safes which use the original `Safe` contract will not be indexed, only Safes which use the `SafeL2` contract.

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
$ yarn test
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
  - Transaction

## Query samples

### Get wallet details

```graphql
{
  wallet(id: "0x220866b1a2219f40e72f5c628b65d54268ca3a9d") {
    id
    creator
    network
    timestamp
    hash
    factory
    singleton
    version
    currentNonce
    owners
    threshold
    transactions {
      id
      timestamp
      block
      status
      hash
      txHash
      value
      to
      data
      signatures
      nonce
      operation
      estimatedSafeTxGas
      estimatedBaseGas
      gasPrice
      gasToken
      refundReceiver
      payment
    }
  }
}
```
