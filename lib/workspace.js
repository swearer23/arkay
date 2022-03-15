import fs from 'fs'
import chalk from 'chalk'
import fsExtra from  'fs-extra'
import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
import {log} from './utils/index.js'
const { emptyDirSync, removeSync, writeJsonSync } = fsExtra

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
      log.combine('WRAN[WARNING: ]', 'WRAN[current folder is ]', 'ERROR[NOT EMPTY]')
      // console.log(chalk.bold.yellow('WARNING: '), chalk.yellow('current folder is '), chalk.red.bold('NOT EMPTY'))
      log.combine('INFO[==> use ]', 'INFO[--force]', 'INFO[ flag to forcefully override existing content]')
      // console.log(chalk.green('==> use '), chalk.green.italic.underline('--force'), chalk.green(' flag to forcefully override existing content'))
      return
    }
  }
  initStorybook(extraOptions)
  log.combine('INFO[==> ]'), 'INFO[new workspace created]')
  // console.log(chalk.green('==> '), chalk.green('new workspace created'))
}
