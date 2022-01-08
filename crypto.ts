import { crypto } from "https://deno.land/std@0.120.0/crypto/mod.ts";

/**
 * Available hash algorithms.
 */
export type DigestAlgorithmType = Parameters<typeof crypto.subtle.digest>[0];

export { crypto };
