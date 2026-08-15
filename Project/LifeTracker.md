---
title: LifeTracker 项目分析报告
description: 跨端番茄钟时间管理应用复盘：洋葱架构、游戏化成长系统与多端打包能力，v1 至 v4 迭代总结。
date: 2026-08-15
tags: [项目复盘, Vue 3, TypeScript, 番茄钟, 洋葱架构, PWA]
category: Project
---

# LifeTracker 项目分析报告

> **项目名称**：LifeTracker
> **当前版本**：v4（迭代至 v5 规划中）
> **文档生成日期**：2026-08-15
> **项目类型**：跨端时间管理 / 番茄钟应用（PWA + Android APK）

---

## 一、项目背景

LifeTracker 起源于对传统时间管理工具"操作负担过重"的痛点反思。市面上多数番茄钟应用要求用户在每次专注前后手动创建任务、填写分类、录入时长，频繁的上下文切换反而打断了心流状态。

本项目以 **"零额外操作统计"** 为核心理念——用户只需开启番茄钟，系统自动记录全部工作与休息时段，并在此基础上逐步扩展出数据可视化、主题个性化、游戏化成长等能力，目标是从一个"计时工具"演进为一个"自律伴侣"。

::: tip 核心理念
零额外操作统计：开启番茄钟即完成记录，一切统计自动发生，用户无需手动录入时间块。
:::

项目采用 **Ralph 任务执行框架** 驱动 AI 辅助开发，通过 `prd.json` 定义 User Story 清单，以每周一个可交付增量的节奏快速迭代，目前已完成 v1 → v4 四个大版本的演进，并启动 v5 数据底座重构规划。

### 迭代历程

| 版本 | 核心定位 | 关键里程碑 |
| --- | --- | --- |
| v1 | 基础计时 | 番茄钟核心引擎、LocalStorage 持久化 |
| v2 | MVP 成型 | 日视图、设置页、洋葱架构落地、26 项单元测试 |
| v3 | 智慧增强 | 任务分组、每日备忘录、常驻番茄钟 |
| v4 | 伴侣化 | ECharts 三维图表、7 套主题配色、灵宠成长系统、底部导航、Capacitor 打包 |
| v5（规划中） | 数据底座 | IndexedDB 迁移、导出 JSON/CSV、数据一致性加固 |

---

## 二、项目目的

### 2.1 核心目标

- **降低记录摩擦**：番茄钟自动统计，用户无需手动录入时间块
- **提供数据洞察**：通过甘特图、环形图、堆叠图三维度复盘时间分配
- **增强持续动力**：游戏化成长系统（种树 / 灵宠 / 拼图）让坚持可视化
- **适配多端场景**：桌面 Web + 移动 Web + Android APK 一致体验
- **保障数据主权**：纯本地存储，支持导出，不依赖后端服务

### 2.2 设计原则

1. **领域纯净**：核心逻辑零外部依赖，不绑定 UI 框架或存储实现
2. **渐进增强**：新功能不得破坏已有测试用例
3. **依赖倒置**：严格遵循洋葱架构，外层依赖内层抽象
4. **配置驱动**：时长、主题、铃声等均通过设置项动态调整

---

## 三、目标用户

| 用户画像 | 核心诉求 | 典型场景 |
| --- | --- | --- |
| **学生群体** | 专注学习、追踪复习时长、备考节奏管理 | 考研 / 考证期间每日番茄钟打卡，周视图复盘各科时间分配 |
| **自律极客** | 数据驱动、高度自定义、本地数据主权 | 多主题切换、铃声自定义、JSON 数据导出分析 |
| **自由职业者** | 多任务并行、项目时间核算 | 任务分组 / 标签分类，按项目统计投入时长 |
| **习惯养成者** | 正向反馈、游戏化激励 | 灵宠成长、种树系统，累计专注次数解锁新阶段 |

**使用环境**：桌面浏览器（Chrome / Edge）为主，移动端浏览器与 Android APK 为辅，支持离线使用（PWA 特性）。

---

## 四、核心功能

### 4.1 技术栈

| 类别 | 技术选型 | 版本 | 用途 |
| --- | --- | --- | --- |
| **前端框架** | Vue 3 | ^3.5.13 | Composition API + `<script setup lang="ts">` |
| **语言** | TypeScript | ~5.7.3 | 全链路类型安全 |
| **构建工具** | Vite | ^6.2.1 | 开发服务器 + 生产构建，路径别名配置 |
| **状态管理** | Pinia | ^3.0.1 | 5 个 Store：settings / theme / taskCreate / growth / permanentPomodoro |
| **路由** | Vue Router | ^4.6.4 | Hash 模式，6 个路由页，懒加载 |
| **图表库** | ECharts | ^6.0.0 | 甘特图 / 环形图 / 堆叠柱状图 |
| **跨端打包** | Capacitor | ^8.3.1 | Web → Android APK，含 `@capacitor/android` |
| **测试框架** | Vitest | ^3.0.7 | 单元测试 + Vue Test Utils 组件测试 |
| **测试环境** | happy-dom + fake-indexeddb | — | DOM 模拟 + IndexedDB 模拟 |
| **音频** | Web Audio API | 原生 | 提示音合成，支持用户上传本地 mp3/wav |
| **存储** | localStorage（当前）/ IndexedDB（规划） | — | 以 `lifetracker/` 为前缀的键空间 |

### 4.2 项目结构目录

```text
LifeTracker/
├── src/                          # 源代码（洋葱架构四层）
│   ├── domain/                   # 🧅 领域层（零外部依赖）
│   │   ├── entities/             # 12 个领域实体
│   │   │   ├── PomodoroEngine.ts       # 番茄钟计时引擎核心
│   │   │   ├── PomodoroConfig.ts       # 配置实体
│   │   │   ├── TaskRecord.ts           # 任务记录实体
│   │   │   ├── GrowthSystem.ts         # 灵宠成长系统逻辑
│   │   │   ├── Theme.ts                # 主题定义实体
│   │   │   ├── Memo.ts / Todo.ts       # 备忘录 / 待办实体
│   │   │   ├── PermanentPomodoro.ts    # 常驻番茄钟实体
│   │   │   ├── PomodoroFolder.ts       # 文件夹实体
│   │   │   ├── TagCategory.ts          # 标签分类实体
│   │   │   ├── ChartSettings.ts        # 图表配置实体
│   │   │   └── TimerState.ts           # 计时器状态枚举
│   │   ├── interfaces/           # 7 个领域接口（依赖倒置）
│   │   │   ├── ITaskRepository.ts
│   │   │   ├── IStorageService.ts
│   │   │   ├── IMemoRepository.ts
│   │   │   ├── ITodoRepository.ts
│   │   │   ├── IGrowthRepository.ts
│   │   │   ├── ISoundService.ts
│   │   │   └── IFutureServices.ts      # 未来扩展占位
│   │   └── services/             # 领域服务
│   │       └── groupingStrategy.ts     # 任务分组策略
│   │
│   ├── application/              # 🧅 应用层（状态管理 + 用例编排）
│   │   ├── stores/               # 5 个 Pinia Store
│   │   │   ├── settingsStore.ts        # 用户设置（时长/通知/背景）
│   │   │   ├── themeStore.ts           # 主题/配色状态
│   │   │   ├── taskCreateStore.ts      # 任务创建流程状态
│   │   │   ├── growthStore.ts          # 灵宠成长状态
│   │   │   └── permanentPomodoroStore.ts  # 常驻番茄钟持久化
│   │   └── useCases/             # 用例层（预留扩展）
│   │
│   ├── infrastructure/           # 🧅 基础设施层（技术实现）
│   │   ├── storage/
│   │   │   ├── LocalStorageAdapter.ts  # localStorage 统一封装
│   │   │   └── IndexedDBAdapter.ts     # IndexedDB 适配（v5 规划）
│   │   ├── repositories/
│   │   │   ├── TaskRepository.ts       # 任务记录仓储实现
│   │   │   ├── MemoRepository.ts       # 备忘录仓储实现
│   │   │   └── TodoRepository.ts       # 待办仓储实现
│   │   └── services/
│   │       └── SoundService.ts         # Web Audio 提示音实现
│   │
│   ├── presentation/             # 🧅 表现层（UI 组件与交互）
│   │   ├── views/                # 6 个页面级视图
│   │   │   ├── PomodoroTimer.vue      # 番茄钟主页
│   │   │   ├── DailyView.vue          # 日视图 / 备忘录
│   │   │   ├── WeekView.vue           # 周视图
│   │   │   ├── ChartsView.vue         # 图表分析
│   │   │   ├── SettingsView.vue       # 设置页
│   │   │   └── PetView.vue            # 灵宠养成
│   │   ├── components/           # 16 个可复用组件
│   │   │   ├── GanttChart.vue / DonutChart.vue / StackedChart.vue
│   │   │   ├── TaskCreatePanel.vue / FolderManager.vue
│   │   │   ├── ThemeSelectorModal.vue / TagPickerModal.vue
│   │   │   ├── FullModePanel.vue / GlassCard.vue
│   │   │   └── WeekOverview.vue / WeekStats.vue / WeekSummary.vue
│   │   ├── composables/          # 5 个组合式函数
│   │   │   ├── usePomodoro.ts          # 番茄钟计时逻辑
│   │   │   ├── useChartData.ts         # 图表数据计算
│   │   │   ├── useWeekData.ts          # 周视图数据
│   │   │   ├── useMemo.ts              # 备忘录 CRUD
│   │   │   └── useInlineEdit.ts        # 行内编辑
│   │   └── router/
│   │       └── index.ts               # Vue Router 配置（hash 模式）
│   │
│   ├── styles/                   # 全局样式
│   │   ├── tokens.css                  # 设计令牌（CSS 变量）
│   │   ├── glass.css                   # 毛玻璃效果
│   │   └── themes/                     # 7 套主题文件
│   │       ├── theme-dopamine-{blue,green,red,yellow}.css
│   │       └── theme-morandi-{brown,gray,purple}.css
│   ├── App.vue                   # 根组件（双端导航 + 布局框架）
│   └── main.ts                   # 应用入口
│
├── android/                      # Capacitor Android 工程
├── dist/                         # 生产构建产物
├── docs/                         # 项目文档
│   ├── project-structure.md
│   └── improvement-roadmap.md
├── ralph/                        # Ralph AI 开发框架（含 flowchart 子项目）
├── scripts/ralph/                # 项目级 Ralph 配置
│   ├── prd.json                  # User Story 任务清单
│   ├── progress.txt              # 开发经验日志
│   └── ralph.sh                  # Ralph 循环脚本
├── tasks/                        # v5 任务规划
│   └── prd-v5-data-foundation.md
├── PRD-v1.md ~ PRD-v4.md         # 各版本产品需求文档
├── README-v2.md                  # MVP 说明文档
├── package.json                  # 依赖与脚本
├── vite.config.ts                # Vite 配置（5 个路径别名）
├── vitest.config.ts              # 测试配置
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── capacitor.config.json         # Capacitor 跨端配置
└── index.html                    # 入口 HTML
```

### 4.3 主要功能模块

#### 模块一：番茄钟计时（核心）

- **倒计时显示**：大字体 MM:SS 格式，实时进度条
- **阶段循环**：Focus → Break → Long Break，可配置周期数
- **控制操作**：Start / Pause / Resume / Stop
- **自动记录**：完成 Focus 阶段后自动创建任务记录到当日数据
- **常驻模式**：`permanentPomodoroStore` 支持后台持续计时，刷新页面不丢失
- **全屏专注**：`FullModePanel.vue` 沉浸式专注面板
- **提示音**：Web Audio API 合成柔和电子音，支持用户上传自定义铃声

#### 模块二：日视图 / 备忘录

- **记录列表**：按时间排序，显示类型徽章、名称、时间段、时长
- **手动添加**：`TaskCreatePanel.vue` 支持名称、标签、文件夹、起止时间
- **标签系统**：`TagCategory` 多级分类，`TagPickerModal` 选择
- **文件夹管理**：`PomodoroFolder` 任务分组，`FolderManager` / `FolderPickerSheet`
- **行内编辑**：`EditableVal.vue` + `useInlineEdit` 快速修改
- **备忘录**：`Memo` 实体 + `MemoRepository`，支持每日心得记录
- **待办事项**：`Todo` 实体 + `TodoRepository`

#### 模块三：周视图

- **周日历概览**：`WeekOverview.vue` 展示一周每日专注时长
- **周统计**：`WeekStats.vue` 汇总数据
- **周总结**：`WeekSummary.vue` 面板化展示
- **数据计算**：`useWeekData.ts` 聚合跨日记录

#### 模块四：图表分析（数据洞察）

- **横向甘特图**：`GanttChart.vue` — 当日所有任务时间块，横轴 0-24 点，支持缩放拖拽
- **环形图**：`DonutChart.vue` — 学习/娱乐/日常/休息四类时长占比，中心显示总专注小时数，支持日/周/月切换
- **堆叠柱状图**：`StackedChart.vue` — 月度趋势，可选日/周/月粒度
- **数据聚合**：`useChartData.ts` 统一处理仓储数据 → ECharts 格式转换
- **图表配置**：`ChartSettings` 实体管理粒度与显示选项

#### 模块五：主题与个性化

- **7 套配色方案**：
  - 多巴胺系列：蓝 / 绿 / 红 / 黄（高饱和活力色）
  - 莫兰迪系列：棕 / 灰 / 紫（低饱和高级灰）
- **CSS 变量驱动**：`tokens.css` 定义设计令牌，主题文件覆盖变量
- **即时响应**：图表、进度条、任务块、灵宠场景随主题切换实时变色
- **毛玻璃 UI**：`glass.css` + `GlassCard.vue` 统一卡片质感
- **自定义背景**：支持用户上传背景图片

#### 模块六：灵宠成长系统（游戏化）

- **成长引擎**：`GrowthSystem.ts` 纯逻辑 — 10 阶段，输入累计专注次数，输出阶段级别与进度
- **三种成长主题**：
  1. **种树**：种子 → 发芽 → 小树 → 茁壮 → 花苞 → 开花 → 结果 → 大树 → 树林 → 森林
  2. **灵宠**：幼态 → 初态 → 中态 → 成熟态 → 超进化 → 完全体 → 究极体 → 传说 → 神话 → 创世
  3. **拼图复现**：用户上传图片，每升一级解锁一块区域清晰度
- **状态管理**：`growthStore.ts` 跨日期累计专注次数
- **UI 展示**：`PetView.vue` 顶部阶段名称 + 进度条，主体 SVG/CSS 动画形象

#### 模块七：设置与数据管理

- **时长配置**：专注 1-60 分钟、休息 1-30 分钟、长休息、周期数
- **铃声设置**：专注/休息结束铃声，支持本地上传 mp3/wav + 试听
- **主题切换**：`ThemeSelectorModal.vue` 可视化选择
- **数据存储**：localStorage 键空间 `lifetracker/`
  - `lifetracker/config/settings.json`
  - `lifetracker/data/YYYY/MM/YYYY-MM-DD.json`
- **v5 规划**：IndexedDB 迁移、JSON/CSV 导出、数据一致性加固

#### 模块八：跨端适配

- **响应式导航**：PC 端顶部横向导航，移动端底部六标签导航
- **安全区适配**：`env(safe-area-inset-bottom)` 处理刘海屏
- **页面缓存**：`keep-alive` 保留番茄钟/图表/灵宠页状态
- **Capacitor 打包**：`npm run build:android` 一键构建 Debug APK
- **路由模式**：Hash 模式，兼容静态托管与 WebView

### 4.4 主要应用技术

#### 洋葱架构（Onion Architecture）

依赖方向：`Presentation → Application → Domain ← Infrastructure`

```text
┌─────────────────────────────────────────┐
│  Presentation Layer                     │  Vue Components, Composables, Router
│  PomodoroTimer.vue, ChartsView.vue ...  │
├─────────────────────────────────────────┤
│  Application Layer                      │  Pinia Stores, Use Cases
│  settingsStore, themeStore ...          │
├─────────────────────────────────────────┤
│  Domain Layer                           │  Pure TypeScript, 零框架依赖
│  Entities, Interfaces, Services         │  可独立测试
├─────────────────────────────────────────┤
│  Infrastructure Layer                   │  技术适配器
│  LocalStorageAdapter, TaskRepository ...│  实现 Domain 定义的接口
└─────────────────────────────────────────┘
```

**核心约束**：

- Domain 层不 import Vue / Pinia / 浏览器 API
- Application 层通过接口依赖 Infrastructure
- Infrastructure 实现 Domain 定义的抽象接口
- Presentation 只调用 Application 层，不直接操作存储

#### 路径别名系统

`vite.config.ts` 配置 5 个别名，配合 `tsconfig` 实现类型安全的分层导入：

| 别名 | 指向 | 用途 |
| --- | --- | --- |
| `@` | `./src` | 通用入口 |
| `@domain` | `./src/domain` | 领域层 |
| `@application` | `./src/application` | 应用层 |
| `@infrastructure` | `./src/infrastructure` | 基础设施层 |
| `@presentation` | `./src/presentation` | 表现层 |

#### 依赖注入

`App.vue` 通过 `provide` 注入仓储实例，子组件通过 `inject` 获取，实现表现层与基础设施的解耦：

```typescript
provide('taskRepo', taskRepo)
provide('memoRepo', memoRepo)
provide('todoRepo', todoRepo)
```

#### AI 辅助开发（Ralph 框架）

项目集成 Ralph 循环脚本，通过 `prd.json` 定义 User Story 清单，AI Agent 按清单逐项实现并自动运行测试验证，`progress.txt` 记录开发经验。

---

## 五、结果与反馈

### 5.1 已交付成果

| 维度 | 成果 | 量化指标 |
| --- | --- | --- |
| **功能完整度** | 8 大功能模块全部落地 | 6 个路由页 + 16 个组件 + 5 个 Store |
| **架构质量** | 严格洋葱架构四层分离 | 12 个领域实体 + 7 个接口 + 3 个仓储实现 |
| **测试覆盖** | 领域层 + 组件层单元测试 | v2 阶段 26 项测试全通过，v4 持续扩充 |
| **主题系统** | 7 套配色 + 黑夜模式 | 4 多巴胺 + 3 莫兰迪，CSS 变量驱动 |
| **跨端能力** | Web + Android 双端 | Capacitor 8.3.1，`build:android` 一键打包 |
| **文档体系** | 4 版 PRD + README + 结构文档 + 路线图 | PRD-v1 ~ v4 累计约 50,000 字 |
| **构建产物** | 生产构建可用 | `dist/` 含代码分割，图表独立 chunk（1.1MB） |

### 5.2 技术亮点

1. **纯领域引擎**：`PomodoroEngine` 与 `GrowthSystem` 完全脱离 Vue，可在任意 JS 环境运行
2. **常驻计时**：`permanentPomodoroStore` 解决了传统番茄钟刷新页面即丢失的痛点
3. **数据转换层**：`useChartData` 统一仓储数据 → ECharts 格式，图表组件只关心渲染
4. **主题零侵入**：CSS 变量方案使主题切换无需重渲染组件，仅改变量值即可

### 5.3 已知问题与改进方向

::: warning
以下待办事项基于 `docs/improvement-roadmap.md` 的规划，尚未全部落地。
:::

#### P0 — 数据一致性（高优先级）

- 自动化测试：mock 数据快照，遍历所有图表对比总时长与分类占比
- 写入唯一性：确认所有记录只通过 `TaskRepository` 写入
- 时区边界：验证 23:50 → 00:20 跨日任务的当日概览分割
- 编辑级联：明确标签修改/删除后历史数据的处理策略
- 存储审查：检查 localStorage 数据结构，预留版本字段

#### P0 — 存储迁移与导出

- IndexedDB 迁移：检测可用性 → 新建 `PomodoroDB` → 迁移旧数据
- 导出 JSON / CSV：包含全部记录、标签、设置、主题
- 隐私弹窗：导出前提示数据敏感性

#### P1 — 性能与稳定性

- Lighthouse 性能指标：FCP/LCP < 1.5s
- 大数据压测：1000 条记录下图表渲染 < 500ms，否则引入 Web Worker
- 虚拟列表：习惯列表超 100 项时启用虚拟滚动
- 全局错误捕获：`app.config.errorHandler` + 降级 UI

#### P1 — APK 打包完善

- Capacitor Share 插件集成（微信/QQ 分享）
- 真机调试流程标准化

#### P2 — 产品功能

- 双环图、甘特图重设计（v5 图表需求）
- 拖拽分类交互
- 分享打包：zip（JSON + CSV + 图表截图）

### 5.4 项目价值总结

LifeTracker 不仅是一个功能完备的番茄钟应用，更是一个 **架构示范项目**：

- **工程价值**：严格的洋葱架构 + 依赖倒置 + 路径别名分层，为中型前端项目提供了可复用的组织范式
- **测试价值**：领域层纯逻辑可独立测试，Vitest + happy-dom 方案轻量高效
- **产品价值**：从"工具"到"伴侣"的演进路径清晰，游戏化 + 数据可视化双轮驱动用户留存
- **方法论价值**：Ralph AI 辅助开发框架的实践，验证了 PRD 驱动 + 自动测试的迭代模式

---

> 本报告基于项目根目录下 `package.json`、`PRD-v1~v4.md`、`README-v2.md`、`docs/`、`src/` 目录结构及源码分析生成。

---

## 相关阅读

- [TimeLine 个人学习时间线（PRD）](/Project/PRD_TimeLine个人学习时间线)：同为时间管理与学习记录类应用
- [Everything Agent](/Project/BasedOnEverythingAgent)：同为 AI 辅助开发的完整实践
- [myblog 项目复盘](/Project/myblog)：本博客的项目复盘文章
