import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.120.0/testing/asserts.ts";
import { fromHex, toHex } from "./hex.ts";

Deno.test("toHex()", () => {
  assertEquals(toHex(Uint8Array.of()), "");
  assertEquals(toHex(Uint8Array.of(0x12, 0x34, 0x56, 0x78)), "12345678");
  assertEquals(toHex(Uint8Array.of(0xfe, 0xdc, 0xba, 0x00)), "fedcba00");
});

Deno.test("fromHex()", () => {
  assertEquals(fromHex(""), Uint8Array.of());
  assertEquals(fromHex("12345678"), Uint8Array.of(0x12, 0x34, 0x56, 0x78));
  assertEquals(fromHex("fedcba00"), Uint8Array.of(0xfe, 0xdc, 0xba, 0x00));
  assertEquals(fromHex("ABCDEF00"), Uint8Array.of(0xab, 0xcd, 0xef, 0x00));
  assertThrows(() => fromHex("a"), RangeError, "length");
  assertThrows(() => fromHex("abc"), RangeError, "length");
  assertThrows(() => fromHex("zz"), RangeError);
});
