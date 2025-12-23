#!/usr/bin/env node

const { ask } = require("./src/ask")
const { firstLogin, confirm } = require("./src/auth")
const { gen } = require("./src/gen")
const chalk = require("chalk")
const fs = require("fs")
const path = require("path")
const os = require("os")
const crypto = require("crypto")

async function getClipboard() {
  const mod = await import("clipboardy")
  return mod.default
}
async function pause() {
  await ask("Press Enter to continue", "input")
}

const BASE_DIR = process.env.RICHPASS_TEST_DIR || path.join(os.homedir(), ".richpass")
const VAULT_PATH = path.join(BASE_DIR, "vault.json")
const ACC_PATH = path.join(BASE_DIR, "acc.json")

if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true })

if (!fs.existsSync(VAULT_PATH)) {
  fs.writeFileSync(VAULT_PATH, JSON.stringify({ salt: null, hash: null }, null, 2))
}

if (!fs.existsSync(ACC_PATH)) {
  fs.writeFileSync(ACC_PATH, JSON.stringify({ accounts: {} }, null, 2))
}

function readVault() {
  return JSON.parse(fs.readFileSync(VAULT_PATH, "utf8"))
}

function readAcc() {
  return JSON.parse(fs.readFileSync(ACC_PATH, "utf8"))
}

function writeAcc(data) {
  fs.writeFileSync(ACC_PATH, JSON.stringify(data, null, 2))
}

function vexister() {
  return !!readVault().hash
}

function encrypt(text) {
  const key = Buffer.from(readVault().hash, "hex")
  const iv = crypto.randomBytes(12)

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  return Buffer.concat([iv, tag, encrypted]).toString("base64url")
}

function decrypt(enc) {
  const key = Buffer.from(readVault().hash, "hex")
  const buf = Buffer.from(enc, "base64url")

  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const encrypted = buf.subarray(28)

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
  decipher.setAuthTag(tag)

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8")
}

async function menu() {
  const ok = await confirm()
  if (!ok) return

  while (true) {
    const data = readAcc()
    if (!data.accounts) data.accounts = {}

    const option = await ask(
      "What do you want to do?",
      "list",
      ["Add Account", "View Account", "Remove Account", "Remove Master Password", "Exit"]
    )

    if (option === "Add Account") {
      const name = await ask("Service name (back / exit)", "input")
      if (!name || name.toLowerCase() === "back") continue
      if (name.toLowerCase() === "exit") process.exit(0)

      const user = await ask("Username (back / exit)", "input")
      if (user.toLowerCase() === "back") continue
      if (user.toLowerCase() === "exit") process.exit(0)

      const auto = await ask("Auto generate password?", "confirm")
      let plain

      if (auto) {
        plain = gen(12)
        console.log(chalk.green(plain))

        const clipboard = await getClipboard()
        await clipboard.write(plain)

        setTimeout(async () => {
          const clipboard = await getClipboard()
          clipboard.write("")
        }, 15000)

        console.log(chalk.gray("Password copied to clipboard"))
        
      } else {
        plain = await ask("Enter password (back / exit)", "password")
        if (plain?.toLowerCase() === "back") continue
        if (plain?.toLowerCase() === "exit") process.exit(0)
      }

      data.accounts[name] = { user, pass: encrypt(plain) }
      writeAcc(data)
      console.log(chalk.green("Account saved"))
      await pause()
      continue

    }

    if (option === "View Account") {
      const names = Object.keys(data.accounts)
      if (!names.length) {
        console.log("No accounts stored")
        continue
      }

      const choice = await ask("Select account", "list", [...names, "Back"])
      if (choice === "Back") continue

      const acc = data.accounts[choice]
      console.log("\nService:", choice)
      console.log("Username:", acc.user)

      while (true) {
        const next = await ask(
          "Action",
          "list",
          ["Copy Password", "Show Password", "Back"]
        )

        if (next === "Back") break

        if (next === "Copy Password") {
          const clipboard = await getClipboard()
          await clipboard.write(decrypt(acc.pass))

          setTimeout(async () => {
            const clipboard = await getClipboard()
            clipboard.write("")
          }, 15000)

          console.log(chalk.green("Password copied"))
        }

        if (next === "Show Password") {
          console.log("Password:", chalk.green(decrypt(acc.pass)))
        }
      }

      continue
    }

    /* REMOVE ACCOUNT */
    if (option === "Remove Account") {
      const names = Object.keys(data.accounts)
      if (!names.length) {
        console.log("No accounts to remove")
        continue
      }

      const choice = await ask("Select account", "list", [...names, "Back"])
      if (choice === "Back") continue

      delete data.accounts[choice]
      writeAcc(data)
      console.log(chalk.red("Account removed"))
      continue
    }

    /* RESET */
    if (option === "Remove Master Password") {
      const sure = await ask("Delete ALL data?", "confirm")
      if (!sure) continue

      if (fs.existsSync(VAULT_PATH)) fs.unlinkSync(VAULT_PATH)
      if (fs.existsSync(ACC_PATH)) fs.unlinkSync(ACC_PATH)

      console.log(chalk.red("All data deleted"))
      process.exit(0)
    }

    /* EXIT */
    if (option === "Exit") {
      console.log("Goodbye")
      process.exit(0)
    }
  }
}

if (vexister()) {
  menu()
} else {
  firstLogin()
}
