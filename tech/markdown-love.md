---
title: 为什么我沉迷 Markdown
description: Markdown 的极简哲学：专注内容，工具退后。
date: 2026-08-08
tags: [Markdown, 写作, 效率]
---

# 为什么我沉迷 Markdown

如果你也喜欢"编辑器 + 纯文本 + 一切皆文件"，那 Markdown 一定合你口味。

## 一、极简：格式即语法

不需要工具栏，语法本身就是格式：

```markdown
# 标题
## 二级标题
**加粗** *斜体* `代码`
> 引用
- 列表项
[链接](https://example.com)
```

::: tip
写作时手指不离键盘，思维不被鼠标打断——这是 Markdown 最大的魅力。
:::

## 二、纯文本：永远可读

- 任何编辑器都能打开，不会因为软件停更而打不开
- `git diff` 可以精确看到每一行改动
- 天然适合版本管理，一篇博客就是一次提交

```bash
$ git log --oneline -- tech/markdown-love.md
a1b2c3d fix: 补充引用示例
e4f5g6h docs: 初稿
```

## 三、生态：到处都能渲染

| 平台 | 支持 |
| ---- | ---- |
| GitHub | 仓库 README、Issue、Discussion |
| VitePress / VuePress | 静态博客与文档站 |
| Obsidian / Typora | 本地笔记 |
| Notion | 导入导出 |

## 四、工具链：一套键盘走天下

我的写作工具链是：

1. **VS Code** 编辑，等宽字体
2. **VitePress** 渲染成站点
3. **Git + GitHub Actions** 发布

```text
想法 --> 随手写 .md --> push --> 自动部署上线
```

> 工具应该退到内容后面。Markdown 做到了这一点。
