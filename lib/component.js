import fsExtra from "fs-extra";
import {execSync} from 'child_process';
const { writeJsonSync, readJsonSync, readFileSync, writeFileSync } = fsExtra;
import { createProject } from "./akatoshClient.js";
import ora from 'ora';
import logger from './utils/logger.js'
import { upgradePackageVersion, tinyDegit } from "./utils/gitOps.js";
import { COMPONENT_DIR_PATH } from "./consts.js"
import { readdirSync, renameSync } from "fs";

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
  const camelName = strToCamel(name);
  const storyFilePath = `${localPath}/Component.stories.js`
  const indexFilePath = `${localPath}/index.js`
  const packageFilePath = `${localPath}/package.json`
  const componentFilePath = `${localPath}/src/Component.vue`
  const componentIndexFilePath = `${localPath}/src/index.js`
  const packageJson = readJsonSync(packageFilePath)
  packageJson.name = packageJson.name.replace('{{:name}}', name)

  writeFileSync(storyFilePath,
    readFileSync(storyFilePath).toString().replace('{{:name}}', name).replace(/Component.vue/g, camelName+'.vue'),
  )
  writeFileSync(indexFilePath,
    readFileSync(indexFilePath).toString().replace('{{:name}}', strToCamel(name))
  )
  writeFileSync(componentIndexFilePath,
    readFileSync(componentIndexFilePath).toString().replace(/Component/g, camelName)
  )
  writeFileSync(componentFilePath,
    readFileSync(componentFilePath).toString().replace('Component.css', camelName+'.css').replace('my-component',name)
  )
  writeJsonSync(packageFilePath, packageJson, {spaces: 2})

  let files = readdirSync(localPath+'/src');
    // files是名称数组
  files.forEach(function(filename) {
      //运用正则表达式替换oldPath中不想要的部分
      var oldPath = localPath+'/src/' + filename,
      newPath = localPath+'/src/' + filename.replace('Component',camelName) // g表示全局匹配
      renameSync(oldPath, newPath)
  })
  renameSync(storyFilePath,`${localPath}/${camelName}.stories.js`)
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
