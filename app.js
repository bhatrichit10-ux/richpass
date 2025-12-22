#!/usr/bin/env node

// Hi, Welcome to richpass. A password manager made by ghast9544
// WHat do you think?
// Open a PR to help me!!!
const { ask } = require("./src/ask.js")
const { firstLogin, confirm } = require("./src/auth.js")
const vault = require("./vault.json")
const data = require("./acc.json")
const { gen } = require("./src/gen")
const chalk = require("chalk")
const fs = require("fs")
const crypto = require("crypto")
function vexister() {
if(vault.hash) {
  return true
}}
const vexist = vexister()
function encrypt(text) {
  const key = Buffer.from(vault.hash, "hex")
  const iv = crypto.randomBytes(12)

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final()
  ])

  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString("base64url")
}

function decrypt(enc) {
  const key = Buffer.from(vault.hash, "hex")
  const buf = Buffer.from(enc, "base64url")

  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const encrypted = buf.subarray(28)

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
  decipher.setAuthTag(tag)

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]).toString("utf8")
}

async function menu() {
  const ok = await confirm()
  if (!ok) return

  if (!data.accounts) data.accounts = {}

  const option = await ask(
    "What do you want to do?",
    "list",
    ["Add Account", "View Account", "Remove Account"]
  )

  if (option === "Add Account") {
    const name = await ask("Service name")
    const user = await ask("Username")
    const auto = await ask("Auto generate password?", "confirm")

    let plain

    if (auto) {
      plain = gen(12)
      console.log(chalk.blue("Generated password:"))
      console.log(chalk.green(plain))
    } else {
      plain = await ask("Enter password", "password")
    }

    data.accounts[name] = {
      user,
      pass: encrypt(plain)
    }

    fs.writeFileSync("./acc.json", JSON.stringify(data, null, 2))
    console.log(chalk.green("Account saved"))
    return
  }

  if (option === "View Account") {
    const names = Object.keys(data.accounts)

    if (names.length === 0) {
      console.log("No accounts stored")
      return
    }

    const choice = await ask("Select account", "list", names)
    const acc = data.accounts[choice]
    const password = decrypt(acc.pass)

    console.log("\nService :", choice)
    console.log("Username:", acc.user)
    console.log("Password:", chalk.green(password))
    return
  }

  if (option === "Remove Account") {
    const names = Object.keys(data.accounts)

    if (names.length === 0) {
      console.log("No accounts to remove")
      return
    }

    const choice = await ask("Select account to remove", "list", names)
    delete data.accounts[choice]

    fs.writeFileSync("./acc.json", JSON.stringify(data, null, 2))
    console.log(chalk.red("Account removed"))
    return
  }
}

if (vexist) {
  menu()
} else {
  firstLogin()
}
