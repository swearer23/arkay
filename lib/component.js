import fsExtra from "fs-extra";
import degit from 'degit';
import chalk from "chalk";
import inquirer from 'inquirer';
import {execSync} from 'child_process';
const { readJsonSync } = fsExtra;

const TEMPLATE_MAPPING = {
  "vue2": "https://github.com/swearer23/arkay-vue2-component-template#v0.0.1"
}

export const newComponent = (name) => {
  console.log(chalk.bold.green('==> '), chalk.green(`creating component ${name}`))
  const { framework } = readJsonSync("./.arkay.config.json");

  const emitter = degit(TEMPLATE_MAPPING[framework], {
    cache: true,
    force: true,
    verbose: true,
    mode: 'git'
  });
  emitter.on('info', info => {
    console.log(info.message);
  });
  
  emitter.clone(`./components/${name}`).then(() => {
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'remote',
          message: "setting your git remote url: \n you can paste url here, or type skip for setting later on: [url / skip] \n git remote: "
        }
      ])
      .then(answers => {
        if (answers.remote !== 'skip') {
          execSync(`cd ./components/${name} && git init && git remote add origin ${answers.remote}`, { stdio: 'inherit' })
        }
        console.log(chalk.green.bold('==> done'));
      })
  });
  
}