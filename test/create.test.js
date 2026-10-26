const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const S = require("../src");
const bin = path.join(__dirname, "../bin/create-prism-cli.js");
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "cpc-"));

test("names", () => { assert.ok(S.validName("@me/create-x")); assert.ok(!S.validName("Bad Name")); assert.equal(S.binFrom("@me/create-x"), "x"); });
for (const template of ["basic", "commands"]) {
  test(`template ${template} works`, () => {
    const d = path.join(tmp(), "app");
    const files = S.scaffold(d, { name: "my-tool", bin: "mytool", template, author: "Ada" });
    assert.ok(files.includes("bin/mytool.js") && files.includes(".github/workflows/ci.yml"));
    assert.equal(JSON.parse(fs.readFileSync(path.join(d, "package.json"))).bin.mytool, "bin/mytool.js");
    const t = spawnSync(process.execPath, ["--test"], { cwd: d, encoding: "utf8" });
    assert.equal(t.status, 0, t.stdout + t.stderr);
    assert.equal(spawnSync(process.execPath, [path.join(d, "bin/mytool.js"), "--help"]).status, 0);
  });
}
test("cli -y + errors", () => {
  const root = tmp();
  const r = spawnSync(process.execPath, [bin, "demo-cli", "-y", "--no-git", "-t", "commands"], { cwd: root, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /Created/);
  assert.ok(fs.existsSync(path.join(root, "demo-cli/bin/demo-cli.js")));
  assert.equal(spawnSync(process.execPath, [bin, "demo-cli", "-y", "--no-git"], { cwd: root }).status, 2);
  assert.equal(spawnSync(process.execPath, [bin, "x", "-y", "-t", "nope", "--no-git"], { cwd: root }).status, 2);
});
