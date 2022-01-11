import { canonicalize } from "./canon.ts";
import { fromHex } from "./hex.ts";
import {
  assertEquals,
  AssertionError,
} from "https://deno.land/std@0.120.0/testing/asserts.ts";

Deno.test("canonicalize(null)", () => {
  assertEquals(canonicalize(null), "null");
});

Deno.test("canonicalize(boolean)", () => {
  assertEquals(canonicalize(true), "true");
  assertEquals(canonicalize(false), "false");
});

function doubleBE(hex: string): number {
  const buffer = fromHex(hex);
  const view = new DataView(buffer.buffer);
  return view.getFloat64(0, false);
}

// https://tools.ietf.org/id/draft-rundgren-json-canonicalization-scheme-00.html#rfc.section.3.2.2.3  // editorconfig-checker-disable-line
Deno.test("canonicalize(number)", () => {
  assertEquals(
    canonicalize(doubleBE("4340000000000001")),
    "9007199254740994",
  );
  assertEquals(
    canonicalize(doubleBE("4340000000000002")),
    "9007199254740996",
  );
  assertEquals(canonicalize(doubleBE("444b1ae4d6e2ef50")), "1e+21");
  assertEquals(canonicalize(doubleBE("3eb0c6f7a0b5ed8d")), "0.000001");
  assertEquals(
    canonicalize(doubleBE("3eb0c6f7a0b5ed8c")),
    "9.999999999999997e-7",
  );
  assertEquals(canonicalize(doubleBE("8000000000000000")), "0");
  assertEquals(canonicalize(doubleBE("7fffffffffffffff")), "null");
  assertEquals(canonicalize(doubleBE("7ff0000000000000")), "null");
  assertEquals(canonicalize(doubleBE("fff0000000000000")), "null");
});

Deno.test("canonicalize(string)", () => {
  assertEquals(canonicalize(""), `""`);
  assertEquals(
    canonicalize("predefined control chars: \b\t\n\f\r"),
    `"predefined control chars: \\b\\t\\n\\f\\r"`,
  );
  assertEquals(
    canonicalize("control chars: \u0000\u0001\u0002\u0003\u001e\u001f"),
    `"control chars: \\u0000\\u0001\\u0002\\u0003\\u001e\\u001f"`,
  );
  assertEquals(
    canonicalize(`quotes and backslashes: "\\`),
    `"quotes and backslashes: \\"\\\\"`,
  );
  assertEquals(
    canonicalize("other chars: ABC xyz 가나다 123 甲乙丙"),
    `"other chars: ABC xyz 가나다 123 甲乙丙"`,
  );
});

Deno.test("canonicalize(unknown[])", () => {
  assertEquals(canonicalize([]), "[]");
  assertEquals(canonicalize([1, 2, 3]), "[1,2,3]");
  assertEquals(canonicalize([1, 2, 3, null]), "[1,2,3,null]");
  assertEquals(canonicalize(["asdf", true, false]), `["asdf",true,false]`);
});

Deno.test("canonicalize(object)", () => {
  assertEquals(canonicalize({}), "{}");
  assertEquals(canonicalize({ a: 1, b: 2, c: 3 }), `{"a":1,"b":2,"c":3}`);
  assertEquals(
    canonicalize({
      가나다: null,
      "\r\n": true,
      "": {},
      '"\\': [{ a: 1, b: 2 }],
    }),
    `{"":{},"\\r\\n":true,"\\"\\\\":[{"a":1,"b":2}],"가나다":null}`,
  );
});

Deno.test("canonicalize() [JCS compliance]", async () => {
  const jcsTestData = "jcs_spec/testdata";
  try {
    for await (const f of Deno.readDir(`${jcsTestData}/input`)) {
      if (!f.isFile) continue;
      const input = await Deno.readTextFile(`${jcsTestData}/input/${f.name}`);
      const inputTree = JSON.parse(input);
      const output = canonicalize(inputTree);
      const expected = await Deno.readTextFile(
        `${jcsTestData}/output/${f.name}`,
      );
      if (output !== expected) {
        console.error(f.name);
      }
      assertEquals(output, expected);
    }
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      throw new AssertionError(
        "No JCS test suite found.  Please check if submodules are initialized.",
      );
    }

    throw e;
  }
});
