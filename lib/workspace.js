import fs from 'fs'
import chalk from 'chalk'
import fsExtra from  'fs-extra'
import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
import ora from 'ora';
const { emptyDirSync, removeSync, writeJsonSync, pathExistsSync, readJsonSync } = fsExtra

const storyMainTempalte = `module.exports = {
  "stories": [
    "../components/**/*.stories.mdx",
    "../components/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  "framework": "@storybook/vue"
}`

const ARKAY_META_TEMPLATE = {
  framework: 'vue2',
  namespace: 'longfor-vue2-sfc'
}

const checkIfFolderEmpty = () => {
  const res = fs.readdirSync(process.cwd())
  return !res.length
}

const forcefullyCleanContent = () => {
  console.log('==> forcefully cleaning content')
  emptyDirSync(process.cwd())
}


const initStorybook = extraOptions => {
  execSync('npm init -y', { stdio: 'inherit' })
  execSync('npx sb init --type vue', {stdio:[0,1,2]})
  removeSync('./stories')
  execSync('mkdir components', {stdio:[0,1,2]})
  writeFileSync('./.storybook/main.js', storyMainTempalte, 'utf8')
  writeJsonSync('./.arkay.config.json', Object.assign({}, extraOptions, ARKAY_META_TEMPLATE), {spaces: 2})
}

export const create = (isForcefully, extraOptions) => {
  if (!checkIfFolderEmpty()) {
    if (isForcefully) {
      forcefullyCleanContent()
    } else {
      console.log(chalk.bold.yellow('WARNING: '), chalk.yellow('current folder is '), chalk.red.bold('NOT EMPTY'))
      console.log(chalk.green('==> use '), chalk.green.italic.underline('--force'), chalk.green(' flag to forcefully override existing content'))
      return
    }
  }
  initStorybook(extraOptions)
  console.log(chalk.green('==> '), chalk.green('new workspace created'))
}

export const clone = (name) => {
  if(!pathExistsSync('./components')){
    execSync('mkdir components')
  }
  const fileUrls = name.split('/');
  const fileName = fileUrls[fileUrls.length-1];
  if (pathExistsSync(`./components/${fileName}`)) {
    console.log(chalk.red.bold('==> folder with same name already exists, try another project name'))
    return 
  }else {
    const spinner = ora({
      text:`downloading project for ${name} `,
      color:'yellow'
    }).start();
    try{
      const { githost, namespace } = readJsonSync('./.arkay.config.json')
      execSync(`git clone ${githost}/${namespace}/${name}.git`,{cwd:'./components'},{stdio:[0,1,2]})
    }catch(err){
      spinner.fail(err.message);
      return 
    }
    spinner.succeed()
  }
}