import inquirer from 'inquirer'
import chalk from 'chalk'

// init 指令
export const initProject = async () => {
  const { git_username, akatosh_server } = await inquirer.prompt([
    {
      type: 'input',
      name: 'git_username',
      message: "setting your git username: \n git username: "
    },
    {
      type: 'input',
      name: 'akatosh_server',
      message: "setting your akatosh server host (eg. http://akatosh.longfor.com): \n server url: "
    }
  ])
  return {
    username: git_username,
    akatoshServer: akatosh_server || 'http://akatosh.longfor.com'
  }
}

// 选择类型
export const releaseUpgradeType = async () => {
  return await inquirer.prompt([{
    type: 'list',
    name: 'upgrade_type',
    message: 'select your upgrade mode:',
    choices: ['patch', 'minor', 'major']
  }])
}

// 是否新建 MR
export const confirmNewMr = async () => {
  const { user_input: userInput } = await inquirer.prompt([
    {
      type: 'input',
      name: 'user_input',
      message: "==> it seems your are not the maintainer of this project \n would you like to make a merge request [y/n] "
    }
  ])
  
  if (userInput === 'y') {
    return Promise.resolve()
  } else if (userInput === 'n') {
    console.log(chalk.green("==> thanks for contribution"))
    return Promise.reject()
  } else {
    console.log(chalk.red("==> plese input [y/n]"))
    return Promise.reject()
  }
}

// 新建分支
export const newBranchName = async () => {
  const { branch_name: branchName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'branch_name',
      message: "==>  please input your branch name:"
    }
  ])
  if (branchName) {
    return branchName
  } else {
    console.log(chalk.red("==> branch name is required"))
    throw new Error('branch name is required')
  } 
}
