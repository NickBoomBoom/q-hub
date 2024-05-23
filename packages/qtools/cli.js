#!/usr/bin/env node
const { Command } = require('commander');
const { cloneGit } = require('./git-clone.js');
const { deleteDir } = require('./delete-dir.js');
const PKG = require('./package.json');
const program = new Command();

program.version(PKG.version);

// 获取 git 仓库所有分支和 tag
program.command('git-clone <filePath>').description('Git clone all branches and tags by txt(qtl git clone ./[url].txt)').action(cloneGit);

// 删除当前文件夹下所有[name] 文件夹, 默认 node_modules
program
  .command('del-dir [name]')
  .option('-z,--zip', 'output zip by current folder')
  .description('Delete dir, dir name default is node_modules')
  .action((name, option) => {
    deleteDir(process.cwd(), name, option.zip);
  });

program.command('help').description('Print this help').action(program.help);

program.parse(process.argv);
