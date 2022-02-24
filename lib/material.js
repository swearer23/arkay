import fsExtra from "fs-extra"
import { INVALID_MATERIAL_TYPE, DUPLICATED_COMPONENT_NAME, ADD_MATERIAL_ERROR } from "./errors.js"
import { VALID_MATERIAL_TYPE } from "./consts.js"
import chalk from "chalk"
import { newComponent, releaseComponent } from "./component.js"

const {pathExistsSync} = fsExtra

const validateParams = (type, name) => {
  if (!VALID_MATERIAL_TYPE.includes(type)) {
    throw new INVALID_MATERIAL_TYPE()
  }
  if (pathExistsSync(`./components/${name}`)) {
    throw new DUPLICATED_COMPONENT_NAME(name)
  }
}

const sortDefaultParams = (type, name) => {
  if (name === undefined && !VALID_MATERIAL_TYPE.includes(type)) {
    return {
      sortedType: 'cp',
      sortedName: type
    }
  } else {
    return {
      sortedType: type,
      sortedName: name
    }
  }
}

const preAction = (type, name) => {
  const {sortedType, sortedName} = sortDefaultParams(type, name)
  validateParams(sortedType, sortedName)
  return {sortedType, sortedName}
}

export const release = (type, name) => {
  const {sortedType, sortedName} = sortDefaultParams(type, name)
  switch (sortedType) {
    case 'cp':
      releaseComponent(sortedName)
      break
  }
}

export const add = (type, name) => {
  try {
    const {sortedType, sortedName} = preAction(type, name)
    switch (sortedType) {
      case 'cp':
        newComponent(sortedName)
        break
    }
  } catch (err) {
    if (err instanceof ADD_MATERIAL_ERROR)
      return console.log(chalk.red(err))
    else
      throw err
  }
}