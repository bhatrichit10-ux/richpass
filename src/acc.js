const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const os = require('os')

const BASE_DIR = process.env.RICHPASS_TEST_DIR || path.join(os.homedir(), ".richpass")
const VAULT_PATH = path.join(BASE_DIR, 'vault.json')
const ACC_PATH = path.join(BASE_DIR, 'acc.json')

if (!fs.existsSync(BASE_DIR)) {
  fs.mkdirSync(BASE_DIR, { recursive: true })
}

if (!fs.existsSync(VAULT_PATH)) {
  fs.writeFileSync(VAULT_PATH, JSON.stringify({ salt: null, hash: null }, null, 2))
}

if (!fs.existsSync(ACC_PATH)) {
  fs.writeFileSync(ACC_PATH, JSON.stringify({ accounts: {} }, null, 2))
}

function readVault() {
  return JSON.parse(fs.readFileSync(VAULT_PATH, 'utf8'))
}

function readAcc() {
  return JSON.parse(fs.readFileSync(ACC_PATH, 'utf8'))
}

function writeAcc(data) {
  fs.writeFileSync(ACC_PATH, JSON.stringify(data, null, 2))
}

function add(acc, user, pass) {
  const vault = readVault()
  const data = readAcc()

  crypto.pbkdf2(pass, vault.salt, 100000, 32, 'sha256', (err, key) => {
    if (err) throw err

    data.accounts[acc] = {
      user: user,
      passw: key.toString('hex')
    }

    writeAcc(data)
  })
}

module.exports = { add }
