# myblog

一个 **腾讯招聘首页风格** 的个人博客 / 作品集，基于 [VitePress](https://vitepress.dev) 构建，
托管在 GitHub Pages，通过 GitHub Actions 实现 **push 即自动部署**。

八个内容专区：

| 专区 | 目录 | 导航名 | 内容 |
| ---- | ---- | ---- | ---- |
| 技术分析 | `Tech/` | 技术笔记 | 编程、框架、DevOps、学习笔记与行业猜想 |
| 产品分析 | `Product/` | 产品分析 | AI 与效率工具的产品视角拆解 |
| ACGN 评价 | `ACGN/` | ACGN 评价 | 动画、漫画、游戏、轻小说的记录与安利 |
| 项目复盘 | `Project/` | 项目复盘 | 项目背景、技术栈、结果与复盘 |
| 成长思考 | `Growth/` | 成长思考 | 人物访谈、认知、心理、习惯与自我成长 |
| 英语学习 | `English/` | 英语学习 | 商务英语、语法、语音与语用学习 |
| 关于我 | `Me/` | 关于我 | 个人介绍、职业背景与联系方式 |
| 资讯观察 | `news/` | 资讯观察 | 时事热点归档（保留在仓库，可通过站内搜索与侧边栏访问，不在顶部导航） |

> 顶部导航包含前七个专区；`news/` 仅出现在侧边栏，供站内检索与回溯。

## 技术栈

- **框架**：VitePress 1.6（Vue 3 + Vite 静态站点生成器）
- **首页**：腾讯招聘风格长滚动页（`index.md` 渲染 `<TencentHome />` 组件）
- **主题**：自定义主题位于 `.vitepress/theme/`（含组件与样式）
- **包管理**：pnpm
- **CI/CD**：GitHub Actions → GitHub Pages（`push` 到 `main` 自动构建并发布）
- **搜索**：VitePress 本地搜索（minisearch）
- **URL**：`cleanUrls` 开启，路径不带 `.html`

## 目录结构

```text
myblog/
├── .github/workflows/deploy.yml   # CI/CD：构建 + 部署到 Pages
├── .vitepress/
│   ├── config.mts                 # 站点配置（导航/侧边栏/搜索/主题）
│   ├── posts.data.ts              # 文章数据加载器
│   ├── theme/                     # 自定义主题（TencentHome 等组件 + 样式）
│   └── dist/                      # 构建产物（自动生成，勿手改）
├── public/                        # favicon、logo 等静态资源
├── Tech/                          # 技术笔记文章（Markdown）
├── Product/                       # 产品分析文章
├── ACGN/                          # ACGN 评价文章
├── Project/                       # 项目复盘文章
├── Growth/                        # 成长思考文章
├── English/                       # 英语学习文章
├── Me/                            # 关于我文章
├── news/                          # 资讯观察归档
├── index.md                       # 首页（腾讯招聘风格长滚动页）
└── README.md                      # 本文件（仓库说明，不进入站点构建）
```

> 侧边栏由 `config.mts` 按目录自动收集文章（`title` / `date` 取自 frontmatter），新增文章无需手改配置。

## 本地开发

```bash
pnpm install     # 安装依赖
pnpm dev         # 启动开发服务器（默认 http://localhost:5173）
pnpm build       # 构建到 .vitepress/dist
pnpm preview     # 本地预览构建产物
```

## 写文章

在对应专区目录下新建 `.md` 文件，填好 frontmatter 即可，`config.mts` 会自动收录：

```markdown
---
title: 文章标题
description: 一句话摘要（会显示在列表与搜索结果里）
date: 2026-09-01
tags: [标签1, 标签2]
category: Growth          # 与所在目录对应的专区名
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

## License

MIT
