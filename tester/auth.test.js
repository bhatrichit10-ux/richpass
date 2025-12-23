const test = require('node:test')
const assert = require('assert')
const crypto = require('crypto')

test("Auth: Wrong pass, hash altering", () => {
  const salt = crypto.randomBytes(16).toString("hex")
  const correct = crypto.pbkdf2Sync(
    "correct-password",
    salt,
    100000,
    32,
    "sha256"
  ).toString("hex")

  const wrong = crypto.pbkdf2Sync(
    "wrong-password",
    salt,
    100000,
    32,
    "sha256"
  ).toString("hex")

  assert.notStrictEqual(wrong, correct)
})
