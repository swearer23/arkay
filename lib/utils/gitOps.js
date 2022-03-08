import fsExtra from 'fs-extra'
import {execSync} from 'child_process'
const { readJsonSync } = fsExtra;
import { COMMIT_ERROR, REPO_PUSH_PERMISSION_ERROR } from '../errors.js';

const versionStringNotValid = new Error('version string not valid')

const upgradeVersionString = (versionString, upgradeMode) => {
  switch(upgradeMode) {
    case 'major':
      return `${parseInt(versionString.split('.')[0]) + 1}.0.0`
    case 'minor':
      return `${versionString.split('.')[0]}.${parseInt(versionString.split('.')[1]) + 1}.0`
    case 'patch':
      return `${versionString.split('.')[0]}.${versionString.split('.')[1]}.${parseInt(versionString.split('.')[2]) + 1}`
  }
}

const getCurrentVersion = packagePath => {
  const component = readJsonSync(`${packagePath}/package.json`);
  return component.version;
}

const isVersionStringValid = versionString => {
  return (/^(\d+\.)?(\d+\.)?(\*|\d+)$/).test(versionString)
}

export const generateTag = (packagePath, upgradeMode) => {
  const currentVersionString = getCurrentVersion(packagePath);
  if (!isVersionStringValid(currentVersionString)) throw versionStringNotValid
  return upgradeVersionString(currentVersionString, upgradeMode)
}

const commitNewVersion = (packagePath, newVersionString) => {
  try{
    const pkgJson = readJsonSync(`${packagePath}/package.json`);
    pkgJson.version = newVersionString
    fsExtra.writeJsonSync(`${packagePath}/package.json`, pkgJson, { spaces: 2 });
    lockPackageJson(packagePath)
    execSync(`cd ${packagePath} && git add package.json`, {stdio:[0,1,2]})
    execSync(`cd ${packagePath} && git commit -m "chore: bump version to ${newVersionString}"`, {stdio:[0,1,2]})
    const commitHash = execSync(`cd ${packagePath} && git rev-parse HEAD`).toString()
    return {commitRes: true, commitHash}
  } catch (err) {
    console.error(err)
    return {commitRes: false}
  }
  // TODO: catch git push exception
}

const pushNewTag = (packagePath, newVersionString) => {
  try {
    execSync(`cd ${packagePath} && git tag "${newVersionString}"`, {stdio:[0,1,2]})
    execSync(`cd ${packagePath} && git push origin master && git push origin ${newVersionString} `, {stdio:[0,1,2]})
    return true
  } catch (err) {
    return false
  }
}

const lockPackageJson = packagePath => {
  execSync(`cd ${packagePath} && pnpm install --lockfile-only && git add .`, {stdio:[0,1,2]})
}

export const upgradePackageVersion = (packagePath, upgradeMode) => {
  if (['patch', 'minor', 'major'].indexOf(upgradeMode) === -1) throw new Error('upgrade mode not valid')
  const newVersionString = generateTag(packagePath, upgradeMode);
  const {commitRes, commitHash} = commitNewVersion(packagePath, newVersionString)
  if ( !commitRes ) {
    execSync(`cd ${packagePath} && git checkout .`, {stdio:[0,1,2]})
    throw new COMMIT_ERROR()
  }
  if (!pushNewTag(packagePath, newVersionString)) {
    execSync(`cd ${packagePath} && git revert ${commitHash}`, {stdio:[0,1,2]})
    execSync(`cd ${packagePath} && git tag -d ${newVersionString}`, {stdio:[0,1,2]})
    throw new REPO_PUSH_PERMISSION_ERROR()
  }
  return newVersionString
}