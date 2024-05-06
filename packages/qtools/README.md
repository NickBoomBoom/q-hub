# 一些个脚本，必要时候很有用

## 1.qtl git clone ./git-url.txt

通过读取 txt 文档中的 git url来克隆当前每个仓库的所有分支和tag，拉取的仓库会存放在当前文件夹下

### 使用方法：

新建一个 txt 文件，在其中写上需要完全克隆的 git 地址，每一行只放一个地址，ex:

```txt
https://xxxx.git
https://xxxx.git
```

之后在命令行中输入

```node
qtl git clone ./git-url.txt
```

### 注意：

1. 拉取的仓库不要有重名的，如果有重名的，请自行处理。
