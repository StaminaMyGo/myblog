---
title: Everything Agent — 自然语言文件检索 Agent
description: 基于 DeepSeek 大模型与 Everything 本地索引的 Windows 文件检索智能体，实测命中率 86%。
date: 2026-08-15
tags: [项目复盘, AI Agent, DeepSeek, 本地检索, Windows]
category: Project
---

# Everything Agent — 自然语言文件检索 Agent

> 基于 DeepSeek 大模型 + Everything 本地索引的 Windows 自然语言文件检索智能体，说一句话，秒级找回你的文件。

---

## 一、项目背景

### 1.1 日常痛点

随着电脑文件数量持续增长，"上周改的课设 PPT 到底在哪"成为高频难题。现有方案存在明显短板：

- **Windows 自带搜索**：速度慢、索引不全、不支持自然语言表达
- **Everything**：毫秒级检索速度极快，但需要背诵检索语法（`ext:`、`dm:`、`size:` 等），学习成本高
- **云端 Agent（ChatGPT / Cloud Code 等）**：能理解自然语言，但处理本地文件需要多轮工具调用，网络往返慢，且存在隐私上传风险，断网即失效

核心观察：工具要么"快但难用"，要么"好用但慢"，市场缺少一个"说人话就快"的本地方案。

### 1.2 时代机遇

- 2024–2026 年 AI Agent 爆发，"智能体"概念深入人心
- "本地优先（Local-first）"趋势兴起：更快、更私密、离线可用
- 大模型的自然语言理解力 + Everything 本地索引的毫秒级速度，两者结合具备明确的产品价值

---

## 二、项目目的

将用户从繁琐的检索语法翻译中解放出来：

1. **降低使用门槛**：用户只需用自然语言描述需求（如"上周修改的课设 PPT"），系统自动补全查询条件，无需掌握 Everything 检索语法
2. **保证检索速度**：依托 Everything 本地索引，实现秒级文件召回
3. **保障数据隐私**：全部检索在本地完成，文件内容不上传云端
4. **构建数据闭环**：通过搜索历史与点击反馈积累数据，为后续排序优化奠定基础
5. **可靠性优先**：大模型解析、搜索引擎、文件定位各环节均设计降级链路，任一环节失效时整体仍可用

---

## 三、用户对象

| 用户群体 | 典型场景 | 核心诉求 |
| --- | --- | --- |
| **学生** | 课件、课设、资料散落在 D/E/F 多盘，时间紧、路径记不住 | 快速定位、说人话即可搜索 |
| **职场人** | 简历、合同、报表需随时快速调取 | 十秒内找到目标文件 |
| **开发者 / 效率爱好者** | 源码、配置文件、工具链路径深、数量大 | 精准过滤、一键定位 |

**共性需求**：说人话 → 要快 → 要准 → 能一键在资源管理器中定位。

---

## 四、核心功能

### 4.1 技术栈

| 层级 | 技术选型 | 说明 |
| --- | --- | --- |
| **前端** | React 18 + Vite 6 + lucide-react | 响应式界面，暗黑/浅色主题切换，桌面/移动端适配 |
| **后端** | FastAPI + Uvicorn（Python 3.10+） | RESTful API，CORS 支持 |
| **大模型** | DeepSeek（deepseek-v4-flash / deepseek-chat） | temperature=0 结构化 JSON 输出，多模型按序容错 |
| **检索引擎** | Everything64.dll（ctypes IPC）+ es.exe + 文件系统扫描 | 三级适配链，自动探测优先级 |
| **存储** | SQLite（WAL 模式 + 线程锁） | 搜索历史 + 点击反馈 |
| **测试** | pytest + 无头 Edge（Playwright） | 冒烟测试 + 截图验证 |

### 4.2 项目结构目录

```text
BasedOnEverythingAgent/
├── backend/                          # 后端服务
│   ├── app/
│   │   ├── agent.py                  # Sense → Think → Act 编排核心
│   │   ├── api.py                    # FastAPI 路由（/api/health、/api/search、/api/feedback、/api/open）
│   │   ├── schemas.py                # Pydantic 请求/响应模型
│   │   ├── config.py                 # 环境变量配置
│   │   ├── llm.py                    # DeepSeek 意图解析 + 本地规则降级
│   │   ├── mapper.py                 # 意图 JSON → Everything 查询语法映射
│   │   ├── reveal.py                 # Windows Shell API，资源管理器中定位文件
│   │   ├── storage.py                # SQLite 搜索日志与反馈存储
│   │   └── search/                   # 检索适配器
│   │       ├── factory.py            # 后端自动探测与选择
│   │       ├── dll_backend.py        # Everything64.dll（ctypes）
│   │       ├── es_backend.py         # es.exe 命令行工具
│   │       └── fs_backend.py         # 文件系统兜底扫描
│   ├── data/agent.db                 # SQLite 数据库
│   ├── run.py                        # 后端启动入口
│   ├── smoke_test.py                 # 直连 Agent 冒烟测试
│   ├── api_smoke.py                  # HTTP API 端到端测试
│   ├── test_explorer.py              # 资源管理器定位测试
│   └── test_reveal.py                # reveal 功能测试
├── frontend/                         # 前端应用
│   ├── src/
│   │   ├── App.jsx                   # 主界面（DeepSeek 风格响应式 UI）
│   │   ├── api.js                    # 后端 API 封装
│   │   └── styles.css                # 全局样式（暗黑/浅色主题）
│   ├── dist/                         # 构建产物
│   ├── verify.mjs                    # 无头 Edge 截图验证脚本
│   ├── package.json
│   └── pnpm-lock.yaml
├── tools/                            # 第三方工具
│   ├── sdk/dll/Everything64.dll      # Everything 1.4.1 SDK
│   └── es/es.exe                     # Everything 命令行工具
├── README.md                         # 项目说明
├── AGENT_INTRO.md                    # 技术栈与架构介绍
├── build_ppt.py                      # PPT 生成脚本
├── PPT内容大纲_24页.txt              # 作品集 PPT 大纲
└── 自然语言检索Agent_作品集_24页.pptx # 作品集 PPT
```

### 4.3 主要功能模块

#### 4.3.1 Sense 感知层 — 自然语言意图解析

- 优先调用 DeepSeek API，通过 System Prompt 约束输出固定 JSON Schema（关键词、扩展名、时间范围、大小、路径等 8 个字段）
- 中文时间词智能转换："昨天" → `start=1,end=1`；"上周" → `7..13`；"最近3天" → `0..3`
- 中文类型词智能转换："PPT" → `pptx`；"图片" → `jpg/jpeg/png/gif/webp`；"视频" → `mp4/mkv/avi`
- **可靠性降级**：未配置 API Key / 超时 / 解析失败时，自动降级为本地正则规则解析，完全离线可用

#### 4.3.2 Think 思考层 — 查询语法映射

将意图 JSON 映射为 Everything 查询语法：

| 意图字段 | 映射语法 | 示例 |
| --- | --- | --- |
| keywords | 文件名关键词（含空格自动加引号） | `课设` |
| extensions | `ext:` 多扩展名分号分隔 | `ext:pptx;pdf` |
| 时间范围 | `dm:开始..结束` | `dm:2026-07-28..2026-08-03` |
| 大小 | `size:>` 字节（MB 自动换算） | `size:>5242880` |
| 路径 | `path:"路径"` | `path:"D:\课件"` |
| 文件夹/文件 | `folder:` / `!folder:` | `!folder:` |

::: tip 示例
输入"上周修改的课设 PPT" → 生成 `课设 ext:pptx dm:2026-07-28..2026-08-03`。
:::

#### 4.3.3 Act 执行层 — 三级检索适配链

按优先级自动探测，无需用户配置：

| 优先级 | 引擎 | 特点 |
| --- | --- | --- |
| 第 1 级 | **Everything64.dll**（ctypes IPC） | 最快，毫秒级，Everything 1.4.1 SDK |
| 第 2 级 | **es.exe**（官方命令行工具） | 兼容兜底 |
| 第 3 级 | **文件系统扫描** | 保底可用，默认根目录为用户 Documents |

每次检索记录所用引擎，便于观测与问题排查。

#### 4.3.4 搜索-反馈数据闭环

- SQLite（WAL 模式）记录每条搜索：查询原文 / 意图 JSON / 生成语法 / 引擎 / 耗时 / 结果数
- 记录每次点击反馈：哪个文件、排第几、什么动作
- 价值：从"能搜到"到"越用越准"，为排序优化积累训练数据

#### 4.3.5 前端交互体验

- DeepSeek 风格响应式界面，暗黑/浅色主题自动跟随系统
- 文件类型标签筛选：全部 / 文件夹 / PDF / Word / MD / TXT + 用户自定义扩展名
- 标签支持展开全部、新增、删除、点击高亮，高频类型一步过滤
- 结果卡片展示文件图标、大小、修改时间，点击高亮
- 一键在资源管理器中定位文件（Windows Shell API）

### 4.4 主要应用技术

- **大模型结构化输出**：temperature=0 + JSON Schema 约束，保证意图解析稳定性
- **ctypes 本地 IPC 调用**：直接调用 Everything64.dll，避免进程启动开销
- **多级降级容错架构**：LLM → 本地规则、DLL → es.exe → 文件系统，每层独立可替换可降级
- **SQLite WAL 模式**：高并发读写下保证数据一致性
- **Pydantic 数据校验**：请求/响应强类型约束
- **Playwright 无头浏览器验证**：桌面/移动端、暗黑/浅色模式自动化截图测试
- **环境变量全配置化**：API Key、模型、端口、TopN、兜底根目录均可通过环境变量调整

---

## 五、结果和反馈

### 5.1 实测数据

| 指标 | 数值 |
| --- | --- |
| 真实查询次数 | 22 次 |
| 成功命中次数 | 19 次 |
| **命中率** | **86%** |
| 端到端中位耗时（含大模型解析） | 3.36 秒 |
| 最快响应 | 1.54 秒 |
| 真实点击反馈 | 9 次 |

### 5.2 已验证能力

- DeepSeek `deepseek-v4-flash` 稳定返回结构化意图 JSON
- `Everything64.dll` 引擎返回真实文件结果（支持 `ext:txt !folder:` 等复杂查询）
- 桌面端与移动端布局、暗黑/浅色模式均通过无头 Edge 截图验证
- 三级检索降级链在 IPC 不可用时可正常回退

### 5.3 已知限制

::: warning
- 时间/大小等条件由 Everything 原生语法过滤，**文件内容全文搜索不在范围**
- 本原型仅面向 **Windows + Everything**，不包含跨平台支持
- 前端工具按钮（AI 解析 / Everything 索引）当前为展示状态，尚未接入开关逻辑
:::

### 5.4 后续优化方向

- 基于点击反馈数据优化结果排序算法
- 支持文件内容全文检索（结合本地索引引擎）
- 扩展更多文件类型预设与智能推荐
- 探索跨平台适配方案

---

## 相关阅读

- [对 AI 不同发展阶段的猜想](/Tech/对AI不同发展阶段的猜想)：大模型能力边界的延伸思考
- [TimeLine 个人学习时间线（PRD）](/Project/PRD_TimeLine个人学习时间线)：同为 AI 辅助全栈开发的完整实践
- [LifeTracker 项目分析报告](/Project/LifeTracker)：Ralph 框架驱动的 AI 辅助开发实践

---

*文档生成时间：2026-08-15*
