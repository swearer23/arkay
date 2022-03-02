import fsExtra from "fs-extra";
import degit from 'degit';
import chalk from "chalk";
import {execSync} from 'child_process';
const { readJsonSync } = fsExtra;
import { createProject } from "./akatoshClient.js";
import ora from 'ora';
import { upgradePackageVersion } from "./utils/index.js";

const TEMPLATE_MAPPING = {
  "vue2": "https://github.com/swearer23/arkay-vue2-component-template#v0.0.2"
}

const getPackagePath = componentName => {
  return `./components/${componentName}`
}

export const releaseComponent = (name, upgradeMode) => {
  console.log(chalk.green('==> '), chalk.green('release component'), chalk.green(name))
  return upgradePackageVersion(getPackagePath(name), upgradeMode);
}

export const newComponent = async name => {
  console.log(chalk.bold.green('==> '), chalk.green(`creating component ${name}`))
  try {
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
    console.log(chalk.green('==> '), chalk.green(`setting git remote ${gitrepo}`))
    execSync(`cd ./components/${name} && git init && git remote add origin ${gitrepo}`, {stdio:[0,1,2]})
    return `./components/${name}`
  } catch (err) {
    console.log(chalk.red(err))
  }
  
  
}