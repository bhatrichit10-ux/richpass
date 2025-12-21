const { ask } = require("./src/ask.js")
const { firstLogin, confirm } = require("./src/auth.js")
// ask('LOL', 'password') 
const fs = require("fs");

if (fs.existsSync("vault.json")) {
  console.log("File exists")
  confirm()
} else {
  console.log("File does not exist")
  firstLogin()
}
