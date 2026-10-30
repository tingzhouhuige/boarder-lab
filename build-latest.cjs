// Dev-only helper: build the portable Windows app and refresh one stable test
// file, so every change can be tested by launching the same path again.
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const distDir = path.join(root, "dist");
const builderCli = path.join(root, "node_modules", "electron-builder", "out", "cli", "cli.js");

console.log(`Building Border Lab ${pkg.version} (portable)...`);
// Spawn node with the CLI entry directly: a .cmd shim would break on the space in the project path.
const build = spawnSync(process.execPath, [builderCli, "--win", "portable"], {
  cwd: root,
  stdio: "inherit",
});
if (build.status !== 0) {
  console.error("Build failed.");
  process.exit(build.status || 1);
}

const versioned = path.join(distDir, `Border Lab ${pkg.version}.exe`);
const latest = path.join(distDir, "Border Lab 测试版.exe");
if (!fs.existsSync(versioned)) {
  console.error(`Missing build output: ${versioned}`);
  process.exit(1);
}

fs.copyFileSync(versioned, latest);
const sizeMb = (fs.statSync(latest).size / 1024 / 1024).toFixed(1);
console.log("");
console.log(`测试包已更新: ${latest}`);
console.log(`版本 ${pkg.version}，${sizeMb} MB`);
