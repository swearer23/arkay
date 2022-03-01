import fsExtra from "fs-extra"
import { DUPLICATED_COMPONENT_NAME, ADD_MATERIAL_ERROR } from "./errors.js"
import { COMPONENT_DIR_PATH } from "./consts.js"
import chalk from "chalk"
import { newComponent, releaseComponent } from "./component.js"
import {execSync} from 'child_process'

const {pathExistsSync} = fsExtra

const validateParams = name => {
  if (pathExistsSync(`./components/${name}`)) {
    throw new DUPLICATED_COMPONENT_NAME(name)
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

export const add = name => {
  try {
    validateParams(name)
    newComponent(name)
  } catch (err) {
    if (err instanceof ADD_MATERIAL_ERROR)
      return console.log(chalk.red(err))
    else
      throw err
  }
}