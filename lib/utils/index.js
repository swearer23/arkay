import fsExtra from 'fs-extra'
import {execSync} from 'child_process'
const { readJsonSync } = fsExtra;

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
    execSync(`cd ${packagePath} && git add package.json`, {stdio:[0,1,2]})
    execSync(`cd ${packagePath} && git commit -m "chore: bump version to ${newVersionString}"`, {stdio:[0,1,2]})
    const commitHash = execSync(`cd ${packagePath} && git rev-parse HEAD`).toString()
    execSync(`cd ${packagePath} && git tag "${newVersionString}"`, {stdio:[0,1,2]})
    execSync(`cd ${packagePath} && git push origin ${newVersionString} && git push origin master`, {stdio:[0,1,2]})
    return {commitRes: true, commitHash}
  } catch (err) {
    console.error(err)
    return {commitRes: false}
  }
  // TODO: catch git push exception
}

const lockPackageJson = packagePath => {
  execSync(`cd ${packagePath} && pnpm install --lockfile-only && git add .`, {stdio:[0,1,2]})
}

export const upgradePackageVersion = (packagePath, upgradeMode) => {
  if (['patch', 'minor', 'major'].indexOf(upgradeMode) === -1) throw new Error('upgrade mode not valid')
  const component = readJsonSync(`${packagePath}/package.json`);
  const newVersionString = generateTag(packagePath, upgradeMode);
  component.version = newVersionString
  fsExtra.writeJsonSync(`${packagePath}/package.json`, component, { spaces: 2 });
  lockPackageJson(packagePath)
  const {commitRes, commitHash} = commitNewVersion(packagePath, newVersionString)
  if ( commitRes ) {
    return newVersionString
  } else {
    execSync(`cd ${packagePath} && git revert ${commitHash}`, {stdio:[0,1,2]})
    execSync(`cd ${packagePath} && git tag -d ${newVersionString}`, {stdio:[0,1,2]})
    return false
  }
}