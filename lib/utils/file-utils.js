import os from 'os'
import path from 'path'
import http from 'http'
import fs from 'fs'
import tar from 'tar'
import fsExtra from 'fs-extra'
import { execSync } from 'child_process'

const { ensureDirSync, readJsonSync } = fsExtra

export const downloadTarball = async url => {
  const dest = path.join(os.tmpdir(), path.parse(url).base)
  var file = fs.createWriteStream(dest);
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      res.pipe(file);
      file.on('finish', function() {
        file.close(() => {
          resolve(dest)
        })
      });
    }).on('error', function(err) { // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      reject(err.message)
    })
  })
}

export const untarTarball = async filepath => {
  const destTarName = path.parse(filepath).name
  const destDirName = `${path.parse(filepath).dir}/${destTarName}`
  ensureDirSync(destDirName)
  tar.x({ cwd: destDirName, file: filepath, sync: true, strip: 1 })
  return destDirName
}

export const installDeps = (packageDirPath, projectDir) => {
  const { dependencies } = readJsonSync(`${packageDirPath}/package.json`)
  const depsList = Object.entries(dependencies).map(([name, version]) => `${name}@${version}`)
  const command = [
    `cd ${projectDir}`,
    `npm install ${depsList.join(' ')}`,
  ]
  execSync(command.join(' && '), {stdio:[0,1,2]})
}

export const moveSource = (packageDirPath, projectDir) => {
  const sourceDir = path.join(packageDirPath, 'src')
  const destDir = path.join(projectDir, `arkay_components/${path.parse(packageDirPath).base}`)
  ensureDirSync(destDir)
  fsExtra.moveSync(sourceDir, destDir, {overwrite: true})
}