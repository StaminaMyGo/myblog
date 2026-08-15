---
title: myblog 项目 v1 说明文档
description: myblog v1 技术架构复盘：DeepSeek 橙白风格 VitePress 静态博客的选型、设计与实现。
date: 2026-08-15
tags: [VitePress, 项目复盘, 前端, DevOps]
---

# myblog 项目 v1 说明文档

myblog 是作者的个人博客静态站点项目。本文档作为 v1 技术架构复盘，从开发背景、项目目的、用户对象、核心功能到结果反馈，完整记录了这个项目的设计与实现过程。

> **项目名称**：myblog
> **版本**：0.1.0
> **类型**：DeepSeek 橙白风格个人博客（静态站点）
> **部署地址**：https://staminamygo.github.io/myblog/
> **文档日期**：2026-08-15

## 一、开发背景

### 1.1 项目起源

作者是一名"白天写代码、晚上刷番打游戏"的全栈开发者与 ACGN 爱好者，在日常学习和生活中积累了大量技术笔记、二次元心得和行业观察。但这些内容长期散落在本地文件、备忘录和社交平台中，缺乏统一的沉淀与展示渠道，myblog 正是为了解决这个问题而诞生。

### 1.2 为什么选择静态博客

在选型阶段，项目面临以下现实约束：

| 维度 | 需求 |
|------|------|
| 成本 | 零服务器费用、零运维负担 |
| 写作体验 | 纯 Markdown、键盘流、Git 版本管理 |
| 部署效率 | `git push` 后自动上线，无需手动操作 |
| 个性化 | 可深度定制主题，摆脱模板化外观 |

综合以上因素，最终选择 **VitePress + GitHub Pages** 的技术方案——纯静态、零后端、免费托管，同时保留了完整的主题定制能力。

### 1.3 与 ACGN_Page 的分工

本项目与作者的另一个项目 [ACGN_Page](https://github.com/StaminaMyGo/ACGN_Page)（FastAPI + React 动态站）形成互补：

- **myblog**：静态内容站，专注技术 / ACGN / 时事的长文内容沉淀，零成本自动部署
- **ACGN_Page**：需要注册、评论、点赞等动态交互能力的全栈应用

## 二、项目目的

### 2.1 核心目标

1. **内容沉淀**：将技术学习笔记、ACGN 作品记录、行业热点观察统一归档，形成可检索的个人知识库
2. **个人品牌**：搭建具有鲜明风格（DeepSeek 橙白 / 编辑器美学）的个人主页，展示技术能力与兴趣广度
3. **写作习惯**：降低写作门槛（Markdown + 热更新 + 自动部署），倒逼持续输出
4. **技术实践**：以博客为载体，实践 VitePress 主题开发、Vue 3 组件设计、GitHub Actions CI/CD 等前端与 DevOps 技能

### 2.2 设计理念

> **"专注内容，工具退后。"**

- 内容以纯文本 Markdown 为唯一源码，任何编辑器可读、Git 可追踪
- 主题风格服务于"沉浸式阅读"，而非喧宾夺主的视觉特效
- 部署链路完全自动化，作者只需关注写作本身

## 三、用户对象

### 3.1 主要用户

| 用户角色 | 特征 | 核心诉求 |
|----------|------|----------|
| **作者本人** | 全栈学习者 / ACGN 爱好者，偏好键盘流与终端美学 | 低门槛写作、内容可检索、风格个性化 |
| **技术读者** | 开发者、学生，关注前端 / DevOps / 编程实践 | 高质量技术笔记、可复现的实战经验 |
| **ACGN 同好** | 二次元爱好者，关注新番、Galgame、轻小说 | 作品安利与深度评论、共鸣感 |
| **行业关注者** | 对 AI / 科技动态感兴趣的读者 | 及时的热点梳理与观点输出 |

### 3.2 用户画像关键词

- 偏好深色模式与等宽字体
- 熟悉 Markdown 与命令行操作
- 对"编辑器美学"有认同感
- 重视内容质量而非花哨交互

## 四、核心功能

### 4.1 技术栈

| 层级 | 技术选型 | 版本 / 说明 |
|------|----------|-------------|
| **静态站点生成器** | VitePress | ^1.6.4（Vue 3 + Vite） |
| **UI 框架** | Vue 3 | 3.5.x（VitePress 内置） |
| **构建工具** | Vite | 5.4.x（VitePress 内置） |
| **包管理器** | pnpm | 10.x |
| **运行时** | Node.js | 22.x |
| **代码高亮** | Shiki | github-light 主题（浅色） |
| **本地搜索** | minisearch | VitePress 内置本地搜索 |
| **CI/CD** | GitHub Actions | push to main 自动触发 |
| **托管平台** | GitHub Pages | 免费静态托管 |
| **版本控制** | Git | GitHub 仓库 |

### 4.2 项目结构目录

```text
myblog/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD：构建 + 部署到 GitHub Pages
├── .vitepress/
│   ├── config.mts                  # 站点主配置（导航 / 侧边栏 / 搜索 / Markdown）
│   ├── posts.data.ts               # 文章数据加载器（自动收集五个专区文章）
│   ├── theme/
│   │   ├── index.ts                # 自定义主题入口（注册全局组件）
│   │   ├── components/
│   │   │   ├── SixScreens.vue      # 首页六屏组件（简介/项目/产品/技术/自我介绍/技术栈）
│   │   │   └── PostsList.vue       # 文章列表组件（支持五分区筛选 / 分组 / 数量限制）
│   │   └── style/
│   │       ├── vars.css            # 设计令牌（DeepSeek 橙白配色 / 字体 / 覆盖 VitePress 默认变量）
│   │       └── nerd.css            # DeepSeek 橙白主题样式
│   └── dist/                       # 构建产物（.gitignore）
├── public/
│   ├── favicon.svg                 # 站点图标
│   └── logo.svg                    # 站点 Logo
├── Tech/                           # 【分区】技术分析
│   ├── index.md                    # 分区首页
│   ├── gh-pages-ci.md              # GitHub Pages + CI/CD 实战
│   ├── vitepress-arch.md           # VitePress 架构笔记
│   ├── markdown-love.md            # 为什么我沉迷 Markdown
│   ├── myblog-V1.md                # myblog V1 技术架构复盘
│   └── 对AI不同发展阶段的猜想.md     # AI 发展猜想
├── Product/                        # 【分区】产品分析
│   ├── index.md                    # 分区首页
│   ├── Openclaw 对我的启示.md      # AI 范式转变思考
│   ├── 为什么想走产品方向.md        # 职业选择心路
│   ├── 微信输入法.md               # 效率工具拆解
│   └── 给千问的一个建议.md          # 产品建议
├── ACGN/                           # 【分区】ACGN 评价
│   ├── index.md                    # 分区首页
│   ├── 《甜蜜夏日》.md             # Galgame 评价
│   └── 《白箱》剧场版.md           # 动画剧场版评价
├── Project/                        # 【分区】项目复盘
│   ├── index.md                    # 分区首页
│   ├── myblog.md                   # myblog 项目复盘
│   ├── BasedOnEverythingAgent.md   # 文件检索 Agent
│   ├── LifeTracker.md              # 番茄钟应用
│   ├── PRD_TimeLine个人学习时间线.md # 学习时间线 PRD
│   └── 乡村建议平台-小组合作.md      # 乡村助学平台
├── Me/                             # 【分区】关于我
│   ├── index.md                    # 分区首页
│   └── 个人介绍.md                 # 个人介绍
├── news/                           # 时事热点归档（不在导航中）
│   ├── index.md                    # 归档首页
│   ├── ai-roundup-2026-08.md       # 2026-08 AI 大模型动态
│   └── dev-ecosystem.md            # 开发者生态观察
├── index.md                        # 站点首页（六屏展示）
├── about.md                        # 旧关于页（重定向到 /Me/）
├── package.json                    # 项目依赖与脚本
├── pnpm-lock.yaml                  # 依赖锁定文件
├── .gitignore                      # Git 忽略规则
└── README.md                       # 项目说明
```

### 4.3 主要功能模块

#### 4.3.1 首页六屏（SixScreens）

首页采用"六度分隔"理念的六屏滚动展示，每屏占满一屏高度，右侧圆点导航 + IntersectionObserver 高亮当前屏：

1. **个人简介**：姓名、一句话介绍 + 技能 / 兴趣标签云（Python、React、ACGN 等关键词）
2. **项目复盘**：双行布局，可左右滑动查看多篇项目复盘文章，点击跳转
3. **产品分析**：四列网格，展示最新 4 篇产品分析文章
4. **技术分析**：4×4 网格展示技术分析内容
5. **个人自我介绍**：职业背景、技术方向、职业目标
6. **网站技术栈与相关信息**：技术栈、GitHub 仓库与部署信息

#### 4.3.2 文章列表组件（PostsList）

可复用的文章列表组件，支持三种使用模式：

| Prop | 类型 | 说明 |
|------|------|------|
| `category` | string | 按分区筛选（`tech` / `product` / `acgn` / `project` / `me`） |
| `limit` | number | 限制显示文章数量 |
| `grouped` | boolean | 是否按栏目分组展示 |

- 自动从 `posts.data.ts` 加载所有文章元数据（标题、日期、标签、摘要）
- 按日期倒序排列
- 支持标签展示和文章摘要预览

#### 4.3.3 自定义布局（MyLayout）

基于 VitePress 默认布局扩展，注入两个增强元素：

- **阅读进度条**（ReadingProgress）：页面顶部的细条，实时显示当前阅读位置百分比，使用 `requestAnimationFrame` 优化滚动性能
- **底部状态栏**（StatusBar）：模拟 VS Code 底部状态栏，显示 Git 分支、编码格式（UTF-8 / LF）、包管理器（pnpm）、部署状态等装饰性信息

#### 4.3.4 五大内容分区

| 分区 | 目录 | 内容定位 | 文章数 |
|------|------|----------|--------|
| 技术分析 | `Tech/` | 编程、框架、DevOps、学习笔记与行业猜想 | 6 篇 |
| 产品分析 | `Product/` | AI 与效率工具的产品视角拆解 | 4 篇 |
| ACGN 评价 | `ACGN/` | 动画、漫画、游戏、轻小说记录与安利 | 2 篇 |
| 项目复盘 | `Project/` | 项目背景、技术栈、结果与复盘 | 5 篇 |
| 关于我 | `Me/` | 个人介绍、职业背景与联系方式 | 1 篇 |
| 时事归档 | `news/` | AI、科技、行业观察（归档，不在导航中） | 2 篇 |

每篇文章使用标准 frontmatter 元数据：

```yaml
---
title: 文章标题
description: 一句话摘要（显示在列表中）
date: 2026-08-10
tags: [标签1, 标签2]
---
```

#### 4.3.5 本地全文搜索

- 基于 VitePress 内置的 `minisearch` 本地搜索
- 构建时生成搜索索引，无需第三方服务
- 支持中文搜索，搜索按钮和结果面板已中文化

#### 4.3.6 自动化 CI/CD 部署

GitHub Actions 工作流（`deploy.yml`）实现 push 即部署：

```text
git push to main
    │
    ▼
GitHub Actions 触发
    │
    ├── Checkout 代码
    ├── Setup pnpm 10 + Node 22
    ├── pnpm install --frozen-lockfile
    ├── pnpm build（注入 BASE_PATH 环境变量）
    ├── Setup Pages
    └── Upload artifact
            │
            ▼
    Deploy to GitHub Pages
```

- **并发控制**：同一时间只允许一个部署任务（`concurrency.group: pages`）
- **base 路径自动注入**：通过 `BASE_PATH` 环境变量自动取仓库名，无需手动修改配置
- **权限最小化**：仅授予 `contents: read`、`pages: write`、`id-token: write`

## 五、主要应用技术

### 5.1 DeepSeek 橙白主题设计

自定义主题以 **DeepSeek 橙白配色（活力橙 + 白 / 浅灰 / 深灰）** 为基调，通过 CSS 变量体系实现：

| 设计令牌 | 色值 | 用途 |
|----------|------|------|
| `--mb-orange` | `#f97316` | 品牌色 / 高亮 |
| `--mb-orange-deep` | `#ea580c` | 链接 / 强调 / 悬停 |
| `--mb-bg` | `#ffffff` | 页面底色 |
| `--mb-bg-alt` | `#fff7ed` | 侧边栏 / 顶栏 |
| `--mb-bg-soft` | `#faf5ef` | 卡片 / 悬浮 |
| `--mb-bg-inset` | `#f6f8fa` | 代码块底色（浅色高亮） |
| `--mb-text` | `#1f2937` | 正文文字 |

字体栈采用等宽字体优先：`Cascadia Code → JetBrains Mono → Fira Code → Sarasa Mono SC`

### 5.2 编辑器美学细节

- **标题前缀**：`h2` 前自动添加 `## `，`h3` 前添加 `### `，模拟 Markdown 源码视图
- **h1 闪烁光标**：标题末尾的 `▌` 字符以 1.1s 周期闪烁
- **代码块窗口化**：代码块顶部模拟 macOS 窗口三色按钮（红 / 黄 / 绿），右上角显示语言标签
- **侧边栏激活指示**：当前页面前添加 `▸` 符号
- **自定义滚动条**：WebKit 滚动条 hover 时变为品牌橙色

### 5.3 VitePress 内容加载器

`posts.data.ts` 使用 VitePress 的 `createContentLoader` API，在构建时自动扫描五个专区目录下的所有 Markdown 文件，提取 frontmatter 元数据并按日期排序，生成可在组件中直接导入的静态数据。

### 5.4 Markdown 增强

- 代码块行号显示（`lineNumbers: true`）
- 图片懒加载（`lazyLoading: true`）
- 支持 VitePress 自定义容器（`::: tip` / `::: warning` / `::: danger`）
- 表格、任务列表、脚注等标准 Markdown 扩展

## 六、结果与反馈

### 6.1 项目成果

| 指标 | 数据 |
|------|------|
| 已部署页面 | 28 个（首页 + 五个分区首页 + 19 篇文章 + 归档等） |
| 文章总数 | 19 篇（技术 6 + 产品 4 + ACGN 2 + 项目 5 + 关于我 1 + 时事归档 2） |
| 自定义 Vue 组件 | 2 个（SixScreens + PostsList） |
| CI/CD 部署 | ✅ 已配置，push 自动部署 |
| 线上可用性 | ✅ 全部页面 HTTP 200 |
| 部署地址 | https://staminamygo.github.io/myblog/ |

### 6.2 已解决的问题

#### 问题一：导航点击后页面不更新

- **现象**：点击导航栏链接后 URL 变化，但页面内容未刷新
- **根因**：`vitepress-plugin-mermaid` 全局注册导致每页预加载 40+ 个 mermaid 图表子模块，阻塞 SPA 导航
- **修复**：移除全局 mermaid 插件，仅在需要图表的页面按需引入
- **验证**：修复 commit `c91b8ae`，全量 12 页面 HTTP 检测通过，导航恢复正常

#### 问题二：GitHub Pages 子路径资源 404

- **现象**：部署到 `https://<user>.github.io/myblog/` 后静态资源路径错误
- **根因**：VitePress `base` 配置默认为 `/`，未适配项目子路径
- **修复**：在 `config.mts` 中通过 `process.env.BASE_PATH` 动态读取 base，GitHub Actions 构建时自动注入仓库名
- **验证**：所有 CSS / JS / 字体 / 图标资源均返回 200

### 6.3 项目亮点

1. **零成本运行**：GitHub Pages 免费托管 + GitHub Actions 免费 CI/CD，无任何服务器支出
2. **极致写作体验**：Markdown 源码 + 热更新预览 + push 自动部署，全程键盘操作
3. **风格辨识度高**：DeepSeek 橙白配色与首页六屏在个人博客中辨识度高，文章目录与代码高亮等细节增强了阅读体验
4. **架构清晰可扩展**：五分区结构扁平，新增文章只需在对应目录新建 `.md` 文件，无需修改配置
5. **性能良好**：纯静态站点，移除冗余依赖后页面加载和导航流畅

### 6.4 后续规划

| 方向 | 具体内容 |
|------|----------|
| 内容扩充 | 持续补充技术笔记、ACGN 作品记录、行业观察文章 |
| 评论系统 | 引入 giscus 等基于 GitHub Discussions 的第三方评论方案 |
| 访问统计 | 接入 Google Analytics 或不蒜子等轻量统计 |
| RSS 订阅 | 生成 RSS feed，方便读者订阅更新 |
| 主题优化 | 移动端适配细节打磨、暗色模式支持（当前为浅色橙白主题） |
| Mermaid 按需加载 | 实现图表组件的懒加载，在需要时动态引入 |

## 相关阅读

- [GitHub Pages + CI/CD 实战：让博客自动部署](/Tech/gh-pages-ci) —— 部署链路的完整实现细节
- [VitePress 架构笔记：它到底是怎么工作的](/Tech/vitepress-arch) —— 站点底层机制的深入拆解
- [myblog 项目复盘](/Project/myblog) —— 从项目视角回看开发全过程

---

> **文档状态**：初稿
> **维护者**：LyY
> **最后更新**：2026-08-15
