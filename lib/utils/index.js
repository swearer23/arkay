import fsExtra from 'fs-extra'
const { readJsonSync } = fsExtra;

const versionStringNotValid = new Error('version string not valid')

const upgradeVersionString = (versionString, upgradeType) => {
  switch(upgradeType) {
    case 'major':
      return `${parseInt(versionString.split('.')[0]) + 1}.0.0`
    case 'minor':
      return `${versionString.split('.')[0]}.${parseInt(versionString.split('.')[1]) + 1}.0`
    case 'patch':
      return `${versionString.split('.')[0]}.${versionString.split('.')[1]}.${parseInt(versionString.split('.')[2]) + 1}`
  }
}

const getCurrentVersion = componentName => {
  const component = readJsonSync(`./components/${componentName}/package.json`);
  return component.version;
}

const isVersionStringValid = versionString => {
  return (/^(\d+\.)?(\d+\.)?(\*|\d+)$/).test(versionString)
}

export const generateTag = (componentName, upgradeType) => {
  const currentVersionString = getCurrentVersion(componentName);
  if (!isVersionStringValid(currentVersionString)) throw versionStringNotValid
  return upgradeVersionString(currentVersionString, upgradeType)
}