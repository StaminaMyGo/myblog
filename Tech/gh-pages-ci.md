---
title: "20260810-GitHub Pages + CI/CD 实战：让博客自动部署"
description: 从零配置 GitHub Actions，push 后自动构建并发布到 GitHub Pages。
date: 2026-08-10
tags: [DevOps, GitHub Actions, CI/CD, VitePress]
category: Tech
---

# GitHub Pages + CI/CD 实战：让博客自动部署

写博客最爽的一刻，莫过于 `git push` 之后什么都不用做，网站自己就更新了。本文记录这个博客的自动化部署方案：**GitHub Actions 构建 → Pages 发布**，从仓库设置到 workflow 编写，一步步复现整条部署链路。

## 原理

整个流程可以浓缩成下面这张图：你推送代码，Actions 负责构建，Pages CDN 负责分发，最终用户访问到的是最新的静态站点。

```text
[你 push 到 main]  -->  [GitHub Actions 触发]  -->  [pnpm build]
                                                      |
                                                      v
[用户访问 Pages]  <--  [GitHub Pages CDN]  <--  [上传构建产物]
```

## 三步搞定

### 1. 仓库设置

进入仓库 **Settings → Pages**，把 Source 选为 **GitHub Actions**：

```yaml
# 之后 workflow 里的 deploy-pages 会自动接管发布
Build and deployment: GitHub Actions
```

这一步是让 GitHub Pages 放弃传统的分支发布模式，改为完全由 workflow 控制发布行为的前提。

### 2. 编写 workflow

在仓库根目录创建 `.github/workflows/deploy.yml`，内容如下：

```yaml
name: Deploy VitePress site to Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Build
        run: pnpm build
        env:
          BASE_PATH: /${{ github.event.repository.name }}/
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .vitepress/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

工作流分为 `build` 与 `deploy` 两个 job：前者负责安装依赖并构建静态产物，后者等待构建成功后把产物发布到 Pages。`permissions` 与 `concurrency` 分别保证权限最小化和同一时间只有一个部署任务在跑。

### 3. 关键点：base 路径

项目站点（`username.github.io/repo`）必须设置正确的 `base`，否则资源 404：

```ts
// .vitepress/config.mts
const base = process.env.BASE_PATH || '/'
export default defineConfig({ base })
```

本地开发默认 `/`，CI 中由 workflow 注入 `/myblog/`，一套配置两处复用。

::: warning
如果你的博客部署在用户名仓库（`username.github.io`）下，`base` 应为 `/`，无需注入 `BASE_PATH`；只有项目子路径仓库才需要这一步。
:::

## 效果

每次 push 后，Actions 页面会出现一次绿色勾：

```text
✓ build  (pnpm install + pnpm build)
✓ deploy (upload-pages-artifact → deploy-pages)
```

::: tip
免费、自动、零服务器，这就是 GitHub Pages + Actions 的魅力。
:::

## 相关阅读

- [VitePress 架构笔记：它到底是怎么工作的](/Tech/vitepress-arch) —— 了解构建产物与静态站点生成原理
- [myblog 项目 v1 说明文档](/Tech/myblog-V1) —— 本博客完整的技术架构复盘
- [myblog 项目复盘](/Project/myblog) —— 从项目视角回看整个开发过程
