<!-- deno-fmt-ignore-file -->

JSON Hash
=========

This package contains the following JSON utilties for [Deno]:

 -  [*digest.ts*](./digest.ts) provides cryptographic hash digests of
    JSON trees.  It guarantee that `digest()` function always returns
    the same digest for the equivalent JSON trees.  It means you don't have to
    care about the order of how object keys occurs or how characters in string
    are encoded.  It also provides various hash algorithms; see also the [docs
    of Deno's std/crupto module][std/crypto].

 -  [*canon.ts*](./canon.ts) provides canonicalization of JSON trees.
    This complies with [RFC 8785], also known as JCS (JSON Canonicalization
    Scheme).

 -  [*mod.ts*](./mod.ts) re-exports everything in the above files.

[Deno]: https://deno.land/
[std/crypto]: https://deno.land/std@0.120.0/crypto#supported-algorithms
[RFC 8785]: https://tools.ietf.org/html/rfc8785


License
-------

Distributed under [LGPL 3.0].

[LGPL 3.0]: https://www.gnu.org/licenses/lgpl-3.0.html