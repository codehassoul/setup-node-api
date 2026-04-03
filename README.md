[![npm version](https://img.shields.io/npm/v/setup-node-api)](https://www.npmjs.com/package/setup-node-api)
[![npm downloads](https://img.shields.io/npm/dm/setup-node-api)](https://www.npmjs.com/package/setup-node-api)
[![CI](https://github.com/codehassoul/setup-node-api/actions/workflows/ci.yml/badge.svg)](https://github.com/codehassoul/setup-node-api/actions/workflows/ci.yml)

# setup-node-api

`setup-node-api` scaffolds a minimal Node.js + Express API with sensible defaults.

Node.js 20.12.0 or newer is required.

## Features

- Scaffold a ready-to-run Express API
- Choose JavaScript or TypeScript
- Use prompts interactively or pass CLI flags
- Validate project names before generation
- Avoid overwriting existing folders without confirmation
- Optionally skip dependency installation

## Quick start

```bash
npx setup-node-api my-api
```

Run it against the latest published version explicitly:

```bash
npx setup-node-api@latest my-api
```

Create a TypeScript project:

```bash
npx setup-node-api my-api --typescript
```

Skip package installation:

```bash
npx setup-node-api my-api --no-install
```

Set a custom port:

```bash
npx setup-node-api my-api --port 8080
```

## CLI usage

```bash
setup-node-api [project-name] [options]
```

### Options

| Option | Description |
| --- | --- |
| `--typescript` | Generate the TypeScript template |
| `--no-install` | Skip dependency installation |
| `--port <number>` | Write a custom `PORT` value to `.env` |
| `-h, --help` | Show help |
| `-V, --version` | Show the installed CLI version |

If you omit some options, the CLI prompts for them in an interactive terminal.

## Generated project

JavaScript template:

```text
my-api/
|-- .env
|-- package.json
`-- src/
    `-- app.js
```

TypeScript template:

```text
my-api/
|-- .env
|-- package.json
|-- tsconfig.json
`-- src/
    `-- app.ts
```

The generated project name in `package.json` is automatically set to the selected folder name.

## Examples

Create a JavaScript project without installing dependencies:

```bash
setup-node-api my-api --no-install
```

Create a TypeScript project and set a custom port:

```bash
setup-node-api my-api --typescript --port 4000
```

Ask the CLI to guide you interactively:

```bash
setup-node-api
```

## Development

```bash
npm install
npm test
npm run check
```

## CI

GitHub Actions runs the test suite on Node.js 20 and 22 across Linux, Windows, and macOS for pushes to `main` and pull requests.

## Notes

- In a non-interactive environment, provide the project name as an argument.
- If the target folder already exists, the CLI stops unless you explicitly confirm overwrite in an interactive terminal.
- `prepublishOnly` runs `npm run check` before publish.

## License

MIT
