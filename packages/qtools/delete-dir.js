const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file, index) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
}

function deleteDirectory(directory, name) {
  const files = fs.readdirSync(directory);
  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      if (file === name) {
        deleteFolderRecursive(filePath);
      } else {
        deleteDirectory(filePath, name);
      }
    }
  });
}

function deleteDir(directory, name = 'node_modules', isZip) {
  console.log(`[${name}] delete start ====> `);
  deleteDirectory(directory, name);
  console.log(`[${name}] has been completely deleted.`);
  if (isZip) {
    zip(directory);
  }
}

function zip(folderPath) {
  console.log('Compress start ===>');
  const outputFilePath = './output.zip';
  const output = fs.createWriteStream(outputFilePath);
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });
  archive.pipe(output);

  // 递归遍历文件夹并添加文件到压缩包
  const addFilesToArchive = (folderPath, archivePath) => {
    fs.readdirSync(folderPath).forEach((file) => {
      const filePath = path.join(folderPath, file);
      const archiveFilePath = archivePath ? path.join(archivePath, file) : file;

      if (fs.statSync(filePath).isDirectory()) {
        // 如果是文件夹，递归添加文件
        addFilesToArchive(filePath, archiveFilePath);
      } else {
        // 如果是文件，将文件添加到压缩包
        archive.append(fs.createReadStream(filePath), { name: archiveFilePath });
      }
    });
  };

  // 添加文件到压缩包
  addFilesToArchive(folderPath);

  // 完成压缩并关闭输出流
  archive.finalize();

  // 输出提示信息
  output.on('close', () => {
    console.log(`Successfully compressed ${archive.pointer()} total bytes.`);
    console.log(`Compressed file is saved to: ${outputFilePath}`);
  });
}

module.exports = {
  deleteDir,
};
