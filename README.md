# myblog

一个 **Clay 奶油风格**的个人博客 / 求职作品集，基于 [VitePress](https://vitepress.dev) 构建，
托管在 GitHub Pages，通过 GitHub Actions 实现 **push 即自动部署**。

五个内容专区：

| 专区 | 目录 | 内容 |
| ---- | ---- | ---- |
| 技术分析 | `Tech/` | 编程、框架、DevOps、学习笔记与行业猜想 |
| 产品分析 | `Product/` | AI 与效率工具的产品视角拆解 |
| ACGN 评价 | `ACGN/` | 动画、漫画、游戏、轻小说的记录与安利 |
| 项目复盘 | `Project/` | 项目背景、技术栈、结果与复盘 |
| 关于我 | `Me/` | 个人介绍、职业背景与联系方式 |

> `news/` 为旧站「时事热点」归档内容，保留在仓库中，可通过站内搜索访问。

## 技术栈

- **框架**：VitePress 1.6（Vue 3 + Vite 静态站点生成器）
- **主题**：CLAY SURFACE SYSTEM · Clay 风格配色（奶油画布 `#fffaf0` + Ink 墨色主按钮 + Pink/Teal/Lavender/Peach/Ochre 饱和特色卡片）
- **首页**：六屏滚动展示（个人简介 / 项目复盘 / 产品分析 / 技术分析 / 自我介绍 / 网站技术栈）
- **包管理**：pnpm
- **CI/CD**：GitHub Actions → GitHub Pages
- **搜索**：VitePress 本地搜索（minisearch）

## 目录结构

```text
myblog/
├── .github/workflows/deploy.yml   # CI/CD：构建 + 部署到 Pages
├── .vitepress/
│   ├── config.mts                 # 站点配置（导航/侧边栏/搜索）
│   ├── posts.data.ts              # 文章数据加载器（自动收集五个专区文章）
│   └── theme/
│       ├── index.ts               # 自定义主题入口
│       ├── components/            # SixScreens / PostsList
│       └── style/                 # vars.css（配色令牌）+ nerd.css（主题样式）
├── public/                        # favicon、logo
├── Tech/                          # 技术分析文章（Markdown）
├── Product/                       # 产品分析文章
├── ACGN/                          # ACGN 评价文章
├── Project/                       # 项目复盘文章
├── Me/                            # 关于我文章
├── news/                          # 时事热点归档（不在导航中）
├── index.md                       # 首页（六屏展示）
└── about.md                       # 旧关于页（重定向到 /Me/）
```

## 本地开发

```bash
pnpm install     # 安装依赖
pnpm dev         # 启动开发服务器（默认 http://localhost:5173）
pnpm build       # 构建到 .vitepress/dist
pnpm preview     # 本地预览构建产物
```

## 写文章

在对应专区目录下新建 `.md` 文件，写好 frontmatter 即可，无需改任何配置：

```markdown
---
title: 文章标题
description: 一句话摘要（会显示在列表里）
date: 2026-08-10
tags: [标签1, 标签2]
---

正文内容（支持代码块、表格、提示框等 VitePress 语法）。
```

保存后本地开发服务器会热更新；推送到 `main` 分支后自动上线。

## 部署

1. 将本仓库推送到 GitHub（例如 `StaminaMyGo/myblog`）；
2. 仓库 **Settings → Pages**，Source 选择 **GitHub Actions**；
3. 之后每次 push 到 `main`，Actions 自动构建并发布到
   `https://<用户名>.github.io/myblog/`。

`base` 路径由 workflow 自动注入仓库名，无需手改。

## 与 ACGN_Page 的关系

如果你同时维护 [ACGN_Page](https://github.com/StaminaMyGo/ACGN_Page)
（FastAPI + React 的动态站），两者可以这样分工：

- **myblog**：静态内容站（技术/产品/ACGN/项目/关于），零成本、自动部署；
- **ACGN_Page**：需要注册、评论、点赞等动态交互的全栈应用。

静态博客也可以引入 giscus 等第三方评论方案补齐互动能力。

## License

MIT
