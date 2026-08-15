---
title: VitePress 架构笔记：它到底是怎么工作的
description: 拆解 VitePress 的构建流程、主题机制与内容加载方式。
date: 2026-08-09
tags: [VitePress, Vue, 前端架构]
---

# VitePress 架构笔记：它到底是怎么工作的

VitePress 是 Vue 官方维护的静态站点生成器（SSG），本博客正是基于它构建的。这篇文章拆解它的核心机制，梳理它从 Markdown 源码到静态站点的完整工作方式。

## 三条主线

理解 VitePress，可以从三条主线入手：Markdown 即源码、构建期生成静态文件、运行时水合。

### 1. Markdown 即源码

所有页面都是 `.md` 文件，构建时被解析成 HTML：

```text
docs/
  tech/vitepress-arch.md  -->  /tech/vitepress-arch.html
  index.md                -->  /index.html
```

- 前置元数据（frontmatter）：`title`、`date`、`tags` 等
- Markdown 语法扩展：代码高亮（Shiki）、提示框、表格、Mermaid 图

### 2. 构建期生成静态文件

```text
pnpm build
  └─ vitepress build
       ├─ 扫描所有 .md 生成路由
       ├─ 按需渲染成 HTML
       ├─ 生成本地搜索索引 (minisearch)
       └─ 输出到 .vitepress/dist
```

### 3. 运行时水合

页面加载后，Vue 在静态 HTML 上做水合（hydration），导航变为客户端路由跳转，因此切换页面极快。

## 主题机制

VitePress 默认主题可整体替换，也可以**扩展**：

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'layout-bottom': () => h(StatusBar), // 注入底部状态栏
  }),
}
```

通过 `extends` 继承默认主题，再借助插槽机制向布局注入自定义内容，既保留了默认主题的完整功能，又实现了风格定制。

## 内容加载器

文章列表不需要手写，用 `createContentLoader` 自动收集：

```ts
// .vitepress/posts.data.ts
import { createContentLoader } from 'vitepress'

export default createContentLoader(['tech/**/*.md', 'acgn/**/*.md', 'news/**/*.md'], {
  exclude: ['**/index.md'],
  transform(raw) {
    return raw.map(({ url, frontmatter }) => ({
      url,
      title: frontmatter.title,
      date: String(frontmatter.date),
    }))
  },
})
```

内容加载器在构建期扫描指定目录，提取 frontmatter 元数据并生成静态数据，组件可以直接导入使用，天然适合文章列表、归档页等场景。

## 构建流程

```text
[编写 .md 源码]
      │
      ▼
[vitepress build] ──┬── [Shiki 代码高亮] ──┐
                    │                       │
                    └── [渲染 Vue 组件]  ───┤
                                            ▼
                                   [生成静态 HTML]
                                            │
                                            ▼
                                   [.vitepress/dist]
                                            │
                                            ▼
                                  [GitHub Actions 上传]
                                            │
                                            ▼
                                  [GitHub Pages CDN]
                                            │
                                            ▼
                                     [用户访问]
```

## 小结

| 环节 | 技术 |
| ---- | ---- |
| 渲染 | Vue 3 + Vite |
| 代码高亮 | Shiki |
| 搜索 | minisearch 本地索引 |
| 部署产物 | 纯静态 HTML/CSS/JS |

> 一个 SSG 的核心就三件事：**读 Markdown → 渲染页面 → 输出静态文件**。

## 相关阅读

- [GitHub Pages + CI/CD 实战：让博客自动部署](/Tech/gh-pages-ci) —— 构建产物是如何被自动发布到线上的
- [myblog 项目 v1 说明文档](/Tech/myblog-V1) —— 这些机制在本博客中的完整落地
- [为什么我沉迷 Markdown](/Tech/markdown-love) —— Markdown 写作与渲染生态的由来
