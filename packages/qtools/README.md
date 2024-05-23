# 一些个脚本，必要时候很有用

## 1.qtl git-clone [filePath]

通过读取 txt 文档中的 git url来克隆当前每个仓库的所有分支和tag，拉取的仓库会存放在当前文件夹下.

（直接git clone 拉取git 项目，并不会把所有分支和 tag 都拉下来，这个指令用于拉取多个项目的所有分支和 tag）

### 使用方法：

新建一个 txt 文件，在其中写上需要完全克隆的 git 地址，每一行只放一个地址，ex:

```txt
https://xxxx.git
https://xxxx.git
```

之后在命令行中输入

```node
qtl git-clone ./git-url.txt
```

### 注意：

1. 拉取的仓库不要有重名的，如果有重名的，请自行处理。

## 2. qtl del-dir [name]

删除当前文件夹下所有 [name] 文件。
提供 -z 选项，再删除完成后将整个文件夹打包

name默认为 node_modules

```node
// 删除当前文件夹下所有 node_modules 目录
qtl del-dir node_modules

// 删除并压缩
qtl del-dir node_modules -z
qtl del-dir -z
```
