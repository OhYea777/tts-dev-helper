import type { PackageManagerName } from 'nypm';
import type { DownloadTemplateResult } from 'giget';

import { consola } from 'consola';
import { defineCommand } from 'citty';
import { downloadTemplate } from 'giget';
import { resolve, relative } from 'pathe';
import { installDependencies } from 'nypm';

import { sharedArgs } from './_shared';

const DEFAULT_TEMPLATE_NAME = 'tts-project';

const packageManagers: PackageManagerName[] = ['npm', 'pnpm', 'yarn', 'bun'];

export default defineCommand({
  meta: {
    name: 'init',
    description: 'Initialize a new project',
  },

  args: {
    ...sharedArgs,

    dir: {
      type: 'positional',
      default: '',
      description: 'Project directory',
    },

    template: {
      type: 'string',
      alias: 't',
      default: DEFAULT_TEMPLATE_NAME,
      description: 'Template name',
    },

    force: {
      type: 'boolean',
      alias: 'f',
      default: false,
      description: 'Override existing directory',
    },

    offline: {
      type: 'boolean',
      default: false,
      description: 'Force offline mode',
    },

    preferOffline: {
      type: 'boolean',
      default: false,
      description: 'Prefer offline mode',
    },

    install: {
      type: 'boolean',
      default: true,
      description: 'Skip installing dependencies',
    },

    gitInit: {
      type: 'boolean',
      description: 'Initialize git repository and submodules',
    },

    packageManager: {
      type: 'string',
      description: 'Package manager choice (npm, pnpm, yarn, bun)',
    },
  },

  async run(ctx) {
    const cwd = resolve(ctx.args.cwd || '.');
    const templateName = ctx.args.template || DEFAULT_TEMPLATE_NAME;

    let template: DownloadTemplateResult;
    try {
      template = await downloadTemplate(templateName, {
        cwd,
        dir: ctx.args.dir,
        force: Boolean(ctx.args.force),
        offline: ctx.args.offline,
        registry: 'https://raw.githubusercontent.com/tts-tools/tts-starter/main/templates',
        preferOffline: ctx.args.preferOffline,
      });
    } catch (err) {
      if (process.env.DEBUG) {
        throw err;
      }

      consola.error((err as Error).toString());
      process.exit(1);
    }

    const argPackageManager = ctx.args.packageManager as PackageManagerName;
    const packageManager = packageManagers.includes(argPackageManager)
      ? argPackageManager
      : await consola.prompt('Which package manager do you want to use?', {
          type: 'select',
          options: packageManagers,
        });

    if (ctx.args.install) {
      consola.start('Installing dependencies');
      try {
        await installDependencies({
          cwd: template.dir,
          packageManager: {
            name: packageManager,
            command: packageManager,
          },
        });
      } catch (err) {
        if (process.env.DEBUG) {
          throw err;
        }

        consola.error((err as Error).toString());
        process.exit(1);
      }

      consola.success('Installation complete');
    } else {
      consola.info('Skipping installation');
    }

    if (typeof ctx.args.gitInit === 'undefined') {
      ctx.args.gitInit = await consola.prompt('Initialize git repository and submodules?', {
        type: 'confirm',
      });
    }

    if (ctx.args.gitInit) {
      const { execa } = await import('execa');

      consola.info('Initializing git repository...\n');
      await execa('git', ['init', template.dir], { stdio: 'inherit' }).catch((err) =>
        consola.warn(`Failed to initialize git repository: ${err.message}`)
      );

      consola.info('Initializing git submodules...\n');
      await execa(
        'git',
        [
          'submodule',
          'add',
          '--name',
          'TTSLua',
          '--',
          'https://github.com/bavalpey/TTSLua.git',
          'addons/TTSLua',
        ],
        {
          cwd: template.dir,
          stdio: 'inherit',
        }
      ).catch((err) => consola.warn(`Failed to initialize git submodules: ${err.message}`));
    }

    consola.log(`tts-project has been created with the template \`${templateName}\`. Next steps:`);

    const relativeTemplateDir = relative(process.cwd(), template.dir) || '.';
    const nextSteps = [
      relativeTemplateDir.length > 1 && `\`cd ${relativeTemplateDir}\``,
      '`cp .env.example .env`',
      'Modify `.env` to change `EXTRACT_SOURCE` and `COMPILE_DEST` to your TTS save file location',
      `Extract save with \`${packageManager} run extract\``,
    ].filter(Boolean);

    for (const step of nextSteps) {
      consola.log(` › ${step}`);
    }
  },
});
