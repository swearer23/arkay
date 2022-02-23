import { VALID_MATERIAL_TYPE } from "./consts.js"

export class ADD_MATERIAL_ERROR extends Error {}

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