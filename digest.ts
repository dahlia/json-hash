/**
 * This module provides cryptographic hash digests of JSON trees.
 * It guarantee that `digest()` function always returns the same digest
 * for the equivalent JSON trees.  It means you don't have to care about
 * the order of how object keys occurs or how characters in string are encoded.
 * It also provides various hash algorithms; see also the docs of Deno's
 * std/crypto module.
 * @license LGPL-3.0-or-later
 */
import { crypto, type DigestAlgorithmType } from "./crypto.ts";
import { canonicalize, type Tree } from "./canon.ts";

/**
 * Digests a tree using the specified hash algorithm.
 * @param algorithm The hash algorithm to use.
 * @param data The JSON tree to digest.
 * @returns The hash digest.
 * @throws {DOMException} Thrown when the algorithm is not supported.
 */
export async function digest(
  algorithm: DigestAlgorithmType,
  data: Tree,
): Promise<Uint8Array> {
  const canon = canonicalize(data);
  const canonBytes = new TextEncoder().encode(canon);
  const digestBuffer = await crypto.subtle.digest(algorithm, canonBytes);
  return new Uint8Array(digestBuffer);
}

export { type DigestAlgorithmType, type Tree };
