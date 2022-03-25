import inquirer from 'inquirer'
import logger from './logger.js'
import { DEFAULT_GITLAB_HOST, DEFAULT_AKATOSH_HOST } from '../consts.js'

// init 指令
export const initWorkspace = async () => {
  const { git_username, akatosh_server, gitlab_token } = await inquirer.prompt([
    {
      type: 'input',
      name: 'git_username',
      message: "setting your git username: \n git username: "
    },
    {
      type: 'input',
      name: 'akatosh_server',
      message: `setting your akatosh server host (eg. ${DEFAULT_AKATOSH_HOST}): \n server url: `
    },
    {
      type: 'input',
      name: 'gitlab_token',
      message: "setting your gitlab access token (get a new one from your edit profile page on gitlab): \n gitlab token: "
    }
  ])
  return {
    username: git_username,
    akatoshServer: akatosh_server || DEFAULT_AKATOSH_HOST,
    gitlabToken: gitlab_token
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
    return Promise.resolve(true)
  } else {
    logger.info('thanks for contribution')
    return Promise.resolve(false)
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
    throw new Error('branch name is required')
  }
}

export const newMergeRequestTitle = async () => {
  const { mergeRequestTitle } = await inquirer.prompt([
    {
      type: 'input',
      name: 'mergeRequestTitle',
      message: 'set title for your merge request'
    }
  ])
  if (mergeRequestTitle) {
    return mergeRequestTitle
  } else {
    throw new Error('merge request title is required')
  }
}

export const initUserConfigPrompt = async () => {
  const { git_username, githost, gitlab_token } = await inquirer.prompt([
    {
      type: 'input',
      name: 'git_username',
      message: "setting your git username: \n git username: "
    },
    {
      type: 'input',
      name: 'githost',
      message: `setting your gitlab host (eg. ${DEFAULT_GITLAB_HOST}): \n gitlab host: `
    },
    {
      type: 'input',
      name: 'gitlab_token',
      message: "setting your gitlab access token (get a new one from your edit profile page on gitlab): \n gitlab token: "
    }
  ])
  const gitlab_host = githost ? githost : DEFAULT_GITLAB_HOST
  return { git_username, gitlab_host, gitlab_token }
}
