import { Address, Bytes, ethereum, BigInt } from "@graphprotocol/graph-ts";
import {
  describe,
  test,
  clearStore,
  createMockedFunction,
  afterAll,
  newMockCall,
} from "matchstick-as/assembly/index";
import { Wallet } from "../generated/schema";
import { handleProxyCreation_1_1_1 } from "../src/factory";

describe("handleProxyCreation tests", () => {
  afterAll(() => {
    // Clear the store after tests
    clearStore();
  });

  test("Should save L1 wallet", () => {

  });
});
