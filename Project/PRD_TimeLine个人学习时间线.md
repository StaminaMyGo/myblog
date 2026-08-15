---
title: TimeLine 个人学习时间线 — 产品需求文档（PRD）
description: 以 AI 辅助全栈开发打造的双线学习时间线 PWA：云端同步、个人博客展示与 Clay 设计系统。
date: 2026-08-15
tags: [项目复盘, Vue 3, TypeScript, Supabase, PWA, PRD]
category: Project
---

# TimeLine 个人学习时间线 — 产品需求文档（PRD）

> **项目名称**：TimeLine — 个人学习时间线 Web 应用
> **技术栈**：Vue 3 + TypeScript + Vite + Pinia + Supabase + PWA
> **文档版本**：v1.0
> **最后更新**：2026-08-15

---

## 一、项目背景

### 1.1 痛点分析

在校学生与初级开发者在长期学习过程中普遍面临以下问题：

- **学习轨迹碎片化**：技术学习与考研备考双线并行，缺乏统一的记录与回溯工具，学习成果难以沉淀。
- **数据易丢失**：传统笔记分散在本地文件、备忘录、纸质本中，换设备或清理缓存后数据不可逆丢失。
- **个人品牌缺失**：技术学习者需要一个公开展示面来呈现学习历程与技术文章，但搭建独立博客成本高、维护重。
- **移动端体验差**：多数学习记录工具为桌面端设计，手机端录入与查看体验割裂。

### 1.2 项目起源

本项目由产品经理视角驱动，以「AI 辅助全栈开发」为方法论，从 0 到 1 完成需求定义、技术选型、迭代开发、部署上线的完整产品周期。项目同时作为产品经理岗位应聘的作品集项目，展示需求拆解、技术决策、AI 协作与项目管理能力。

---

## 二、项目目的

### 2.1 核心目标

| 目标维度 | 具体描述 |
| --- | --- |
| **双线并行追踪** | 支持「工程线」（技术学习）与「考研线」（备考进度）两条独立时间线，一键切换查看 |
| **云端持久化** | 基于 Supabase 实现数据云端存储与多设备同步，避免本地数据丢失 |
| **渐进式 Web 应用** | 支持桌面/手机端安装，提供接近原生 App 的离线体验与自动更新 |
| **个人品牌展示** | 内置静态博客页面，展示技术文章，支持 GitHub/Gitee 外链，兼具「学习工具」与「个人名片」双重属性 |
| **全设备可用** | 桌面端侧边栏 + 主区域布局，移动端抽屉式侧边栏，保证手机端体验 |

### 2.2 产品定位

::: tip 一句话定位
一款面向个人学习者的「时间线式学习记录 + 个人博客」PWA 应用。
:::

以时间线为核心交互范式，将碎片化的学习记录结构化呈现；同时通过博客页面提供公开展示能力，实现「私人记录」与「公开品牌」的一体化。

---

## 三、用户对象

### 3.1 目标用户画像

#### 主要用户：有技术学习与考研双重需求的在校生/应届生

- **年龄**：20–24 岁
- **身份**：计算机相关专业大三/大四学生，同时准备考研与技术学习
- **核心诉求**：
  - 需要分别追踪工程实践学习与考研备考进度
  - 希望数据云端同步，手机/电脑随时可录入
  - 需要一个展示面来呈现技术积累，辅助求职
- **使用场景**：每天学习结束后，在侧边栏表单填写「学习内容 + 日期」，发布后生成时间线节点

#### 次要用户：需要记录学习轨迹并展示个人技术博客的开发者

- **身份**：初级开发者 / 开源爱好者
- **核心诉求**：
  - 记录技术学习历程，形成可回溯的成长档案
  - 通过博客页面展示技术文章与社交链接
  - 希望零运维成本，无需自行搭建服务器

### 3.2 用户使用流程

```text
用户访问应用
    │
    ├─ 未登录 → 弹出登录弹窗 → 邮箱/密码登录
    │              │
    │              └─ 登录成功 → 数据云端同步
    │
    └─ 已登录 → 静默恢复会话
           │
           ├─ 选择「工程线」/「考研线」
           │      │
           │      └─ 侧边栏填写内容 → 发布 → 时间线节点生成
           │
           └─ 切换至博客页面 → 浏览技术文章 / 跳转 GitHub
```

---

## 四、核心功能

### 4.1 技术栈

#### 前端核心

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| **Vue** | ^3.5.32 | 渐进式前端框架，使用组合式 API（Composition API） |
| **TypeScript** | ~6.0.2 | 类型安全，提升代码可维护性 |
| **Vite** | ^7.3.2 | 下一代前端构建工具，极速 HMR 与生产构建 |
| **Pinia** | ^3.0.4 | Vue 官方状态管理库，替代 Vuex，支持组合式写法 |

#### 后端与数据

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| **Supabase** | ^2.105.1 | BaaS 平台，提供 PostgreSQL 数据库 + Auth 认证 + RLS 行级安全 |

#### PWA 与构建

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| **vite-plugin-pwa** | ^1.2.0 | Vite PWA 插件，零配置生成 Service Worker 与 Manifest |
| **workbox-build** | ^7.4.1 | Service Worker 缓存策略库，精细控制缓存行为 |
| **@vitejs/plugin-vue** | ^6.0.6 | Vue 3 单文件组件编译支持 |
| **vue-tsc** | ^3.2.7 | Vue 模板类型检查，构建前类型校验 |

### 4.2 项目结构目录

```text
TimeLine_Vue3_ts/
├── public/                      # 静态资源（PWA 图标等）
├── src/
│   ├── assets/                  # 静态素材
│   ├── components/              # 通用组件
│   │   ├── AuthModal.vue        # 登录认证弹窗
│   │   ├── EditorSidebar.vue    # 编辑侧边栏（表单 + 线路切换）
│   │   ├── InstallPrompt.vue    # PWA 安装引导弹窗
│   │   ├── TimelineDisplay.vue  # 时间线主展示区
│   │   └── UserStatus.vue       # 用户状态栏（登录/登出/线路切换）
│   ├── composables/             # 组合式函数
│   │   ├── usePWAInstall.ts     # PWA 安装逻辑封装
│   │   └── usePWAInstallTrigger.ts  # PWA 安装触发时机控制
│   ├── data/                    # 静态数据与类型定义
│   │   ├── timeline.json        # 时间线示例数据
│   │   └── types.ts             # 全局 TypeScript 类型
│   ├── layout/                  # 布局组件
│   │   └── side2main.vue        # 侧边栏 + 主区域双栏布局
│   ├── pages/                   # 页面级组件
│   │   └── BlogHome.vue         # 个人博客首页（26 篇静态文章）
│   ├── router/                  # 路由解析（轻量 hash 路由）
│   │   └── resolveRoute.ts      # 基于 URL hash 的路由解析器
│   ├── store/                   # Pinia 状态管理
│   │   ├── useAuth.ts           # 用户认证 Store（状态机模式）
│   │   ├── useTimeline.ts       # 时间线数据 Store（当前主版本）
│   │   ├── useTimelineComposable.ts  # 组合式函数版（历史版本）
│   │   └── useTimeline_pinia.ts      # Pinia Options 版（历史版本）
│   ├── styles/                  # 全局样式
│   │   └── design.css           # Clay 设计系统 CSS 变量
│   ├── utils/                   # 工具函数
│   │   └── supabase.ts          # Supabase 客户端单例
│   ├── App.vue                  # 根组件（路由分发 + 全局弹窗）
│   └── main.ts                  # 应用入口（Pinia + PWA 注册 + 认证初始化）
├── DESIGN.md                    # Clay 设计系统规范文档
├── README.md                    # 项目说明与可拓展性说明
├── vite.config.ts               # Vite 配置（含 PWA 完整配置）
├── tsconfig.json                # TypeScript 配置
├── package.json                 # 项目依赖与脚本
└── index.html                   # HTML 入口
```

### 4.3 主要功能模块

#### 模块一：双线时间线管理

- **工程线 / 考研线**：两条独立时间线，对应 Supabase 中两张独立数据表（`timeline_items` / `exam_timeline_items`）
- **CRUD 全流程**：支持新增、编辑、删除时间线节点
- **节点类型**：支持 `post`（普通记录）与 `section`（分段标签）两种节点类型
- **时间排序**：按 `created_at` 倒序排列，最新记录置顶
- **线路切换**：通过 URL hash（`#/engineering`、`#/exam`）驱动，刷新后状态保持
- **编辑态管理**：点击节点进入编辑态，`editingId` 全局追踪，切换线路自动清空

#### 模块二：用户认证与权限

- **登录方式**：邮箱 + 密码登录（Supabase Auth）
- **认证状态机**：`loading` → `authenticated` / `anon` 三态管理
  - 页面加载时先 mount 应用，再非阻塞初始化认证
  - 有会话则静默恢复，无会话则弹出登录弹窗
  - `onAuthStateChange` 监听登录/登出事件，实时同步状态
- **数据隔离**：Supabase Row Level Security（RLS）确保 `user_id = auth.uid()`，用户只能操作自己的数据
- **登出功能**：一键登出，清除本地会话状态

#### 模块三：个人博客展示

- **静态文章列表**：内置 26 篇技术文章，支持分页浏览
- **标签与分类**：侧边栏展示文章标签与分类筛选
- **社交链接**：支持 GitHub / Gitee 外链跳转
- **独立路由**：通过 `#/blog` hash 路由访问，与时间线功能解耦

#### 模块四：PWA 渐进式 Web 应用

- **桌面/移动端安装**：支持添加到主屏幕，以独立窗口运行（`display: standalone`）
- **离线可用**：Service Worker 缓存静态资源，断网后仍可浏览已加载内容
- **自动更新**：`registerType: autoUpdate`，新版本检测后自动刷新
- **安装引导弹窗**：`InstallPrompt` 组件引导用户安装，含 iOS/Android 差异化提示
- **安装触发时机控制**：`usePWAInstallTrigger` 监听登录弹窗状态，登录弹窗关闭后才注册 `beforeinstallprompt`，避免弹窗冲突

#### 模块五：响应式布局

- **桌面端（>768px）**：固定侧边栏（320px）+ 弹性主区域的双栏 Flex 布局
- **移动端（≤768px）**：侧边栏转为 fixed 定位 Drawer 模式，默认隐藏
  - 右下角 FAB 按钮（☰）控制展开/收起，带平滑过渡动画
  - 时间线节点隐藏轴线，改为纯卡片堆叠布局
  - 字号、间距、内边距等比缩小

### 4.4 主要应用技术

#### 4.4.1 Clay 设计系统

项目采用自研 **Clay 设计系统**（参考 Clay.com 品牌语言），核心特征：

- **色彩体系**：暖白画布（`#fffaf0`）+ 深色主按钮（`#0a0a0a`）+ 高饱和品牌色（Hot Pink `#ff4d8b`、Deep Teal `#1a3a3a`、Lavender `#b8a4ed`、Peach `#ffb084`、Ochre `#e8b94a`）
- **圆角系统**：6px / 8px / 12px / 16px / 24px / 9999px 六级圆角
- **排版层级**：Display（72/56/40/32px）→ Title（24/18/16px）→ Body（16/14px）→ Caption（13/12px）
- **时间线气泡**：按 `6n+1` 至 `6n+6` 循环使用不同品牌色背景，视觉节奏丰富
- **CSS 变量**：所有设计 Token 通过 `--clay-*` 变量注入 `design.css`，全局统一管理

#### 4.4.2 Supabase BaaS 架构

```text
前端 (Pinia Store)
    │  supabase-js SDK
    ▼
Supabase Auth ──→ JWT Token ──→ PostgreSQL
                                      │
                                      └─ RLS 策略: user_id = auth.uid()
```

- **数据库**：PostgreSQL，两张业务表分别存储工程线与考研线数据
- **认证**：Supabase Auth 提供邮箱密码登录，JWT 自动注入请求头
- **安全**：Row Level Security 在数据库层面强制数据隔离，前端无法越权访问
- **实时性**：SDK 内置连接池与重试机制，CRUD 操作实时生效

#### 4.4.3 PWA 缓存策略

| 资源类型 | 缓存策略 | 说明 |
| --- | --- | --- |
| 导航请求（HTML） | **NetworkFirst** | 始终优先拉取最新 HTML，避免版本错配 |
| JS / CSS | **StaleWhileRevalidate** | 先用缓存快速响应，后台静默更新 |
| 图片 | **CacheFirst** | 缓存优先，最多缓存 50 张，过期自动淘汰 |
| HTML 兜底 | `navigateFallback: null` | 禁用 HTML 离线兜底，防止旧页面残留 |

**版本更新机制**：

- `skipWaiting: true` + `clientsClaim: true`：新 Service Worker 立即激活并接管所有标签页
- 前端监听 `controllerchange` 事件，检测到 SW 更换后自动 `window.location.reload()`
- `onNeedRefresh` 回调中调用 `updateSW(true)` 强制刷新

#### 4.4.4 状态管理架构

采用 **Pinia 组合式 Store** 模式，实现组件与数据层完全解耦：

- `useTimelineStore`：封装所有时间线 CRUD 操作，组件仅调用 `fetchItems` / `addItem` / `updateItem` / `deleteItem`
- `useAuthStore`：封装认证逻辑，对外暴露 `login` / `logout` / `initAuth` 与状态变量
- 组件层不直接操作 Supabase，所有数据请求经由 Store 中转，便于后续替换后端实现

---

## 五、结果和反馈

### 5.1 功能交付清单

| 功能模块 | 交付状态 | 说明 |
| --- | --- | --- |
| 工程线 & 考研线双线时间线 | ✅ 已交付 | 支持 CRUD 全流程，双表独立存储 |
| Supabase 云端数据库 | ✅ 已交付 | PostgreSQL + RLS 行级安全 |
| 用户认证（邮箱/密码） | ✅ 已交付 | 登录状态机，含自动弹窗与静默恢复 |
| PWA 支持 | ✅ 已交付 | 桌面/手机端可安装，离线可用，自动更新 |
| 个人博客页面 | ✅ 已交付 | 26 篇静态文章 + 分页 + 标签/分类 + 社交链接 |
| 响应式布局 | ✅ 已交付 | 桌面端侧边栏 + 移动端 Drawer |
| Clay 设计系统 | ✅ 已交付 | 统一色彩、圆角、阴影、排版变量 |
| GitHub Pages 部署 | ✅ 已交付 | base 路径 `/TimeLine_Vue3_ts/` |

### 5.2 技术指标

| 指标 | 数值 |
| --- | --- |
| 构建体积 | Vite 打包后 < 200KB（不含 Supabase SDK） |
| 首屏加载（二次） | PWA 缓存策略下 < 1s |
| PWA Lighthouse 评分 | PWA 类别 > 90 |
| 源文件数量 | 约 20 个核心源文件 |
| Git 提交次数 | 13 次迭代提交 |

### 5.3 迭代历程

| 迭代 | 内容 |
| --- | --- |
| #1 | 本地时间线 MVP（Vue3 组合式 API + 响应式数据） |
| #2 | 接入 Supabase 云端数据库 |
| #3 | GitHub Pages 部署 |
| #4 | 添加登录认证 UI |
| #5 | 插入记录绑定用户 ID + 删除功能 |
| #6 | 新增考研线 + 个人博客 |
| #7 | Clay 设计系统应用 |
| #8 | 移动端响应式适配 |
| #9 | 登录逻辑重构（状态机模式） |
| #10 | 个人仓库跳转路径修正 |
| #11 | 网站 SVG 图标 |
| #12 | PWA 支持（安装 + 离线 + 缓存策略） |
| #13 | PWA install trigger 初始化 Bug 修复 |

### 5.4 核心挑战与解决方案

#### 挑战 1：云端数据同步与权限控制

- **问题**：时间线数据需多设备同步，同时保证用户只能编辑自己的数据
- **方案**：Supabase PostgreSQL + Auth + RLS，JWT 自动携带身份，数据库层面 `user_id = auth.uid()` 强制隔离

#### 挑战 2：PWA 缓存一致性

- **问题**：部署新版本后，Service Worker 缓存旧 HTML 导致用户看到过期页面，出现「新旧代码混跑」
- **方案**：`navigateFallback: null` 禁用 HTML 缓存 + `skipWaiting` / `clientsClaim` 立即生效 + `controllerchange` 监听强制刷新 + 导航请求 NetworkFirst

#### 挑战 3：PWA 安装触发时机

- **问题**：`beforeinstallprompt` 须在用户交互后注册，但应用启动自动弹出登录弹窗，导致安装提示与登录弹窗冲突
- **方案**：`usePWAInstallTrigger` 组合式函数 watch 登录弹窗状态，弹窗关闭后才注册安装监听

#### 挑战 4：双线切换数据一致性

- **问题**：切换线路时编辑状态和列表数据需正确同步，避免「在工程线编辑考研线数据」的串线问题
- **方案**：双表独立存储 + `currentLine` 状态追踪 + 切换时自动 `fetchItems` 并清空 `editingId` + hash 路由保持刷新状态

#### 挑战 5：移动端适配

- **问题**：桌面端 320px 侧边栏在手机上挤占主内容空间
- **方案**：≤768px 侧边栏转 Drawer 模式 + FAB 按钮控制 + 时间线隐藏轴线改卡片堆叠 + 字号间距等比缩小

### 5.5 产品反思与未来方向

#### 已验证的价值

::: tip 复盘结论
- **AI 辅助全栈开发可行**：在 Claude Code 辅助下，产品经理可独立完成从需求到上线的完整周期，大幅缩短「想法 → 原型」周期
- **MVP 范围控制有效**：13 次迭代每次都有可交付增量，本地 → 云端 → PWA → UI 的演进路径清晰
- **边缘体验受关注**：空状态提示、错误信息展示、离线可用性等细节均有覆盖
:::

#### 未来拓展方向

| 方向 | 说明 |
| --- | --- |
| **路由升级** | 引入 vue-router，支持更多页面与嵌套路由，当前 hash 路由可平滑迁移 |
| **分页功能** | 在 `sortedItems` 计算属性中加入 `slice` 逻辑，支持大数据量分页 |
| **后端扩展** | Store 层已封装 Supabase 调用，组件层无感知，可替换为任意后端实现 |
| **数据导出** | 支持时间线数据导出为 Markdown / JSON，便于备份与迁移 |
| **搜索与筛选** | 按日期范围、关键词、标签筛选时间线记录 |
| **社交化** | 支持公开时间线、好友关注、学习打卡分享 |

---

## 相关阅读

- [LifeTracker 项目分析报告](/Project/LifeTracker)：同为时间管理与学习记录类应用
- [myblog 项目复盘](/Project/myblog)：同为包含个人博客展示能力的项目实践
- [Everything Agent](/Project/BasedOnEverythingAgent)：同为 AI 辅助开发实践

---

> **文档维护者**：李宇扬（LyY）
> **协作工具**：Claude Code（Anthropic）
> **项目仓库**：GitHub Pages 部署中
