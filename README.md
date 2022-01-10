<!-- deno-fmt-ignore-file -->

JSON Hash
=========

[![Latest version][Tag badge]][Deno module]
[![LGPL 3.0][License badge]](./LICENSE)
[![Deno Doc (API references)][Deno Doc badge]][Deno Doc]
[![GitHub Actions][GitHub Actions status badge]][GitHub Actions]

This package contains the following JSON utilties for [Deno]:

 -  [*digest.ts*](./digest.ts) provides cryptographic hash digests of
    JSON trees.  It guarantee that `digest()` function always returns
    the same digest for the equivalent JSON trees.  It means you don't have to
    care about the order of how object keys occurs or how characters in string
    are encoded.  It also provides various hash algorithms; see also the [docs
    of Deno's std/crupto module][std/crypto].

 -  [*merkle.ts*](./merkle.ts) provides hash digests of JSON [Merkle tree]s.
    It can be used for efficient diff of two large trees or updating a deep
    leaf in a large tree.

 -  [*canon.ts*](./canon.ts) provides canonicalization of JSON trees.
    This complies with [RFC 8785], also known as JCS (JSON Canonicalization
    Scheme).

 -  [*mod.ts*](./mod.ts) re-exports everything in the above files.

See also [Deno Doc] for the complete API references.

[Tag badge]: https://img.shields.io/github/v/tag/dahlia/json-hash
[Deno module]: https://deno.land/x/json_hash
[License badge]: https://img.shields.io/github/license/dahlia/json-hash
[Deno Doc]: https://doc.deno.land/https://deno.land/x/json_hash/mod.ts
[Deno Doc badge]: https://img.shields.io/badge/api-deno%20doc-blue
[GitHub Actions]: https://github.com/dahlia/json-hash/actions/workflows/test.yaml
[GitHub Actions status badge]: https://github.com/dahlia/json-hash/actions/workflows/test.yaml/badge.svg
[Deno]: https://deno.land/
[std/crypto]: https://deno.land/std@0.120.0/crypto#supported-algorithms
[Merkle tree]: https://en.wikipedia.org/wiki/Merkle_tree
[RFC 8785]: https://tools.ietf.org/html/rfc8785


License
-------

Distributed under [LGPL 3.0].

[LGPL 3.0]: https://www.gnu.org/licenses/lgpl-3.0.html