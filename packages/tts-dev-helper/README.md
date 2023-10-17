<h1 align="center">tts-dev-helper</h1>

<p align="center">
  <img alt="npm downloads" src="https://img.shields.io/npm/dy/tts-dev-helper.svg">
  <img alt="npm version" src="https://img.shields.io/npm/v/tts-dev-helper.svg">
  <img alt="npm license" src="https://img.shields.io/npm/l/tts-dev-helper.svg">
</p>

A simple CLI app to help make development, with version control, easier for Tabletop Simulator (TTS).

# Installation

```bash
$ npx tts-dev-helper
```

or if you really want to install it:

```bash
$ npm i -g tts-dev-helper
```

# Command Line Interface

Extract a TTS save to a given location:
```
Usage: tts-dev-helper extract [options]

Options:
  -s, --source <source>  source of existing save file (env: EXTRACT_SOURCE)
  -d, --dest <dest>      output destination to extract save to (env: EXTRACT_DEST)
  -h, --help             display help for command
```

Compile an extracted save directory to a TTS save:
```
Usage: tts-dev-helper compile [options]

Options:
  -s, --source <source>  source folder of existing extracted save (env: COMPILE_SOURCE)
  -d, --dest <dest>      output destination of the save file (env: COMPILE_DEST)
  -r, --reload           send "Save & Play" command after compiling save
  -i, --include <dir>    a directory of lua files to include
  -h, --help             display help for command
```
