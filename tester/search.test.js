// For the contributers
// This isnt implemented yet
// Just logic testing for future implementation

const test = require("node:test")
const assert = require("node:assert")

function searchAccounts(accounts, query) {
  return Object.keys(accounts).filter(name =>
    name.toLowerCase().includes(query.toLowerCase())
  )
}

test("Search: Matching names returned", () => {
  const accounts = {
    github: {},
    google: {},
    discord: {},
    bank: {}
  }

  const result = searchAccounts(accounts, "go")
  assert.deepStrictEqual(result, ["google"])
})

test("Search: Case insensitive", () => {
  const accounts = { Gmail: {}, GitHub: {} }
  const result = searchAccounts(accounts, "git")
  assert.deepStrictEqual(result, ["GitHub"])
})
