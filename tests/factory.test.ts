import { Address, Bytes, ethereum, BigInt, log } from "@graphprotocol/graph-ts";
import {
  describe,
  test,
  clearStore,
  createMockedFunction,
  afterEach,
  newMockCall,
  newMockEvent,
  assert,
} from "matchstick-as/assembly/index";
import { Wallet } from "../generated/schema";
import { ProxyCreation as ProxyCreation_v1_1_1 } from "../generated/GnosisSafeProxyFactory_v1_1_1/GnosisSafeProxyFactory";
import { ProxyCreation as ProxyCreation_v1_3_0 } from "../generated/GnosisSafeProxyFactory_v1_3_0/GnosisSafeProxyFactory";
import { ProxyCreation as ProxyCreation_v1_4_1 } from "../generated/SafeProxyFactory_v1_4_1/SafeProxyFactory";
import {
  handleProxyCreation_1_1_1,
  handleProxyCreation_1_3_0,
  handleProxyCreation_1_4_1,
} from "../src/factory";

describe("handleProxyCreation tests", () => {
  afterEach(() => {
    // Clear the store after tests
    clearStore();
  });

  test("Should save 1.1.1 L1 wallet", () => {
    let safeAddress = Address.fromString(
      "0x49d6bd7784377b709643f4ba5a03c4Ca07a99227"
    );

    let proxyCreationEvent = changetype<ProxyCreation_v1_1_1>(newMockEvent());
    proxyCreationEvent.transaction.input = Bytes.fromHexString("0x1688f0b900000000000000000000000034cfac646f301356faa8b21e94227e3583fe3f5f000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000177b7a7972c0000000000000000000000000000000000000000000000000000000000000184b63e800d0000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000160000000000000000000000000d5d82b6addc9027b22dca772aa68d5d74cdbdf4400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000009583ca25ec7770b1d575d0c4c76b79ce257e6645000000000000000000000000a60e19fb510d15511f11c4277b92400ed4294ee7000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
    proxyCreationEvent.parameters = new Array();
    proxyCreationEvent.parameters.push(
      new ethereum.EventParam("proxy", ethereum.Value.fromAddress(safeAddress))
    );

    createMockedFunction(
      safeAddress,
      "getOwners",
      "getOwners():(address[])"
    ).returns([
      ethereum.Value.fromAddressArray([
        Address.fromString("0x9583Ca25eC7770B1d575D0c4C76B79cE257e6645"),
        Address.fromString("0xa60e19fB510D15511F11C4277B92400ED4294ee7"),
      ]),
    ]);
    createMockedFunction(safeAddress, "VERSION", "VERSION():(string)").returns([
      ethereum.Value.fromString("1.1.1"),
    ]);
    createMockedFunction(
      safeAddress,
      "getThreshold",
      "getThreshold():(uint256)"
    ).returns([ethereum.Value.fromI32(2)]);

    handleProxyCreation_1_1_1(proxyCreationEvent);

    assert.entityCount("Wallet", 1);
    assert.fieldEquals("Wallet", safeAddress.toHexString(), "version", "1.1.1");
  });

  test("Should save 1.3.0 L1 wallet", () => {
    let safeAddress = Address.fromString(
      "0x2073238095eeb85a2977e9925d15f5425aee93d2"
    );

    let proxyCreationEvent = changetype<ProxyCreation_v1_3_0>(newMockEvent());
    proxyCreationEvent.parameters = new Array();
    proxyCreationEvent.parameters.push(
      new ethereum.EventParam("proxy", ethereum.Value.fromAddress(safeAddress))
    );
    proxyCreationEvent.parameters.push(
      new ethereum.EventParam(
        "singleton",
        ethereum.Value.fromAddress(
          Address.fromString("0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552")
        )
      )
    );

    createMockedFunction(
      safeAddress,
      "getOwners",
      "getOwners():(address[])"
    ).returns([
      ethereum.Value.fromAddressArray([
        Address.fromString("0x4858Fbd70F681b703Adb5f3be5B103bF27eDAe02"),
      ]),
    ]);
    createMockedFunction(safeAddress, "VERSION", "VERSION():(string)").returns([
      ethereum.Value.fromString("1.3.0"),
    ]);
    createMockedFunction(
      safeAddress,
      "getThreshold",
      "getThreshold():(uint256)"
    ).returns([ethereum.Value.fromI32(1)]);

    handleProxyCreation_1_3_0(proxyCreationEvent);

    assert.entityCount("Wallet", 1);
    assert.fieldEquals("Wallet", safeAddress.toHexString(), "version", "1.3.0");
  });

  test("Should save 1.4.1 L2 wallet", () => {
    let safeAddress = Address.fromString(
      "0xb823e0889F0f5DB232654272a8D99a7ca43818dc"
    );

    let proxyCreationEvent = changetype<ProxyCreation_v1_4_1>(newMockEvent());
    proxyCreationEvent.parameters = new Array();
    proxyCreationEvent.parameters.push(
      new ethereum.EventParam("proxy", ethereum.Value.fromAddress(safeAddress))
    );
    proxyCreationEvent.parameters.push(
      new ethereum.EventParam(
        "singleton",
        ethereum.Value.fromAddress(
          Address.fromString("0x29fcB43b46531BcA003ddC8FCB67FFE91900C762")
        )
      )
    );

    createMockedFunction(
      safeAddress,
      "getOwners",
      "getOwners():(address[])"
    ).returns([
      ethereum.Value.fromAddressArray([
        Address.fromString("0x4858Fbd70F681b703Adb5f3be5B103bF27eDAe02"),
      ]),
    ]);
    createMockedFunction(safeAddress, "VERSION", "VERSION():(string)").returns([
      ethereum.Value.fromString("1.4.1"),
    ]);
    createMockedFunction(
      safeAddress,
      "getThreshold",
      "getThreshold():(uint256)"
    ).returns([ethereum.Value.fromI32(1)]);

    handleProxyCreation_1_4_1(proxyCreationEvent);

    assert.entityCount("Wallet", 1);
    assert.fieldEquals("Wallet", safeAddress.toHexString(), "version", "1.4.1+L2");
  });
});
