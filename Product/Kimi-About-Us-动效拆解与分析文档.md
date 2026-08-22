---
title: "20260820-Kimi「About Us」页面动效拆解与分析"
description: 基于 Playwright 取证的 Kimi 团队介绍页动效逆向分析，含技术栈、核心机制与复刻蓝图，用于个人博客 About Me 页复现。
date: 2026-08-20
tags:
  - 动效拆解
  - 前端逆向
  - VitePress
  - 原型设计
  - Canvas
category: Product
---

# Kimi「About Us」页面动效拆解与分析

> 取证时间：2026-08-20
> 目标页面：`https://careers.kimi.com/about-us`（Moonshot · Kimi 团队介绍）
> 取证方式：Playwright 真实浏览器 DOM / 网络 / 计算样式取证（非目测）
> 本文档 = 详细分析 + 原型设计需求，供在个人博客 About Me 页面复现使用。

本文以真实浏览器取证为基础，逐层拆解 Kimi 团队介绍页的视觉与动效实现，并提炼出可在个人博客中复用的原型设计需求。全文分为页面概览、技术栈与实现原理、逐场景动效拆解、复刻蓝图、适配方案、原型需求、验收标准与证据索引八个部分。

::: tip 适用读者
本文同时面向前端工程师与原型设计师。技术部分解释实现原理，原型部分以表格与清单形式交付可直接执行的需求。
:::

---

## 一、页面整体概览

### 1.1 一句话定位

整个页面为**复古像素风（Retro Pixel）叙事型单屏滚动页面**：固定在一屏视口内，没有传统页面滚动，通过滚轮驱动"场景切换"，类似放映幻灯片的方式讲述 Kimi 团队的故事。

### 1.2 页面叙事线（场景流）

| # | 场景 | 核心内容 | 状态 |
| --- | --- | --- | --- |
| 0 | **Hero 首屏** | 大标题 "Build Your Own Job" + 像素流光背景 + "继续了解"滚动提示 | ✅ 已取证 |
| 1 | **探索阶段** | 左右双列对比：旧思维 vs 新思维 + 11 步过程图 | ✅ 已取证 |
| 2 | 价值观组 | 解决复杂问题 / 全球化 / 用 1% 做到 100% 之上 / 年轻不等席位 | 🟡 DOM 存在，切换机制待实现期验证 |
| 3 | **全球 5 大城市办公** | 办公地点展示 | 🟡 同上 |

> 页面标题即品牌声明："Moonshot · Kimi 团队介绍 \| 月之暗面招聘"。

::: note 关于"🟡"标记
标注 🟡 的内容为基于 DOM 结构与已取证机制的推断，需要在实际开发阶段以真实页面行为复核。
:::

---

## 二、技术栈与实现原理（取证结论）

### 2.1 技术栈清单

| 项 | 结论 | 证据 |
| --- | --- | --- |
| 框架 | **Next.js（App Router + Turbopack）** | `_next/static/chunks/turbopack-*.js` |
| 样式 | **Tailwind CSS** | `px-1 py-[2px] transition-colors duration-200` 等原子类 |
| 动画库 | **无 GSAP / 无 Framer Motion / 无 Lenis** | window 上全部探测为 false |
| 动效实现 | **React 状态机 + CSS transition** | 计算样式均为 `transition`，无 `@keyframes` 运行 |
| 像素字体 | **Fusion Pixel 12px Mono zh_hans**（.otf） | `/assets/fonts/fusion-pixel-12px-mono-zh-hans.otf` |
| 光标 | **自定义像素光标**（retrosmart 主题） | `body { cursor: url(retrosmart/default.png) 0 0, auto }` |

### 2.2 核心机制一：固定视口场景舞台（Scene Deck）

```text
html/body  overflow: hidden          ← 禁原生滚动
MAIN       h-svh + overflow-hidden   ← 舞台 = 恰好一屏
├─ DIV z-0  背景层（bg-about-us.png / bg-about-us-2.png，bg-cover）
├─ DIV z-2  内容层（场景内容，绝对定位叠放）
└─ DIV z-4  顶部导航（60px 高，absolute top-0）
```

- 页面滚动高度 = 视口高度（791px），**没有原生滚动**。
- 滚轮 / 触控事件 → React 状态推进"场景索引" → 场景内容在固定舞台上**淡入淡出 / 位移动画切换**。
- 证据：派发 10 次 `wheel` 事件后，hero 视频层被 React 卸载（video 从 DOM 消失）。

### 2.3 核心机制二：视频 → Canvas 擦帧（Hero 像素流光）

```html
<video src="pixel-flow.webm" 5.017s>
  style="position:fixed; left:-9999px; top:-9999px; width:2px; height:2px; opacity:0"
          ↑ 隐藏视频（2×2px、屏幕外、透明）作为帧源
<canvas> 全屏 2D context（1037×791）
          ↑ 每帧 drawImage(video) → 实现像素流光的循环播放
```

- 这是经典"**隐藏视频驱动 Canvas**"技巧：不引入 GSAP / WebGL，用 2D canvas 逐帧绘制视频实现复杂特效。
- 两个 video 元素 + 多个 canvas 会按场景**动态挂载 / 卸载**（hero 场景 canvas = 1，切换后 canvas = 3）。
- `pixel-flow.webm` 从网络加载时返回 **206（分片流式播放）**，用于循环动画。

### 2.4 核心机制三：自定义像素光标

- body 级 CSS：`cursor: url(https://careers.kimi.com/assets/cursors/retrosmart/default.png) 0 0, auto`
- 另有 `pointer.png`（悬停指针态）→ 交互元素上会切换光标。
- 复刻时可直接复用这两张素材，或自绘 16×16 像素光标。

---

## 三、逐场景动效拆解

### 3.1 场景 0：Hero 首屏

**布局**

- 背景：`bg-about-us.png` 全屏 `bg-cover bg-center`
- 前景：H2 标题 **"Build Your Own Job"**（居中，`text-[24px] font-normal leading-[32px]`）
- 底部：**"继续了解"** 滚动提示 + `btn-swipe-up.svg` 图标

**动效清单**

| # | 元素 | 效果 | 参数（取证值） |
| --- | --- | --- | --- |
| 1 | 背景像素流光 | video → canvas 循环动画，全屏铺满 | webm 5.017s 循环；canvas 全屏 |
| 2 | "Build Your Own Job" | 入场动画（推测淡入 / 上移，当前为静态终态 opacity:1） | — |
| 3 | "继续了解" 提示 | **上下浮动 / 呼吸闪烁**——两个绝对定位同层 span 叠放，opacity 一明一暗循环 | `absolute top-[34px]`；一层 opacity:0、两层 opacity:1（无限往返） |
| 4 | 自定义光标 | 全局像素光标 | `cursor: url(...) 0 0, auto` |

> 取证细节：同位置存在 3 个"继续了解" span，opacity 分别为 0 / 1 / 1——这是"渐隐 - 渐现"循环的标准实现（两个副本交错透明度）。

### 3.2 场景 1：探索阶段（左右双列对比）

**布局（桌面 ≥1024px）**

```text
SECTION.min-h-svh
├─ 容器1 (lg:flex, 双列)          ← 桌面布局
│   ├─ 左列（旧思维, text-right）: 单一技能 / 过去履历 / 单线程努力 / 我一直是对的 / 跟随共识的安全感
│   └─ 右列（新思维, text-left）: 通用智能 / 进化速度 / 使用 AI Scale / 追求真相的好奇 / 独立思考的审美
├─ 容器2 (lg:hidden, flex-col)   ← 移动端布局（纵向堆叠）
└─ 底部滚动提示                   ← transform 活跃（T）
```

**动效清单**

| # | 元素 | 效果 | 参数 |
| --- | --- | --- | --- |
| 1 | 背景 | 切换为 `bg-about-us-2.png` | 场景切换时背景图 swap |
| 2 | 左右列文字 | 随滚轮推进逐条"点亮"（opacity / transform 过渡） | Tailwind `transition` |
| 3 | 11 步过程图 | `process/small/01~11.png`（296×220），默认 **grayscale 灰阶**，激活 / 悬停时 `transition duration-300` 变彩色 | `object-cover transition duration-300 grayscale` |
| 4 | 过程图（移动端） | `process/phone/01~11.png` 竖版变体 | 桌面隐藏（w=0） |
| 5 | 滚动提示 | 持续位移动画（transform 非 none） | — |

**关键叙事结构**：5 个旧思维词条（左）↔ 5 个新思维词条（右）**一一对应**，形成"从过去到未来"的观念转变叙事——滚动逐条点亮。

### 3.3 场景 2+（推断，待实现期验证）

- 价值观组：解决复杂问题 / 一开始就是全球化 / 用 1%，做到 100% 之上 / 年轻，不等席位
- 全球 5 大城市办公
- 推测为后续场景，沿用同一"滚轮切换 + 淡入淡出"模式。

---

## 四、动效总清单（复刻蓝图）

### 4.1 全局级动效

| # | 动效 | 触发 | 实现方式（建议） | 参数 |
| --- | --- | --- | --- | --- |
| G1 | 自定义像素光标 | 常驻 | CSS `cursor: url()`；交互元素换 pointer 态 | 16×16 png |
| G2 | 像素字体 | 常驻 | @font-face 引入 Fusion Pixel 12px | .otf，font-display: swap |
| G3 | 固定视口舞台 | 常驻 | html/body overflow:hidden + 100svh 舞台 | — |

### 4.2 场景切换动效

| # | 动效 | 触发 | 实现方式 | 参数 |
| --- | --- | --- | --- | --- |
| S1 | 背景图淡入淡出换场 | 滚轮跨场景 | 背景层 opacity crossfade，300-500ms | ease-in-out |
| S2 | 场景内容入场 | 场景激活 | opacity 0→1 + translateY(20px→0) | 300-400ms |
| S3 | 场景内容离场 | 场景失活 | opacity 1→0 + translateY(0→-20px) | 300-400ms |
| S4 | 视频 / Canvas 层挂载卸载 | 进入 / 离开 hero | React 条件渲染 | 懒加载，退出即卸载 |

### 4.3 元素级动效

| # | 动效 | 触发 | 实现方式 | 参数 |
| --- | --- | --- | --- | --- |
| E1 | 像素流光背景（hero） | 自动播放 | **隐藏 video + 2D canvas drawImage 循环** | webm ≤6s，canvas 全屏 |
| E2 | "继续了解"呼吸提示 | 自动循环 | 双层 span opacity 交替 | 2s 周期，无限循环 |
| E3 | 概念词条逐条点亮 | 滚轮推进 | 激活态 opacity 1 / 非激活 0.4 + 过渡 | 300ms |
| E4 | 过程图灰阶 → 彩色 | 悬停 / 激活 | CSS filter grayscale + transition | 300ms |
| E5 | 滚动提示位移动画 | 常驻 | transform translateY 循环 | — |

---

## 五、复刻适配方案（个人博客「About Me」）

### 5.1 内容映射

| Kimi 页面 | 你的 About Me | 建议 |
| --- | --- | --- |
| "Build Your Own Job" | 你的姓名 / 博客名 Slogan | 保留同款大标题 + 像素流光背景 |
| 旧思维 vs 新思维 | "我的转变"（如：应试思维 vs 工程思维 / 单打独斗 vs 协作） | 保留左右对比结构，换成你的叙事 |
| 11 步过程图 | 你的成长历程 / 技能栈 / 时间线 | 可压缩为 4-6 张（AI 生成像素风图或截图加滤镜） |
| 解决复杂问题等价值观 | 你的技术信条 / 博客宗旨 | 保留逐条点亮动效 |
| 全球 5 大城市办公 | 你的坐标 / 经历城市 | 简化为 1-2 屏 |

### 5.2 技术选型建议

| 方案 | 适配度 | 说明 |
| --- | --- | --- |
| **Next.js + Tailwind（同款）** | ⭐⭐⭐ | 直接复用取证到的全部结构 |
| Vite + React + Tailwind | ⭐⭐⭐ | 更轻量，动效机制全部照搬 |
| 纯 HTML / CSS / JS | ⭐⭐ | 需手写场景状态机，但 2D canvas 与 CSS 光标不受影响 |

**必装依赖**：Fusion Pixel 字体（开源）、像素光标素材（可自绘）、`pixel-flow.webm` 可用任意像素风循环视频替代（或用 canvas 粒子自绘）。

### 5.3 场景状态机伪代码（复刻核心）

```text
sceneIndex = 0, totalScenes = N
wheel Δ > 0 → sceneIndex = min(sceneIndex + 1, N-1)
wheel Δ < 0 → sceneIndex = max(sceneIndex - 1, 0)
sceneIndex 变化 →
  backgroundLayer.opacity 交叉淡入淡出
  旧场景内容离场动画 / 新场景内容入场动画
  hero 场景(0) 激活 → 挂载 video+canvas；离开 → 卸载
```

---

## 六、原型设计需求（Requirements）

### 6.1 功能需求

- [ ] **F1 固定视口场景舞台**：整页一屏，禁原生滚动（overflow hidden）
- [ ] **F2 滚轮场景切换**：wheel / touch / 键盘(↑↓) 驱动场景索引，支持边界钳制
- [ ] **F3 Hero 像素流光**：隐藏 video → 全屏 2D canvas 循环绘制
- [ ] **F4 自定义像素光标**：全局 default 光标 + 交互元素 pointer 光标
- [ ] **F5 像素字体**：Fusion Pixel 12px 全局应用
- [ ] **F6 滚动呼吸提示**："继续了解"双层 opacity 交替动画 + 位移动画
- [ ] **F7 概念词条逐条点亮**：双列 / 单列按场景进度点亮
- [ ] **F8 灰阶 → 彩色过程图**：hover / 激活切换
- [ ] **F9 响应式**：桌面双列、移动端纵向堆叠（`lg:` 断点）
- [ ] **F10 场景懒加载**：非当前场景的媒体延迟加载，离开即卸载

### 6.2 非功能需求

| 项 | 要求 |
| --- | --- |
| 性能 | canvas 循环 60fps；媒体 < 3MB / 个；Lighthouse Performance ≥ 90 |
| 无障碍 | `prefers-reduced-motion: reduce` 时关闭循环动画；键盘可导航（↑↓）；滚动提示有 aria-label |
| 兼容 | Chrome / Edge / Firefox / Safari 最新两版；移动端触控滑动 |
| SEO | 场景文字 SSR 渲染（Next.js 默认），禁用 JS 也可见首屏标题 |

### 6.3 动效参数速查表（复刻基准）

| 动效 | 时长 | 缓动 | 周期 |
| --- | --- | --- | --- |
| 场景换场（背景 crossfade） | 400ms | ease-in-out | 一次性 |
| 内容入场 | 350ms | ease-out | 一次性 |
| 词条点亮 | 300ms | ease | 一次性 |
| 灰阶 → 彩色 | 300ms | ease | 一次性 |
| "继续了解"呼吸 | 2s | ease-in-out | 无限 |
| 像素流光 | 5s | — | 无限循环 |

---

## 七、复刻验收标准

- [ ] 页面首屏 = 一屏视口，无原生滚动条
- [ ] 滚轮下 / 上推进 / 回退场景，边界不越界
- [ ] Hero 背景像素流光持续循环（canvas 活动，60fps）
- [ ] 自定义像素光标在 body 生效，悬停交互元素变 pointer 态
- [ ] 概念词条随场景进度逐条点亮
- [ ] 过程图默认灰阶，hover 变彩色
- [ ] 桌面（≥1024px）双列布局；移动端纵向堆叠
- [ ] 离开 hero 场景后 video / canvas 被卸载（无资源泄漏）
- [ ] `prefers-reduced-motion: reduce` 下循环动画停止
- [ ] 移动端触摸滑动可切换场景

---

## 八、附：取证证据索引

| 证据 | 来源 |
| --- | --- |
| 无 GSAP / Framer / Lenis、Next.js + Turbopack | window 探测 + chunk 文件 |
| overflow:hidden、MAIN h-svh、z 分层 | computed style + getBoundingClientRect |
| 隐藏 video(2×2px, -9999px) + 全屏 2D canvas | DOM 遍历 |
| pixel-flow.webm 206 分片 | 网络请求日志 |
| 背景图 2 张、过程图 11 张、phone 变体 | 网络请求日志（/assets/scenes/about-us/**） |
| 像素光标、Fusion Pixel 字体 | computed style + document.fonts |
| wheel → video 层卸载（场景切换证据） | 派发 WheelEvent 前后 DOM 对比 |

> **待验证项**（实现期复核）：场景 2+ 的精确切换参数、"Build Your Own Job"入场动画的起止态、滚动提示位移动画的幅度。

::: note 文档生成说明
本文档由浏览器取证生成，标注"🟡"处为推断内容，需在实现期以真实页面行为复核。
:::
