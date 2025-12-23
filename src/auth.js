const { ask } = require('./ask')
const crypto = require("crypto")
const fs = require("fs")
const path = require("path")
const os = require("os")
const chalk = require('chalk')

const BASE_DIR = process.env.RICHPASS_TEST_DIR || path.join(os.homedir(), ".richpass")
const VAULT_PATH = path.join(BASE_DIR, "vault.json")

if (!fs.existsSync(BASE_DIR)) {
  fs.mkdirSync(BASE_DIR, { recursive: true })
}

if (!fs.existsSync(VAULT_PATH)) {
  fs.writeFileSync(
    VAULT_PATH,
    JSON.stringify({ salt: null, hash: null, vault: null }, null, 2)
  )
}

function readVault() {
  return JSON.parse(fs.readFileSync(VAULT_PATH, "utf8"))
}

async function firstLogin() {
  console.log("First time setup")

  const p1 = await ask("Set master password", "password")
  const p2 = await ask("Confirm master password", "password")

  if (p1 !== p2) {
    console.log(chalk.red("✖ Passwords do not match"))
    process.exit(1)
  }

  const salt = crypto.randomBytes(16).toString("hex")

  await new Promise((resolve, reject) => {
    crypto.pbkdf2(p1, salt, 100000, 32, "sha256", (err, key) => {
      if (err) return reject(err)

      const data = {
        salt,
        hash: key.toString("hex"),
        vault: null
      }

      fs.writeFileSync(VAULT_PATH, JSON.stringify(data, null, 2))
      resolve()
    })
  })

  console.log(chalk.green("✔ Master Password Set Successfully"))
}

async function confirm() {
  const vault = readVault()
  const salt = vault.salt
  const hash = vault.hash

  const p1 = await ask("Enter the master password", "password")

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(p1, salt, 100000, 32, "sha256", (err, key) => {
      if (err) return reject(err)

      if (key.toString("hex") === hash) {
        console.log(chalk.green("✔ Access granted"))
        resolve(true)
      } else {
        console.log(chalk.red("✖ Wrong password"))
        resolve(false)
      }
    })
  })
}

module.exports = { firstLogin, confirm }
