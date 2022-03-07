#! /usr/bin/env node

import { program } from 'commander'
import * as workspace from '../lib/workspace.js'
import * as material from '../lib/material.js'
import inquirer from 'inquirer';
import * as akatoshClient from '../lib/akatoshClient.js'
import chalk from 'chalk'
import { RELEASE_MATERIAL_ERROR } from '../lib/errors.js';

program
.version('0.1.0')
.description('create a new workspace containing multiple components repo')

program
  .command('init')
  .option('--force', 'forcefully override existing content in current working folder')
  .action( option => {
    inquirer.prompt([
      {
        type: 'input',
        name: 'git_username',
        message: "setting your git username: \n git username: "
      },
      {
        type: 'input',
        name: 'akatosh_server',
        message: "setting your akatosh server host (eg. http://akatosh.longfor.com): \n server url: "
      }
    ])
    .then(async answers => {
      const username = answers.git_username
      const akatoshServer = answers.akatosh_server || 'http://akatosh.longfor.com'
      try {
        if (await akatoshClient.validateUsername(username, akatoshServer)) {
          const extraOptions = {
            username, akatoshServer
          }
          workspace.create(option.force, extraOptions)
        } else {
          console.log(chalk.red('ERROR: username is not valid'))
        }
      } catch (err) {
        console.error(err)
        console.log(chalk.red(err.message))
      }
    })
  })

program
  .command('add')
  .argument('[name]', 'component name')
  .action( name => {
    if (material.add(name) )
      workspace.onMaterialAdded()
  })

program
  .command('release')
  .argument('<name>', 'component name')
  .description('upgrade a component version')
  .action( name => {
    inquirer.prompt([{
      type: 'list',
      name: 'upgrade_type',
      message: 'select your upgrade mode:',
      choices: ['patch', 'minor', 'major']
    }])
    .then(async answers => {
      try {
        material.release(name, answers.upgrade_type)
      } catch (err) {
        if (err instanceof RELEASE_MATERIAL_ERROR) {
          if (err.name == 'REPO_PUSH_PERMISSION_ERROR') {
            material.newMergeRequest(name)
          } else {
            console.log(chalk.red(err.message))
          }
        } else {
          console.log(chalk.red(err.message))
        }
      }
    })
  })

program
  .command('fetch')
  .argument('[name]', 'name of material to be fetched')
  .action((name) => {
    if(!name){
      console.log(chalk.red.bold('==> File name cannot be empty'))
      return
    }
    if (material.clone(name))
      workspace.onMaterialAdded()
  })

program.parse()