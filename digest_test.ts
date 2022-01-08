import { digest } from "./digest.ts";
import { toHex } from "./hex.ts";
import { assertEquals } from "https://deno.land/std@0.120.0/testing/asserts.ts";

Deno.test("digest()", async () => {
  const a1 = { foo: 1, bar: { x: 1, y: 2 } };
  const a2 = { bar: { y: 2, x: 1 }, foo: 1 };
  const b = { bar: { x: 1, y: 1 }, foo: 1 };
  const hashA1 = await digest("SHA-256", a1);
  assertEquals(
    toHex(hashA1),
    "fc9fcf9bc651901c1b870fa315676818fd95407a0444f73b9f931858978addf4",
  );
  const hashA2 = await digest("SHA-256", a2);
  assertEquals(hashA2, hashA1);
  const hashB = await digest("SHA-256", b);
  assertEquals(
    toHex(hashB),
    "9e92e99663a38271f9476f337a835ad88294c6afe9416e08db0e7285e5b93a07",
  );
});
