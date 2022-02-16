<!-- deno-fmt-ignore-file -->

JSON Hash
=========

[![Latest version][Tag badge]][Deno module]
[![LGPL 3.0][License badge]](./LICENSE)
[![Deno Doc (API references)][Deno Doc badge]][Deno Doc]
[![GitHub Actions][GitHub Actions status badge]][GitHub Actions]

This [Deno][][^1] package contains several utilties to deal JSON data with
cryoptography.  See the below sections for details.

[^1]: It is open to expand its target runtimes including [web browsers in
      particular][1].

[Tag badge]: https://img.shields.io/github/v/tag/dahlia/json-hash
[Deno module]: https://deno.land/x/json_hash
[License badge]: https://img.shields.io/github/license/dahlia/json-hash
[Deno Doc]: https://doc.deno.land/https://deno.land/x/json_hash/mod.ts
[Deno Doc badge]: https://img.shields.io/badge/api-deno%20doc-blue
[GitHub Actions]: https://github.com/dahlia/json-hash/actions/workflows/test.yaml
[GitHub Actions status badge]: https://github.com/dahlia/json-hash/actions/workflows/test.yaml/badge.svg
[Deno]: https://deno.land/
[1]: https://github.com/dahlia/json-hash/issues/2


[*canon.ts*][canon.ts]: JSON normalizer compliant with JCS
----------------------------------------------------------

Cryptographic operations like hashing and signing need the data to be
expressed in an invariant format so that the operations are reliably
repeatable.  Even if two messages are similar, only a single byte of difference
causes totally different digests or signatures.

However, JSON allows stylistic freedom on their representations.
For example, the following representations all encodes the same JSON entity:

~~~ jsonl
{ "foo": "bar", "baz": [1, 2, 3] }
{ "baz": [1, 2, 3], "foo": "bar" }
{"foo":"bar","baz":[1,2,3]}
{ "\u0066\u006f\u006f": "\u0062\u0061\u0072", "\u0062\u0061\u007a": [1, 2, 3] }
~~~~

In order to hash or sign JSON data, they should be normalized first.
That's why JSON Canonicalization Scheme (JCS) was proposed in [RFC 8785].
JCS allows only a single representation for each possible JSON entity.
For example, the JSON entity the above multiple representations encode can
be represented into only the below single form:

~~~ json
{"baz":[1,2,3],"foo":"bar"}
~~~

The [*canon.ts*][canon.ts] module implements JCS, which completely complies
with [RFC 8785].  Here's some example:

~~~ typescript
import { canonicalize } from "https://deno.land/x/json_hash/canon.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

assertEquals(
  canonicalize({ foo: "bar", baz: [1, 2, 3] }),
  canonicalize({
    "\x62\x61\x7a": [1, 2, 3],
    "\x66\x6f\x6f": "\x62\x61\x72",
  }),
);
~~~

[canon.ts]: https://doc.deno.land/https://deno.land/x/json_hash/canon.ts
[RFC 8785]: https://tools.ietf.org/html/rfc8785


[*digest.ts*][digest.ts]: Hashing JSON entities
-----------------------------------------------

This module is a thin wrapper around the above `canonicalize()` function and
the curated collection of cryptographic hash algorithms:

~~~~ typescript
import { digest } from "https://deno.land/x/json_hash/digest.ts";
import { toHex } from "https://deno.land/x/json_hash/hex.ts";

const data = { foo: "bar", baz: [ 1, 2, 3 ]};
const hash: Uint8Array = await digest("BLAKE3", data);
console.log(toHex(hash));
// dec9c1a89be824103c812b7ace381263335cd6f421a4d0f4dd407a4d3335189c
~~~~

The `digest()` function guarantees that it will return the equivalent hash
digest (in `Uint8Array`) for the same hash algorithm and the equivalent JSON
entity.  It means you don't have to care about the order of how object keys
occurs or how characters in string are encoded.

Also note that the above example uses [BLAKE3], which is unsupported by
Web Crypto API (as of January 2022).  Powered by Deno's [std/crypto] module,
which is baked into Web Assembly, it provides much wider range of hash
algorithms than Web Crypto API.

[digest.ts]: https://doc.deno.land/https://deno.land/x/json_hash/digest.ts
[BLAKE3]: https://github.com/BLAKE3-team/BLAKE3
[std/crypto]: https://deno.land/std@0.120.0/crypto#supported-algorithms


[*merkle.ts*][merkle.ts]: Dealing JSON with Merkle tree
-------------------------------------------------------

If you need to track changes of large JSON trees this module could help you.
It provides `merkle()` function and `MerkleHash<T>` class which enables you to
build [Merkle tree]s.

Unlikes `digest()` function from *digest.ts* module, `merkle()` function doesn't
digest the entire JSON data at once, but digests each small entity of the tree
and digests them recursively.  For example:

~~~ typescript
import { MerkleHash, merkle } from "https://deno.land/x/json_hash/merkle.ts";
import { assert } from "https://deno.land/std/testing/asserts.ts";

const a: MerkleHash<"BLAKE3"> = await merkle("BLAKE3", [1, 2, 3]);
const b: MerkleHash<"BLAKE3"> = await merkle("BLAKE3", [
  await merkle("BLAKE3", 1),
  await merkle("BLAKE3", 2),
  await merkle("BLAKE3", 3),
]);
assert(a.equals(b));

const c: MerkleHash<"BLAKE3"> = await merkle(
  "BLAKE3",
  { foo: "bar", baz: [1, 2, 3] }
);
const d: MerkleHash<"BLAKE3"> = await merkle(
  "BLAKE3",
  { foo: await merkle("BLAKE3", "bar"), baz: a }
);
assert(c.equals(d));

const e = await merkle(c);
assert(e.equals(c));
~~~

Note that `merkle()` returns `MerkleHash<T>` (instead of `Uint8Array`),
and also takes a JSON tree mixed with `MerkleHash<T>` values.  In this module,
such mixed trees are called `MerkleTree<T>`.[^2]  The `merkle()` function
behaves like below:

 -  `merkle()` derives `MerkleHash<T>` from `MerkleTree<T>`.
 -  `merkle()` makes no distinction between a `MerkleTree<T>` and
    `MerkleHash<T>` derived from the same tree.

In other words, the idea this module implements is very simple: hierarchical
hash verification of JSON trees.  If you still don't get it well I recommend
you to read *[Diving into Merkle Trees]* by Pedro Tavares.

[^2]: It is a compiled-time abstract type, and the type parameter `T` represents
      the hash algorithm, which corresponds to `MerkleHash<T>`'s type parameter.

[merkle.ts]: https://doc.deno.land/https://deno.land/x/json_hash/digest.ts
[Merkle tree]: https://en.wikipedia.org/wiki/Merkle_tree
[Diving into Merkle Trees]: https://ordep.dev/posts/diving-into-merkle-trees


[*mod.ts*][Deno doc]: Façade
----------------------------

This module re-exports everything in the above files.

See also [Deno Doc] for the complete API references.


Changelog
---------

See [CHANGES.md](CHANGES.md) file.


License
-------

Distributed under [LGPL 3.0] or later.

[LGPL 3.0]: https://www.gnu.org/licenses/lgpl-3.0.html
