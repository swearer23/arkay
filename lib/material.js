import fsExtra from "fs-extra"
import {
  DUPLICATED_COMPONENT_NAME,
  ADD_MATERIAL_ERROR,
  RELEASE_MATERIAL_NOT_EXISTS,
  UNCOMMITED_CONTENT_FOR_RELEASE_MATERIAL
} from "./errors.js"
import { COMPONENT_DIR_PATH } from "./consts.js"
import chalk from "chalk"
import { newComponent, releaseComponent } from "./component.js"
import {execSync} from 'child_process'
import * as akatoshClient from './akatoshClient.js'
import * as prompt from '../lib/utils/prompt.js'
import ora from 'ora';
const {pathExistsSync, readJsonSync } = fsExtra

const validateParams = name => {
  if (pathExistsSync(`./components/${name}`)) {
    throw new DUPLICATED_COMPONENT_NAME(name)
  }
}
const checkIfRepoUncommited = dirpath => {
  const uncommitedFiles = execSync(`cd ${dirpath} && git status --porcelain`).toString().split('\n').filter(ele => ele.length)
  return !!uncommitedFiles.length
}

const pushLocalRepo = (name, upgradeMode) => {
  const componentPath = `${COMPONENT_DIR_PATH}/${name}`
  if (!pathExistsSync(componentPath)) {
    console.error(chalk.red('==> component to be published seems not present in this workspace”'))
    throw new RELEASE_MATERIAL_NOT_EXISTS(name)
  }
  if (checkIfRepoUncommited(componentPath)) {
    console.log(chalk.red('==> '), chalk.red(`git repo has uncommited changes, please commit or stash before release`))
    throw new UNCOMMITED_CONTENT_FOR_RELEASE_MATERIAL(name)
  }
  return releaseComponent(name, upgradeMode)
}

const publish = async (name, newVersionString) => {
  console.log(chalk.green('==> '), chalk.green(`calling akatosh server for publish new version of ${name}`))
  const { namespace } = readJsonSync('./.arkay.config.json')
  await akatoshClient.publishComponent(`${namespace}/${name}`, newVersionString)
  console.log(chalk.green('==> '), chalk.green(`published new version of ${name}`))
}

const preLocalBuild = async name => {
  console.log(chalk.green('==> trying build locally'))
  execSync(`cd ${COMPONENT_DIR_PATH}/${name} && npx pnpm i && npx pnpm run build`, {stdio: 'inherit'})
  execSync(`cd ${COMPONENT_DIR_PATH}/${name} && rm *.tgz`, {stdio: 'inherit'})
}

export const release = async (name, upgradeMode) => {
  await preLocalBuild(name)
  const newVersionString = pushLocalRepo(name, upgradeMode)
  if (newVersionString) {
    console.log(chalk.green('==> '), chalk.green(`upgraded ${name} to ${newVersionString}`))
    await publish(name, newVersionString)
  } else {
    // TODO: shouldn't reach here
    throw new Error('new version string is empty')
  }
}

export const add = async name => {
  try {
    validateParams(name)
    const localPath = await newComponent(name)
    console.log(chalk.greenBright('==> you are ready to set, now get into the component folder and play'))
    return true
  } catch (err) {
    if (err instanceof ADD_MATERIAL_ERROR) {
      console.log(chalk.red(err))
      return false
    } else
      throw err
  }
}

export const clone = name => {
  if(!pathExistsSync('./components')){
    execSync('mkdir components')
  }
  if (pathExistsSync(`./components/${name}`)) {
    console.log(chalk.red.bold('==> folder with same name already exists, try another project name'))
    return false
  }else {
    const spinner = ora({
      text:`downloading project for ${name} `,
      color:'yellow'
    }).start();
    try{
      const { githost, namespace } = readJsonSync('./.arkay.config.json')
      execSync(`git clone ${githost}/${namespace}/${name}.git`,{cwd:'./components'},{stdio:[0,1,2]})
      return true
    }catch(err){
      spinner.fail(err.message);
      return false
    }finally {
      spinner.succeed()
    }
  }
}

export const newMergeRequest = async name => {
  try {
    await prompt.confirmNewMr()
    try {
      const branchName = await prompt.newBranchName()
      execSync(`cd ${COMPONENT_DIR_PATH}/${name} && git checkout -b ${branchName}-${Date.now()}`, { stdio: [0, 1, 2] })
      execSync(`cd ${COMPONENT_DIR_PATH}/${name} && git push origin ${branchName}-${Date.now()}`, { stdio: [0, 1, 2] })
      // TODO 请求akatosh server提交一个新的merge request
      console.log(chalk.green("==> thanks for contribution"))
    } catch(err) {}
  } catch(err) {}
}
