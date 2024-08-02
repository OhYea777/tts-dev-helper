#!/usr/bin/env node

import { consola } from 'consola';
import { runMain, defineCommand } from 'citty';

import { commands } from './commands';
import { checkEngines } from './utils/engines';
import { name, version, description } from '../package.json';

export const main = defineCommand({
  meta: {
    name,
    version,
    description,
  },

  subCommands: commands,

  async setup(ctx) {
    const command = ctx.args._[0];
    if (command === 'dev') {
      consola.wrapAll();
    } else {
      consola.wrapConsole();
    }

    process.on('unhandledRejection', (err) => consola.error('[unhandledRejection]', err));
    process.on('uncaughtException', (err) => consola.error('[uncaughtException]', err));

    checkEngines();
  },
});

runMain(main);
