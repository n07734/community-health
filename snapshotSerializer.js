import prettyFormat from "pretty-format";

const test = x => typeof x !== "string";
const print = value =>
  prettyFormat(value)
    .replace(/"/g, "'")
    .replace(/Object \{/g, "{")
    .replace(/Array \[/g, "[");

export { test, print };
