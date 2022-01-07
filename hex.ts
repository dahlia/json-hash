const hexTable: string[] = [];
for (let i = 0; i < 0x100; ++i) {
  hexTable.push(i.toString(16).padStart(2, "0"));
}

/**
 * Turns a {@link Uint8Array} into a hexadecimal string.
 * @param bytes The bytes to convert.
 * @returns The hexadecimal string.  The string will be lowercase.
 */
export function toHex(bytes: Uint8Array): string {
  const result = [];
  for (let i = 0; i < bytes.length; ++i) {
    result.push(hexTable[bytes[i]]);
  }
  return result.join("");
}

/**
 * Turns a hexadecimal string into a {@link Uint8Array}.
 * @param hex The hexadecimal string to convert.  It is case-insensitive.
 * @returns The bytes.
 * @throws {@link RangeError} if the string is not a valid hexadecimal string.
 */
export function fromHex(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new RangeError("Invalid hex string; length must be even.");
  } else if (!hex.match(/^[0-9a-fA-F]*$/)) {
    throw new RangeError("Invalid hex string; must be hexadecimal.");
  }
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    result[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return result;
}
