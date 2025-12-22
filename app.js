#!/usr/bin/env node
const { ask } = require("./src/ask.js")
const { firstLogin, confirm } = require("./src/auth.js")
const vault = require('./vault.json')
const { add } = require('./src/acc.js')
const fs = require("fs");
let vexist = fs.existsSync("vault.json")
async function menu() {
  let c = await confirm()
  if(c) {
    let option = await ask('What do you want to do?', 'list', ['Add Account', 'List Accounts', 'Remove Accounts'])
    
    if(option === 'Add Account') {}
    add()
  }
}
if (vexist) {
  menu()
} else {
  firstLogin()
}