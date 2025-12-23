const fs = require("fs")
const path = require("path")
const os = require("os")

const BASE_DIR = path.join(os.homedir(), ".richpass")

const VAULT_PATH = path.join(BASE_DIR, "vault.json")
const ACC_PATH = path.join(BASE_DIR, "acc.json")

function ensureStore(filePath, defaultData) {
  if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR, { recursive: true })
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      JSON.stringify(defaultData, null, 2)
    )
  }
}

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function writeJSON(filePath, data) {
  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2)
  )
}

module.exports = {
  VAULT_PATH,
  ACC_PATH,
  ensureStore,
  readJSON,
  writeJSON
}
