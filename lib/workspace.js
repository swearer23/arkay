import fs from 'fs'
import chalk from 'chalk'
import fsExtra from  'fs-extra'
import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
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

const postSBInit = () => {
  execSync('npm install vue lerna', {stdio:[0,1,2]})
  execSync('npx lerna init && git init', {stdio:[0,1,2]})
  execSync('touch .gitignore && echo "node_modules" >> .gitignore', {stdio:[0,1,2]})
  execSync('touch .gitignore && echo "packages/*" >> .gitignore', {stdio:[0,1,2]})
  writeJsonSync('./lerna.json', Object.assign(readJsonSync('./lerna.json'), {
    packages: ['components/*'],
  }), {spaces: 2})
}

export const onMaterialAdded = () => {
  console.log(chalk.green('==> bootstraping sub packages'))
  execSync('npx lerna bootstrap', {stdio:[0,1,2]})
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
  postSBInit()
  console.log(chalk.green('==> '), chalk.green('new workspace created'))
}

