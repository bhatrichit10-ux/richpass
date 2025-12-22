#!/usr/bin/env node
const { ask } = require("./src/ask.js")
const { firstLogin, confirm } = require("./src/auth.js")
const vault = require('./vault.json')
const data = require('./acc.json')
const { gen } = require('./src/gen')
const { add } = require('./src/acc.js')
const fs = require("fs");
let vexist = fs.existsSync("vault.json")
async function menu() {
  let c = await confirm()
  if(c) {
    let option = await ask('What do you want to do?', 'list', ['Add Account', 'List Accounts', 'Remove Accounts'])
    
    if(option === 'Add Account') {}
    let name =  await ask('Name of the service? [Google, Facebook, HackClub]')
    let user = await ask('Enter Username of the account')
    let ap = await ask('Use an auto-generated password?', 'confirm')
    if(ap) {
      'Yeah'
      let nonenc = gen(12)
      console.log('Your Password is >', nonenc)
      console.log('Copy n Paste \/ \/ ')
      console.log(chalk.blue(nonenc))
       const iv = crypto.randomBytes(12)
       const cipher = crypto.createCipheriv('aes-256-gcm', vault.hash, iv);
       let encrypted = cipher.update(nonenc, 'utf8')
       encrypted = Buffer.concat([encrypted, cipher.final()]);
       const authTag = cipher.getAuthTag();
       let encpass = Buffer.concat([iv, authTag, encrypted]).toString('base64url')
    } else {
      'Nah'
      let passwordbyuser = await ask('Enter the password [for the service]', password)
      const iv = crypto.randomBytes(12)
       const cipher = crypto.createCipheriv('aes-256-gcm', vault.hash, iv);
       let encrypted = cipher.update(passwordbyuser, 'utf8')
       encrypted = Buffer.concat([encrypted, cipher.final()]);
       const authTag = cipher.getAuthTag();
       let encpass = Buffer.concat([iv, authTag, encrypted]).toString('base64url')
    }
    data.accounts[name] = {
      user: user,
      pass: encpass
    }
  }
}
if (vexist) {
  menu()
} else {
  firstLogin()
}