#!/usr/bin/env node
const { ask } = require("./src/ask.js")
const { firstLogin, confirm } = require("./src/auth.js")
const vault = require('./vault.json')
const data = require('./acc.json')
const { gen } = require('./src/gen')
const chalk = require('chalk')
const fs = require("fs")
const crypto = require('crypto')

let vexist = fs.existsSync("vault.json")

function encrypt(text) {
  const key = Buffer.from(vault.hash, "hex")
  const iv = crypto.randomBytes(12)

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final()
  ])

  const authTag = cipher.getAuthTag()

  return Buffer.concat([iv, authTag, encrypted]).toString("base64url")
}

async function menu() {
  const ok = await confirm()
  if (!ok) return

  const option = await ask(
    "What do you want to do?",
    "list",
    ["Add Account", "List Accounts", "Remove Accounts"]
  )

  if (option !== "Add Account") return

  const name = await ask("Name of the service?")
  const user = await ask("Enter username")
  const auto = await ask("Use auto generated password?", "confirm")

  let plainPassword

  if (auto) {
    plainPassword = gen(12)
    console.log(chalk.blue("Generated Password:"))
    console.log(chalk.green(plainPassword))
  } else {
    plainPassword = await ask("Enter password", "password")
  }

  const encpass = encrypt(plainPassword)

  if (!data.accounts) data.accounts = {}

  data.accounts[name] = {
    user,
    pass: encpass
  }

  fs.writeFileSync("./acc.json", JSON.stringify(data, null, 2))
  console.log(chalk.green("Account saved securely"))
}

if (vexist) {
  menu()
} else {
  firstLogin()
}

