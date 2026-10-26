<!-- ═════════════ HEADER ═════════════ -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:07060f,50:6C63FF,100:7CFFB2&height=200&section=header&text=Prism%20Create%20CLI&fontSize=48&fontColor=ffffff&animation=fadeIn&fontAlignY=36&desc=Scaffold%20a%20zero-dep%20Node%20CLI&descAlignY=58&descSize=16" width="100%" alt="Prism Create CLI" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=19&duration=2600&pause=800&color=6C63FF&center=true&vCenter=true&width=680&lines=create-prism-cli;Idea+%E2%86%92+CLI+in+5+seconds;Zero+dependencies;Tests+%2B+CI+included" alt="Typing SVG" />
</p>

<p align="center">
  <a href="https://github.com/krishyaa06/prism-create-cli/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/krishyaa06/prism-create-cli/ci.yml?branch=main&style=for-the-badge&label=CI&logo=githubactions&logoColor=white" alt="CI" /></a>
  <img src="https://img.shields.io/badge/Node.js-%E2%89%A518.17-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/dependencies-0-6C63FF?style=for-the-badge" alt="Zero dependencies" />
  <a href="LICENSE"><img src="https://img.shields.io/github/license/krishyaa06/prism-create-cli?style=for-the-badge&color=7CFFB2" alt="License" /></a>
</p>

<p align="center">
  <img src="assets/screenshots/demo.png" width="90%" alt="Prism Create CLI screenshot" />
</p>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" width="100%" alt="" />

## ⚡ Overview

**Prism Create CLI** (`create-prism-cli`) is the starter behind the Prism CLIs. Answer four questions (or pass flags) and you get a working, tested, zero-dependency Node.js command-line tool: argument parsing with `node:util` `parseArgs`, colours that respect `NO_COLOR`, proper exit codes, `node:test` tests that already pass, a README, an MIT license and a GitHub Actions matrix. Pick `basic` for a single command with flags or `commands` for git-style subcommands.

## ✨ Features

- **Two templates**: `basic` (flags, positional args, JSON output) and `commands` (add / list subcommands with per-command help)
- **Zero dependencies** in the generated project — only Node built-ins
- **Tests included** with `node:test`, passing out of the box (`--test` verifies)
- **CI matrix**: Ubuntu, Windows, macOS × Node 18 / 20 / 22
- README, MIT LICENSE (author from git), `.editorconfig`, `.gitignore`, git init + first commit
- Interactive prompts, or fully scripted with `-y` and flags

## 🚀 Quick Start

```bash
# run without installing
npx github:krishyaa06/prism-create-cli my-cli

# or install globally
npm install -g github:krishyaa06/prism-create-cli
create-prism-cli my-cli -t commands
```

Requires Node.js 18.17+. No dependencies.

## 🛠️ Usage

```text
create-prism-cli [dir] [options]      asks for anything missing (unless -y)

  -n, --name <pkg>        package name (default: folder name)
  -b, --bin <cmd>         command name
  -d, --desc <text>       one-line description
  -t, --template <t>      basic | commands
  -a, --author <name>     author (default: git user.name)
  -r, --repo <owner/repo> GitHub repo for package.json + README
      --no-git            skip git init + first commit
      --test              run the generated tests
  -y, --yes               accept defaults, no prompts
  -f, --force             write into a non-empty folder
```

### What you get (`basic`)

```text
my-cli/
├── .github/workflows/ci.yml
├── bin/my-cli.js        parseArgs, help, exit codes
├── src/index.js         your logic (pure, testable)
├── src/colors.js        NO_COLOR-aware colours
├── test/my-cli.test.js  node:test
├── README.md  LICENSE  package.json  .editorconfig  .gitignore
```

## 📁 Project Structure

```text
prism-create-cli/
├── assets/
│   ├── logo.png
│   └── logo.svg
├── bin/
│   └── create-prism-cli.js   # CLI entry
├── src/
│   ├── index.js   # scaffold + git init
│   ├── templates.js   # generated files (basic / commands)
│   └── ui.js   # colours, tables
├── test/
│   └── create.test.js
├── .gitignore
├── LICENSE
└── package.json
```

## 🧪 Tests

```bash
npm test
```

Tests use the built-in `node:test` runner, so there is nothing to install. CI runs them on Node 20 and 22.

## 🤝 Contributing

1. Fork the repo and create a branch: `git checkout -b feature/my-idea`
2. Make your change and add a test in `test/`
3. Run `npm test` and open a Pull Request

## 🔷 Part of Prism Protocol

Prism Create CLI is one of the open-source tools built by [Prism Protocol](https://dc.gg/prismprotocol), a tech community where young builders learn, ship and compete together.

## 👤 Author

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/krishyaa06"><img src="https://github.com/krishyaa06.png" width="90" style="border-radius:50%" alt="Soumya Bhandare" /><br><b>Soumya Bhandare</b></a><br>
      <sub>Founder @ Prism Protocol</sub>
    </td>
    <td>
      <a href="https://dc.gg/prismprotocol"><img src="https://img.shields.io/badge/Discord-Prism%20Protocol-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord" /></a><br>
      <a href="https://instagram.com/prism_protocol_"><img src="https://img.shields.io/badge/Instagram-@prism__protocol__-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" /></a><br>
      <a href="https://x.com/krishyaa06"><img src="https://img.shields.io/badge/X-@krishyaa06-000000?style=for-the-badge&logo=x&logoColor=white" alt="X" /></a>
    </td>
  </tr>
</table>

## 📄 License

Released under the [MIT License](LICENSE).

<p align="center">
  <b>If you like this project, consider giving it a ⭐</b><br>
  <sub>"Build. Create. Compete." · Made with ⚡ by Prism Protocol</sub>
</p>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:7CFFB2,50:6C63FF,100:07060f&height=110&section=footer" width="100%" alt="" />
