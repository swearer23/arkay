#! /usr/bin/env node

import { program } from 'commander'
import * as workspace from '../lib/workspace.js'
import * as material from '../lib/material.js'
import inquirer from 'inquirer';
import * as akatoshClient from '../lib/akatoshClient.js'
import chalk from 'chalk'

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
      const akatoshServer = answers.akatosh_server
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
  .argument('<type>', 'material type to add [cp]')
  .argument('[name]', 'component name')
  .action((type, name) => {
    material.add(type, name)
  })

program
  .command('release')
  .argument('<type>', 'material type to add [cp]')
  .argument('[name]', 'component name')
  .action((type, name) => {
    material.release(type, name)
  })

program.parse()

