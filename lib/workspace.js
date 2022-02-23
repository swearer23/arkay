import fs from 'fs'
import chalk from 'chalk'
import fsExtra from  'fs-extra'
import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
const { emptyDirSync, removeSync } = fsExtra

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

const checkIfFolderEmpty = () => {
  const res = fs.readdirSync(process.cwd())
  return !res.length
}

const forcefullyCleanContent = () => {
  console.log('==> forcefully cleaning content')
  emptyDirSync(process.cwd())
}

const initStorybook = () => {
  execSync('npm init', { stdio: 'inherit' })
  execSync('npx sb init --type vue', {stdio:[0,1,2]})
  removeSync('./stories')
  execSync('mkdir components', {stdio:[0,1,2]})
  writeFileSync('./.storybook/main.js', storyMainTempalte, 'utf8')
}

export const create = isForcefully => {
  if (!checkIfFolderEmpty()) {
    if (isForcefully) {
      forcefullyCleanContent()
    } else {
      console.log(chalk.bold.yellow('WARNING: '), chalk.yellow('current folder is '), chalk.red.bold('NOT EMPTY'))
      console.log(chalk.green('==> use '), chalk.green.italic.underline('--force'), chalk.green(' flag to forcefully override existing content'))
      return
    }
  }
  initStorybook()
}
