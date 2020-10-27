#!/usr/bin/env node

import fs from 'fs';
import { program } from 'commander';
import { parseVttLines, toIrcLogEntry, parseBaseTimeFromFileName } from './parser';


export function doParse(fileName: string) {

  try {
    const baseTime = parseBaseTimeFromFileName(fileName);

    const data = fs.readFileSync(fileName,  { encoding: "utf8" });
    const lines = data.split(/\r?\n/);

    const result = parseVttLines(lines, baseTime);

    result.forEach((l) => {
      console.log(toIrcLogEntry(l));
    });
  } catch (err) {
    console.error(err);
  }
}

program
  .requiredOption('-f, --fileName <fileName>', 'the vtt file to process');

program.parse(process.argv);

doParse(program.fileName);

