import { Address, BigInt, ByteArray, Wrapped } from "@graphprotocol/graph-ts";

export function zeroBigInt(): BigInt {
  return BigInt.fromI32(0);
}

export function oneBigInt(): BigInt {
  return BigInt.fromI32(1);
}

export function concat(a: ByteArray, b: ByteArray): ByteArray {
  let out = new Uint8Array(a.length + b.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i];
  }
  for (let j = 0; j < b.length; j++) {
    out[a.length + j] = b[j];
  }
  return changetype<ByteArray>(out);
}

export function padLeft(input: string, length: number, symbol: string): string {
  if (input.length >= 2 && input[0] == "0" && input[1] == "x") {
    input = input.substr(2);
  }

  if (input.length >= length) {
    return "0x" + input;
  }

  for (let i = 0, len = length - input.length; i < len; i++) {
    input = symbol + input;
  }

  return "0x" + input;
}

/**
 * Tries to determine if the given singleton is an L2 singleton
 * by checking the singleton address against a list of known L2 singletons.
 * This means if new singletons are deployed in future, they will not be considered L2
 * @param singleton - the singleton address to check
 * @returns true if the singleton is an L2 singleton, false otherwise
 */
export function isL2Wallet(singleton: Address): boolean {
  // TODO: check against a list of known L2 singletons
  return false;
}

/**
 * An improved version of the CallResult type from the graph-ts library.
 * This type allows for a reverted call to be distinguished from a call that
 * returned an empty value.
 */
export class ImprovedCallResult<T> {
  // `null` indicates a reverted call.
  private _value: Wrapped<T> | null;
  private _isEmpty: boolean;

  constructor() {
    this._value = null;
    this._isEmpty = false;
  }

  static fromValue<T>(value: T): ImprovedCallResult<T> {
    const result = new ImprovedCallResult<T>();
    result._isEmpty = false;
    result._value = new Wrapped(value);
    return result;
  }

  static emptyValue<T>(): ImprovedCallResult<T> {
    const result = new ImprovedCallResult<T>();
    result._isEmpty = true;
    return result;
  }

  get reverted(): bool {
    return !this._isEmpty && this._value == null;
  }

  get isEmpty(): bool {
    return this._isEmpty;
  }

  get value(): T {
    assert(
      !this.reverted,
      'accessed value of a reverted call, ' +
        'please check the `reverted` field before accessing the `value` field',
    );
    assert(
      !this._isEmpty,
      'accessed value of an empty call result, ' +
        'please check the `isEmpty` field before accessing the `value` field',
    );
    return changetype<Wrapped<T>>(this._value).inner;
  }
}
