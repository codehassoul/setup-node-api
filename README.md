![npm version](https://img.shields.io/npm/v/setup-node-api)
![downloads](https://img.shields.io/npm/dm/setup-node-api)

# setup-node-api

A minimal CLI for scaffolding Node.js + Express APIs.

Opinionated, simple, and focused on developer experience.

---

## Quick Start

```bash
npx setup-node-api my-api
```

---

## Features

* Fast API scaffolding
* JavaScript and TypeScript support
* Interactive prompts + CLI flags
* Safe project creation
* Clean project structure

---

## Usage

```bash
setup-node-api <project-name>
```

### Options

```bash
--typescript
--no-install
--port <number>
```

---

## Example

```bash
npx setup-node-api my-api --typescript
```

---

## Generated Project

```text
my-api/
  |-- src/
  |   `-- app.js / app.ts
  |-- package.json
  `-- .env
```

---

## Architecture

* CLI layer (Commander)
* Core orchestration layer
* Services (template, install, filesystem)
* Prompt system + validation

---

## Roadmap

* Command-based CLI (`create`, `add`, `generate`)
* Config file support
* Plugin system
* AI-assisted scaffolding

---

## License

MIT
