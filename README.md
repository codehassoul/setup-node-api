# 🚀 setup-node-api

Create a production-ready Node.js + Express API instantly from your terminal.

---

## ✨ Features

* ⚡ **Instant project setup** with zero configuration
* 🤖 **Interactive mode** for beginners (guided prompts)
* 🧠 **Smart CLI behavior** (flags + prompts hybrid)
* 🛡️ **Safe overwrite handling** with confirmation
* 🎨 Clean CLI output (colors + spinner)
* 🔧 Configurable via flags
* 📦 Works directly with `npx` (no install required)

---

## 📦 Quick Start

```bash
npx setup-node-api my-app
```

---

## 🧠 Interactive Mode

Run without arguments:

```bash
npx setup-node-api
```

You’ll be guided through:

* Project name
* TypeScript or JavaScript
* Install dependencies

---

## ▶️ Usage

```bash
setup-node-api <project-name>
```

---

## ⚙️ Options

### Skip installing dependencies

```bash
setup-node-api my-app --no-install
```

---

### Use TypeScript template

```bash
setup-node-api my-app --typescript
```

---

### Set custom port

```bash
setup-node-api my-app --port 5000
```

---

## 🧪 Examples

### Full interactive

```bash
npx setup-node-api
```

---

### With flags (no prompts)

```bash
npx setup-node-api my-api --typescript --no-install
```

---

### Custom port

```bash
npx setup-node-api my-api --port 4000
```

---

## 🛡️ Safety

If the target folder already exists, the CLI will ask before overwriting:

```bash
? Folder already exists. Overwrite? (y/N)
```

---

## 📁 Generated Project

Each project includes:

* Express server setup
* `/health` endpoint
* `.env` support
* Ready-to-run scripts

---

## 📁 Example Structure

```
my-app/
  ├── src/
  │   └── app.js / app.ts
  ├── package.json
  ├── .env
```

---

## 🛠️ Tech Stack

* Node.js
* Express
* Commander
* Inquirer
* Chalk
* Ora

---

## 🎯 Why This Tool?

Most scaffolding tools are either:

* too complex
* or too minimal

**setup-node-api** focuses on:

> simplicity + good developer experience

---

## 📄 License

MIT © 2026 codehassoul