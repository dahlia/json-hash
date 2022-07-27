/**
 * This module provides hash digests of JSON Merkle trees.  It can be used for
 * efficient diff of two large trees or updating a deep leaf in a large tree.
 * @license LGPL-3.0-or-later
 */
import * as ascii85 from "https://deno.land/std@0.120.0/encoding/ascii85.ts";
import { Tree } from "./canon.ts";
import { crypto, type DigestAlgorithmType } from "./crypto.ts";
import { fromHex, toHex } from "./hex.ts";

/**
 * Represents a JSON Merkle tree.  It is equivalent to {@link Tree}, except that
 * it can contain {@link MerkleHash}es instead of actual JSON values.
 */
export type MerkleTree<T extends DigestAlgorithmType> =
  | Tree
  | MerkleTreeArray<T>
  | MerkleTreeObject<T>
  | MerkleHash<T>;

// deno-lint-ignore no-empty-interface
interface MerkleTreeArray<T extends DigestAlgorithmType>
  extends Array<MerkleTree<T>> {
}

interface MerkleTreeObject<T extends DigestAlgorithmType> {
  [_: string]: MerkleTree<T>;
}

/**
 * Represents a hash of a Merkle tree.
 */
export class MerkleHash<T extends DigestAlgorithmType> {
  static readonly #MoveFromInternalBuffer: unknown = {};
  readonly #hashBuffer: Uint8Array;

  /**
   * The hash algorithm used to create this digest.
   */
  readonly algorithm: T & DigestAlgorithmType;

  /**
   * Creates a new {@link MerkleHash} from a {@link Uint8Array}.
   * @param algorithm The used hash algorithm.
   * @param hashBuffer A buffer of digest bytes.
   */
  constructor(
    algorithm: T & DigestAlgorithmType,
    hashBuffer: ArrayBuffer | Uint8Array | number[],
    private _moveFromInternalBuffer?: unknown,
  ) {
    if (hashBuffer instanceof ArrayBuffer) {
      this.#hashBuffer =
        _moveFromInternalBuffer === MerkleHash.#MoveFromInternalBuffer
          ? new Uint8Array(hashBuffer)
          : new Uint8Array(new Uint8Array(hashBuffer));
    } else if (hashBuffer instanceof Uint8Array || Array.isArray(hashBuffer)) {
      this.#hashBuffer = new Uint8Array(hashBuffer);
    } else {
      throw new Error(`Unexpected type: ${typeof hashBuffer}.`);
    }
    this.algorithm = algorithm;
  }

  /**
   * Derives a {@link MerkleHash} from input data.
   * @param algorithm The hash algorithm to use.
   * @param data Input bytes to digest.
   * @returns The derived {@link MerkleHash}.
   */
  static async deriveFrom<T extends DigestAlgorithmType>(
    algorithm: T & DigestAlgorithmType,
    data: BufferSource | AsyncIterable<BufferSource> | Iterable<BufferSource>,
  ): Promise<MerkleHash<T>> {
    const digest = await crypto.subtle.digest(algorithm, data);
    return new MerkleHash(algorithm, digest);
  }

  /**
   * Converts a hexadecimal string into a {@link MerkleHash}.
   * @param algorithm The used hash algorithm.
   * @param hex The hexadecimal representation of a hash.
   * @returns A {@link MerkleHash} object.
   */
  static fromHex<T extends DigestAlgorithmType>(
    algorithm: T & DigestAlgorithmType,
    hex: string,
  ): MerkleHash<T> {
    return new MerkleHash(algorithm, fromHex(hex));
  }

  /**
   * Shows the hexadecimal representation of the hash.
   */
  get hex(): string {
    return toHex(this.#hashBuffer);
  }

  /**
   * Shows the base85 (RFC 1924) representation of the hash.
   */
  get base85(): string {
    return ascii85.encode(this.#hashBuffer, {
      "standard": "RFC 1924",
      delimiter: false,
    });
  }

  /**
   * Checks if two {@link MerkleHash} objects are equal.
   * @param other The other {@link MerkleHash} to compare.
   * @returns `true` if the hashes are equal, `false` otherwise.
   */
  equals(other: MerkleHash<T>): boolean {
    if (this.algorithm !== other.algorithm) return false;
    const thisBuffer = this.#hashBuffer;
    const otherBuffer = other.#hashBuffer;
    const length = thisBuffer.length;
    if (length !== otherBuffer.length) return false;
    for (let i = 0; i < length; i++) {
      if (thisBuffer.at(i) !== otherBuffer.at(i)) return false;
    }
    return true;
  }

  /**
   * Compares two {@link MerkleHash} objects.  The comparison is done by
   * comparing the hashes in byte order, that is, it's lexicographic.
   * @param other The other {@link MerkleHash} to compare.
   * @returns `-1` if this hash goes before the other hash, `0` if they are
   *          equal, and `1` if this hash goes after the other hash.
   * @throws {TypeError} Thrown if the other hash is a different kind of
   *                     {@link MerkleHash}; for example, different hash
   *                     algorithms.
   */
  compareTo(other: MerkleHash<T>): number {
    if (this.algorithm !== other.algorithm) {
      throw new TypeError(
        `Cannot compare merkle hashes with different algorithms.`,
      );
    }
    const thisBuffer = this.#hashBuffer;
    const otherBuffer = other.#hashBuffer;
    const length = thisBuffer.length;
    if (length !== otherBuffer.length) {
      throw new TypeError(
        `Cannot compare merkle hashes with different sizes.`,
      );
    }
    for (let i = 0; i < length; i++) {
      const a = thisBuffer.at(i);
      const b = otherBuffer.at(i);
      if (a !== b) return a! - b!;
    }
    return 0;
  }

  /**
   * Returns the {@link Uint8Array} representation of the hash.
   * @returns A copy of the {@link Uint8Array} representation of the hash.
   */
  toUint8Array(): Uint8Array {
    return new Uint8Array(this.#hashBuffer);
  }

  /**
   * Shows the algorithm and hexadecimal representation of the hash.
   * @returns The algorithm and hexadecimal representation of the hash.
   */
  toString(): string {
    return `${this.algorithm.toString()} ${this.hex}`;
  }

  [Symbol.for("Deno.customInspect")](): string {
    return `MerkleHash ${this.toString()}`;
  }
}

const utf8Encoder = new TextEncoder();

// editorconfig-checker-disable
/**
 * Derives a {@link MerkleHash} from input data.
 *
 * It treats {@link MerkleHash}es in the input tree as like JSON values that
 * those hashes represent.  For example, the following code prints 5 rows of
 * the exactly same hashes:
 *
 * ```ts
 * import { MerkleTree, merkle } from "./merkle.ts";
 * const tree = [
 *   {
 *     title: "The Catcher in the Rye",
 *     author: "J.D. Salinger",
 *     content: "Very long content...",
 *   },
 *   {
 *    title: "The Great Gatsby",
 *    author: "F. Scott Fitzgerald",
 *    content: "Very long content...",
 *   },
 * ];
 *
 * const tree2: MerkleTree<"SHA3-256"> = [
 *   {
 *     ...tree[0],
 *     content: await merkle("SHA3-256", tree[0].content),
 *   },
 *   tree[1],
 * ];
 *
 * const tree3: MerkleTree<"SHA3-256"> = [
 *   await merkle("SHA3-256", tree[0]),
 *   tree[1],
 * ];
 *
 * const tree4: MerkleTree<"SHA3-256"> = [
 *   await merkle("SHA3-256", tree[0]),
 *   await merkle("SHA3-256", tree[1]),
 * ];
 *
 * const merkleRoot = await merkle("SHA3-256", tree);
 *
 * console.log(await merkle("SHA3-256", tree));
 * console.log(await merkle("SHA3-256", tree2));
 * console.log(await merkle("SHA3-256", tree3));
 * console.log(await merkle("SHA3-256", tree4));
 * console.log(await merkle("SHA3-256", merkleRoot));
 *
 * // prints:
 * // MerkleHash SHA3-256 ede1427e0292877c45436591ac28139e0a8a1c23cf5d2036ffad6067bbc8c15c
 * // MerkleHash SHA3-256 ede1427e0292877c45436591ac28139e0a8a1c23cf5d2036ffad6067bbc8c15c
 * // MerkleHash SHA3-256 ede1427e0292877c45436591ac28139e0a8a1c23cf5d2036ffad6067bbc8c15c
 * // MerkleHash SHA3-256 ede1427e0292877c45436591ac28139e0a8a1c23cf5d2036ffad6067bbc8c15c
 * // MerkleHash SHA3-256 ede1427e0292877c45436591ac28139e0a8a1c23cf5d2036ffad6067bbc8c15c
 * ```
 *
 * @param algorithm The hash algorithm to use.
 * @param tree The input JSON data.
 * @returns The merkle root hash of the given JSON tree.
 */
// editorconfig-checker-enable
export async function merkle<T extends DigestAlgorithmType>(
  algorithm: T & DigestAlgorithmType,
  tree: MerkleTree<T>,
): Promise<MerkleHash<T>> {
  if (tree instanceof MerkleHash) return tree;
  let canon: string;
  if (tree == null || typeof tree !== "object") {
    // ES6 JSON partially complies with RFC 8785 (JCS: JSON Canonicalization
    // Scheme) except for objects and arrays:
    canon = JSON.stringify(tree);
  } else if (Array.isArray(tree)) {
    const buffer: string[] = [];
    buffer.push("[");
    let notFirst = false;
    for (const item of tree) {
      buffer.push(notFirst ? ",'" : "'");
      notFirst = true;
      const itemHash = await merkle(algorithm, item);
      buffer.push(itemHash.base85);
      buffer.push("'");
    }
    buffer.push("]");
    canon = buffer.join("");
  } else {
    // Object keys must be sorted.
    const keys = Object.keys(tree);
    keys.sort();
    const buffer: string[] = [];
    buffer.push("{");
    let notFirst = false;
    for (const key of keys) {
      if (notFirst) {
        buffer.push(",");
      }
      notFirst = true;
      buffer.push(JSON.stringify(key));
      buffer.push(":'");
      const valueHash = await merkle(algorithm, tree[key]);
      buffer.push(valueHash.base85);
      buffer.push("'");
    }
    buffer.push("}");
    canon = buffer.join("");
  }
  const utf8 = utf8Encoder.encode(canon);
  return await MerkleHash.deriveFrom(algorithm, utf8);
}

export { type DigestAlgorithmType };
