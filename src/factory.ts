import { ProxyCreation as ProxyCreation_v1_3_0 } from "../generated/GnosisSafeProxyFactory_v1_3_0/GnosisSafeProxyFactory";
import { ProxyCreation as ProxyCreation_v1_1_1 } from "../generated/GnosisSafeProxyFactory_v1_1_1/GnosisSafeProxyFactory";
import { ProxyCreation as ProxyCreation_v1_4_1 } from "../generated/SafeProxyFactory_v1_4_1/SafeProxyFactory";
import { GnosisSafe } from "../generated/templates/GnosisSafe/GnosisSafe";
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
  BigInt,
} from "@graphprotocol/graph-ts";
import { isL2Wallet, zeroBigInt } from "./utils";

function getSingleton(address: Address): Address | null {
  let callGetStorageResult = GnosisSafe.bind(address).try_getStorageAt(
    BigInt.fromI32(0),
    BigInt.fromI32(1)
  );

  if (!callGetStorageResult.reverted) {
    return Address.fromBytes(callGetStorageResult.value);
  } else {
    return null;
  }
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

    let maybeL2 = isL2 ? "-L2" : "";

    let wallet = new Wallet(walletAddress.toHex());
    wallet.creator = event.transaction.from;
    wallet.network = dataSource.network();
    wallet.stamp = event.block.timestamp;
    wallet.hash = event.transaction.hash;
    wallet.factory = event.address as Address;
    wallet.singleton = singletonAddress;
    wallet.version = safeInstance.VERSION() + maybeL2;
    wallet.owners = changetype<Bytes[]>(callGetOwnerResult.value);
    wallet.threshold = safeInstance.getThreshold();
    wallet.currentNonce = zeroBigInt();
    wallet.transactions = [];
    wallet.save();

    // Instantiate a new datasource for the Safe{Wallet}
    if (isL2) {
      SafeL2Contract.create(walletAddress);
    } else {
      SafeContract.create(walletAddress);
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
  let singleton = getSingleton(event.params.proxy);

  if (!singleton) {
    log.warning(
      "handleProxyCreation_1_1_1::Wallet {} is incorrect, could not get singleton (tx: {})",
      [event.params.proxy.toHexString(), event.transaction.hash.toHexString()]
    );
    return;
  }

  handleProxyCreation(event.params.proxy, singleton, event);
}
