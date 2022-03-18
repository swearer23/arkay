import fsExtra from "fs-extra";
import path from "path";
import { WORKSPACE_NOT_FOUND } from "../lib/errors.js";

const { pathExistsSync } = fsExtra

/**
 * 在arkay add/publish/fetch 执行之前调用这个函数，切换到根目录下
 */
export const switchToRootPath = () => {
  upLoop()
}

const isRootPath = () => {
  let rootPath = path.parse(process.cwd()).root
  return process.cwd() === rootPath
}

const goUpperFolder = () => {
  process.chdir(path.join(process.cwd(), '..'))
}

const upLoop = () => {
  let curPath = process.cwd()
  const arkayConfigPath = `${curPath}/.arkay.config.json`
  if (!pathExistsSync(arkayConfigPath)) {
    if (isRootPath()) {
      throw new WORKSPACE_NOT_FOUND()
    }
    goUpperFolder()
    upLoop()
  }
}