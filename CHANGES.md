<!-- deno-fmt-ignore-file -->

JSON Hash Changelog
===================

Version 0.2.0
-------------

Released on July 29, 2022.

 -  Added `MerkleHash#compareTo()` method.  [[#4]]
 -  `new MerkleHash()` constructor became to throw `TypeError` instead of
    `Error` if its second argument is a wrong type.
 -  `MerkleHash#equals()` method became to return `false` instead of throwing
    `TypeError` if its operand is not a `MerkleHash` instance.

[#4]: https://github.com/dahlia/json-hash/issues/4


Version 0.1.0
-------------

Released on January 11, 2022.
