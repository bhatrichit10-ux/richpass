const {ask} = require('./ask')
const crypto = require("crypto")
const fs = require("fs");
const chalk = require('chalk')


async function firstLogin() {
  console.log("First time setup");

  const p1 = await ask("Set master password", 'password');
  const p2 = await ask("Confirm master password", 'password');

  if (p1 !== p2) {
    console.log("Passwords do not match");
    process.exit(1);
  }
  const salt = crypto.randomBytes(16).toString("hex")
  crypto.pbkdf2(p1, salt, 100000, 32, "sha256", (err, key) => {
    if (err) throw err;
    const data = {
      salt,
      hash: key.toString("hex"),
      vault: null
}
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync("vault.json", json);

  })
}
async function confirm(){
    const vault = require('../vault.json')
    salt = vault.salt;
    hash = vault.hash;
    let p1 = await ask('Enter the master password', 'password')
    crypto.pbkdf2(p1, salt, 100000, 32, "sha256", (err, key) => {
    if (err) throw err;
    if(key.toString('hex') === hash.toString('hex')) {
        "Access grant"
        console.log(chalk.green("✔ Access granted"))
    } else console.log(chalk.red("✖ Wrong password"))
    })
}
module.exports = { firstLogin, confirm }