import {
  GnosisSafe,
  AddedOwner,
  RemovedOwner,
  ChangedThreshold,
  ExecutionSuccess,
  ExecutionFailure,
  ExecTransactionCall,
} from "../generated/templates/Safe/GnosisSafe";
import { SafeMultiSigTransaction } from "../generated/templates/Safe/GnosisSafeL2";
import { ChangedMasterCopy } from "../generated/templates/SafeMigraton/SafeMigration";
import { Wallet, Transaction } from "../generated/schema";
import {
  oneBigInt,
  concat,
  zeroBigInt,
  isL2Wallet,
  ImprovedCallResult,
} from "./utils";
import {
  log,
  Address,
  Bytes,
  crypto,
  ByteArray,
  BigInt,
  ethereum,
} from "@graphprotocol/graph-ts";

export function handleAddedOwner(event: AddedOwner): void {
  let walletAddr = event.address;
  let wallet = Wallet.load(walletAddr.toHex());

  if (wallet != null) {
    let owners = wallet.owners;
    owners.unshift(event.params.owner);
    wallet.owners = owners;
    wallet.save();
  } else {
    log.warning("handleAddedOwner::Wallet {} not found", [
      walletAddr.toHexString(),
    ]);
  }
}

export function handleRemovedOwner(event: RemovedOwner): void {
  let walletAddr = event.address;
  let wallet = Wallet.load(walletAddr.toHex());

  if (wallet != null) {
    let owners = wallet.owners;
    let index = owners.indexOf(event.params.owner, 0);
    if (index > -1) {
      owners.splice(index, 1);
    }
    wallet.owners = owners;
    wallet.save();
  } else {
    log.warning("handleRemovedOwner::Wallet {} not found", [
      walletAddr.toHexString(),
    ]);
  }
}

export function handleChangedThreshold(event: ChangedThreshold): void {
  let walletAddr = event.address;
  let wallet = Wallet.load(walletAddr.toHex());

  if (wallet != null) {
    wallet.threshold = event.params.threshold;
    wallet.save();
  } else {
    log.warning("handleChangedThreshold::Wallet {} not found", [
      walletAddr.toHexString(),
    ]);
  }
}

export function handleExecutionSuccess(event: ExecutionSuccess): void {
  let walletAddr = event.address;
  let wallet = Wallet.load(walletAddr.toHex());

  if (wallet != null) {
    let transaction = getTransaction(walletAddr, event.params.txHash);
    transaction.status = "EXECUTED";
    transaction.block = event.block.number;
    transaction.hash = event.transaction.hash;
    transaction.timestamp = event.block.timestamp;
    transaction.txHash = event.params.txHash;
    transaction.payment = event.params.payment;
    transaction.save();

    wallet = addTransactionToWallet(<Wallet>wallet, transaction);
    wallet.save();
  } else {
    log.warning("handleExecutionSuccess::Wallet {} not found", [
      walletAddr.toHexString(),
    ]);
  }
}

export function handleExecutionFailure(event: ExecutionFailure): void {
  let walletAddr = event.address;
  let wallet = Wallet.load(walletAddr.toHex());

  if (wallet != null) {
    let transaction = getTransaction(walletAddr, event.params.txHash);
    transaction.status = "FAILED";
    transaction.block = event.block.number;
    transaction.hash = event.transaction.hash;
    transaction.timestamp = event.block.timestamp;
    transaction.txHash = event.params.txHash;
    transaction.payment = event.params.payment;
    transaction.save();

    wallet = addTransactionToWallet(<Wallet>wallet, transaction);
    wallet.save();
  } else {
    log.warning("handleExecutionFailure::Wallet {} not found", [
      walletAddr.toHexString(),
    ]);
  }
}

export function handleChangedMasterCopy(event: ChangedMasterCopy): void {
  let walletAddr = event.address;
  let safeInstance = GnosisSafe.bind(walletAddr);
  let wallet = Wallet.load(walletAddr.toHex());

  if (wallet != null) {
    wallet.singleton = event.params.singleton;

    // it would be nice if we could change the data source for the wallet at this point from Safe to SafeL2 but it doesn't seem to be possible
    let maybeL2 = isL2Wallet(event.params.singleton) ? "+L2" : "";
    wallet.version = safeInstance.VERSION() + maybeL2;

    wallet.save();
  } else {
    log.warning("handleChangedMasterCopy::Wallet {} not found", [
      walletAddr.toHexString(),
    ]);
  }
}

export function handleExecTransaction(call: ExecTransactionCall): void {
  handleTransaction(
    call.to,
    call.transaction.hash,
    call.inputs.to,
    call.inputs.value,
    call.inputs.data,
    call.inputs.operation,
    call.inputs.safeTxGas,
    call.inputs.baseGas,
    call.inputs.gasPrice,
    call.inputs.gasToken,
    call.inputs.refundReceiver,
    call.inputs.signatures
  );
}

export function handleSafeMultiSigTransaction(
  event: SafeMultiSigTransaction
): void {
  handleTransaction(
    event.address,
    event.transaction.hash,
    event.params.to,
    event.params.value,
    event.params.data,
    event.params.operation,
    event.params.safeTxGas,
    event.params.baseGas,
    event.params.gasPrice,
    event.params.gasToken,
    event.params.refundReceiver,
    event.params.signatures
  );
}

/*
 * UTILS
 */

function getTransaction(wallet: Address, transctionHash: Bytes): Transaction {
  let id = crypto.keccak256(concat(wallet, transctionHash));

  let transaction = Transaction.load(id.toHexString());
  if (transaction == null) {
    transaction = new Transaction(id.toHexString());
  }

  return transaction as Transaction;
}

function addTransactionToWallet(
  wallet: Wallet,
  transaction: Transaction
): Wallet {
  let transactions = wallet.transactions;

  if (transactions.indexOf(transaction.id, 0) == -1) {
    transactions.push(transaction.id);
    wallet.transactions = transactions;
  }

  return wallet;
}

/**
 * Improved version of the GnosisSafe.try_nonce function which handles the case where
 * the nonce is empty bytes.
 * @param walletInstance A GnosisSafe contract instance
 * @returns ImprovedCallResult<BigInt>
 */
function improved_try_nonce(
  walletInstance: GnosisSafe
): ImprovedCallResult<BigInt> {
  let result = walletInstance.tryCall("nonce", "nonce():(uint256)", []);
  if (result.reverted) {
    return new ImprovedCallResult();
  }

  let value = result.value;
  if (
    value[0].kind == ethereum.ValueKind.BYTES &&
    value[0].toBytes().length == 0
  ) {
    // consider a nonce of 0 bytes as a non-existent nonce
    // this can happen when Safes are hacked
    // e.g. The WazirX hacked safe:
    // https://etherscan.io/address/0x27fd43babfbe83a81d14665b1a6fb8030a60c9b4
    return ImprovedCallResult.emptyValue<BigInt>();
  }

  return ImprovedCallResult.fromValue(value[0].toBigInt());
}

export function handleTransaction(
  walletAddr: Address,
  hash: Bytes,
  to: Address,
  value: BigInt,
  data: Bytes,
  operation: i32,
  safeTxGas: BigInt,
  baseGas: BigInt,
  gasPrice: BigInt,
  gasToken: Address,
  refundReceiver: Address,
  signatures: Bytes
): void {
  let wallet = Wallet.load(walletAddr.toHex());

  if (wallet != null) {
    let walletInstance = GnosisSafe.bind(walletAddr);
    let currentNonce = improved_try_nonce(walletInstance);
    if (currentNonce.isEmpty) {
      log.warning(
        "handleTransaction::Wallet: {} transaction {} - cannot get nonce (empty bytes)",
        [walletAddr.toHexString(), hash.toHexString()]
      );
    } else if (currentNonce.reverted) {
      log.warning(
        "handleTransaction::Wallet: {} transaction {} - cannot get nonce (reverted)",
        [walletAddr.toHexString(), hash.toHexString()]
      );
    } else {
      let nonce = currentNonce.value.equals(zeroBigInt())
        ? currentNonce.value
        : currentNonce.value.minus(oneBigInt());

      let txHash = walletInstance.getTransactionHash(
        to,
        value,
        data,
        operation,
        safeTxGas,
        baseGas,
        gasPrice,
        gasToken,
        refundReceiver,
        nonce
      );

      let transaction = getTransaction(walletAddr, txHash);

      if (data.length < 2700) {
        // max size of a column. In some very rare cases, the method data bytecode is very long
        transaction.data = data;
      } else {
        log.warning(
          "handleTransaction::Wallet: {} transaction {} - cannot store transaction.data (too long), length: {}",
          [
            walletAddr.toHexString(),
            hash.toHexString(),
            ByteArray.fromI32(data.length).toHexString(),
          ]
        );
      }
      transaction.value = value;
      transaction.to = to;
      transaction.signatures = signatures;
      transaction.nonce = nonce;
      transaction.operation = operation == 0 ? "CALL" : "DELEGATE_CALL";
      transaction.estimatedSafeTxGas = safeTxGas;
      transaction.estimatedBaseGas = baseGas;
      transaction.gasToken = gasToken;
      transaction.gasPrice = gasPrice;
      transaction.refundReceiver = refundReceiver;
      transaction.save();

      wallet = addTransactionToWallet(<Wallet>wallet, transaction);
      wallet.currentNonce = currentNonce.value;
      wallet.save();
    }
  } else {
    log.warning("handleTransaction::Wallet {} not found", [
      walletAddr.toHexString(),
    ]);
  }
}
