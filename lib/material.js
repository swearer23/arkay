import fsExtra from "fs-extra"
import { DUPLICATED_COMPONENT_NAME, ADD_MATERIAL_ERROR } from "./errors.js"
import { COMPONENT_DIR_PATH } from "./consts.js"
import chalk from "chalk"
import { newComponent, releaseComponent } from "./component.js"
import {execSync} from 'child_process'
import inquirer from "inquirer"
import { upgradePackageVersion} from './utils/index.js'
const {pathExistsSync, readFileSync, writeFileSync} = fsExtra

const validateParams = name => {
  if (pathExistsSync(`./components/${name}`)) {
    throw new DUPLICATED_COMPONENT_NAME(name)
  }
}
const checkIfRepoUncommited = dirpath => {
  try {
    // execSync(`cd ${dirpath} && git status --porcelain`, {stdio:[0,1,2]})
    const uncommitedFiles = execSync(`cd ${dirpath} && git status --porcelain`).toString().split('\n').filter(ele => ele.length)
    console.log(uncommitedFiles)
    return uncommitedFiles.length
  } catch (err) {
    console.error(err)
    return false
  }
}

const postTemplateInit = (localPath, name) => {
  const storyFilePath = `${localPath}/Component.stories.js`
  writeFileSync(storyFilePath,
    readFileSync(storyFilePath).toString().replace('{{:name}}', name)
  )
}

export const release = (name, upgradeMode) => {
  if (checkIfRepoUncommited(`${COMPONENT_DIR_PATH}/${name}`)) {
    try {
      return releaseComponent(name, upgradeMode)
    } catch (err) {
      console.error(err)
      return false
    }
  }
  console.log(chalk.red('==> '), chalk.red(`git repo has uncommited changes, please commit or stash before release`))
}

export const add = async name => {
  try {
    validateParams(name)
    const localPath = await newComponent(name)
    postTemplateInit('./components/button-2', name)
    console.log(chalk.greenBright('==> you are ready to set, now get into the component folder and play'))
  } catch (err) {
    if (err instanceof ADD_MATERIAL_ERROR)
      return console.log(chalk.red(err))
    else
      throw err
  }
}

export const publish = (name) => {
  const COMPONENT_PATH  = `${COMPONENT_DIR_PATH}/${name}`
  if (pathExistsSync(COMPONENT_PATH)){
    if (checkIfRepoUncommited(COMPONENT_PATH)) {
      console.log(chalk.red('Changes have not been added to commit (use "git add" and/or "git commit -a")'))
      return
    }
    inquirer.prompt([{
      type: 'list',
      name: 'upgrade_type',
      message: 'please select your upgrade mode of this release:',
      choices: ['patch', 'minor', 'major']
    }])
    .then(answers => {
      const tag = upgradePackageVersion(COMPONENT_PATH,answers.upgrade_type)
      if(!tag){
        inquirer.prompt([
          {
            type: 'input',
            name: 'user_input',
            message: "==> it seems your are not the maintainer of this project \n would you like to make a merge request [y/n] "
          }
        ])
        .then(async answers => {
          const userInput = answers.user_input
          if(userInput == 'n'){
            console.log(chalk.green("==> thanks for contribution"))
            return
          }else if(userInput == 'y'){
            inquirer.prompt([
              {
                type: 'input',
                name: 'branch_name',
                message: "==>  please input your branch name:"
              }
            ])
            .then(answers => {
              const branchName = answers.branch_name || ""
              execSync(`cd ${COMPONENT_PATH} && git checkout -b ${branchName}-${Date.now()}`, {stdio:[0,1,2]})
              execSync(`cd ${COMPONENT_PATH} && git push origin ${branchName}-${Date.now()}`, {stdio:[0,1,2]})
              // TODO 请求akatosh server提交一个新的merge request
              console.log(chalk.green("==> thanks for contribution"))
            })
          }
        })
      }
    })
  }else{
    console.log(chalk.red('==> component to be published seems not present in this workspace”'))
  }
}