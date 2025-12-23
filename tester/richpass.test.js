const test = require("node:test")
const assert = require("node:assert")
const fs = require("fs")
const path = require("path")
const os = require("os")
const crypto = require("crypto")

process.env.RICHPASS_TEST_DIR = path.join(os.tmpdir(), "richpass-test")

const BASE_DIR = process.env.RICHPASS_TEST_DIR
const VAULT_PATH = path.join(BASE_DIR, "vault.json")
const ACC_PATH = path.join(BASE_DIR, "acc.json")

function setup() {
  if (fs.existsSync(BASE_DIR)) {
    fs.rmSync(BASE_DIR, { recursive: true, force: true })
  }
  fs.mkdirSync(BASE_DIR, { recursive: true })
}

function cleanup() {
  fs.rmSync(BASE_DIR, { recursive: true, force: true })
}

function encrypt(text, keyHex) {
  const key = Buffer.from(keyHex, "hex")
  const iv = crypto.randomBytes(12)

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
  const tag = cipher.getAuthTag()

  return Buffer.concat([iv, tag, encrypted]).toString("base64url")
}

function decrypt(enc, keyHex) {
  const key = Buffer.from(keyHex, "hex")
  const buf = Buffer.from(enc, "base64url")

  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const encrypted = buf.subarray(28)

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
  decipher.setAuthTag(tag)

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]).toString()
}

test("vault and account files are created", () => {
  setup()

  fs.writeFileSync(
    VAULT_PATH,
    JSON.stringify({ salt: "s", hash: "h" }, null, 2)
  )

  fs.writeFileSync(
    ACC_PATH,
    JSON.stringify({ accounts: {} }, null, 2)
  )

  assert.ok(fs.existsSync(VAULT_PATH))
  assert.ok(fs.existsSync(ACC_PATH))

  cleanup()
})

test("encryption and decryption works", () => {
  setup()

  const salt = crypto.randomBytes(16).toString("hex")
  const key = crypto.pbkdf2Sync("testpass", salt, 100000, 32, "sha256").toString("hex")

  const enc = encrypt("hello", key)
  const dec = decrypt(enc, key)

  assert.strictEqual(dec, "hello")

  cleanup()
})

test("account write and read", () => {
  setup()

  fs.writeFileSync(
    ACC_PATH,
    JSON.stringify({ accounts: {} }, null, 2)
  )

  const acc = JSON.parse(fs.readFileSync(ACC_PATH))
  acc.accounts.github = { user: "me", pass: "secret" }

  fs.writeFileSync(ACC_PATH, JSON.stringify(acc, null, 2))

  const readBack = JSON.parse(fs.readFileSync(ACC_PATH))
  assert.ok(readBack.accounts.github)

  cleanup()
})
