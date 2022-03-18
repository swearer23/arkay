import fsExtra from "fs-extra";
import {execSync} from 'child_process';
const { writeJsonSync, readJsonSync, readFileSync, writeFileSync } = fsExtra;
import { createProject } from "./akatoshClient.js";
import ora from 'ora';
import logger from './utils/logger.js'
import { upgradePackageVersion, tinyDegit } from "./utils/gitOps.js";
import { COMPONENT_DIR_PATH } from "./consts.js"

const getPackagePath = componentName => {
  return `./components/${componentName}`
}

export const releaseComponent = (name, upgradeMode) => {
  logger.info(`release component ${name}`)
  return upgradePackageVersion(getPackagePath(name), upgradeMode);
}

const strToCamel = str => {
  return str.split('-').map((frag, index) => {
    if (index === 0) { return frag}
    return frag.charAt(0).toUpperCase() + frag.slice(1)
  }).join('')
}

const postTemplateInit = (localPath, name) => {
  const storyFilePath = `${localPath}/Component.stories.js`
  const indexFilePath = `${localPath}/index.js`
  const packageFilePath = `${localPath}/package.json`
  const packageJson = readJsonSync(packageFilePath)
  packageJson.name = packageJson.name.replace('{{:name}}', name)
  writeFileSync(storyFilePath,
    readFileSync(storyFilePath).toString().replace('{{:name}}', name)
  )
  writeFileSync(indexFilePath,
    readFileSync(indexFilePath).toString().replace('{{:name}}', strToCamel(name))
  )
  writeJsonSync(packageFilePath, packageJson, {spaces: 2})
}

export const newComponent = async name => {
  logger.info(`creating component ${name}`)
  const spinner = ora('Loading unicorns').start();
  spinner.color = 'yellow';
  spinner.text = `downloading template for ${name}`;
  tinyDegit(`./components/${name}`)
  spinner.stop()
  const gitrepo = await createProject(name)
  postTemplateInit(`${COMPONENT_DIR_PATH}/${name}`, name)
  logger.info(`setting git remote ${gitrepo}`)
  execSync(`cd ./components/${name} && git init && git remote add origin ${gitrepo}`, {stdio:[0,1,2]})
  return `./components/${name}`
}
