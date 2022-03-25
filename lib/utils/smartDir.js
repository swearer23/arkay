import fsExtra from "fs-extra";
import path from 'path'
const { pathExistsSync } = fsExtra

const isRootPath = () => {
  let rootPath = path.parse(process.cwd()).root
  return process.cwd() === rootPath
}

export const getProjectRootByFilename = filename => {
  const currentdir = process.cwd()
  while (!isRootPath()) {
    let curPath = process.cwd()
    const arkayConfigPath = `${curPath}/${filename}`
    if (!pathExistsSync(arkayConfigPath)) {
      process.chdir(path.join(process.cwd(), '..'))
    } else {
      process.chdir(currentdir)
      return process.cwd()
    }
  }
  process.chdir(currentdir)
  return false
}