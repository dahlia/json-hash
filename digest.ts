import { crypto, DigestAlgorithmType } from "./crypto.ts";
import { canonicalize, Tree } from "./canon.ts";

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
