#! /usr/bin/env node

import { program } from 'commander'
import * as workspace from '../lib/workspace.js'
import * as material from '../lib/material.js'
import inquirer from 'inquirer';
import * as akatoshClient from '../lib/akatoshClient.js'
import chalk from 'chalk'
import fsExtra from 'fs-extra'

const { readJsonSync } = fsExtra

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
    .then(async answers => {
      const newVersionString = material.release(name, answers.upgrade_type)
      console.log(chalk.green('==> '), chalk.green(`upgraded ${name} to ${newVersionString}`))
      if (newVersionString) {
        console.log(chalk.green('==> '), chalk.green(`calling akatosh server for publish new version of ${name}`))
        const { namespace } = readJsonSync('./.arkay.config.json')
        try {
          await akatoshClient.publishComponent(`${namespace}/${name}`, newVersionString)
          console.log(chalk.green('==> '), chalk.green(`published new version of ${name}`))
        } catch (err) {
          console.log(chalk.red('ERROR: '), chalk.red(err.message))
        }
        // TODO: calling akatosh to release the component
      } else {
        console.log(chalk.red('==> there is something wrong with git repo, thanks for checking'))
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
    workspace.clone(name)
  })

program.parse(process.argv)


