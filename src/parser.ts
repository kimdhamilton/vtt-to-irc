import { alias } from "commander";

var path = require('path');

const SecondsToMs = 1000;
const MinutesToMs = 60 * SecondsToMs;
const HourToMs = 60 * MinutesToMs;
const Arrow = "-->";


function startTimeOffset(timeRange: string): number {
  const startTime = timeRange.substring(0, timeRange.indexOf(Arrow)).trim();
  const parts = startTime.split(":");
  const hour = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  const secondsAndMs = parts[2].split(".");
  const seconds = parseInt(secondsAndMs[0]);
  const ms = parseInt(secondsAndMs[1]);

  const offset = (hour * HourToMs) + (minutes * MinutesToMs) + (seconds * SecondsToMs) + ms;
  return offset;
}

function adjustTime(baseTime: string, offset: number) {
  const timeMs = Date.parse(baseTime) + offset;
  const adjustedTime = new Date(timeMs).toISOString();
  return adjustedTime;
}

export class ParsedEntry {
  lineNumber: number;
  time: string; //e.g. 00:00:03.330

  name: string;
  alias: string;

  message: string;
}

export function parseEntry(lines: string[], baseTime: string): ParsedEntry {
  if (lines.length != 3) {
    throw new Error(`this may not be a valid vtt file. Expected 3 lines but got ${lines.length}`);
  }

  const entry = new ParsedEntry();
  entry.lineNumber = parseInt(lines[0]);

  const timeRange = lines[1];
  const rawMessage = lines[2];

  // calculate time
  const offset = startTimeOffset(timeRange);
  const adjustedTime = adjustTime(baseTime, offset);
  entry.time = adjustedTime;

  // extract speaker
  const colonIndex = rawMessage.indexOf(":");
  const name = rawMessage.substring(0, colonIndex).trim();
  entry.name = name;
  entry.alias = name; // TODO

  // extract message
  const message = rawMessage.substring(colonIndex + 1).trim();
  entry.message = message;

  return entry;
}

export function toIrcLogEntry(entry: ParsedEntry): string {
  return `[${entry.time}]\t<${entry.alias}>\t${entry.message}`;
}

export function parseBaseTimeFromFileName(filePath: string) {

  var fileName = path.basename(filePath);
  const isoString = `${fileName.substring(3, 7)}-${fileName.substring(7, 9)}-${fileName.substring(9, 11)}T${fileName.substring(12, 14)}:${fileName.substring(14, 16)}:${fileName.substring(16, 18)}`
  const theDate = new Date(isoString);
  return theDate.toISOString();
}

export function parseVttLines(lines: string[], baseTime: string) {
  let i = 2
  try {
    const converted = new Array();
    for (; i < lines.length; i += 4) {
      if (i > lines.length - 3) {
        // note: don't want to include in loop criteria; trailing end lines may be variable
        break;
      }
      const entry = parseEntry(lines.slice(i, i + 3), baseTime);
      converted.push(entry);
    }
    return converted;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
