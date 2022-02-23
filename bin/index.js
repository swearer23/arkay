#! /usr/bin/env node

import { program } from 'commander'
import * as workspace from '../lib/workspace.js'

program
.version('0.1.0')
.description('create a new workspace containing multiple components repo')

program
  .command('init')
  .option('--force', 'forcefully override existing content in current working folder')
  .action( option => {
    workspace.create(option.force)
  })

program.parse()

