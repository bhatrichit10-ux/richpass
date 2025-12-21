const inquirer = require('inquirer')
async function ask(q, utype) {
  const ans = await inquirer.default.prompt([
    {
      type: utype,
      name: "value",
      message: q,
      mask: "*"
    }
  ]);

  return ans.value
}

module.exports = { ask }
 