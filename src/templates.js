"use strict";
/* Files for a new zero-dependency Node CLI. Returns { "path": "content" }. */
const J = (o) => JSON.stringify(o, null, 2) + "\n";

const colors = `"use strict";
const on = process.stdout.isTTY && !process.env.NO_COLOR && process.env.TERM !== "dumb";
const wrap = (a, b) => (s) => (on ? \`\\x1b[\${a}m\${s}\\x1b[\${b}m\` : String(s));
module.exports = {
  bold: wrap(1, 22), dim: wrap(2, 22), red: wrap(31, 39), green: wrap(32, 39),
  yellow: wrap(33, 39), blue: wrap(34, 39), magenta: wrap(35, 39), cyan: wrap(36, 39),
};
`;

function basic(o) {
  return {
    [`bin/${o.bin}.js`]: `#!/usr/bin/env node
"use strict";
const { parseArgs } = require("node:util");
const c = require("../src/colors");
const { greet } = require("../src");
const pkg = require("../package.json");

const HELP = \`\${c.bold("${o.bin}")} \${c.dim("— ${o.description}")}

\${c.bold("Usage")}
  ${o.bin} [name] [options]

\${c.bold("Options")}
  -s, --shout       uppercase the greeting
  -n, --times <n>   repeat n times (default 1)
      --json        JSON output
  -v, --version     print version
  -h, --help        show this help\`;

let args;
try {
  args = parseArgs({
    allowPositionals: true,
    options: {
      shout: { type: "boolean", short: "s" },
      times: { type: "string", short: "n", default: "1" },
      json: { type: "boolean" },
      version: { type: "boolean", short: "v" },
      help: { type: "boolean", short: "h" },
    },
  });
} catch (e) {
  console.error(c.red(\`✖ \${e.message}\`));
  console.error(c.dim("Run ${o.bin} --help for usage."));
  process.exit(2);
}
const { values: opts, positionals } = args;
if (opts.help) { console.log(HELP); process.exit(0); }
if (opts.version) { console.log(pkg.version); process.exit(0); }

const times = Number(opts.times);
if (!Number.isInteger(times) || times < 1) { console.error(c.red("✖ --times must be a positive integer")); process.exit(2); }

const lines = Array.from({ length: times }, () => greet(positionals[0], { shout: opts.shout }));
if (opts.json) console.log(JSON.stringify({ lines }, null, 2));
else for (const l of lines) console.log(\`\${c.green("✔")} \${l}\`);
`,
    "src/index.js": `"use strict";

/**
 * Build a greeting. Replace this with your CLI's real logic —
 * keep it pure so it stays easy to test.
 */
function greet(name = "world", { shout = false } = {}) {
  const msg = \`Hello, \${name}\`;
  return shout ? msg.toUpperCase() + "!" : msg;
}

module.exports = { greet };
`,
    "src/colors.js": colors,
    [`test/${o.bin}.test.js`]: `const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { greet } = require("../src");

const bin = path.join(__dirname, "../bin/${o.bin}.js");
const run = (...a) => spawnSync(process.execPath, [bin, ...a], { encoding: "utf8" });

test("greet", () => {
  assert.equal(greet(), "Hello, world");
  assert.equal(greet("dev", { shout: true }), "HELLO, DEV!");
});

test("cli", () => {
  assert.match(run("Ada").stdout, /Hello, Ada/);
  assert.deepEqual(JSON.parse(run("x", "-n", "2", "--json").stdout).lines.length, 2);
  assert.equal(run("--times", "0").status, 2);
  assert.equal(run("--nope").status, 2);
  assert.equal(run("-v").stdout.trim(), require("../package.json").version);
});
`,
  };
}

function commands(o) {
  return {
    [`bin/${o.bin}.js`]: `#!/usr/bin/env node
"use strict";
const { parseArgs } = require("node:util");
const c = require("../src/colors");
const commands = require("../src/commands");
const pkg = require("../package.json");

const HELP = \`\${c.bold("${o.bin}")} \${c.dim("— ${o.description}")}

\${c.bold("Usage")}
  ${o.bin} <command> [options]

\${c.bold("Commands")}
\${Object.entries(commands).map(([k, v]) => \`  \${c.cyan(k.padEnd(10))} \${v.summary}\`).join("\\n")}

\${c.bold("Global options")}
  -v, --version   print version
  -h, --help      show help (also: ${o.bin} <command> --help)\`;

const [cmd, ...rest] = process.argv.slice(2);
if (!cmd || cmd === "-h" || cmd === "--help" || cmd === "help") { console.log(HELP); process.exit(0); }
if (cmd === "-v" || cmd === "--version") { console.log(pkg.version); process.exit(0); }

const command = commands[cmd];
if (!command) {
  const near = Object.keys(commands).find((k) => k.startsWith(cmd[0]));
  console.error(c.red(\`✖ Unknown command "\${cmd}"\`) + (near ? c.dim(\` — did you mean "\${near}"?\`) : ""));
  process.exit(2);
}
let args;
try {
  args = parseArgs({ args: rest, allowPositionals: true, options: { ...command.options, help: { type: "boolean", short: "h" } } });
} catch (e) { console.error(c.red(\`✖ \${e.message}\`)); process.exit(2); }
if (args.values.help) { console.log(\`\${c.bold(\`${o.bin} \${cmd}\`)} \${c.dim("— " + command.summary)}\\n\\n\${command.usage}\`); process.exit(0); }

Promise.resolve(command.run(args.values, args.positionals))
  .then((code) => process.exit(code ?? 0))
  .catch((e) => { console.error(c.red(\`✖ \${e.message}\`)); process.exit(1); });
`,
    "src/commands.js": `"use strict";
const c = require("./colors");
const { add, list } = require("./store");

/** Each command: summary, usage, parseArgs options, run(values, positionals) → exit code. */
module.exports = {
  add: {
    summary: "add a note",
    usage: "  ${o.bin} add <text...> [--tag <t>]",
    options: { tag: { type: "string", short: "t" } },
    run(v, p) {
      if (!p.length) throw new Error("Nothing to add — try: ${o.bin} add buy milk");
      const n = add(p.join(" "), v.tag);
      console.log(\`\${c.green("✔")} Added #\${n.id} \${c.dim(n.tag ? "[" + n.tag + "]" : "")}\`);
    },
  },
  list: {
    summary: "list notes",
    usage: "  ${o.bin} list [--tag <t>] [--json]",
    options: { tag: { type: "string", short: "t" }, json: { type: "boolean" } },
    run(v) {
      const items = list(v.tag);
      if (v.json) return console.log(JSON.stringify(items, null, 2));
      if (!items.length) return console.log(c.dim("No notes yet."));
      for (const n of items) console.log(\`\${c.dim("#" + n.id)} \${n.text} \${n.tag ? c.cyan("[" + n.tag + "]") : ""}\`);
    },
  },
};
`,
    "src/store.js": `"use strict";
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const file = () => process.env.${o.bin.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_FILE || path.join(os.homedir(), ".${o.bin}.json");
const read = () => { try { return JSON.parse(fs.readFileSync(file(), "utf8")); } catch { return []; } };
const write = (d) => fs.writeFileSync(file(), JSON.stringify(d, null, 2));

function add(text, tag) { const d = read(); const n = { id: (d.at(-1)?.id || 0) + 1, text, tag: tag || null, at: new Date().toISOString() }; d.push(n); write(d); return n; }
function list(tag) { return read().filter((n) => !tag || n.tag === tag); }
module.exports = { add, list, file };
`,
    "src/colors.js": colors,
    [`test/${o.bin}.test.js`]: `const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const bin = path.join(__dirname, "../bin/${o.bin}.js");
const env = { ...process.env, ${o.bin.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_FILE: path.join(fs.mkdtempSync(path.join(os.tmpdir(), "t-")), "db.json") };
const run = (...a) => spawnSync(process.execPath, [bin, ...a], { encoding: "utf8", env });

test("add + list", () => {
  assert.equal(run("add", "ship", "it", "-t", "work").status, 0);
  run("add", "rest");
  const all = JSON.parse(run("list", "--json").stdout);
  assert.equal(all.length, 2);
  assert.equal(JSON.parse(run("list", "-t", "work", "--json").stdout)[0].text, "ship it");
});

test("errors", () => {
  assert.equal(run("nope").status, 2);
  assert.equal(run("add").status, 1);
  assert.match(run("--help").stdout, /Commands/);
});
`,
  };
}

function common(o) {
  const year = new Date().getFullYear();
  const pkg = { name: o.name, version: "0.1.0", description: o.description, bin: { [o.bin]: `bin/${o.bin}.js` }, main: "src/index.js", files: ["bin", "src"], scripts: { test: "node --test", start: `node bin/${o.bin}.js` }, keywords: ["cli"], author: o.author || "", license: "MIT", engines: { node: ">=18.17" } };
  if (o.template === "commands") pkg.main = "src/commands.js";
  if (o.repo) pkg.repository = { type: "git", url: `git+https://github.com/${o.repo}.git` };
  return {
    "package.json": J(pkg),
    ".gitignore": "node_modules/\n.env\n.DS_Store\ncoverage/\n*.log\n",
    ".editorconfig": "root = true\n\n[*]\nindent_style = space\nindent_size = 2\nend_of_line = lf\ninsert_final_newline = true\ntrim_trailing_whitespace = true\n",
    LICENSE: `MIT License\n\nCopyright (c) ${year} ${o.author || o.name}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n`,
    ".github/workflows/ci.yml": `name: CI\non: [push, pull_request]\njobs:\n  test:\n    runs-on: \${{ matrix.os }}\n    strategy:\n      matrix:\n        os: [ubuntu-latest, windows-latest, macos-latest]\n        node: [18, 20, 22]\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \${{ matrix.node }}\n      - run: npm test\n      - run: node bin/${o.bin}.js --help\n`,
    "README.md": `# ${o.bin}\n\n> ${o.description}\n\n## Install\n\n\`\`\`bash\nnpm install -g ${o.repo ? `github:${o.repo}` : o.name}\n\`\`\`\n\nOr run from this folder with \`npm link\`.\n\n## Usage\n\n\`\`\`bash\n${o.template === "commands" ? `${o.bin} add "ship the thing" --tag work\n${o.bin} list\n${o.bin} --help` : `${o.bin} Ada --shout\n${o.bin} --help`}\n\`\`\`\n\n## Development\n\n\`\`\`bash\nnpm test        # node:test, no dependencies\nnpm start -- --help\n\`\`\`\n\n## License\n\nMIT${o.author ? ` © ${o.author}` : ""}\n`,
  };
}

const TEMPLATES = { basic: "single command with flags", commands: "git-style subcommands (add / list)" };
function files(o) { return { ...common(o), ...(o.template === "commands" ? commands(o) : basic(o)) }; }
module.exports = { files, TEMPLATES };
