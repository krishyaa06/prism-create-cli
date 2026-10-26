"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { files, TEMPLATES } = require("./templates");

const validName = (n) => /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(n) && n.length <= 214;
const binFrom = (n) => n.replace(/^@[^/]+\//, "").replace(/^create-/, "");

/** Scaffold into dir. Returns list of written files. */
function scaffold(dir, opts) {
  const o = { template: "basic", description: "A tiny, zero-dependency CLI", ...opts };
  if (!validName(o.name)) throw new Error(`"${o.name}" is not a valid npm package name`);
  if (!TEMPLATES[o.template]) throw new Error(`Unknown template "${o.template}" (${Object.keys(TEMPLATES).join(" | ")})`);
  o.bin ||= binFrom(o.name);
  if (!/^[a-z0-9][a-z0-9-_.]*$/i.test(o.bin)) throw new Error(`"${o.bin}" is not a valid command name`);
  if (fs.existsSync(dir) && fs.readdirSync(dir).filter((f) => f !== ".git").length && !o.force) throw new Error(`${path.basename(dir)}/ is not empty (use --force)`);
  const out = files(o);
  for (const [rel, content] of Object.entries(out)) {
    const abs = path.join(dir, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
    if (rel.startsWith("bin/")) fs.chmodSync(abs, 0o755);
  }
  return Object.keys(out).sort();
}
function gitInit(dir) {
  try { execFileSync("git", ["init", "-q", "-b", "main"], { cwd: dir, stdio: "ignore" }); execFileSync("git", ["add", "-A"], { cwd: dir, stdio: "ignore" }); execFileSync("git", ["commit", "-q", "-m", "chore: scaffold with create-prism-cli"], { cwd: dir, stdio: "ignore" }); return "committed"; }
  catch { try { execFileSync("git", ["rev-parse", "--git-dir"], { cwd: dir, stdio: "ignore" }); return "initialized"; } catch { return null; } }
}
function gitAuthor() { try { return execFileSync("git", ["config", "user.name"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return ""; } }
module.exports = { scaffold, gitInit, gitAuthor, validName, binFrom, TEMPLATES };
