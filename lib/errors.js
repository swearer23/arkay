import { VALID_MATERIAL_TYPE } from "./consts.js"

export class ADD_MATERIAL_ERROR extends Error {}

export class RELEASE_MATERIAL_ERROR extends Error {}

export class COMMON_MATERIAL_ERROR extends Error {}

export class WORKSPACE_ERROR extends Error {}

export class ARKAY_USER_CONFIG_ERROR extends Error {}

export class INVALID_MATERIAL_TYPE extends ADD_MATERIAL_ERROR {
  constructor() {
    super(`invalid material type, only [${VALID_MATERIAL_TYPE.join(' | ')}] are supported`)
    this.name = 'INVALID_MATERIAL_TYPE'
  }
}

export class DUPLICATED_COMPONENT_NAME extends ADD_MATERIAL_ERROR {
  constructor(name) {
    super(`component ${name} already exists, try another name`)
    this.name = 'DUPLICATED_COMPONENT_NAME'
  }
}

export class DUPLICATED_GIT_REPO_ERROR extends ADD_MATERIAL_ERROR {
  constructor(name) {
    super(`git repo name ${name} already exists, try another name`)
    this.name = 'DUPLICATED_GIT_REPO'
  }
}

export class INVALID_MATERIAL_NAME extends COMMON_MATERIAL_ERROR {
  constructor(name) {
    super(`component ${name} does not conform to component naming conventions`)
    this.name = 'INVALID_MATERIAL_NAME'
  }
}

export class RELEASE_MATERIAL_NOT_EXISTS extends RELEASE_MATERIAL_ERROR {
  constructor(name) {
    super(`component ${name} does not exist`)
    this.name = 'RELEASE_MATERIAL_NOT_EXISTS'
  }
}

export class UNCOMMITED_CONTENT_FOR_RELEASE_MATERIAL extends RELEASE_MATERIAL_ERROR {
  constructor (name) {
    super(`component ${name} has uncommited changes, please commit or stash before release`)
    this.name = 'UNCOMMIT_CONTENT_FOR_RELEASE_MATERIAL'
  }
}

export class AKATOSH_SERVER_ERROR extends RELEASE_MATERIAL_ERROR {
  constructor (message) {
    super(`calling akatosh publish api encountered some errors: ${message}`)
    this.name = 'AKATOSH_SERVER_ERROR'
  }
}

export class REPO_PUSH_PERMISSION_ERROR extends RELEASE_MATERIAL_ERROR {
  constructor () {
    super(`failed to pushing repo to remote, see details above`)
    this.name = 'REPO_PUSH_PERMISSION_ERROR'
  }
}

export class COMMIT_ERROR extends RELEASE_MATERIAL_ERROR {
  constructor () {
    super(`failed to commit repo, see details above`)
    this.name = 'COMMIT_ERROR'
  }
}

export class WORKSPACE_NOT_FOUND extends WORKSPACE_ERROR {
  constructor () {
    super(`Workspace not found, please execute arkay init first!`)
    this.name = 'WORKSPACE_NOT_FOUND'
  }
}

export class ARKAY_USER_CONFIG_MISSING extends ARKAY_USER_CONFIG_ERROR {
  constructor () {
    super('missing arkay user config file, please execute arkay init first!')
    this.name = 'ARKAY_USER_CONFIG_MISSING'
  }
}

export class ARKAY_USER_TOKEN_ERROR extends ARKAY_USER_CONFIG_ERROR {
  constructor () {
    super('gitlab token is not correct, unauthorised to access gitlab api')
    this.name = 'ARKAY_USER_TOKEN_ERROR'
  }
}