import {
  assert,
  assertEquals,
  assertNotEquals,
  assertThrows,
} from "https://deno.land/std@0.120.0/testing/asserts.ts";
import { fromHex } from "./hex.ts";
import {
  type DigestAlgorithmType,
  merkle,
  MerkleHash,
  MerkleTree,
} from "./merkle.ts";

function assertHashEquals<T extends DigestAlgorithmType>(
  actual: MerkleHash<T>,
  expected: MerkleHash<T>,
): void {
  assertEquals(
    { algorithm: actual.algorithm, hex: actual.hex },
    { algorithm: expected.algorithm, hex: expected.hex },
  );
  assert(actual.equals(expected));
}

function assertHashNotEquals<T extends DigestAlgorithmType>(
  actual: MerkleHash<T>,
  expected: MerkleHash<T>,
): void {
  assertNotEquals(
    { algorithm: actual.algorithm, hex: actual.hex },
    { algorithm: expected.algorithm, hex: expected.hex },
  );
  assert(!actual.equals(expected));
}

Deno.test("new MerkleHash()", () => {
  const randomBytes: number[] = new Array(32);
  for (let i = 0; i < randomBytes.length; i++) {
    randomBytes[i] = Math.floor(Math.random() * 0xff);
  }
  const randomBytes2: number[] = randomBytes.slice();
  randomBytes2[0] = randomBytes[0] ^ 0xff;
  assertHashEquals(
    new MerkleHash("SHA-256", new Uint8Array(randomBytes)),
    new MerkleHash("SHA-256", new Uint8Array(randomBytes).buffer),
  );
  assertHashEquals(
    new MerkleHash("SHA-256", randomBytes),
    new MerkleHash("SHA-256", new Uint8Array(randomBytes)),
  );
  assertHashEquals(
    new MerkleHash("SHA-256", new Uint8Array(randomBytes).buffer),
    new MerkleHash("SHA-256", randomBytes),
  );
  assertHashNotEquals(
    new MerkleHash("SHA-256", new Uint8Array(randomBytes)),
    new MerkleHash("SHA-256", new Uint8Array(randomBytes2)),
  );
  assertHashNotEquals(
    new MerkleHash("SHA-256", new Uint8Array(randomBytes)),
    new MerkleHash("SHA3-256", new Uint8Array(randomBytes)),
  );
});

Deno.test("MerkleHash.deriveFrom()", async () => {
  assertHashEquals(
    await MerkleHash.deriveFrom("SHA3-224", Uint8Array.of()),
    MerkleHash.fromHex(
      "SHA3-224",
      "6b4e03423667dbb73b6e15454f0eb1abd4597f9a1b078e3f5b5a6bc7",
    ),
  );
  assertHashEquals(
    await MerkleHash.deriveFrom("SHA3-256", Uint8Array.of()),
    MerkleHash.fromHex(
      "SHA3-256",
      "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
    ),
  );
  const input = new TextEncoder().encode("hello");
  assertHashEquals(
    await MerkleHash.deriveFrom("SHA3-256", input),
    MerkleHash.fromHex(
      "SHA3-256",
      "3338be694f50c5f338814986cdf0686453a888b84f424d792af4b9202398f392",
    ),
  );
});

Deno.test("MerkleHash.fromHex()", () => {
  assertHashEquals(
    MerkleHash.fromHex("SHA-256", ""),
    new MerkleHash("SHA-256", new Uint8Array()),
  );
  assertHashEquals(
    MerkleHash.fromHex("MD5", "d41d8cd98f00b204e9800998ecf8427e"),
    new MerkleHash(
      "MD5",
      Uint8Array.of(
        0xd4,
        0x1d,
        0x8c,
        0xd9,
        0x8f,
        0x00,
        0xb2,
        0x04,
        0xe9,
        0x80,
        0x09,
        0x98,
        0xec,
        0xf8,
        0x42,
        0x7e,
      ),
    ),
  );
});

Deno.test("MerkleHash#algorithm", () => {
  const sha3_224 = MerkleHash.fromHex(
    "SHA3-224",
    "6b4e03423667dbb73b6e15454f0eb1abd4597f9a1b078e3f5b5a6bc7",
  );
  assertEquals(sha3_224.algorithm, "SHA3-224");
  const md5 = new MerkleHash(
    "MD5",
    Uint8Array.of(
      0xd4,
      0x1d,
      0x8c,
      0xd9,
      0x8f,
      0x00,
      0xb2,
      0x04,
      0xe9,
      0x80,
      0x09,
      0x98,
      0xec,
      0xf8,
      0x42,
      0x7e,
    ),
  );
  assertEquals(md5.algorithm, "MD5");
});

Deno.test("MerkleHash#hex", () => {
  const hash = new MerkleHash(
    "MD5",
    Uint8Array.of(
      0xd4,
      0x1d,
      0x8c,
      0xd9,
      0x8f,
      0x00,
      0xb2,
      0x04,
      0xe9,
      0x80,
      0x09,
      0x98,
      0xec,
      0xf8,
      0x42,
      0x7e,
    ),
  );
  assertEquals(hash.hex, "d41d8cd98f00b204e9800998ecf8427e");
});

Deno.test("MerkleHash#base85", () => {
  const hash = new MerkleHash(
    "MD5",
    Uint8Array.of(
      0xd4,
      0x1d,
      0x8c,
      0xd9,
      0x8f,
      0x00,
      0xb2,
      0x04,
      0xe9,
      0x80,
      0x09,
      0x98,
      0xec,
      0xf8,
      0x42,
      0x7e,
    ),
  );
  assertEquals(hash.base85, ")E$i3j{vd+>3|8C?D#@{");
});

Deno.test("MerkleHash#equals()", () => {
  const a = MerkleHash.fromHex(
    "SHA-256",
    "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
  );
  const b = new MerkleHash(
    "SHA-256",
    fromHex("a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a"),
  );
  const c = MerkleHash.fromHex(
    "SHA3-256",
    "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
  );
  const d = MerkleHash.fromHex(
    "SHA-256",
    "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434b",
  );
  assert(a.equals(b));
  assert(!a.equals(c as unknown as MerkleHash<"SHA-256">));
  assert(!a.equals(d));
  assert(b.equals(a));
  assert(!b.equals(c as unknown as MerkleHash<"SHA-256">));
  assert(!b.equals(d));
  assert(!c.equals(a as unknown as MerkleHash<"SHA3-256">));
  assert(!c.equals(b as unknown as MerkleHash<"SHA3-256">));
  assert(!c.equals(d as unknown as MerkleHash<"SHA3-256">));
  assert(!d.equals(a));
  assert(!d.equals(b));
  assert(!d.equals(c as unknown as MerkleHash<"SHA-256">));
});

Deno.test("MerkleHash#compareTo()", () => {
  const a = MerkleHash.fromHex(
    "SHA-256",
    "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
  );
  const b = MerkleHash.fromHex(
    "SHA-256",
    "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434b",
  );
  const c = MerkleHash.fromHex(
    "SHA-256",
    "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8435a",
  );
  assertEquals(a.compareTo(a), 0);
  assert(a.compareTo(b) < 0);
  assert(a.compareTo(c) < 0);
  assert(b.compareTo(a) > 0);
  assertEquals(b.compareTo(b), 0);
  assert(b.compareTo(c) < 0);
  assert(c.compareTo(a) > 0);
  assert(c.compareTo(b) > 0);
  assertEquals(c.compareTo(c), 0);

  assertThrows<TypeError>(() => a.compareTo(null!));
  assertThrows<TypeError>(
    () => a.compareTo({} as unknown as MerkleHash<"SHA-256">),
  );
  const sha1MerkleHash = MerkleHash.fromHex(
    "SHA-1",
    "adc83b19e793491b1c6ea0fd8b46cd9f32e592fc",
  );
  assertThrows<TypeError>(
    () => a.compareTo(sha1MerkleHash as unknown as MerkleHash<"SHA-256">),
  );
  const sha3_256MerkleHash = MerkleHash.fromHex(
    "SHA3-256",
    "cc7fd2d0b9381e25d5f1394227a8a4df0f82d374567632ddae402323ac71427b",
  );
  assertThrows<TypeError>(
    () => a.compareTo(sha3_256MerkleHash as unknown as MerkleHash<"SHA-256">),
  );
});

Deno.test("MerkleHash#toUint8Array()", () => {
  const initData = fromHex("d41d8cd98f00b204e9800998ecf8427e");
  const hash = new MerkleHash("MD5", initData);
  initData[0] = 0x00;
  assertHashEquals(
    hash,
    MerkleHash.fromHex("MD5", "d41d8cd98f00b204e9800998ecf8427e"),
  );

  const copy = hash.toUint8Array();
  assertEquals(
    copy,
    fromHex("d41d8cd98f00b204e9800998ecf8427e"),
  );

  copy[0] = 0x00;
  assertHashEquals(
    hash,
    MerkleHash.fromHex("MD5", "d41d8cd98f00b204e9800998ecf8427e"),
  );
});

Deno.test("MerkleHash#toString()", () => {
  const a = MerkleHash.fromHex(
    "SHA-256",
    "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
  );
  assertEquals(
    a.toString(),
    "SHA-256 a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
  );
  const b = MerkleHash.fromHex("MD5", "d41d8cd98f00b204e9800998ecf8427e");
  assertEquals(b.toString(), "MD5 d41d8cd98f00b204e9800998ecf8427e");
});

Deno.test("merkle()", async () => {
  const tree = [
    {
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      content: "Very long content...",
    },
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      content: "Very long content...",
    },
  ];

  const tree2: MerkleTree<"SHA3-256"> = [
    {
      ...tree[0],
      content: await merkle("SHA3-256", tree[0].content),
    },
    tree[1],
  ];

  const tree3: MerkleTree<"SHA3-256"> = [
    await merkle("SHA3-256", tree[0]),
    tree[1],
  ];

  const tree4: MerkleTree<"SHA3-256"> = [
    await merkle("SHA3-256", tree[0]),
    await merkle("SHA3-256", tree[1]),
  ];

  const merkleRoot = await merkle("SHA3-256", tree);

  assertHashEquals(await merkle("SHA3-256", tree), merkleRoot);
  assertHashEquals(await merkle("SHA3-256", tree2), merkleRoot);
  assertHashEquals(await merkle("SHA3-256", tree3), merkleRoot);
  assertHashEquals(await merkle("SHA3-256", tree4), merkleRoot);
  assertHashEquals(await merkle("SHA3-256", merkleRoot), merkleRoot);
  assertHashEquals(
    await merkle("SHA3-256", merkleRoot),
    MerkleHash.fromHex(
      "SHA3-256",
      "ede1427e0292877c45436591ac28139e0a8a1c23cf5d2036ffad6067bbc8c15c",
    ),
  );
});
