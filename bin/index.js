#! /usr/bin/env node

import { program } from 'commander'
import * as workspace from '../lib/workspace.js'
import * as material from '../lib/material.js'
import * as prompt from '../lib/utils/prompt.js'
import * as akatoshClient from '../lib/akatoshClient.js'
import {log} from '../lib/utils/index.js'
import chalk from 'chalk'
import { RELEASE_MATERIAL_ERROR } from '../lib/errors.js';

program
.version('0.1.0')
.description('create a new workspace containing multiple components repo')

program
  .command('init')
  .option('--force', 'forcefully override existing content in current working folder')
  .description('initialize a new arkay workspace')
  .action( async option => {
    const { username, akatoshServer } = await prompt.initWorkspace()
    try {
      const {valid, gitlabUrlHttp} = await akatoshClient.validateUsername(username, akatoshServer)
      if (valid) {
        const extraOptions = {
          username, akatoshServer, githost: gitlabUrlHttp
        }
        workspace.create(option.force, extraOptions)
      } else {
        log.error('ERROR: username is not valid')
      }
    }  catch (err) {
      console.error(err)
      log.error(err.message)
      // log.combine(`INFO[${err.message}]`,'ERROR[你错了]')
      // console.log(chalk.red(err.message))
    }
  })

program
  .command('add')
  .argument('<name>', 'component name')
  .description('add a new component to your workspace')
  .action(async name => {
    if (await material.add(name) )
      workspace.onMaterialAdded()
  })

program
  .command('release')
  .argument('<name>', 'component name')
  .description('upgrade a component version')
  .action( async name => {
    const answers = await prompt.releaseUpgradeType()
    try {
      await material.release(name, answers.upgrade_type)
    } catch (err) {
      if (err instanceof RELEASE_MATERIAL_ERROR) {
        if (err.name == 'REPO_PUSH_PERMISSION_ERROR') {
          material.newMergeRequest(name)
        } else {
          log.error(err.message)
        }
      } else {
        log.error((err.message)
      }
    }
  })

program
  .command('fetch')
  .argument('<name>', 'name of material to be fetched')
  .description('fetch a material from a remote git repository')
  .action((name) => {
    if(!name){
      log.error('==> File name cannot be empty')
      // console.log(chalk.red.bold('==> File name cannot be empty'))
      return
    }
    if (material.clone(name))
      workspace.onMaterialAdded()
  })

program
  .command('hoist')
  .description('hoist components dependencies up to workspace incase for building workspace storybook')
  .action(() => {
    workspace.hoist()
  })

program
  .command('publish')
  .argument('[name]', 'component name')
  .action( name => {
    material.publish(name)
  })

program.parse()
