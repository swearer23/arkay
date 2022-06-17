import { Gitlab } from '@gitbeaker/node'
import fsExtra from 'fs-extra'
import { homedir } from 'os'
import axios from 'axios'
import {
  ARKAY_USER_CONFIG_MISSING,
  ARKAY_USER_TOKEN_ERROR
} from '../errors.js'

const { readJsonSync, pathExistsSync} = fsExtra

const getGitlabClient = () => {
  const { gitlab_token, gitlab_host } = readJsonSync(`${homedir()}/.arkayrc`)
  const gitlabClient = new Gitlab({
    token: gitlab_token,
    host: gitlab_host 
  });
  return gitlabClient
}

const isArkayUserInitialized = () => {
  const userConfigPath = `${homedir()}/.arkayrc`
  return pathExistsSync(userConfigPath)
}

const getNamespaceIdByName = async namespaceName => {
  const groupInfo = await getGitlabClient().Groups.search(namespaceName)
  return groupInfo.length ? groupInfo[0].id : undefined
}

const parseNpmRegistryPrefix = packageInfo => {
  if (packageInfo.length) {
    const preprefix = packageInfo[0]._links.delete_api_path.split('/')
    preprefix.pop()
    return `${preprefix.join('/')}/npm/`
  } else {
    return undefined
  }
}

export const getMetadataForPackage = async componentName => {
  if (!isArkayUserInitialized()) {
    throw new ARKAY_USER_CONFIG_MISSING()
  }
  const { gitlab_token } = readJsonSync(`${homedir()}/.arkayrc`)
  const [namespace, _] = componentName.split('/')
  const namespaceId = await getNamespaceIdByName(namespace.replace('@', ''))
  const gitlabClient = getGitlabClient()
  const list = await gitlabClient.Packages.all({
    groupId: namespaceId,
    page: 1,
    perPage: 1
  })
  const prefix = parseNpmRegistryPrefix(list)
  const ret = await axios.get(`${prefix}${componentName}`, {
    headers: {Authorization: `Bearer ${gitlab_token}`}
  })
  return ret.data.versions[ret.data['dist-tags'].latest]
}

export const validateUserConfig = async (git_username, gitlab_host, gitlab_token) => {
  const gitlabClient = new Gitlab({
    token: gitlab_token,
    host: gitlab_host
  })
  try {
    const { username } = await gitlabClient.Users.current()
    return username === git_username
  } catch (err) {
    if (err.response.statusCode === 401) {
      throw new ARKAY_USER_TOKEN_ERROR()
    }
  }
}