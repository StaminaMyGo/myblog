---
title: "20260720-开发者生态观察：静态站与 SSG 的文艺复兴"
description: 为什么个人博客又回到了"Markdown + 静态部署"的老路上。
date: 2026-07-20
tags: [开发者生态, SSG, 博客]
category: news
---

# 开发者生态观察：静态站与 SSG 的文艺复兴

最近观察到一种趋势：个人博客开始"返祖"——回到 Markdown + 静态生成 + CDN。

## 为什么？

### 1. 零运维是硬需求

```text
动态博客（自建）: 服务器 + 数据库 + 备份 + 防攻击 ...
静态博客（Pages）: git push，完事
```

GitHub Pages / Vercel / Netlify 把"发布"压缩成了一次 push，
个人站点几乎不需要再买服务器。

### 2. 内容所有权

Markdown 文件是自己的，永远可以迁移：

- 换 SSG：改一下 frontmatter 即可
- 换平台：文件照搬
- 十年后：`cat` 照样能读

### 3. 生态成熟

- **VitePress / Astro**：现代、快、主题丰富
- **Hugo / Jekyll**：老牌、极简
- **评论**：giscus / Waline 等第三方方案补齐互动

## 静态 ≠ 简陋

| 能力 | 静态方案 |
| ---- | -------- |
| 搜索 | 本地索引（minisearch） |
| 评论 | giscus（GitHub Discussions） |
| 统计 | umami / 自建轻量埋点 |
| 订阅 | RSS 生成器 |

## 结论

对个人写作者来说，**"内容即文件、发布即推送"** 仍然是最优解。
动态后端更适合交互复杂的产品，而不是博客。

> 文艺复兴不是倒退，是把复杂度留给平台，把内容留给自己。
