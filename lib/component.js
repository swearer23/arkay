import fsExtra from "fs-extra";
import degit from 'degit';
import chalk from "chalk";
import {execSync} from 'child_process';
const { writeJsonSync, readJsonSync, readFileSync, writeFileSync } = fsExtra;
import { createProject } from "./akatoshClient.js";
import ora from 'ora';
import { upgradePackageVersion } from "./utils/gitOps.js";
import { COMPONENT_DIR_PATH } from "./consts.js"

const TEMPLATE_MAPPING = {
  "vue2": "https://github.com/swearer23/arkay-vue2-component-template#v0.0.5"
}

const getPackagePath = componentName => {
  return `./components/${componentName}`
}

export const releaseComponent = (name, upgradeMode) => {
  console.log(chalk.green('==> '), chalk.green('release component'), chalk.green(name))
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
  console.log(chalk.bold.green('==> '), chalk.green(`creating component ${name}`))
  const gitrepo = await createProject(name)
  const { framework } = readJsonSync("./.arkay.config.json");
  const spinner = ora('Loading unicorns').start();
  spinner.color = 'yellow';
  spinner.text = `downloading template for ${name}`;
  const emitter = degit(TEMPLATE_MAPPING[framework], {
    cache: true,
    force: true,
    verbose: true,
    mode: 'git'
  });
  emitter.on('info', info => {
    console.log(info.message);
  });
  
  await emitter.clone(`./components/${name}`)
  spinner.stop()
  postTemplateInit(`${COMPONENT_DIR_PATH}/${name}`, name)
  console.log(chalk.green('==> '), chalk.green(`setting git remote ${gitrepo}`))
  execSync(`cd ./components/${name} && git init && git remote add origin ${gitrepo}`, {stdio:[0,1,2]})
  return `./components/${name}`
}