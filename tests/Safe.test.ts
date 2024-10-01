import { Address, Bytes, ethereum, BigInt } from "@graphprotocol/graph-ts";
import {
  describe,
  test,
  clearStore,
  createMockedFunction,
  beforeAll,
  afterAll,
  newMockCall,
} from "matchstick-as/assembly/index";
import { handleExecTransaction } from "../src/wallet";
import { ExecTransactionCall } from "../generated/templates/GnosisSafe/GnosisSafe";
import { Wallet } from "../generated/schema";
import { zeroBigInt } from "../src/utils";

describe("handleExecTransaction tests", () => {
  beforeAll(() => {
    let brokenSafe = Address.fromString(
      "0x6775eba20f0b52b8b5f8527cc4352da8c24d0e6a"
    );
    // Setting up a mock for the `nonce` function that fails, as shown in the error message
    createMockedFunction(brokenSafe, "nonce", "nonce():(uint256)").reverts();

    let wallet = new Wallet(brokenSafe.toHex());
    wallet.creator = Address.fromString(
      "0xB6BdD4F0839eF6791eC1c77Cf29B10592d514624"
    );
    wallet.network = "mainnet";
    wallet.stamp = BigInt.fromString("1670966903");
    wallet.hash = Bytes.fromHexString(
      "0xc6f6ed20f8e7a199429d24fa78befe38714c32496d18ab9c24603dd87063bc1c"
    );
    wallet.factory = Address.fromString(
      "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2"
    );
    wallet.mastercopy = null;
    wallet.version = "1.3.0";
    wallet.owners = changetype<Bytes[]>([
      Address.fromString("0xB6BdD4F0839eF6791eC1c77Cf29B10592d514624"),
    ]);
    wallet.threshold = BigInt.fromI32(1);
    wallet.currentNonce = zeroBigInt();
    wallet.transactions = [];
    wallet.save();
  });

  afterAll(() => {
    // Clear the store after tests
    clearStore();
  });

  test("Should handle reverted contract call gracefully", () => {
    // Mocked from:
    // https://etherscan.io/tx/0x9cee302b9d536688dcf6451900dd3f402d231f884a83d32a3c1ef9fbc14ff0e7
    let call = changetype<ExecTransactionCall>(newMockCall());
    call.to = Address.fromString("0x6775eba20f0b52b8b5f8527cc4352da8c24d0e6a");

    call.inputValues = [
      new ethereum.EventParam(
        "to",
        ethereum.Value.fromAddress(
          Address.fromString("0xcE0c0210211274e98220Ea4F81C8671De9054cc9")
        )
      ),
      new ethereum.EventParam("value", ethereum.Value.fromI32(0)),
      new ethereum.EventParam(
        "data",
        ethereum.Value.fromBytes(Bytes.fromHexString("0xd55ec697"))
      ),
      new ethereum.EventParam("operation", ethereum.Value.fromI32(1)),
      new ethereum.EventParam("safeTxGas", ethereum.Value.fromI32(0)),
      new ethereum.EventParam("baseGas", ethereum.Value.fromI32(0)),
      new ethereum.EventParam("gasPrice", ethereum.Value.fromI32(0)),
      new ethereum.EventParam(
        "gasToken",
        ethereum.Value.fromAddress(
          Address.fromString("0x0000000000000000000000000000000000000000")
        )
      ),
      new ethereum.EventParam(
        "refundReceiver",
        ethereum.Value.fromAddress(
          Address.fromString("0x0000000000000000000000000000000000000000")
        )
      ),
      new ethereum.EventParam(
        "signatures",
        ethereum.Value.fromBytes(
          Bytes.fromHexString(
            "0x000000000000000000000000b6bdd4f0839ef6791ec1c77cf29b10592d514624000000000000000000000000000000000000000000000000000000000000000001"
          )
        )
      ),
    ];

    // Call the handler with the mocked call
    handleExecTransaction(call);
  });
});
