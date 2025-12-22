const { ask } = require('./ask')
const vault = require('../vault.json')
const data = require('../acc.json')
const crypto = require('crypto')
function add(acc, user, pass) {
    let salter = vault.hash;
    crypto.pbkdf2(p1, salter, 100000, 32, "sha256", (err, key) => {
        let hashedpass = key.toString('hex')
    })
    
    data.accounts[acc] = {
        user:user,
        passw:hashedpass
    }
}
module.exports = {add}