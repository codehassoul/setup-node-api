# 🚀 setup-node-api

Create a Node.js Express API instantly from the CLI.

## ✨ Features

* ⚡ Instant project setup
* 🧩 Express server with `/health` endpoint
* 🎨 Clean CLI experience (colors + spinner)
* 🛡️ Input validation & error handling
* 🔧 Configurable via flags

## 📦 Installation (via npx)

```bash
npx setup-node-api my-app
```

---

## ▶️ Usage

```bash
setup-node-api my-app
```

---

## ⚙️ Options

### Skip installing dependencies

```bash
setup-node-api my-app --no-install
```

---

### Set custom port

```bash
setup-node-api my-app --port 5000
```

---

### Use TypeScript template

```bash
setup-node-api my-app --typescript
```

---

## 🧪 Example

```bash
npx setup-node-api my-api --typescript --port 4000
```

---

## 📁 Project Structure

Generated project includes:

* Express server
* `.env` support
* `/health` endpoint

---

## 🛠️ Tech

* Node.js
* Express
* Commander
* Chalk
* Ora

---

## 📄 License

MIT