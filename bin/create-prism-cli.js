#!/usr/bin/env node
"use strict";
const path = require("node:path");
const readline = require("node:readline/promises");
const { parseArgs } = require("node:util");
const { execFileSync } = require("node:child_process");
const S = require("../src");
const { c, header } = require("../src/ui");
const pkg = require("../package.json");

const HELP = `${header("create-prism-cli", "scaffold a zero-dependency Node CLI")}

${c.bold("Usage")}
  create-prism-cli [dir] [options]      ${c.dim("asks for anything missing (unless -y)")}

${c.bold("Options")}
  -n, --name <pkg>        package name (default: folder name)
  -b, --bin <cmd>         command name (default: name without create-/scope)
  -d, --desc <text>       one-line description
  -t, --template <t>      basic (flags) | commands (git-style subcommands)
  -a, --author <name>     author (default: git user.name)
  -r, --repo <owner/repo> GitHub repo for package.json + README
      --no-git            skip git init + first commit
      --test              run npm test after scaffolding
  -y, --yes               accept defaults, no prompts
  -f, --force             write into a non-empty folder
  -v, --version / -h, --help

Generates: bin/, src/, test/ (node:test), README, MIT LICENSE, CI (3 OS × Node 18/20/22), .editorconfig`;

let a;
try { a = parseArgs({ allowPositionals: true, options: { name: { type: "string", short: "n" }, bin: { type: "string", short: "b" }, desc: { type: "string", short: "d" }, template: { type: "string", short: "t" }, author: { type: "string", short: "a" }, repo: { type: "string", short: "r" }, "no-git": { type: "boolean" }, test: { type: "boolean" }, yes: { type: "boolean", short: "y" }, force: { type: "boolean", short: "f" }, version: { type: "boolean", short: "v" }, help: { type: "boolean", short: "h" } } }); }
catch (e) { console.error(c.red(`✖ ${e.message}`)); process.exit(2); }
const o = a.values;
if (o.help) { console.log(HELP); process.exit(0); }
if (o.version) { console.log(pkg.version); process.exit(0); }

(async () => {
  const interactive = !o.yes && process.stdin.isTTY && process.stdout.isTTY;
  const rl = interactive ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;
  const ask = async (q, def) => { if (!rl) return def; const v = (await rl.question(`${c.accent("?")} ${c.bold(q)} ${def ? c.dim(`(${def}) `) : ""}`)).trim(); return v || def; };
  console.log(header("create-prism-cli", `v${pkg.version}`) + "\n");
  let dirArg = a.positionals[0] || (await ask("Project folder", "my-cli"));
  const dir = path.resolve(dirArg);
  const name = o.name || (await ask("Package name", path.basename(dir).toLowerCase().replace(/[^a-z0-9-._~]/g, "-")));
  const bin = o.bin || (await ask("Command name", S.binFrom(name)));
  const description = o.desc || (await ask("Description", "A tiny, zero-dependency CLI"));
  let template = o.template || (rl ? await ask(`Template ${c.dim("basic | commands")}`, "basic") : "basic");
  const author = o.author ?? S.gitAuthor();
  rl?.close();
  let written;
  try { written = S.scaffold(dir, { name, bin, description, template, author, repo: o.repo, force: o.force }); }
  catch (e) { console.error(c.red(`✖ ${e.message}`)); process.exit(2); }

  const rel = path.relative(process.cwd(), dir) || ".";
  console.log(`${c.green("✔")} Created ${c.bold(name)} in ${c.cyan(rel + "/")} ${c.dim(`(${template}, ${written.length} files)`)}\n`);
  // mini tree
  const dirs = {}; for (const f of written) { const [top, ...r] = f.split("/"); (dirs[r.length ? top + "/" : ""] ??= []).push(r.length ? r.join("/") : top); }
  const keys = Object.keys(dirs).sort((x, y) => (x === "" ? 1 : y === "" ? -1 : x.localeCompare(y)));
  keys.forEach((k, i) => { if (k) { console.log(`  ${c.accent(k)} ${c.dim(dirs[k].join("  "))}`); } else console.log(`  ${dirs[k].join(c.dim("  "))}`); });
  if (!o["no-git"]) { const g = S.gitInit(dir); if (g) console.log(`\n${c.green("✔")} git ${g === "committed" ? "repo + first commit" : "repo initialized"}`); }
  if (o.test) {
    try { execFileSync(process.execPath, ["--test"], { cwd: dir, stdio: "pipe" }); console.log(`${c.green("✔")} npm test passes`); }
    catch (e) { console.log(c.red("✖ tests failed\n" + e.stdout)); process.exit(1); }
  }
  console.log(`\n${c.bold("Next")}\n  ${c.cyan(`cd ${rel}`)}\n  ${c.cyan("npm link")}            ${c.dim(`# makes \`${bin}\` available everywhere`)}\n  ${c.cyan(`${bin} --help`)}\n  ${c.cyan("npm test")}`);
})();
