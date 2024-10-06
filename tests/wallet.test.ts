import { Address, Bytes, ethereum, BigInt } from "@graphprotocol/graph-ts";
import {
  describe,
  test,
  clearStore,
  createMockedFunction,
  afterAll,
  newMockCall,
} from "matchstick-as/assembly/index";
import { handleExecTransaction } from "../src/wallet";
import { ExecTransactionCall } from "../generated/templates/Safe/GnosisSafe";
import { Wallet } from "../generated/schema";
import { zeroBigInt } from "../src/utils";

describe("handleExecTransaction tests", () => {
  afterAll(() => {
    // Clear the store after tests
    clearStore();
  });

  test("Should handle reverted nonce call gracefully", () => {
    // Mocked from:
    // https://etherscan.io/tx/0x9cee302b9d536688dcf6451900dd3f402d231f884a83d32a3c1ef9fbc14ff0e7
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
    wallet.singleton = Address.fromString(
      "0xd9db270c1b5e3bd161e8c8503c55ceabee709552"
    );
    wallet.version = "1.3.0";
    wallet.owners = changetype<Bytes[]>([
      Address.fromString("0xB6BdD4F0839eF6791eC1c77Cf29B10592d514624"),
    ]);
    wallet.threshold = BigInt.fromI32(1);
    wallet.currentNonce = zeroBigInt();
    wallet.transactions = [];
    wallet.save();

    let call = changetype<ExecTransactionCall>(newMockCall());
    call.to = brokenSafe;

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

  test("Should handle empty nonce bytes returned gracefully", () => {
    // Mocked from:
    // https://etherscan.io/tx/0x66975e3a403aded15b6181c511e9442941e24ccbbd69daf9f63e05d3411fccc5
    let brokenSafe = Address.fromString(
      "0x27fd43babfbe83a81d14665b1a6fb8030a60c9b4"
    );
    // Setting up a mock for the `nonce` function that fails, as shown in the error message
    createMockedFunction(brokenSafe, "nonce", "nonce():(uint256)").returns([
      ethereum.Value.fromBytes(Bytes.empty()),
    ]);

    let wallet = new Wallet(brokenSafe.toHex());
    wallet.creator = Address.fromString(
      "0xfA54B4085811aef6ACf47D51B05FdA188DEAe28b"
    );
    wallet.network = "mainnet";
    wallet.stamp = BigInt.fromString("1670413079");
    wallet.hash = Bytes.fromHexString(
      "0x3c889ee7c1a19bb15d899f21c5c7d9da0af0c5a5f597f0e288b7309169b4dba5"
    );
    wallet.factory = Address.fromString(
      "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2"
    );
    wallet.singleton = Address.fromString(
      "0xd9db270c1b5e3bd161e8c8503c55ceabee709552"
    );
    wallet.version = "1.3.0";
    wallet.owners = changetype<Bytes[]>([
      Address.fromString("0xfA54B4085811aef6ACf47D51B05FdA188DEAe28b"),
      Address.fromString("0x9AF78003CecC2383d9D576A49c0C6b17fc34Ae34"),
      Address.fromString("0xD83b89E261D02B0f2f9E384B44907f8d380E9AF0"),
      Address.fromString("0x10F16CdE93f1bC9C38a9e31C8DB0eEb89a744824"),
      Address.fromString("0xaE648f68823bc164CA3ad1f5f5dC0057d9d515aD"),
    ]);
    wallet.threshold = BigInt.fromI32(3);
    wallet.currentNonce = zeroBigInt();
    wallet.transactions = [];
    wallet.save();

    let call = changetype<ExecTransactionCall>(newMockCall());
    call.to = brokenSafe;

    call.inputValues = [
      new ethereum.EventParam(
        "to",
        ethereum.Value.fromAddress(
          Address.fromString("0xfbfFEF83b1C172fE3BC86C1CCB036AB9F3efCAF2")
        )
      ),
      new ethereum.EventParam("value", ethereum.Value.fromI32(0)),
      new ethereum.EventParam(
        "data",
        ethereum.Value.fromBytes(
          Bytes.fromHexString(
            "0x804e1f0a0000000000000000000000003db5a2ace1928683f397b4e56b58afbc4f049af7"
          )
        )
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
            "0x375f180cd78f570742d80105b6eec00a1966c65b9cf61c86a7f32ab66269affb07b9c06013ae102b87b97fff6a49401f0c700c8aeb31e3e53e14d174a5d0a4bb1c58289d37c639c6ed6a3fff619b7b50c66741bda1c9d1963e7f0d3fa064b2a5df352b4910762b146a205b0cfb0700e69d668fa9478ebdec226f5606f591d410421b0000000000000000000000003b74ca0a491adea5d954b2644a3eb66b01a9f61b00000000000000000000000000000000000000000000000000000000000000000190bde104c3301c5fc873f730a8252c06d02ae544137534da14bb3d656b17695742b186ec754f2fbce63fc1acd0dc13d322de47b45b865a2af269c6aa0f68aed71b"
          )
        )
      ),
    ];

    // Call the handler with the mocked call
    handleExecTransaction(call);
  });
});
