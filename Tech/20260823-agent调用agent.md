---
title: "20260823-agent 调用 agent：/handoff 技能的设计思路"
description: 解析 Matt Pocock 的 /handoff 技能——如何将当前会话上下文压缩为 Markdown 文档，交付给全新的 Agent 继续执行，并与 /compact 进行对比。
date: 2026-08-23
tags:
  - Agent
  - Context Window
  - Claude Code
  - 工作流
  - Skill
category: Tech
---

# Agent 调用 Agent：/handoff 技能的设计思路

在 AI 编程 Agent 的实际使用中，一个常见场景是：当前会话正在处理一项任务，过程中突然产生了一个新想法，但又不希望打断正在进行的工作。Matt Pocock 将这一需求固化为一个 Skill，命名为 `/handoff`。本文基于其视频讲解，梳理该技能的工作原理、设计动机与适用场景。

## 一、/handoff 的工作原理

`/handoff` 的核心动作是将当前会话的上下文窗口压缩成一份 Markdown 文档，保存到操作系统的临时目录中，然后由一个新的 Agent 会话基于该文档继续执行任务。

```text
当前会话 ──► 上下文压缩为 Markdown ──► 写入临时目录 ──► 新 Agent 会话加载并继续
```

与 Claude Code 内置的 `/compact` 不同：

- `/compact` 将一段长对话压缩后放回**同一个**会话中继续；
- `/handoff` 则将内容切分出来，交给**另一个**会话执行，原会话保持纯粹，两个会话各自独立运行。

## 二、设计动机：Context Window 的智能分区

视频中重点解释了为何 `context window` 越大并不等于越聪明。随着上下文长度增长，模型对关键信息的关注度会下降，检索与推理的效率随之降低。因此需要对上下文进行分区管理：

| 区域 | 特征 | 处理方式 |
|------|------|---------|
| Smart Zone | 高价值、与当前任务强相关的信息 | 保留在当前会话中 |
| Dumb Zone | 低价值、冗余或过时的信息 | 压缩、归档或移出会话 |

`/handoff` 正是 Smart Zone 与 Dumb Zone 之间的一种显式边界管理手段：将不再需要关注的子任务完整地"搬出去"，让当前会话始终运行在聚焦的状态。

## 三、/compact 与 /handoff 的适用场景

| 方式 | 适合场景 | 说明 |
|------|---------|------|
| `/compact` | 单一会话内的长对话延续 | 保留全部上下文脉络，压缩后继续同一任务 |
| `/handoff` | 拆分独立子任务 | 将子任务交给全新会话，原会话不被干扰 |

二者并非替代关系，而是互补关系。判断标准在于：新任务是否需要共享当前会话的全部上下文。若需要完整上下文，使用 `/compact`；若子任务相对独立，使用 `/handoff`。

## 四、两个典型实战模式

### 模式一：grilling 会话中切出子任务

当处于 grilling（质疑与压力测试）会话中时，被质疑的内容可能是多个独立议题。此时可以将某个待验证的议题通过 `/handoff` 单独切出，交给一个新会话进行深入分析，同时保持原 grilling 会话的节奏不被破坏。

### 模式二：grilling 与 prototype 之间的双向 handoff

在"质疑 — 原型验证"的循环中，`/handoff` 可以在两个会话之间来回传递：

```text
grilling 会话 ──handoff──► prototype 会话（搭建原型验证）
prototype 会话 ──handoff──► grilling 会话（带着验证结果继续质疑）
```

这种双向传递使得"理论质疑"与"实践验证"可以并行推进，且每个会话只负责单一职责。

## 五、为什么选择 Markdown 而非原生 Agent 机制

`/handoff` 选择用 Markdown 作为交接载体，而非某种 Agent 框架原生机制，核心原因在于**可移植性**。Markdown 是纯文本格式，可以跨工具、跨会话传递，不受特定 Agent 实现的约束。

借助这一特性，可以将会话在 Claude Code、Codex、Copilot CLI 等不同 Agent 工具之间互相传递，从而实现跨工具的对抗式 review——例如让 Codex 审查 Claude Code 产生的方案，反之亦然。

## 六、/handoff 技能的设计原则

结合视频内容，该技能遵循以下几条设计原则：

1. **使用 suggested skill 段**：在技能定义中提供"建议使用时机"，降低调用门槛；
2. **不重复 artifact**：交接文档只生成一次，避免同一信息在多处冗余；
3. **使用临时目录**：交接文档存放于系统临时目录，生命周期短，不污染项目文件；
4. **敏感信息脱敏**：写入交接文档前对敏感信息进行处理，防止跨会话泄露。

## 七、关键结论

- `/handoff` 将当前会话上下文压缩为 Markdown 文档，交给全新 Agent 会话继续执行；
- 其设计动机源于对 context window 智能分区（Smart Zone / Dumb Zone）的认知；
- 与 `/compact` 形成互补：前者拆分会话，后者延续会话；
- 选用 Markdown 而非原生机制，是为了实现跨工具、跨 Agent 的可移植协作。

## 参考来源

| 项目 | 内容 |
|------|------|
| 作者 | Matt Pocock（@mattpocockuk） |
| 原视频 | https://www.youtube.com/watch?v=dtAJ2dOd3ko |
| Skills 仓库 | https://github.com/mattpocock/skills |

:::: tip 延伸阅读
关于 Agent 技能编排与上下文管理，可参考本站《AI 时代的个人 SOP》与《LLM Wiki》相关文章，理解上下文组织对 Agent 行为质量的整体影响。
::::
