const inquirer = require('inquirer')

async function ask(q, utype, ch) {
  const ans = await inquirer.default.prompt([
    {
      type: utype,
      name: "value",
      message: `${q} > `,
      mask: "*",
      choices: ch
    }
  ])

  return ans.value
}

module.exports = { ask }
