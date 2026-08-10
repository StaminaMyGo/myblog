---
title: GitHub Pages + CI/CD 实战：让博客自动部署
description: 从零配置 GitHub Actions，push 后自动构建并发布到 GitHub Pages。
date: 2026-08-10
tags: [DevOps, GitHub Actions, CI/CD, VitePress]
---

# GitHub Pages + CI/CD 实战：让博客自动部署

写博客最爽的一刻，是 `git push` 之后什么都不用做，网站自己就更新了。
本文记录这个博客的自动化部署方案：**GitHub Actions 构建 → Pages 发布**。

## 原理

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

### 2. 编写 workflow

在仓库根目录创建 `.github/workflows/deploy.yml`：

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

### 3. 关键点：base 路径

项目站点（`username.github.io/repo`）必须设置正确的 `base`，否则资源 404：

```ts
// .vitepress/config.mts
const base = process.env.BASE_PATH || '/'
export default defineConfig({ base })
```

本地开发默认 `/`，CI 中由 workflow 注入 `/myblog/`，一套配置两处复用。

## 效果

每次 push 后，Actions 页面会出现一次绿色勾：

```text
✓ build  (pnpm install + pnpm build)
✓ deploy (upload-pages-artifact → deploy-pages)
```

::: tip
免费、自动、零服务器，这就是 GitHub Pages + Actions 的魅力。
:::
