---
title: "20260820-Bash 语法速查"
description: Bash 基础语法与高频命令速查表，涵盖核心哲学、命令分类、组合符、变量与脚本基础。
date: 2026-08-20
tags: [Bash, Shell, Linux, 命令行, 学习笔记]
category: Tech
---

# Bash 语法速查

## 一、什么是 Bash

**Bash** 全称 **Bourne Again SHell**，是一种命令行解释器，也是 Linux 和 macOS 的默认 Shell。

- 负责将用户输入的文字命令翻译给操作系统内核执行
- 同时也是一种编程语言，支持将多条命令写入 `.sh` 脚本文件实现自动化

## 二、核心哲学

记住以下 3 点，即可理解 Bash 的大部分行为：

1. **一切皆文件**：键盘、屏幕、硬盘都被视为文件
2. **组合优于堆砌**：用管道符 `|` 把小工具串联解决复杂问题
3. **空格敏感**：`ls -l` 需要空格，但 `a=1` 等号两边绝对不能有空格

::: warning 注意
变量赋值语法 `变量名=值` 中等号两侧不能有空格，否则 Bash 会将其解析为命令调用。
:::

## 三、高频命令分类速查

### 文件与目录操作

| 命令 | 作用 | 常用示例 |
| :--- | :--- | :--- |
| `pwd` | 显示当前路径 | `pwd` |
| `ls` | 列出目录内容 | `ls -la`（显示全部+详细信息） |
| `cd` | 切换目录 | `cd ..`（上级目录） |
| `mkdir` | 新建文件夹 | `mkdir my_folder` |
| `touch` | 新建空白文件 | `touch file.txt` |
| `cp` | 复制 | `cp a.txt b.txt` |
| `mv` | 移动/重命名 | `mv old new` |
| `rm` | **危险** 删除 | `rm -rf folder/` |
| `cat` | 查看短文件 | `cat file.txt` |
| `less` | 分页查看长文件 | `less big.log`（按 `q` 退出） |

### 查看与搜索

| 命令 | 作用 | 常用示例 |
| :--- | :--- | :--- |
| `head` | 查看文件前几行 | `head -n 5 file.txt` |
| `tail` | 查看文件末尾 | `tail -f log.txt`（实时追踪） |
| `grep` | 搜索关键词 | `grep "error" log.txt` |
| `find` | 查找文件 | `find . -name "*.py"` |
| `wc` | 统计行数/字数 | `wc -l file.txt` |

### 系统与权限

| 命令 | 作用 | 常用示例 |
| :--- | :--- | :--- |
| `ps` | 查看进程 | `ps aux` |
| `kill` | 终止进程 | `kill -9 1234`（强制终止） |
| `chmod` | 修改权限 | `chmod +x run.sh`（添加可执行权限） |
| `sudo` | 以管理员身份执行 | `sudo apt install git` |

### 网络相关

| 命令 | 作用 | 常用示例 |
| :--- | :--- | :--- |
| `ping` | 测试网络连通性 | `ping baidu.com` |
| `curl` | HTTP 请求/下载 | `curl -O https://a.com/1.zip` |
| `ssh` | 远程连接服务器 | `ssh root@192.168.1.1` |

### 组合与操控

| 符号 | 作用 | 常用示例 |
| :--- | :--- | :--- |
| `\|` | 管道：左边输出作为右边输入 | `ls \| grep ".txt"` |
| `>` | 输出重定向（覆盖） | `echo "hi" > a.txt` |
| `>>` | 输出重定向（追加） | `echo "hi" >> a.txt` |
| `&&` | 前一个成功才执行后一个 | `make && make install` |
| `Ctrl+C` | 强制中断当前程序 | 直接按键 |

::: danger 危险操作
`rm -rf` 会递归强制删除且不经过回收站，误删后无法恢复。执行前务必确认目标路径。
:::

## 四、变量与脚本基础

### 变量定义与引用

```bash
name="world"        # 等号两侧不能有空格
echo "hello $name"  # 用 $ 引用变量
echo "hello ${name}" # 花括号用于明确变量边界
```

### 环境变量

| 变量 | 含义 |
| :--- | :--- |
| `PATH` | 可执行文件的搜索路径，多个目录以 `:` 分隔 |
| `HOME` | 当前用户的主目录 |
| `USER` | 当前用户名 |
| `PWD` | 当前工作目录 |

查看环境变量：`echo $PATH`

### 第一个脚本

1. 新建文件 `hello.sh`：

```bash
#!/bin/bash
# shebang：指定解释器，脚本必须以此行开头
name="world"
echo "hello $name"
```

2. 添加可执行权限并运行：

```bash
chmod +x hello.sh
./hello.sh
```

::: info 运行方式
- `./hello.sh`：以文件内容中的 shebang 指定的解释器运行，需要可执行权限
- `bash hello.sh`：显式指定解释器运行，不需要可执行权限
:::

### 脚本参数

```bash
#!/bin/bash
echo "脚本名: $0"
echo "第1个参数: $1"
echo "第2个参数: $2"
echo "全部参数: $*"
```

## 五、新手防坑口诀

1. **执行前按 `Tab`**：自动补全路径，防打错防删错
2. **`rm -rf` 前先用 `ls` 看一眼**：确认再删
3. **`history` 查看历史命令**，`!123` 重复执行第 123 条
4. **`man 命令名`** 查看官方手册，按 `q` 退出

## 六、智能体场景的典型组合

AI 生成的 Bash 命令最常用链式写法：

```bash
grep "ERROR" app.log | wc -l
```

含义：找出日志中所有 ERROR 行，然后统计行数。

## 七、实战小练习

在终端粘贴执行（Windows 推荐使用 WSL 或 Git Bash）：

```bash
curl -s https://api.github.com/repos/torvalds/linux | grep "stargazers_count"
```

作用：抓取 Linux 内核仓库信息，提取星标数。