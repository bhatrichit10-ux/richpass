const test = require("node:test")
const assert = require("node:assert")
const fs = require("fs")
const path = require("path")
const os = require("os")

const BASE_DIR = path.join(os.tmpdir(), "richpass-reset-test")
const VAULT_PATH = path.join(BASE_DIR, "vault.json")
const ACC_PATH = path.join(BASE_DIR, "acc.json")

test("Reset: vault and acc", () => {
  fs.mkdirSync(BASE_DIR, { recursive: true })
  fs.writeFileSync(VAULT_PATH, "{}")
  fs.writeFileSync(ACC_PATH, "{}")

  assert.ok(fs.existsSync(VAULT_PATH))
  assert.ok(fs.existsSync(ACC_PATH))

  fs.unlinkSync(VAULT_PATH)
  fs.unlinkSync(ACC_PATH)

  assert.ok(!fs.existsSync(VAULT_PATH))
  assert.ok(!fs.existsSync(ACC_PATH))
})
