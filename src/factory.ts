import { ProxyCreation as ProxyCreation_v1_1_1 } from "../generated/GnosisSafeProxyFactory_v1_1_1/GnosisSafeProxyFactory";
import { ProxyCreation as ProxyCreation_v1_3_0 } from "../generated/GnosisSafeProxyFactory_v1_3_0/GnosisSafeProxyFactory";
import { ProxyCreation as ProxyCreation_v1_4_1 } from "../generated/SafeProxyFactory_v1_4_1/SafeProxyFactory";
import { GnosisSafe } from "../generated/templates/Safe/GnosisSafe";
import { Wallet } from "../generated/schema";
import {
  Safe as SafeContract,
  SafeL2 as SafeL2Contract,
} from "../generated/templates";
import {
  log,
  Bytes,
  dataSource,
  Address,
  ethereum,
} from "@graphprotocol/graph-ts";
import { isL2Wallet, onlySupportsEventHandlers, zeroBigInt } from "./utils";

/**
 * Get the singleton address from the proxy creation transaction input data
 * @param input Input data from the proxy creation transaction
 * @returns the singleton address or null if it could not be determined
 */
function getSingleton(input: Bytes): Address | null {
  if (input.length < 36) {
    return null;
  }

  return Address.fromBytes(Bytes.fromUint8Array(input.subarray(16, 36)));
}

function handleProxyCreation(
  walletAddress: Address,
  singletonAddress: Address,
  event: ethereum.Event
): void {
  let safeInstance = GnosisSafe.bind(walletAddress);
  let callGetOwnerResult = safeInstance.try_getOwners();

  if (!callGetOwnerResult.reverted) {
    let isL2 = isL2Wallet(singletonAddress);

    let maybeL2 = isL2 ? "+L2" : "";

    let wallet = new Wallet(walletAddress);
    wallet.creator = event.transaction.from;
    wallet.network = dataSource.network();
    wallet.timestamp = event.block.timestamp;
    wallet.hash = event.transaction.hash;
    wallet.factory = event.address as Address;
    wallet.singleton = singletonAddress;
    wallet.version = safeInstance.VERSION() + maybeL2;
    wallet.owners = changetype<Bytes[]>(callGetOwnerResult.value);
    wallet.threshold = safeInstance.getThreshold();
    // it is possible to setup a Safe and do your first transaction, all in one Ethereum transaction
    // TODO: check if this impacts the nonce
    // TODO: index the first transaction
    wallet.currentNonce = zeroBigInt();
    wallet.save();

    // Instantiate a new datasource for the Safe{Wallet}
    if (isL2) {
      SafeL2Contract.create(walletAddress);
    } else {
      if (onlySupportsEventHandlers(dataSource.network())) {
        // some networks don't support call handlers (due to no support for the trace_filter RPC method), so Safes using the original L1 contract cannot be indexed on that network
        log.warning(
          "handleProxyCreation::Wallet {} is a L1 Safe but this network only supports event handlers, so it will not be indexed (tx: {})",
          [walletAddress.toHexString(), event.transaction.hash.toHexString()]
        );
      } else {
        SafeContract.create(walletAddress);
      }
    }
  } else {
    // A wallet can be instantiated from the proxy with incorrect setup values
    // The wallet is still deployed but unusable
    // e.g https://etherscan.io/tx/0x087226bfdc7d5ff7e64fec3f4fc87522986213265fa835f22208cae83b9259a8#eventlog
    log.warning("handleProxyCreation::Wallet {} is incorrect (tx: {})", [
      walletAddress.toHexString(),
      event.transaction.hash.toHexString(),
    ]);
  }
}

export function handleProxyCreation_1_4_1(event: ProxyCreation_v1_4_1): void {
  handleProxyCreation(event.params.proxy, event.params.singleton, event);
}

export function handleProxyCreation_1_3_0(event: ProxyCreation_v1_3_0): void {
  handleProxyCreation(event.params.proxy, event.params.singleton, event);
}

export function handleProxyCreation_1_1_1(event: ProxyCreation_v1_1_1): void {
  let singleton = getSingleton(event.transaction.input);

  if (!singleton) {
    log.warning(
      "handleProxyCreation_1_1_1::Wallet {} is incorrect, could not get singleton (tx: {})",
      [event.params.proxy.toHexString(), event.transaction.hash.toHexString()]
    );
    return;
  }

  handleProxyCreation(event.params.proxy, singleton, event);
}
