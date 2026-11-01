// Syntax check for every JavaScript module in the repository.
// Compiles each file in-process, so it works without spawning child processes.
// Usage: npm run check:syntax
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const skip = new Set(["node_modules", "dist", ".git", "build-cache", "dist-verified"]);
const targets = [];

function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (skip.has(entry.name) || entry.name.startsWith(".")) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(full);
    else if (/\.(cjs|js)$/.test(entry.name)) targets.push(full);
  }
}

collect(root);
targets.sort();

const failures = [];
for (const file of targets) {
  const source = fs.readFileSync(file, "utf8");
  try {
    // Wrap like a CommonJS module so top-level return/await-free code parses the same way.
    new vm.Script(`(function (exports, require, module, __filename, __dirname) {${source}\n})`, {
      filename: file,
    });
  } catch (error) {
    failures.push({ file, message: error.message });
  }
}

for (const failure of failures) {
  console.log(`FAIL  ${path.relative(root, failure.file)}`);
  console.log(`      ${failure.message}`);
}
console.log(`${targets.length - failures.length}/${targets.length} files passed syntax check`);
process.exit(failures.length ? 1 : 0);
