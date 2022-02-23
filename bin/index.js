#! /usr/bin/env node

import { program } from 'commander'
import * as workspace from '../lib/workspace.js'
import * as material from '../lib/material.js'

program
.version('0.1.0')
.description('create a new workspace containing multiple components repo')

program
  .command('init')
  .option('--force', 'forcefully override existing content in current working folder')
  .action( option => {
    workspace.create(option.force)
  })

program
  .command('add')
  .argument('<type>', 'material type to add [cp]')
  .argument('[name]', 'component name')
  .action((type, name) => {
    material.add(type, name)
  })

program
  .command('remove')

program.parse()

