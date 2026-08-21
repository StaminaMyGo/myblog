# About Me 页面重构 · 界面效果与动效需求说明

> 文档版本：v1.0
> 更新日期：2026-08-20
> 目标页面：`/Me/`（`Me/index.md`）
> 输入依据：
> - **交互与动效权威**：《Kimi-About-Us-动效拆解与分析文档》（`F:\8月重新考研\个人博客\Tech\Kimi-About-Us-动效拆解与分析文档.md`）
> - **视觉与设计权威**：本站 `Minimal-design-analysis.md` 设计系统 + 已落地的 `.vitepress/theme/style/vars.css`（`--mb-*` 令牌）
> - **内容素材**：`Me/index.md`（五章结构）、`Me/个人介绍.md`（详细履历）、`posts.data.ts`（文章数据源）

---

## 目录

1. [设计原则：两级权威与"像素风 → Minimal 风"翻译](#一设计原则两级权威与像素风--minimal-风翻译)
2. [现状分析](#二现状分析)
3. [目标页面架构（场景舞台模型）](#三目标页面架构场景舞台模型)
4. [场景叙事线（6 场景逐场景规格）](#四场景叙事线6-场景逐场景规格)
5. [全局动效清单与参数速查表](#五全局动效清单与参数速查表)
6. [交互规范](#六交互规范)
7. [响应式规范](#七响应式规范)
8. [无障碍规范](#八无障碍规范)
9. [性能要求](#九性能要求)
10. [技术实现方案](#十技术实现方案)
11. [需求编号清单（FR / NFR）](#十一需求编号清单fr--nfr)
12. [验收标准](#十二验收标准)
13. [开发与验证步骤](#十三开发与验证步骤)
14. [附录 A：与 Kimi 原页面对照表](#附录-a与-kimi-原页面对照表)
15. [附录 B：待确认事项](#附录-b待确认事项)

---

## 一、设计原则：两级权威与"像素风 → Minimal 风"翻译

本页面同时参考两份文档。两者存在风格张力，采用**分工原则**消解：

| 权威 | 提供 | 范围 |
|------|------|------|
| Kimi 分析文档 | **交互骨架与动效机制**：固定视口场景舞台、滚轮驱动场景切换、Canvas 背景流动、呼吸式滚动提示、词条逐条点亮、灰阶→彩色激活 | 页面"怎么动、怎么切" |
| Minimal 设计系统（vars.css） | **视觉语言与设计令牌**：单一强调色、HSL 派生表面、无装饰渐变、无 chrome 阴影、SF Pro 字体栈 | 页面"长什么样" |

**核心翻译原则**：Kimi 页面的"复古像素"视觉元素一律翻译为 Minimal 语言中的等价物，保留的是**结构与动效**，不是**像素质感**。翻译表如下：

| Kimi 像素风元素 | Minimal 翻译方案 | 理由 |
|----------------|------------------|------|
| Fusion Pixel 12px 像素字体 | 沿用系统字体栈（`--mb-sans`）；**场景编号、eyebrow、提示语用 `--mb-mono` 等宽字体** | 等宽字体保留"代码/终端"的像素气质，不破坏 SF Pro 排版系统 |
| 自定义像素光标（retrosmart） | **不启用自定义光标**；保留系统光标 | Minimal 系统强调克制，装饰性光标违背"只有内容在说话"；若坚持品牌感，见附录 B 备选方案 |
| 像素流光背景（video→canvas） | **Canvas 粒子流**：单一强调色低透明度粒子缓慢漂移 | 保留"背景层动态叙事"机制，改用 Minimal 强调色、低透明度，符合"无装饰渐变"约束 |
| 背景大图 swap（bg-about-us.png / -2.png） | **同色系表面明度切换**：场景背景在 `--mb-bg` / `--mb-bg-alt` / `--mb-tile-dark-1` 等表面令牌间过渡 | 深度来自表面明度差，而非图片换景（Minimal 的层次哲学） |
| 11 张过程图（灰阶→彩色） | **项目卡图标灰阶→强调色**：lucide 风格线描图标默认 `--mb-text-faint`，激活/悬停过渡到 `--mb-accent` | 卡片无图片素材，用图标承载"灰阶→彩色"的激活语义；若后续引入截图缩略图，可叠加 `filter: grayscale(1) → 0`（见 5.3 E4） |

> **约束**：本页面所有视觉决策不得引入设计系统之外的新颜色、渐变或阴影。动态效果只能使用 `--mb-ax-rgb`（强调色 RGB）与表面令牌。

---

## 二、现状分析

### 2.1 目标页面现状

| 项 | 现状 |
|----|------|
| 路由 | `/Me/` → `Me/index.md`，普通 VitePress 文档页（导航 + 侧边栏 + 页脚） |
| 内容 | 五章结构：身份锚点 / 能力光谱 / 行动逻辑 / 取舍立场 / 与我合作的预期 + `<PostsList category="me" />` |
| 详情页 | `Me/个人介绍.md`（职业背景 / 技术方向 / 职业目标 / 兴趣 / 代表项目 / 联系方式） |
| 问题 | 五章内容以平铺标题堆叠，无叙事节奏；作为求职作品集页面缺少"记忆点"和品牌化表达 |

### 2.2 可直接复用的现成资产

| 资产 | 位置 | 复用方式 |
|------|------|----------|
| Minimal 设计令牌 | `.vitepress/theme/style/vars.css`（`--mb-*` 全量，深浅双模式） | 场景舞台全部样式基于这些令牌 |
| 全宽页面处理模式 | `minimal.css` 的 `.VPDoc:has(.tencent-home)` 规则 | 复刻同款规则给 `.about-scene-deck`（去 padding / 隐藏 aside / 去 max-width） |
| 圆点导航模式 | `SixScreens.vue` 的 `.ss-dots` + `go(i)` | 场景舞台的侧边圆点导航直接沿用该交互与样式范式 |
| 屏高布局范式 | `SixScreens.vue` 的 `.ss-screen`（min-height: 100vh - nav） | 场景舞台的屏高基准 |
| 文章数据源 | `posts.data.ts`（`createContentLoader`） | 场景五的项目卡可 `byCat('project')` 取数（或使用下文固定清单） |
| 链接规范 | `withBase()`（TencentHome / SixScreens 均使用） | 场景内所有内部链接必须 `withBase()`（部署基路径兼容） |
| 图标风格 | TencentHome 的 lucide 线描 SVG（`stroke-width 1.8`） | 项目卡图标沿用同一套 lucide 线描风格 |
| 终端风味 | SixScreens 的 `$ whoami` eyebrow + 光标闪烁 `mb-blink` | Hero 场景 eyebrow 与光标闪烁复用 |

### 2.3 技术栈约束

- VitePress 1.6（Vue 3 + Vite 静态生成），**无 React**；页面组件为 `.vue` 单文件组件
- 项目 `package.json` 仅依赖 `vitepress` + `chokidar`；**不引入 GSAP / Framer Motion / Lenis**（与 Kimi 页面结论一致：纯 Vue 状态 + CSS transition + 原生 rAF 即可）
- 全站开启 `appearance: true`（深浅模式切换），组件必须响应 `.dark` 类变化

---

## 三、目标页面架构（场景舞台模型）

### 3.1 页面形态

将 `/Me/` 从"滚动文档页"重构为 **固定视口场景舞台**（Kimi 场景 0 的机制移植）：

```
html/body  overflow: hidden                    ← 该路由下锁定原生滚动（路由级，见 10.5）
DIV .about-scene-deck  高度 = 100svh - 顶栏高   ← 舞台 = 一屏（组件根节点）
├─ DIV.about-layer 背景层（z 0）                ← Canvas 粒子流（仅 Hero 激活）+ 表面色
├─ DIV.about-scenes 内容层（z 2，绝对定位叠放）  ← 6 个场景，全部常驻 DOM
│   ├─ SECTION.scene.scene-0（Hero）           ← 激活态 opacity 1 / 其余 opacity 0
│   ├─ SECTION.scene.scene-1（转变叙事）
│   ├─ …共 6 个场景…
├─ ASIDE.about-dots 侧边圆点导航（z 4）         ← 复用 ss-dots 范式
└─ HEADER.about-counter 场景计数器（z 4）       ← 等宽字体 "01 / 06"
```

- 滚轮 / 触控滑动 / 键盘（↑↓ 空格 Home End）/ 圆点点击 → 驱动场景索引 → 内容层淡入淡出 + 位移动画切换
- 所有场景内容**常驻 DOM**（SSR 输出全部文案，满足 SEO 与禁 JS 可读性）；非激活场景 `aria-hidden` + `pointer-events: none` + `visibility: hidden`
- 舞台内不再有页面级滚动条；每场景内部内容超高时启用场景内 `overflow-y: auto` 兜底（见 7.4）

### 3.2 布局集成方式（VitePress）

| 层 | 处理 |
|----|------|
| `Me/index.md` | frontmatter 增加 `sidebar: false`、`aside: false`，保留 `title` 与 `description`（SEO）；正文替换为 `<AboutSceneDeck />` |
| 全局 CSS | 新增 `about.css`（或追加到 `minimal.css`）：`.VPDoc:has(.about-scene-deck)` 规则去除内容容器 max-width / padding、隐藏 `.VPDocAside`、隐藏 VitePress 自动渲染的 h1 |
| 组件注册 | `theme/index.ts` 的 `enhanceApp` 中 `app.component('AboutSceneDeck', AboutSceneDeck)`（与 TencentHome/PostsList 同款注册方式） |
| 顶栏 | 保留 VitePress 全局导航（64px 固定）；舞台高度扣除顶栏，避免遮挡 |
| 侧边栏 | 本路由隐藏（`sidebar: false`）；`/Me/个人介绍` 仍可从导航与侧边栏访问 |

> 集成注意：本需求文档本身是根目录 md 文件，建议同步加入 `config.mts` 的 `srcExclude` 列表（参照 `个人博客PRD.md` 的排除方式），避免被 VitePress 渲染成页面。

### 3.3 与首页（TencentHome）的边界

- 首页 TencentHome 是**长滚动多区块页**，保留不动；About 场景舞台是**单屏场景切换页**，两者共享设计令牌但布局机制不同
- 场景舞台的 `overflow: hidden` 锁定是**路由级、生命周期内**的（组件挂载时开启、卸载时恢复），不得影响首页及其他页面滚动

---

## 四、场景叙事线（6 场景逐场景规格）

### 4.0 叙事总览

| 场景 | 编号 | 核心内容 | 数据来源 |
|------|------|----------|----------|
| S0 | 01 / 06 | Hero 身份锚点 | `Me/index.md` 第一章 + `个人介绍.md` 首段 |
| S1 | 02 / 06 | 我的转变（过去的我 ↔ 现在的我） | `个人介绍.md` 职业背景 / 技术方向 / 职业目标 |
| S2 | 03 / 06 | 行事准则（行动逻辑 + 取舍立场） | `Me/index.md` 第三、四章 |
| S3 | 04 / 06 | 能力光谱 | `Me/index.md` 第二章 |
| S4 | 05 / 06 | 与我合作的预期 | `Me/index.md` 第五章 |
| S5 | 06 / 06 | 代表项目 & 联系 | `个人介绍.md` 代表项目 / 联系方式 |

> 每个场景为独立模块，可在不破坏舞台架构的前提下增删或调序（如 S3 与 S4 对调）。默认顺序即上文。

---

### 4.1 S0 · Hero 身份锚点

**布局（桌面）**
```
全屏背景：Canvas 粒子流（低透明度强调色粒子，自上而下漂移）
中央内容（垂直居中）：
  eyebrow（mono）: $ whoami
  大标题（display，56px/600，负字距）: LyY
  副标题（body，17px）: 软件工程在读 · 准产品经理 · ENTJ 实干家
  一句介绍（body-dim）: 需求洞察 × vibe-coding × 文档整理 —— 白天写代码，晚上刷番打游戏
底部中央：呼吸式滚动提示 "下滑，认识我 · 一共六屏" + 向下箭头图标
```

**动效清单**

| # | 元素 | 效果 | 参数 |
|---|------|------|------|
| S0-1 | Canvas 粒子流背景 | 强调色粒子缓慢漂移循环（机制翻译自"像素流光"） | 详见 5.3 E1 |
| S0-2 | eyebrow / 大标题 / 副标题 / 介绍 | 场景激活时错峰入场：opacity 0→1 + translateY(24px→0) | 入场 400ms，stagger 80ms（eyebrow 先、介绍最后） |
| S0-3 | 呼吸式滚动提示 | 双层文案 opacity 交替 + 轻微位移动画（翻译自 Kimi E2） | 周期 2s，ease-in-out，无限循环 |
| S0-4 | 光标闪烁 | 复用 `mb-blink` 关键帧于姓名末尾光标 `▌` | 1.1s steps 无限 |

**内容定稿**（直接取自现有页面）

| 字段 | 文案 | 出处 |
|------|------|------|
| eyebrow | `$ whoami` | SixScreens 既有终端风味 |
| 姓名 | LyY | 个人介绍.md L12 |
| 副标题 | 软件工程在读 · 准产品经理 · ENTJ 实干家 | Me/index.md 第一章 |
| 介绍 | 需求洞察 × vibe-coding × 文档整理 —— 白天写代码，晚上刷番打游戏 | Me/index.md 第一章 + 个人介绍.md L14 |
| 提示 | 下滑，认识我 · 一共六屏 | SixScreens 既有文案 |

---

### 4.2 S1 · 我的转变（双列对比）

**布局（桌面 ≥1024px）**：左右双列对称，中间 1px 分隔线（`--mb-border`），左列 `text-right`、右列 `text-left`

```
头部：场景计数器 02 / 06 · 标题 "我的转变" · 副题 "从学习者走向实践者的五组对照"
左列「过去的我」              右列「现在的我」
─────────────────────────────
只写课堂作业代码     ↔   走完开发→构建→部署→测试→上线全流程
单打独斗             ↔   小组协作（乡村助学平台）
追求绩点高分         ↔   用 3.7 绩点换来行业视野
技术至上             ↔   技术价值 → 用户价值
跟随共识             ↔   宁准不快 · 宁深不广 · 独立思考
底部：滚动提示（transform 位移动画，同 S0 呼吸组件但无文案）
```

**对照表内容映射依据**：左列 = 学生阶段惯性；右列 = 现在的理念，逐条对应 `个人介绍.md` 的职业背景（L20-22）、技术方向（L26-36）、职业目标（L41-45）与 `Me/index.md` 第三、四章。

**动效清单**

| # | 元素 | 效果 | 参数 |
|---|------|------|------|
| S1-1 | 背景表面 | 从 Hero 的 Canvas 流背景切换为 `--mb-bg-alt` 表面 | 背景 crossfade 400ms ease-in-out |
| S1-2 | 左右列词条 | 场景激活后**逐条点亮**：非激活 opacity 0.35，激活 opacity 1 + 轻微上移 | 每条 300ms，左右同步，stagger 40ms |
| S1-3 | 中间分隔线 | 自中向两端生长（scaleX 0→1） | 400ms ease-out |
| S1-4 | 左右列标题 | 先于词条点亮：opacity + translateX（左列 -12px / 右列 +12px → 0） | 300ms |

**移动端（<1024px）**：双列改为纵向堆叠，左列在上、右列在下，分隔线变横向；词条点亮顺序不变。

---

### 4.3 S2 · 行事准则（价值观组）

**布局**：单列居中，四条准则纵向排列，最后一条（取舍立场）做**强调处理**

```
头部：03 / 06 · 标题 "我的行事准则"
① 宁准不快 —— 在 deadline 前规划好步骤
② 宁深不广 —— 按兴趣选课，深挖不铺开
③ 先独立思考，再协同对齐
④ 用视野换绩点 —— 主动放弃水课刷分，3.7 绩点换来行业视野（强调条：accent 色描边卡片）
```

**动效清单**

| # | 元素 | 效果 | 参数 |
|---|------|------|------|
| S2-1 | 准则条目 | 逐条点亮：opacity 0→1 + translateY(20px→0) | 每条 300ms，stagger 120ms |
| S2-2 | 序号（① ② ③ ④） | 等宽字体，点亮时由 `--mb-text-faint` 过渡到 `--mb-accent` | 300ms |
| S2-3 | 强调条（取舍立场） | 额外出现卡片式容器：`--mb-accent-soft` 背景 + `--mb-accent-border` 边框 + `--mb-radius-md` 圆角 | 在 ④ 点亮后 200ms 淡入，600ms 完成 |

---

### 4.4 S3 · 能力光谱

**布局**：单列五行，每行 = 能力名（左）+ 适用 → 不适用边界（右），行内水平二分

```
头部：04 / 06 · 标题 "能力光谱" · 副题 "适用于什么，不适用于什么"
需求洞察    │ 沟通厘清真实诉求      | 无对象信息的判断
vibe-coding │ 快速 demo 与可视化    | 深度后端专项
文档整理    │ 复杂文本→结构化结论    | 纯装饰排版
多视角分析  │ 平衡多方角色诉求      | 单点执行
沟通协作    │ 把握交际距离推进共识  | 纯应酬
```

**动效清单**

| # | 元素 | 效果 | 参数 |
|---|------|------|------|
| S3-1 | 能力行 | 逐行点亮：整行 opacity 0→1 + translateX(0 由 24px 归位) | 每行 300ms，stagger 80ms |
| S3-2 | 行内分隔 | 点亮时行内出现 1px 渐变细线（`--mb-border` → 透明） | 400ms ease-out |
| S3-3 | 能力名 | 点亮后 hover：文字过渡到 `--mb-accent` | 120ms（`--mb-duration`） |

> 设计说明：S1 已是双列对称对比，S3 刻意采用"行内二分"而非双列，避免连续两个同构版面。

---

### 4.5 S4 · 与我合作的预期

**布局**：单列居中，三条承诺 + 末尾 CTA 按钮

```
头部：05 / 06 · 标题 "与我合作的预期"
→ 你将会获得一份把模糊诉求整理成清晰清单的需求拆解
→ 你将会获得可运行的 demo 与可视化结果，而不是口头概念
→ 你将会获得 deadline 前的完整交付和一份可执行的复盘结论
[ 查看完整个人介绍 → ]（button-primary：accent 胶囊，--mb-radius-pill）
```

**动效清单**

| # | 元素 | 效果 | 参数 |
|---|------|------|------|
| S4-1 | 承诺条目 | 逐条点亮：opacity 0→1 + translateX(-16px→0) | 每条 300ms，stagger 150ms |
| S4-2 | 箭头前缀（→） | 点亮时 `--mb-text-faint` → `--mb-accent` | 300ms |
| S4-3 | CTA 按钮 | 全部点亮后 300ms 淡入上移；hover 切换 `--mb-accent-deep`（沿用 `.vp-button.brand` 样式） | 淡入 400ms；hover 80ms |

CTA 链接：`withBase('/Me/个人介绍')`。

---

### 4.6 S5 · 代表项目 & 联系

**布局**：上方项目卡区（5 张，`--mb-radius-lg` 卡片），下方社交链接行

```
头部：06 / 06 · 标题 "代表项目" · 副题 "每一个项目都是一次完整的从 0 到 1"
[卡1] myblog 博客站          VitePress + CI/CD 自动部署        阅读复盘 →
[卡2] LifeTracker 番茄钟      PWA + Android APK 跨端时间管理    阅读复盘 →
[卡3] Everything Agent        DeepSeek + Everything 文件检索    阅读复盘 →
[卡4] TimeLine 学习时间线      PRD 驱动的学习时间线 Web 应用     阅读复盘 →
[卡5] 乡村助学平台            React + TS 小组合作前端应用       阅读复盘 →

社交链接：GitHub 主页 · 博客仓库 · 线上地址（复用 TencentHome socials 数据与图标）
结尾提示（呼吸式，同 S0-3 组件）："欢迎通过 GitHub 找到我 —— 向上滚动重新开始"
```

**项目卡字段定稿**（链接沿用 `个人介绍.md` L57-64 的既有路径）

| 卡 | 标题 | 一行描述 | 链接 |
|----|------|----------|------|
| 1 | myblog 博客站 | 本博客 · VitePress + GitHub Actions 自动构建部署 | `/Project/myblog` |
| 2 | LifeTracker 番茄钟 | 跨端时间管理 / 番茄钟应用（PWA + Android APK） | `/Project/LifeTracker` |
| 3 | Everything Agent | DeepSeek 大模型 + Everything 索引的自然语言文件检索 | `/Project/BasedOnEverythingAgent` |
| 4 | TimeLine 学习时间线 | 以 PRD 形式设计的个人学习时间线 Web 应用 | `/Project/PRD_TimeLine个人学习时间线` |
| 5 | 乡村助学平台 | 小组合作项目 · React + TypeScript Web 前端 | `/Project/乡村建议平台-小组合作` |

> 数据源说明：默认使用上述固定清单（与详情页一致、确定性最强）；如需自动同步，可改为 `posts.data` 中 `byCat('project')` 取前 5 篇（参照 SixScreens 的取数方式）。

**动效清单**

| # | 元素 | 效果 | 参数 |
|---|------|------|------|
| S5-1 | 项目卡 | 依次入场：opacity 0→1 + translateY(24px→0)，卡内图标同步置灰 | 每卡 300ms，stagger 60ms |
| S5-2 | 卡片图标（灰阶→彩色） | 默认 `--mb-text-faint`；hover / 键盘 focus 过渡到 `--mb-accent`（机制翻译自 Kimi E4"灰阶→彩色"） | 200ms ease |
| S5-3 | 卡片边框 | hover 时边框 `--mb-border` → `--mb-accent`（沿用 SixScreens `.ss-card:hover` 范式） | 120ms |
| S5-4 | 结尾提示 | 呼吸式位移动画 + opacity 交替 | 周期 2s，无限 |

---

## 五、全局动效清单与参数速查表

### 5.1 全局级动效（G1-G4）

| # | 动效 | 触发 | 实现方式 | 参数 |
|---|------|------|----------|------|
| G1 | 场景计数器 | 常驻（S0 起） | 等宽字体 `--mb-mono`，12.5px，`--mb-text-faint`；当前场景序号为 `--mb-accent` | 位置：舞台右上（避开圆点导航） |
| G2 | 侧边圆点导航 | 常驻 | 复用 ss-dots：10px 圆形，边框 `--mb-accent`，激活实心 + scale(1.25) | 右侧垂直居中，z 4 |
| G3 | 滚动锁定 | 本路由生命周期 | `document.documentElement` 添加/移除 `about-deck-active` 类 | 见 10.5 |
| G4 | 深浅模式自适应 | 主题切换 | 组件样式全走 `--mb-*` 令牌；Canvas 通过 MutationObserver 重读 `--mb-ax-rgb` | 见 10.7 |

### 5.2 场景切换动效（S1-S3，沿用 Kimi 参数基准并适配）

| # | 动效 | 触发 | 实现方式 | 参数 |
|---|------|------|----------|------|
| S1 | 背景表面过渡 | 滚轮跨场景 | 背景层 opacity 交叉淡入淡出（表面令牌不变，仅视觉层级过渡） | 400ms ease-in-out，一次性 |
| S2 | 场景内容入场 | 场景激活 | opacity 0→1 + translateY(24px→0) | 400ms `cubic-bezier(0.22, 1, 0.36, 1)`，一次性 |
| S3 | 场景内容离场 | 场景失活 | opacity 1→0 + translateY(0→-16px) | 300ms ease-in，一次性 |

> 换场锁：切换期间（450ms）忽略新的滚轮/按键输入，防止连跳两场景。

### 5.3 元素级动效（E1-E6）

| # | 动效 | 触发 | 实现方式 | 参数 |
|---|------|------|----------|------|
| E1 | Canvas 粒子流（Hero） | 自动播放（仅 S0 激活时） | 2D canvas 全屏，粒子数组 rAF 逐帧绘制（机制翻译自 Kimi 视频→Canvas 方案，改为程序化粒子，无媒体资源） | 粒子数 = `max(20, min(80, 视口宽/20))`；半径 1–2px；速度 0.2–0.5 px/frame（按帧时间归一）；颜色 `rgb(var(--mb-ax-rgb))`，alpha 0.06–0.15；60fps |
| E2 | 呼吸式滚动提示 | 自动循环（S0、S5 结尾） | 双层同文案 span 叠放 opacity 交替 + 整体 translateY(0→6px)（翻译自 Kimi 双层 span 技术） | 周期 2s，ease-in-out，无限循环 |
| E3 | 词条逐条点亮 | 场景激活后 | 条目 `.lit` 类控制 opacity/transform，CSS transition | 300ms + 场景内 stagger 40–150ms（按场景规格） |
| E4 | 图标灰阶→彩色 | hover / 键盘 focus / 场景点亮 | `color: var(--mb-text-faint) → var(--mb-accent)` transition（无图片时不用 `filter: grayscale`；若引入截图缩略图则叠加 `filter: grayscale(1) → 0`） | 200ms ease |
| E5 | 光标闪烁 | 常驻（Hero） | 复用 `mb-blink` 关键帧 | 1.1s steps(2, start)，无限 |
| E6 | 分隔线生长 | S1 激活 | `transform: scaleX(0 → 1)`，transform-origin 中心 | 400ms ease-out |

### 5.4 动效参数速查表（实现基准）

| 动效 | 时长 | 缓动 | 周期 |
|------|------|------|------|
| 背景表面过渡 | 400ms | ease-in-out | 一次性 |
| 场景内容入场 | 400ms | cubic-bezier(0.22, 1, 0.36, 1) | 一次性 |
| 场景内容离场 | 300ms | ease-in | 一次性 |
| 词条点亮 | 300ms + stagger | ease | 一次性 |
| 图标激活 | 200ms | ease | hover/focus |
| 呼吸提示 | 2s | ease-in-out | 无限 |
| 光标闪烁 | 1.1s | steps(2, start) | 无限 |
| 粒子流 | 帧驱动 | 线性 rAF | 无限（reduced-motion 关闭） |
| 换场锁 | 450ms | — | 一次性 |

---

## 六、交互规范

### 6.1 输入驱动矩阵

| 输入 | 行为 | 边界 |
|------|------|------|
| 滚轮（wheel） | `deltaY > 0` → 下一场景；`deltaY < 0` → 上一场景 | 阈值 `|deltaY| ≥ 40px` 才触发；换场锁 450ms 内忽略；`preventDefault()` 抑制页面滚动 |
| 触控滑动 | `touchstart` 记录起点，`touchend` 计算 `deltaY` | `|deltaY| ≥ 24px` 触发；监听设为 `passive: false` 以允许 preventDefault |
| 键盘 | `↓`/`PageDown`/`Space` → 下一场景；`↑`/`PageUp` → 上一场景；`Home` → 场景 0；`End` → 末场景 | 忽略输入法组合键与可聚焦元素内部按键 |
| 圆点点击 | 直接跳转对应场景 | `go(i)` 统一入口，含边界钳制 |
| 触摸板惯性 | 由换场锁 + 阈值双重抑制连跳 | — |

### 6.2 状态机伪代码

```
state: scene = 0, total = 6, locked = false

go(target):
  target = clamp(target, 0, total-1)
  if locked or target === scene: return
  locked = true
  old = scene
  scene = target
  startExit(old)      # opacity 1→0 + translateY(0→-16px)  300ms
  startEnter(target)  # opacity 0→1 + translateY(24px→0)   400ms
  updateDots()        # 圆点激活态 + aria-current
  updateCounter()     # 01/06 → 0X/06
  if target === 0: mountCanvas() else: unmountCanvas()
  setTimeout(450ms) → locked = false

wheel / touch / keydown → 换算 target → go(target)
```

### 6.3 场景内可交互元素

- 场景 4 的 CTA 按钮、场景 5 的项目卡与社交链接：可点击、可 Tab 聚焦、focus 可见（`:focus-visible` 用 `--mb-accent` 描边）
- 非激活场景 `pointer-events: none` + `visibility: hidden`，其内部链接不接收焦点
- 圆点导航带 `aria-label`（"第 N 屏：场景名"）与 `aria-current`

### 6.4 无鼠标环境

键盘可完整遍历全部场景与内部链接；`Home`/`End` 直达首尾场景。

---

## 七、响应式规范

### 7.1 断点

| 断点 | 布局变化 |
|------|----------|
| ≥1024px（桌面） | 场景 1 双列对比；场景 5 项目卡 3 列（3+2 两行）；Hero 56px 大标题 |
| 768–1024px（平板） | 场景 1 保持双列（字距收紧）；项目卡 2 列；Hero 42px |
| <768px（移动） | 场景 1 纵向堆叠；项目卡 1 列；Hero 36px；圆点缩至 8px 并右移 8px；场景内边距 40px |

### 7.2 触控优化

- 触控滑动切换场景（阈值 24px），圆点可点击（触控目标 ≥ 40×40px 的点击热区）
- 移动端 `100svh`（回退 `100vh`）避免地址栏高度跳动

### 7.3 横屏 / 矮视口

- 舞台高度不足 480px 时，场景内容容器允许内部滚动（`overflow-y: auto`，滚动条样式沿用 minimal.css 自定义滚动条）
- 场景内容上下内边距不小于 32px

### 7.4 内容溢出兜底

所有场景内容外层容器 `max-height: 100%` + 需要时 `overflow-y: auto`；`overscroll-behavior: none` 防止滚动链穿透。

---

## 八、无障碍规范

| 项 | 要求 |
|----|------|
| `prefers-reduced-motion: reduce` | 关闭粒子流（canvas 不启动）、呼吸提示与光标闪烁、所有 transition 降为瞬时；场景切换改为纯 opacity 淡切（无位移） |
| 语义结构 | 舞台 `<main aria-label="关于我 · 场景导航">`；场景 `<section aria-labelledby>` + `aria-hidden` 管理；场景状态通过 `aria-live="polite"` 区域播报"第 N 屏：场景名" |
| 键盘导航 | 见 6.1 / 6.4 |
| 对比度 | 正文 `--mb-tx1` 于 `--mb-bg`（约 15:1）；强调色 `--mb-accent`（#0052D9 浅色 / #2997ff 深色）满足 4.5:1；禁用仅靠颜色传达状态（图标激活同时改变边框） |
| 焦点管理 | 场景切换时焦点留在圆点/舞台根，不强制移动；内部链接可 Tab 到达 |

---

## 九、性能要求

| 项 | 要求 |
|----|------|
| Canvas | 60fps；DPR 上限 2；粒子数自适应（见 E1）；`document.hidden` 或离开 S0 时暂停 rAF；离开页面组件卸载时 `cancelAnimationFrame` + 移除监听器 |
| 资源 | 页面零外部媒体资源（粒子为程序化绘制）；如后续引入截图，单图 < 300KB、lazy 加载 |
| 体积 | 组件不引入任何新依赖（Vue 内置 + rAF + 原生事件） |
| 构建 | `pnpm build` 通过；SSR 输出全部场景文案（SEO：禁用 JS 可读首屏标题与正文） |
| Lighthouse | Performance ≥ 90（移动端模拟） |
| 主题切换 | 深浅模式切换不触发 Canvas 重建，仅重读颜色变量（见 10.7） |

---

## 十、技术实现方案

### 10.1 文件清单

| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `.vitepress/theme/components/AboutSceneDeck.vue` | 场景舞台主组件（状态机 + 6 场景 + 圆点 + 计数器 + 呼吸提示） |
| 新增 | `.vitepress/theme/components/AboutFlowCanvas.vue` | 粒子流 Canvas 组件（可拆分，独立于主组件） |
| 新增 | `.vitepress/theme/style/about.css` | `.VPDoc:has(.about-scene-deck)` 布局规则 + 路由滚动锁 + 场景级令牌 |
| 修改 | `.vitepress/theme/index.ts` | `enhanceApp` 注册 `AboutSceneDeck` |
| 修改 | `.vitepress/theme/style/minimal.css` | 顶部 `@import './about.css'`（或由 index.ts 引入） |
| 修改 | `Me/index.md` | frontmatter 加 `sidebar: false`、`aside: false`；正文替换为 `<AboutSceneDeck />` |
| 可选修改 | `.vitepress/config.mts` | 将本需求文档加入 `srcExclude`（防误渲染为页面） |

### 10.2 组件结构（AboutSceneDeck.vue 骨架）

```
<script setup>
scene / total / locked 状态
wheel / touch / keydown / resize 监听（onMounted 注册，onBeforeUnmount 注销）
go(target) 统一切换入口
S1 词条数据、S3 能力行、S4 承诺、S5 项目卡 静态数据数组
withBase() 处理全部内部链接
</script>

<template>
  <div class="about-scene-deck" @wheel.prevent>
    <AboutFlowCanvas v-if="scene === 0" />
    <section class="scene" :class="{ active: scene === 0 }" :aria-hidden="scene !== 0">…S0…</section>
    <section class="scene" :class="{ active: scene === 1 }" :aria-hidden="scene !== 1">…S1…</section>
    … S2–S5 …
    <aside class="about-dots">…6 圆点…</aside>
    <header class="about-counter">0{{ scene + 1 }} / 06</header>
    <div class="about-live" aria-live="polite">第 {{ scene + 1 }} 屏：{{ sceneNames[scene] }}</div>
  </div>
</template>

<style scoped>
.scene { position: absolute; inset: 0; opacity: 0; visibility: hidden;
         transform: translateY(16px); transition: opacity .4s, transform .4s, visibility .4s; }
.scene.active { opacity: 1; visibility: visible; transform: none; }
.scene .lit { opacity: 1; transform: none; }   /* 词条点亮类 */
.scene .item { opacity: .35; transition: opacity .3s, transform .3s; }
@media (prefers-reduced-motion: reduce) { .scene { transition: none; } }
</style>
```

### 10.3 粒子流 Canvas 规范（AboutFlowCanvas.vue）

1. **尺寸**：容器尺寸 × `min(devicePixelRatio, 2)`；`ResizeObserver` 监听重建画布尺寸
2. **颜色**：`getComputedStyle(document.documentElement).getPropertyValue('--mb-ax-rgb').trim()` → `rgb(R, G, B)`；透明 alpha 0.06–0.15
3. **粒子**：初始化 `count = clamp(width / 20, 20, 80)` 个；`x, y` 随机分布，`vx ∈ [-0.1, 0.3]`、`vy ∈ [-0.3, -0.1]`（缓慢向右上漂移），半径 1–2px，可叠加轻微正弦摆动
4. **循环**：`requestAnimationFrame` + 帧时间归一（`dt`），粒子越界后重置到对侧
5. **开关**：`v-if="scene === 0"`（离开 S0 即卸载）；`document.hidden` 时暂停；`prefers-reduced-motion: reduce` 时完全不启动
6. **主题**：`MutationObserver` 监听 `documentElement.classList`（`.dark` 变化）→ 重读颜色，不重建粒子

### 10.4 呼吸提示组件（E2）

- 单组件 `<BreathHint text="…" />`：内部渲染两个相同 span 叠放（`position: absolute` 同位），各自独立 `animation: breath 2s ease-in-out infinite`，一个 delay 0、一个 delay 1s（Kimi 双层 span 技术，透明度互补）
- 提示整体附加 `translateY(0→6px)` 位移动画（见 5.3 E2）

### 10.5 路由滚动锁定

```
onMounted: document.documentElement.classList.add('about-deck-active')
onBeforeUnmount: document.documentElement.classList.remove('about-deck-active')

/* about.css */
html.about-deck-active, html.about-deck-active body { overflow: hidden; }
```

> VitePress 为 SPA 路由，切换路由时组件卸载即恢复滚动；同路由内 hash 跳转等不受影响。

### 10.6 全宽布局规则（about.css，仿 TencentHome 既有模式）

```css
.VPDoc:has(.about-scene-deck) .content-container { max-width: none !important; }
.VPDoc:has(.about-scene-deck) .VPDocAside { display: none; }
.VPDoc:has(.about-scene-deck) .content { padding: 0; }
.VPDoc:has(.about-scene-deck) .vp-doc h1 { display: none; }   /* 隐藏 frontmatter 标题 h1，Hero 自行呈现 */
.vp-doc .about-scene-deck { margin-top: 0; }
.about-scene-deck { height: calc(100svh - var(--vp-nav-height, 64px)); position: relative; overflow: hidden; }
```

### 10.7 深浅模式

- 所有颜色引用 `--mb-*` 令牌（自动随 `.dark` 切换）
- Canvas 颜色：见 10.3 第 2、6 条
- 粒子 alpha 深浅模式保持一致，仅 RGB 变化（浅色 `0, 82, 217` / 深色 `51, 150, 255`）

### 10.8 事件与清理清单

| 生命周期 | 注册 | 注销 |
|----------|------|------|
| onMounted | wheel / touchstart / touchend / keydown / resize / MutationObserver / 滚动锁 | — |
| onBeforeUnmount | — | 全部监听器、ResizeObserver、MutationObserver、cancelAnimationFrame、滚动锁移除 |

---

## 十一、需求编号清单（FR / NFR）

### 11.1 功能需求（FR）

| 编号 | 需求 | 对应 Kimi 需求 |
|------|------|----------------|
| FR-1 | 固定视口场景舞台：本路由一屏，无页面滚动条 | F1 |
| FR-2 | 滚轮 / 触控 / 键盘 / 圆点驱动场景切换，边界钳制，换场锁防连跳 | F2 |
| FR-3 | Hero 粒子流背景：程序化 Canvas 循环（不依赖媒体文件） | F3（机制移植） |
| FR-4 | 6 场景叙事线：S0 Hero / S1 转变对比 / S2 行事准则 / S3 能力光谱 / S4 合作预期 / S5 项目与联系 | F1/F2 场景骨架 |
| FR-5 | 呼吸式滚动提示（S0 与 S5 结尾） | F6 |
| FR-6 | 词条逐条点亮（S1 对照、S2 准则、S3 能力、S4 承诺） | F7 |
| FR-7 | 项目卡图标灰阶→彩色激活（hover / focus） | F8 |
| FR-8 | 响应式：≥1024px 双列、移动端纵向堆叠、断点缩放 | F9 |
| FR-9 | 场景懒加载：Canvas 仅在 S0 挂载，离开即卸载；无媒体资源 | F10（机制移植） |
| FR-10 | 场景内链接全部 `withBase()`，跳转既有文章/详情页 | — |

### 11.2 非功能需求（NFR）

| 编号 | 需求 | 对应 Kimi NFR |
|------|------|---------------|
| NFR-1 | 粒子 Canvas 60fps；无新依赖；Lighthouse Performance ≥ 90 | 性能 |
| NFR-2 | `prefers-reduced-motion` 关闭循环动画与位移；键盘完整可导航；`aria-live` 场景播报 | 无障碍 |
| NFR-3 | Chrome / Edge / Firefox / Safari 最新两版；移动端触控滑动 | 兼容 |
| NFR-4 | 场景文案 SSR 输出，禁 JS 可读首屏标题 | SEO |
| NFR-5 | 深浅模式共用一套代码路径，主题切换无闪烁无重建 | 设计系统一致性 |

---

## 十二、验收标准

### 12.1 全局

- [ ] `/Me/` 首屏 = 一屏视口，无页面滚动条；滚动锁定仅作用于本路由，离开后恢复正常滚动
- [ ] 滚轮下 / 上推进 / 回退场景，首尾边界不越界；连续快速滚动不会连跳两场景
- [ ] 桌面 / 移动端均可通过滚轮、触控滑动、键盘（↑↓ 空格 Home End）、圆点点击切换场景
- [ ] 全部场景文案在禁用 JS 时可见（SSR 输出）；页面标题与 description 正常
- [ ] 深浅模式切换后所有颜色与粒子流颜色正确跟随，无闪烁
- [ ] `prefers-reduced-motion: reduce` 下粒子流、呼吸提示、光标闪烁停止，场景切换为纯淡切
- [ ] `pnpm build` 通过；Lighthouse Performance ≥ 90

### 12.2 场景级

| 场景 | 验收点 |
|------|--------|
| S0 | 粒子流持续循环（canvas 活动，60fps）；姓名/副标题/介绍错峰入场；呼吸提示 2s 周期；光标 `▌` 闪烁；滚动提示点击/聚焦可见 |
| S1 | 5↔5 词条左右同步逐条点亮（0.35 → 1 + 上移）；分隔线自中生长；≥1024px 双列、<1024px 纵向堆叠 |
| S2 | 4 条准则逐条点亮，第 4 条出现强调卡（accent 边框 + 柔底） |
| S3 | 5 行能力逐行点亮，行内出现渐变细线；hover 能力名变强调色 |
| S4 | 3 条承诺逐条点亮；CTA 按钮最后淡入，点击跳转 `/Me/个人介绍` |
| S5 | 5 张项目卡依次入场；图标默认灰、hover/focus 变强调色；社交链接可跳转；结尾呼吸提示循环 |

### 12.3 技术级

- [ ] `AboutFlowCanvas` 离开 S0 后被卸载（无 rAF 泄漏）；页面切换路由后滚动锁定被移除
- [ ] 无新增依赖；`package.json` 无变更（除非自愿引入工具链）
- [ ] 深浅模式切换不触发 Canvas 重建，仅重读颜色

---

## 十三、开发与验证步骤

按以下顺序实施，每步完成即本地验证：

1. **新增 `about.css`**：全宽布局规则 + 滚动锁 + 场景令牌 → `pnpm dev` 验证 `/Me/` 页面容器全宽、aside 隐藏
2. **新增 `AboutFlowCanvas.vue`**：粒子流 → 在临时测试页挂载，验证粒子渲染、DPR 缩放、主题颜色重读
3. **新增 `AboutSceneDeck.vue`**：状态机 + 6 场景静态内容 + 圆点 + 计数器 → 验证滚轮 / 键盘 / 圆点切换与换场锁
4. **逐场景打磨动效**：S1 词条点亮 → S2 准则 → S3 能力 → S4 承诺 + CTA → S5 项目卡 + 呼吸提示
5. **注册与接入**：`theme/index.ts` 注册组件；`Me/index.md` 替换内容并加 frontmatter
6. **无障碍与性能**：实现 reduced-motion、键盘、aria；DevTools 性能面板跑粒子帧率；移除滚动锁验证
7. **构建与回归**：`pnpm build` + `pnpm preview` 全路由回归（首页 TencentHome、文章页、`/Me/个人介绍` 均正常）；跑 Lighthouse

**手动 QA 清单（最终验收）**：

| 场景 | 操作 | 期望 |
|------|------|------|
| 滚轮 | 在 `/Me/` 连续向下滚动 6 次 | 场景依次切换，第 6 屏后停止；向上回退正常 |
| 键盘 | 依次按 ↓↑ PageDown PageUp Space Home End | 行为符合 6.1 矩阵 |
| 触控 | DevTools 设备模拟，向上/下滑动 | 场景按阈值切换 |
| 圆点 | 点击第 1 / 3 / 6 圆点 | 直接跳转对应场景 |
| 主题 | 切换深/浅色 | 全页面 + 粒子流颜色跟随 |
| reduced-motion | DevTools 模拟 `prefers-reduced-motion: reduce` | 无循环动画，切换为淡切 |
| 移动端 | 375×667 视口 | 单列布局，无横向滚动，场景内容不溢出 |
| 回归 | 浏览首页 / 文章详情页 / `/Me/个人介绍` | 滚动正常、样式未受影响 |

---

## 附录 A：与 Kimi 原页面对照表

| Kimi 原页面 | 本页翻译实现 | 差异说明 |
|-------------|--------------|----------|
| 固定视口 + `overflow: hidden` | 路由级滚动锁定 + 一屏舞台 | 保留机制，限定路由作用域 |
| 滚轮驱动场景索引 | 同款状态机 + 换场锁 | 增加防连跳与键盘支持 |
| Hero 视频→Canvas 像素流光 | 程序化粒子流（无媒体资源） | 去掉视频依赖，保留动态背景叙事 |
| 像素字体 / 像素光标 | 等宽字体点缀 / 系统光标 | 按 Minimal 系统克制化 |
| "继续了解"呼吸提示 | 呼吸式滚动提示组件（复用双层 span 技术） | 文案与样式适配 |
| 旧思维 vs 新思维 5↔5 | 过去的我 vs 现在的我 5↔5 | 内容替换为真实履历 |
| 价值观组 | 行事准则（行动逻辑 + 取舍） | 内容替换 |
| 11 步过程图灰阶→彩色 | 5 张项目卡图标灰阶→彩色 | 数量与形态简化 |
| 全球 5 大城市 | 代表项目 + 社交联系尾场景 | 按博客定位替换 |
| 自定义光标 / 全局字体 | 不引入 | 设计系统约束 |

---

## 附录 B：待确认事项

| # | 事项 | 默认决定 | 备选 |
|---|------|----------|------|
| 1 | 自定义光标是否启用 | 不启用（遵循 Minimal 克制原则） | 若坚持品牌感：16×16 纯色圆点光标，hover 交互元素变指针（提供素材后可启用） |
| 2 | 场景 5 项目数据来源 | 固定清单（与详情页一致） | `posts.data` 自动取数（文章增删自动同步） |
| 3 | 场景数量 | 6 场景（含 Hero） | 可合并 S3 与 S4 为 5 场景；架构不受影响 |
| 4 | 是否保留 `<PostsList category="me" />` | 移除（文章入口由侧边栏与 S5 链接承接） | 若需保留，在 S5 下方追加正常滚动区块（需处理滚动冲突，默认不做） |
| 5 | 粒子流形态 | 独立漂移粒子（最小克制） | 可加粒子间连线 / 正弦波形流（更高视觉强度，默认不做） |

---

*本需求文档由 AI 根据 Kimi 动效分析文档 + 本站 Minimal 设计系统（vars.css 令牌）合成，供实现与验收使用。*