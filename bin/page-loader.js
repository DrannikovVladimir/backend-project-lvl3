#!/usr/bin/env node

import { program } from 'commander';

import loader from '../index.js';

program
  .version('0.0.1')
  .usage('[options] <url>')
  .description('Downloads a page from the network and puts it in the specified directory')
  .option('-o, --output [dir]', 'output dir (default: "/home/user/current-dir"')
  .action(() => loader());

program.parse(process.argv);
