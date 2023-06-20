#!/usr/bin/env node
import type { SaveFile, TTSObject } from '@tts-tools/savefile';
import type { OutgoingJsonObject } from '@matanlurey/tts-editor';

import fs from 'fs-extra';
import TTS from '@matanlurey/tts-editor';
import * as path from 'path';

import { Option, Command } from 'commander';
import { embedSave, writeExtractedSave } from '@tts-tools/savefile';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { name, version, description } = require('../package.json');

const program = new Command();

program.name(name).version(version).description(description);

export interface ExtractSaveOptions {
  dest: string;
  source: string;
}

async function extractSave({ dest, source }: ExtractSaveOptions) {
  if (!(await fs.pathExists(source))) {
    throw new Error(`Save file not found "${source}"`);
  }

  if (!(await fs.pathExists(dest))) {
    console.log(`Creating destination directory "${dest}"`);
    await fs.mkdirp(dest);
  } else {
    const baseName = path.basename(source).split('.').slice(0, -1).join('.');
    const modOutput = path.join(dest, baseName);

    console.log(`Clearing destination directory "${modOutput}"`);
    await fs.remove(modOutput);
    await fs.mkdirp(modOutput);
  }

  console.log(`Extracting save to "${dest}"`);
  const saveFile = (await fs.readJson(source)) as SaveFile;
  writeExtractedSave(saveFile, { output: dest });
  console.log(`Extracted save to "${dest}"`);
}

program
  .command('extract')
  .description('extract a TTS save to a given location')
  .addOption(
    new Option('-s, --source <source>', 'source of existing save file')
      .env('EXTRACT_SOURCE')
      .makeOptionMandatory(true)
  )
  .addOption(
    new Option('-d, --dest <dest>', 'output destination to extract save to')
      .env('EXTRACT_DEST')
      .makeOptionMandatory(true)
  )
  .action(extractSave);

function combineObjectScripts(
  states: TTSObject[],
  buffer: OutgoingJsonObject[] = []
): OutgoingJsonObject[] {
  states.forEach((state) => {
    const { GUID } = state;
    if (!GUID) return;

    buffer.push({
      ui: state.XmlUI,
      guid: GUID,
      script: state.LuaScript,
    });

    if (state.ContainedObjects) {
      combineObjectScripts(state.ContainedObjects, buffer);
    }
  });

  return buffer;
}

export interface CompileSaveOptions {
  dest: string;
  source: string;
  reload?: boolean;
}

async function compileSaveFile({
  dest,
  source,
  reload = false,
}: CompileSaveOptions) {
  if (!(await fs.pathExists(source))) {
    throw new Error(`Source directory not found "${source}"`);
  }

  const output = path.dirname(dest);
  if (!(await fs.pathExists(output))) {
    console.info(`Creating output directory "${output}"`);
    await fs.mkdirp(output);
  } else {
    console.log(`Clearing destination directory "${output}"`);
    await fs.remove(output);
    await fs.mkdirp(output);
  }

  console.info(`Reading "${source}"...`);
  const saveFile = embedSave(source, { includePath: '' });
  console.info(`Writing "${output}"...`);
  await fs.writeJson(dest, saveFile);
  console.info(`Wrote "${output}"...`);

  if (reload) {
    const api = new TTS();
    const json: OutgoingJsonObject[] = [
      {
        ui: saveFile.XmlUI,
        guid: '-1',
        script: saveFile.LuaScript,
      },
      ...combineObjectScripts(saveFile.ObjectStates),
    ];

    try {
      await api.saveAndPlay(json);
      console.info(`Sent "Save & Play" command!`);
    } catch (err) {
      console.warn(`Could not reload. Is TTS currently running?`, err);
    }
  }
}

program
  .command('compile')
  .description('compiles an extracted save directory to a TTS save')
  .addOption(
    new Option(
      '-s, --source <source>',
      'source folder of existing extracted save'
    )
      .env('COMPILE_SOURCE')
      .makeOptionMandatory(true)
  )
  .addOption(
    new Option('-d, --dest <dest>', 'output destination of the save file')
      .env('COMPILE_DEST')
      .makeOptionMandatory(true)
  )
  .option('-r, --reload', 'send "Save & Play" command after compiling save')
  .action(compileSaveFile);

program.parse(process.argv);
