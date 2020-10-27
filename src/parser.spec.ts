import { expect } from 'chai';
import 'mocha';

import { parseEntry, parseBaseTimeFromFileName, parseVttLines, ParsedEntry } from "./parser";

describe("index", () => {

  it("should parse entry", () => {

    const lines = [ "1", 
      "00:00:03.330 --> 00:00:14.309",
      "Kim Duffy: IP note, anyone can participate..."];

    let parsedEntry = parseEntry(lines, "2020-10-13T16:00:00.000Z");
    expect(parsedEntry.lineNumber).to.equal(1);
    expect(parsedEntry.time).to.equal("2020-10-13T16:00:03.330Z");
    expect(parsedEntry.name).to.equal("Kim Duffy");
    expect(parsedEntry.message).to.equal("IP note, anyone can participate...");

  });

  it("should parse date from file name", () => {
    const fileName = "/blah/blah/GMT20201019-150225_CCG-VC-EDU.transcript.vtt";
    const result = parseBaseTimeFromFileName(fileName);
    expect(result).to.equal("2020-10-19T22:02:25.000Z");
  });

  it("should convert file entries", () => {

    const lines = [ 
      "WEBVTT",
      "",
      "1", 
      "00:00:03.330 --> 00:00:14.309",
      "Some Person: IP note, anyone can participate...",
      "",
      "2",
      "00:00:15.900 --> 00:00:20.610",
      "Some Person: yadda..."
    ];

    let parsed = parseVttLines(lines, "2020-10-13T16:00:00.000Z");

    expect(parsed[0].message).to.equal('IP note, anyone can participate...');
    expect(parsed[0].time).to.equal('2020-10-13T16:00:03.330Z');

    expect(parsed[1].message).to.equal('yadda...');
    expect(parsed[1].time).to.equal('2020-10-13T16:00:15.900Z');
  });

});

