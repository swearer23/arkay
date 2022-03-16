import fsExtra from "fs-extra";
import chalk from "chalk";
import path from "path";
import { WORKSPACE_NOT_FOUND } from "../lib/errors.js";

const { pathExistsSync } = fsExtra

/**
 * 在arkay add/publish/fetch 执行之前调用这个函数，切换到根目录下
 */
export const switchToRootPath = componentName => {
  let curPath = process.cwd()
  let rootPath = path.parse(curPath).root
  upLoop(curPath, rootPath, componentName)
}

const upLoop = (curPath, rootPath, componentName) => {
  const componentPath = `${curPath}/.arkay.config.json`
  if (!pathExistsSync(componentPath)) {
    if (curPath === rootPath) {
      console.log(chalk.red('==> '), chalk.red('Workspace not found, please execute arkay init first!'))
      throw new WORKSPACE_NOT_FOUND()
    }
    curPath = curPath.substring(0, curPath.lastIndexOf('/'))
    if (curPath == '') {
      curPath = rootPath
    }
    process.chdir(curPath)
    upLoop(curPath, rootPath, componentName)
  }
}