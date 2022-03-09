import fsExtra from "fs-extra";
import chalk from "chalk";

const { pathExistsSync } = fsExtra

/**
 * 在arkay add/publish/fetch 执行之前调用这个函数，切换到根目录下
 */
export const switchToRootPath = componentName => {
  let curPath = process.cwd()
  return upLoop(curPath, componentName)
}

const upLoop = (curPath, componentName) => {
  if (curPath.indexOf(componentName) === -1) {
    console.log(chalk.red('==> '), chalk.red('Execute this command at the root of the workspace'))
    return false
  }
  const componentPath = `${curPath}/.arkay.config.json`
  if (!pathExistsSync(componentPath)) {
    let rootPath = curPath.substring(0, curPath.lastIndexOf(componentName) + componentName.length)
    if (curPath === rootPath) {
      console.log(chalk.red('==> '), chalk.red('Workspace not found, please execute arkay init first!'))
      return false
    }
    curPath = curPath.substring(0, curPath.lastIndexOf('/'))
    process.chdir(curPath)
    upLoop(curPath, componentName)
  }
  return true
}