/**
 * Represents a JSON tree.
 */
export type Tree =
  | null
  | boolean
  | number
  | string
  | TreeArray
  | TreeObject;

// deno-lint-ignore no-empty-interface
interface TreeArray extends Array<Tree> {
}

interface TreeObject {
  [_: string]: Tree;
}

function serialize(tree: Tree, buffer: string[]): void {
  if (tree == null || typeof tree !== "object") {
    // ES6 JSON partially complies with RFC 8785 (JCS: JSON Canonicalization
    // Scheme) except for objects and arrays:
    buffer.push(JSON.stringify(tree));
  } else if (Array.isArray(tree)) {
    buffer.push("[");
    let notFirst = false;
    for (const item of tree) {
      if (notFirst) {
        buffer.push(",");
      }
      notFirst = true;
      serialize(item, buffer);
    }
    buffer.push("]");
  } else {
    // Object keys must be sorted in JSON.
    const keys = Object.keys(tree);
    keys.sort();
    buffer.push("{");
    let notFirst = false;
    for (const key of keys) {
      if (notFirst) {
        buffer.push(",");
      }
      notFirst = true;
      buffer.push(JSON.stringify(key));
      buffer.push(":");
      serialize(tree[key], buffer);
    }
    buffer.push("}");
  }
}

/**
 * Serializes a tree into a JSON string which complies with RFC 8785
 * (JCS: JSON Canonicalization Scheme).
 * @param tree The tree to serialize.
 * @returns The canonicalized JSON string.
 */
export function canonicalize(tree: Tree): string {
  const buffer: string[] = [];
  serialize(tree, buffer);
  return buffer.join("");
}
