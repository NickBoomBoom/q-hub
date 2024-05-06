#!/usr/bin/env node
var program = require("commander");
var { cloneGit } = require("./git-clone.js");
var PKG = require("./package.json");

program.version(PKG.version);

program.command("git clone").description("Git clone all branches and tags(qtl gca ./url.txt)").action(cloneGit);

program.command("help").description("Print this help").action(program.help);

program.parse(process.argv);

if (process.argv.length === 2) {
  program.outputHelp();
}

module.exports = {
  cloneGit,
};
