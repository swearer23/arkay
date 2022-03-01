#! /usr/bin/env node

import { program } from 'commander'
import * as workspace from '../lib/workspace.js'
import * as material from '../lib/material.js'
import inquirer from 'inquirer';
import * as akatoshClient from '../lib/akatoshClient.js'
import chalk from 'chalk'
import { generateTag } from '../lib/utils/index.js'

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
  .argument('[name]', 'component name')
  .action( name => {
    material.add(name)
  })

program
  .command('release')
  .argument('[name]', 'component name')
  .action( name => {
    material.release(name)
  })

// TODO: 等待联调
program
  .command('upgrade')
  .argument('<name>', 'component name')
  .description('upgrade a component version')
  .action( name => {
    inquirer.prompt([{
      type: 'list',
      name: 'upgrade_type',
      message: 'select your upgrade mode:',
      choices: ['patch', 'minor', 'major']
    }])
    .then(answers => {
      material.release(name, answers.upgrade_type)
    })
  })

program.parse()

