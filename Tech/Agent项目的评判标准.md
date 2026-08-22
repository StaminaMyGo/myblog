---
title: "20260819-Agent 项目的评判标准：以文件检索项目为例"
description: 从感知、规划、工具调用、循环、记忆、反思等维度拆解“真正 Agent”的评判标准，并以 Everything 文件检索项目为例逐项评估。
date: 2026-08-19
tags:
  - Agent
  - LLM
  - 技术分析
  - LangChain
  - LangGraph
  - Everything
category: Tech
---

# Agent 项目的评判标准：以文件检索项目为例

::: tip 阅读提示
本文从“真正 Agent”的严格定义出发，梳理 Agent 项目通常需要具备的能力维度，并以一个基于 Everything 的本地文件检索项目为例进行逐项评估，最后讨论当前阶段是否需要引入 LangChain 或 LangGraph。
:::

## 一、结论先行

按行业和学术界对“真正 Agent”的严格定义来看，该项目还不是一个完整的 Agent。更准确的定位是：

> **“LLM 驱动的自然语言文件检索助手 / 单轮 Sense-Think-Act 流水线”**，或者说是一个“初级、窄任务的 Agent 雏形”。

如果采用最宽泛的定义，即“只要用 LLM 理解意图并调用工具完成任务就算 Agent”，那么它可以算作一个非常轻量的 Agent。但它缺少 Agent 最关键的自主循环、规划、反思和多步执行能力。

## 二、Agent 项目通常应具备的评判标准

一般可以从以下几个维度评判一个项目是否接近“真正的 Agent”：

| 维度 | 含义 |
| --- | --- |
| 感知 / 理解 | 能理解用户自然语言目标，并提取结构化信息 |
| 规划 / 推理 | 能把任务拆解成步骤，必要时生成多步计划 |
| 工具调用 / 环境交互 | 能调用外部工具、API、系统能力完成动作 |
| 循环 / 自主性 | 能根据中间结果继续执行、修正、重试，而不是一次调用结束 |
| 记忆 / 上下文 | 能记住历史、用户偏好、之前执行结果 |
| 反思 / 评估 | 能判断结果是否满足目标，并自我纠错 |
| 多工具选择 | 能根据任务动态选择合适工具，而不是写死一个工具 |
| 安全 / 人机协作 | 高风险操作有人确认、有边界控制 |

## 三、对照项目逐项评估

| 标准 | 项目现状 |
| --- | --- |
| 感知 / 理解 | 有。DeepSeek 把自然语言解析成意图 JSON；失败时用本地正则降级。 |
| 规划 / 推理 | 几乎没有。没有任务分解，没有多步计划，只有“一次解析 → 一次查询”。 |
| 工具调用 / 环境交互 | 部分有。确实调用了 Everything，但是写死的单工具调用，不是模型自主选工具。 |
| 循环 / 自主性 | 没有。`backend/app/agent.py` 的 `run_search()` 是线性单轮流程，搜索完直接返回，不会根据结果反思或重试。 |
| 记忆 / 上下文 | 有“数据记录”，没有“智能记忆”。SQLite 存了搜索历史和点击反馈，但当前没有用这些数据影响下一次排序或查询，只是记录。 |
| 反思 / 评估 | 没有。不会判断“结果是否满意”，也不会自动改写查询。 |
| 多工具选择 | 没有。后端启动时自动探测一个检索后端（DLL → es.exe → 文件系统），之后一直使用同一个，不是 LLM 动态选择。 |
| 人机协作 | 有用户点击、反馈，但系统不会主动追问澄清。 |

因此，它目前是：

> **“LLM 做意图抽取 + 规则做查询映射 + 工具执行”的增强版检索工具**，而不是“能自主完成任务闭环的 Agent”。

## 四、它是如何使用 Everything 的？

该项目没有通过 MCP 使用 Everything，而是使用了三种本地集成方式，按优先级自动切换。

### 1. Everything64.dll —— 主引擎（原生 SDK + ctypes IPC）

- 文件：`backend/app/search/dll_backend.py`
- 通过 Python `ctypes.WinDLL` 直接加载 `tools/sdk/dll/Everything64.dll`。
- 调用 Everything SDK 的 IPC 接口：
  - `Everything_SetSearchW()` 设置查询语句
  - `Everything_SetMatchPath(True)` 允许匹配路径
  - `Everything_SetMax()` 限制返回条数
  - `Everything_SetSort()` 按修改时间倒序
  - `Everything_QueryW()` 发起查询
  - `Everything_GetResultFullPathNameW()` 获取结果完整路径
- 这是最快路径，直接和正在运行的 Everything 进程通信，返回速度可达毫秒级。

### 2. es.exe —— 官方命令行工具兜底

- 文件：`backend/app/search/es_backend.py`
- 通过 `subprocess.run([es.exe, "-n", count, query])` 执行搜索。
- 解析标准输出，再按修改时间排序。

### 3. 文件系统扫描 —— 保底

- 文件：`backend/app/search/fs_backend.py`
- 用 `os.walk()` 扫描 `SEARCH_FALLBACK_ROOT`（默认用户 Documents）。
- 能解析 `ext:`、`size:`、`dm:`、`path:` 等 Everything 查询语法的子集，做简易过滤。

### 关键链路

```text
用户输入
  → DeepSeek 解析为意图 JSON
  → mapper.py 转换成 Everything 查询语法
  → factory.py 自动选择 DLL / es.exe / 文件系统
  → 返回文件列表
```

注意：**LLM 并不直接调用 Everything**。LLM 只输出结构化意图，然后由代码里的 `mapper.py` 固定映射成 `ext:pptx dm:2026-..` 这类查询语法，再由后端执行。

## 五、是否使用了 MCP？

没有。

在代码和文档中检索 `MCP`、`mcp`、`function calling`、`function_call` 等关键词，均未发现 MCP 相关实现。它使用的是以下方式：

| 方式 | 用途 |
| --- | --- |
| DeepSeek HTTP REST API | 调用 `/chat/completions`，用 `temperature=0` + `response_format=json_object` 做结构化意图解析 |
| Everything64.dll + ctypes | 直接通过 Windows DLL/IPC 调用 Everything 本地索引 |
| es.exe + subprocess | 调用 Everything 官方命令行工具 |
| FastAPI REST API | 前端和后端通信 |
| SQLite | 记录搜索历史和点击反馈 |
| 本地正则规则 | DeepSeek 不可用时的离线降级解析 |

MCP（Model Context Protocol）是一种让 LLM 动态发现和调用外部工具的标准协议。该项目没有引入它，而是选择了“直接把 Everything 集成进后端”的硬编码方式。这也解释了为什么它更像“工具 + 规则流水线”，而不是“模型自主控制工具的 Agent”。

## 六、是否需要 LangChain 或 LangGraph？

### 6.1 当前阶段不需要

现阶段不需要用 LangChain，也不需要用 LangGraph。当前项目是一个“单轮、单工具、无循环”的检索流水线，用原生 Python + FastAPI 已经足够清晰。强行引入 LangChain 会增加依赖、抽象和调试成本；LangGraph 是为“有状态、有循环、有多步分支”的 Agent 设计的，对当前复杂度来说属于超出需求。

### 6.2 当前项目的真实复杂度

现有核心流程：

```text
用户输入
  → DeepSeek 解析意图 JSON
  → mapper.py 映射成 Everything 查询语法
  → 检索（DLL / es.exe / 文件系统）
  → 返回结果
```

代码上对应：

```python
# backend/app/agent.py
intent, model, warning = parse_with_llm(query)
syntax = build_query(intent)
results = backend.search(syntax, top_n)
```

这是一个线性、无状态、单次调用的流程：

- 没有多轮循环
- 没有根据结果反思
- 没有状态管理
- 没有多 Agent
- 只有一个外部工具（Everything）
- LLM 只调用一次

在这种复杂度下，LangChain 提供的 Chain、Tool、Memory 等抽象，多数属于多余封装。

### 6.3 LangChain 的适用场景与代价

LangChain 适合解决的问题：

- 需要对接大量不同 LLM 提供商
- 需要大量文档加载、切分、向量化、RAG 组件
- 需要大量预置 Tool/Integration
- 需要快速拼装 Prompt Template、Output Parser
- 不想自己写底层调用代码

对当前项目的价值：

| 需求 | 现状 | LangChain 是否有必要 |
| --- | --- | --- |
| 调用 DeepSeek | 已用 `requests` 直接调用，约 60 行 | 没必要 |
| 结构化输出 | 已用 `response_format=json_object` | 没必要 |
| 工具调用 | 只有 Everything，且是本地 DLL/CLI | 没必要 |
| 记忆 | SQLite 自己管理 | 没必要 |
| 查询映射 | 已用 `mapper.py` 硬编码 | 没必要 |

LangChain 的代价：

1. 依赖膨胀：为了一个简单流程引入 `langchain`、`langchain-openai`、`langchain-core` 等，安装体积和依赖风险增加。
2. API 不稳定：LangChain 历史上 API 变化频繁，升级可能导致代码大面积改动。
3. 抽象泄漏：遇到超时、JSON 解析失败、模型返回格式不对时，仍需要回到底层 `requests` 逻辑排查。
4. 调试变难：`llm.py`、`mapper.py`、`agent.py` 都是直白 Python，出问题容易定位；引入框架后调用栈会变长。

因此，LangChain 对这个项目不是必需品，甚至可能成为负担。

### 6.4 LangGraph 的定位与适用场景

LangGraph 和 LangChain 定位不同：

- LangChain：偏组件库，帮助封装 LLM、Prompt、Tool。
- LangGraph：偏编排引擎，帮助管理 Agent 的状态、循环、分支、持久化、人工介入。

LangGraph 适合解决的问题：

| 能力 | 说明 |
| --- | --- |
| 循环 | Agent 可以反复执行“思考 → 行动 → 观察” |
| 条件分支 | 根据搜索结果决定“结束 / 重试 / 换关键词” |
| 状态管理 | 在节点间维护共享状态 |
| Checkpoint | 中断后恢复、持久化会话 |
| Human-in-the-loop | 需要用户确认才执行下一步 |
| 多 Agent | 多个 Agent 协作、路由、交接 |

如果未来项目进化成以下形态，才值得考虑 LangGraph：

```text
用户输入
  → 解析意图
  → 搜索
  → 如果结果太少/为空：
      → LLM 反思，改写查询
      → 再次搜索
  → 最多尝试 3 次
  → 返回最终结果
```

一旦加入“循环 + 条件分支 + 反思”，LangGraph 确实能提供结构化支持。但即使如此，也不一定需要 LangGraph。这种“搜索失败就重试”的循环，用原生 Python 也可以写得很清楚：

```python
def run_search_agent(query: str, max_attempts: int = 3):
    history = []
    current_query = query

    for attempt in range(max_attempts):
        intent = parse_with_llm(current_query)
        syntax = build_query(intent)
        results = backend.search(syntax, top_n)

        history.append({
            "attempt": attempt,
            "query": current_query,
            "syntax": syntax,
            "result_count": len(results),
        })

        if is_good_enough(results):
            return results, history

        current_query = refine_query(current_query, results, history)

    return results, history
```

这段代码只有几十行，且完全可控、容易测试。

### 6.5 对比表

| 维度 | 原生 Python（当前） | LangChain | LangGraph |
| --- | --- | --- | --- |
| 当前单轮搜索 | 最合适 | 不必要 | 过度设计 |
| 依赖数量 | 少 | 多 | 较多 |
| 调试难度 | 低 | 中高 | 中高 |
| 支持循环/分支 | 自己写 | 弱 | 强 |
| 支持状态持久化 | 自己写 | 弱 | 强 |
| 支持人工介入 | 自己写 | 弱 | 强 |
| 适合项目阶段 | 原型/小工具 | 组件多、集成多 | 真正 Agent 化后 |
| 学习成本 | 无 | 中 | 高 |

## 七、什么情况下才需要 LangChain 或 LangGraph？

### 7.1 建议使用 LangGraph 的场景

- 确定要把项目升级成“真正 Agent”
- 需要多轮反思、自我纠错
- 需要复杂状态机，例如：搜索 → 无结果 → 改写 → 再搜 → 仍无 → 问用户
- 需要多人协作、多 Agent 分工
- 需要断点续跑、暂停恢复
- 需要清晰的图结构来可视化 Agent 流程

到这一步，建议使用 LangGraph，而不是 LangChain。

### 7.2 建议使用 LangChain 的场景

- 要快速接入大量外部能力（文档、向量库、几十种工具）
- 需要一套统一接口对接多个模型厂商
- 希望少写底层请求代码
- 愿意接受它的抽象和版本变动成本

对当前项目来说，这些需求目前都不存在。

## 八、推荐演进路径

```text
第一阶段（现在）
  保持 FastAPI + requests + 原生 Python
  不加 LangChain / LangGraph

第二阶段（想要更像 Agent）
  自己写一个轻量 AgentLoop：
  - 搜索失败自动改写查询
  - 记录尝试历史
  - 最多重试 2~3 次
  - 返回时附带推理过程

第三阶段（复杂到原生代码难以维护）
  再考虑引入 LangGraph：
  - 多个循环节点
  - 多 Agent 协作
  - 人工审批
  - 断点恢复
```

如果目标是“让 LLM 动态调用 Everything 这类工具”，更值得考虑的其实不是 LangChain，而是：

- OpenAI 兼容的 Function Calling / Tool Calling
- MCP（Model Context Protocol）
- 继续使用当前“LLM 输出结构化 JSON → 代码执行”的方式

这几种方式都比“为了 Agent 而用 LangChain”更贴合当前项目。

## 九、总结

| 问题 | 答案 |
| --- | --- |
| 现在需要 LangChain 吗？ | 不需要 |
| 现在需要 LangGraph 吗？ | 不需要 |
| 未来需要吗？ | 当出现“多轮循环、自我反思、复杂状态、人工审批”时，优先考虑 LangGraph |
| 最合适的路线？ | 保持轻量原生 Python，必要时手写一个简单的 Agent Loop；复杂后再迁移到 LangGraph |

当前项目最大的瓶颈不是“缺少框架”，而是“缺少 Agent 循环”。而循环本身用原生 Python 就能实现，不需要为它引入一个大型框架。
