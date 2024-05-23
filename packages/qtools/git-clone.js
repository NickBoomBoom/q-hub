const { execSync } = require('child_process');
const { readFileSync } = require('fs');
const { join } = require('path');

function get(url) {
  console.log('开始拉取：' + url);
  new RegExp(/\/([^\/]+)\.git$/).test(url);
  const folderName = RegExp.$1;
  return new Promise((resolve, reject) => {
    execSync(`git clone ${url}`, {
      encoding: 'utf-8',
    });
    const gitOutput = execSync(`cd ${folderName}; git branch -r`).toString();
    const branches = gitOutput.trim().split('\n');
    const currentBranch = execSync(`cd ${folderName}; git branch --show-current`).toString().trim();
    // 过滤并处理分支
    branches
      .filter((branch) => !branch.includes('->') && !branch.includes(`origin/${currentBranch}`))
      .forEach((branch) => {
        const remoteBranch = branch.trim().replace(/^origin\//, '');
        execSync(`cd ${folderName}; git branch --track ${remoteBranch} ${branch}`, {
          encoding: 'utf-8',
        });
      });
    resolve();
  });
}

async function cloneGit(urlPath) {
  const addr = join(process.cwd(), urlPath);

  const data = readFileSync(addr, {
    encoding: 'utf-8',
  });

  const urls = data.split('\n').filter((t) => !!t);

  if (urls.length === 0) {
    throw '文件中无 url 地址';
  }

  for (const p of urls) {
    await get(p);
  }

  console.log('拉取完成');
}

module.exports = {
  cloneGit,
};
