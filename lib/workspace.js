import fs from 'fs'
import chalk from 'chalk'
import fsExtra from  'fs-extra'
import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
const { emptyDirSync, removeSync, writeJsonSync,outputFile } = fsExtra

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

const checkIfFileExist = (name,folderURL) => {
  if(!folderURL){
    folderURL = process.cwd()
  }
  const res = fs.readdirSync(folderURL)
  return res.includes(name)
}

const initStorybook = extraOptions => {
  execSync('npm init -y', { stdio: 'inherit' })
  execSync('npx sb init --type vue', {stdio:[0,1,2]})
  removeSync('./stories')
  execSync('mkdir components', {stdio:[0,1,2]})
  writeFileSync('./.storybook/main.js', storyMainTempalte, 'utf8')
  writeJsonSync('./arkay.config.json', Object.assign({}, extraOptions, ARKAY_META_TEMPLATE), {spaces: 2})
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
  if(!checkIfFileExist('components','')){
    execSync('mkdir components')
  }
  const fileName = name.split('/');
  if (checkIfFileExist(fileName[fileName.length-1],'./components')) {
    console.log(chalk.red.bold('==> folder with same name already exists, try another project name'))
    return 
  }else {
    try{
      execSync(`git clone https://git.longhu.net/${name}`,{cwd:'./components'})
    }catch(err){
      console.log(err.message)
      if(err.message.includes('you were looking for could not be found')){
        console.log(chalk.red.bold('==> it seems expected project does not exists on git, or you do not have access or permission'))
      }else if(err.message.includes('already exists')){
        console.log(chalk.red.bold('==> folder with same name already exists, try another project name'))
      }
      return 
    }
  }
  console.log(chalk.green('==> '), chalk.green(`${name} done`))
}