import fsExtra from "fs-extra"
import { DUPLICATED_COMPONENT_NAME, ADD_MATERIAL_ERROR } from "./errors.js"
import { COMPONENT_DIR_PATH } from "./consts.js"
import chalk from "chalk"
import { newComponent, releaseComponent } from "./component.js"
import {execSync} from 'child_process'
import inquirer from "inquirer"
import { generateTag,upgradePackageVersion} from './utils/index.js'
const {pathExistsSync, readFileSync, writeFileSync} = fsExtra

const validateParams = name => {
  if (pathExistsSync(`./components/${name}`)) {
    throw new DUPLICATED_COMPONENT_NAME(name)
  }
}

const checkIsComponentExists = name => {
  console.log(`${COMPONENT_DIR_PATH}/${name}`)
  if (pathExistsSync(`${COMPONENT_DIR_PATH}/${name}`)) {
    return true
  }else{
    return false
  }
}
const checkIfRepoUncommited = dirpath => {
  try {
    execSync(`cd ${dirpath} && git status --porcelain`, {stdio:[0,1,2]})
    return true
  } catch (err) {
    console.error(err)
    return false
  }
}

const postTemplateInit = (localPath, name) => {
  const storyFilePath = `${localPath}/Component.stories.js`
  console.log(readFileSync(storyFilePath).toString())
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
  if (checkIsComponentExists(name)){
    console.log("组件存在")
    console.log(`${COMPONENT_DIR_PATH}/${name}`)
    //TODO  是否还有未commit的变更
    if (checkIfRepoUncommited(`${COMPONENT_DIR_PATH}/${name}`)) {
      console.log(chalk.red('no changes added to commit (use "git add" and/or "git commit -a")'))
      return
    }
    inquirer.prompt([{
      type: 'list',
      name: 'upgrade_type',
      message: 'please select your upgrade mode of this release:',
      choices: ['patch', 'minor', 'major']
    }])
    .then(answers => {
      upgradePackageVersion(`${COMPONENT_DIR_PATH}/${name}`,answers.upgrade_type)
    })
  }else{
    console.log(chalk.red('==> component to be published seems not present in this workspace”'))
  }

  
 
}