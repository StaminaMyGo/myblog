---
title: "20260823-Unlimited-OCR 简介：长文档端到端 OCR 模型"
description: 介绍百度开源项目 Unlimited-OCR 的技术原理（R-SWA 机制）、模型架构、性能指标、推理框架支持及完整使用方式。
date: 2026-08-23
tags:
  - OCR
  - 大模型
  - 百度
  - R-SWA
  - 文档解析
  - 开源项目
category: Tech
---

# Unlimited-OCR 简介：长文档端到端 OCR 模型

Unlimited-OCR 是百度于 2026 年 6 月 22 日正式开源的一个端到端长文档 OCR 模型。项目标语为："Welcome the Era of One-shot Long-horizon Parsing"。其核心目标是**让 OCR 模型能像人类一样，在一次前向推理中完整地转录长达数十页的文档**，而非传统的一页一页分别处理。

该模型基于 **DeepSeek-OCR** 的架构构建，总参数量为 **3B**，但在推理时实际激活的参数量仅约 **570M**，在大模型时代属于非常轻量的模型。其核心技术突破是 **Reference Sliding Window Attention（R-SWA）** 机制，将解码器的 KV 缓存从随输出长度线性增长优化为**恒定大小**，解决了长文档 OCR"越生成越慢"的痛点。

模型采用 **MIT 开源协议**，代码与模型权重已在 GitHub 和 Hugging Face 上全面开源。

## 一、核心技术原理

### 1.1 传统端到端 OCR 的痛点

传统的基于大语言模型解码器的端到端 OCR 模型存在三大核心问题：

| 痛点 | 说明 |
|------|------|
| **KV 缓存线性增长** | 每生成一个 token 就新增一份 KV 缓存，输出越长显存占用越大 |
| **推理速度逐渐变慢** | KV 缓存膨胀导致注意力计算量持续增长，长序列解码越来越慢 |
| **无法一次跑完长文档** | 受显存限制，单次推理往往只能处理 1-2 页 |

### 1.2 R-SWA 机制：核心创新

R-SWA（Reference Sliding Window Attention）是 Unlimited-OCR 最核心的技术创新。其设计灵感来源于**人类抄书的工作记忆机制**——人类在长时间抄写时效率不会下降，因为不需要记住之前所有内容，只需参考最近的内容即可。

**工作机制对比：**

| 维度 | 传统注意力机制 | R-SWA 机制 |
|------|--------------|-----------|
| 注意力范围 | 每个 token 关注之前**所有** token | 每个 token 只关注**固定窗口内**的 token |
| KV 缓存变化 | 随输出长度**线性增长** | **保持恒定** |
| 长文档处理 | 越往后越慢 | 全程速度恒定 |

**具体实现：**

- **视觉 token**：作为固定的参考信息始终完整保留；
- **滑动窗口**：仅对最近 **128 个输出 token** 维持一个滑动的注意力窗口；
- **恒定 KV 缓存**：解码过程的 KV 缓存始终保持恒定大小。

:::: tip 说明
R-SWA 的窗口大小与跨窗口的语义衔接是影响长文档解析质量的关键。在实际使用中，`ngram_window` 参数需要与解码策略配合设置（多页解析通常设为 1024）。
::::

### 1.3 模型架构

Unlimited-OCR 采用了与 DeepSeek-OCR 相同的架构：

- **视觉编码器（Vision Tower）**：**SAM-ViT-B + CLIP-L DeepEncoder** 组合；
- **文本解码器（Text Decoder）**：**DeepSeek-V2 MoE** 架构；
- **图像处理**：支持两种配置模式——
  - **gundam 模式**：`base_size=1024, image_size=640, crop_mode=True`（切片处理高分辨率图，适合单张高清图片）；
  - **base 模式**：`base_size=1024, image_size=1024, crop_mode=False`（整图输入，适合多页/PDF 联合解析）。

### 1.4 性能指标

在 **OmniDocBench v1.6** 基准测试中，Unlimited-OCR 取得了 **93.92%** 的综合指标，位列端到端模型第一，比 DeepSeek-OCR 基线提升了 **6.22 个百分点**。

**长文档解析能力：**

- 支持一次性解析 **40 多页**文档；
- 输入 20 页时编辑距离（Edit Distance）为 **0.057**；
- 输入 40+ 页时编辑距离低于 **0.11**；
- Distinct-35 指标约 **97%**。

**推理效率：**

- 在输出长度达 6000 个 token 时，推理速度（TPS）较 DeepSeek-OCR 提升约 **35%**。

## 二、相关链接汇总

### 2.1 官方资源

| 资源 | 链接 |
|------|------|
| **GitHub 主仓库** | https://github.com/baidu/Unlimited-OCR |
| **Hugging Face 模型** | https://huggingface.co/baidu/Unlimited-OCR |
| **学术论文（arXiv）** | https://arxiv.org/abs/2606.23050 |
| **Hugging Face Demo** | https://huggingface.co/spaces/baidu/Unlimited-OCR |
| **百度智能云** | https://cloud.baidu.com/doc/OCR/s/fmr1p39gb |
| **ModelScope 社区** | https://modelscope.cn/models/PaddlePaddle/Unlimited-OCR |

### 2.2 社区生态与扩展项目

| 项目 | 链接 | 说明 |
|------|------|------|
| **ComfyUI-Unlimited-OCR** | https://github.com/PsychoLogicAu/ComfyUI-Unlimited-OCR | ComfyUI 自定义节点，可视化工作流中调用 OCR |
| **unlimited-ocr-mcp-server** | https://github.com/tinygone/unlimited-ocr-mcp-server | MCP 工具封装，让 Claude Code 等客户端本地调用 OCR |
| **franken_ocr** | https://github.com/Dicklesworthstone/franken_ocr | 纯 Rust、纯 CPU 的 OCR 引擎，无需 GPU 和 Python |
| **Unlimited-OCR-GGUF** | https://huggingface.co/sahilchachra/Unlimited-OCR-GGUF | GGUF 量化版本，支持 llama.cpp 加载 |
| **SGLang 集成** | https://docs.sglang.io/cookbook/autoregressive/Baidu/Unlimited-OCR | SGLang 部署文档与 PR #29186 |

### 2.3 推理框架支持

Unlimited-OCR 目前已获得多个主流推理框架的支持：

| 框架 | 支持时间 | 说明 |
|------|---------|------|
| **vLLM** | 2026/06/28 | vLLM 社区支持 vLLM 推理 |
| **ms-swift** | 2026/07/21 | ModelScope 社区支持训练 |
| **SGLang** | PR #29186 | 支持 prefill-aware 滑动窗口注意力 |
| **Xinference** | 2026/06/29 | 注册为一等公民的 OCR 模型 |

## 三、完整使用说明

### 3.1 环境要求

| 项目 | 要求 |
|------|------|
| **GPU** | NVIDIA GPU，建议 ≥8GB 显存（bfloat16） |
| **CUDA** | 与 PyTorch 版本匹配 |
| **Python** | 3.10+（官方测试于 3.12.3 + CUDA12.9） |
| **磁盘** | 模型权重约 6.3GB（首次下载） |
| **操作系统** | Windows / Linux |

### 3.2 方式一：Hugging Face Transformers 推理（最基础）

**安装依赖：**

```bash
pip install torch==2.10.0 torchvision==0.25.0 transformers==4.57.1 Pillow==12.1.1 matplotlib==3.10.8 einops==0.8.2 addict==2.4.0 easydict==1.13 pymupdf==1.27.2.2 psutil==7.2.2
```

**基础调用代码：**

```python
import os
import torch
from transformers import AutoModel, AutoTokenizer

model_name = 'baidu/Unlimited-OCR'
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
model = AutoModel.from_pretrained(
    model_name,
    trust_remote_code=True,
    use_safetensors=True,
    torch_dtype=torch.bfloat16,
)
model = model.eval().cuda()

# ── 单图解析（gundam 模式，高精度） ──
model.infer(
    tokenizer,
    prompt='<image>document parsing.',
    image_file='your_image.jpg',
    output_path='your/output/dir',
    base_size=1024,
    image_size=640,      # gundam 模式
    crop_mode=True,      # gundam 模式
    max_length=32768,
    no_repeat_ngram_size=35,
    ngram_window=128,
    save_results=True,
)

# ── 单图解析（base 模式，整图） ──
model.infer(
    tokenizer,
    prompt='<image>document parsing.',
    image_file='your_image.jpg',
    output_path='your/output/dir',
    base_size=1024,
    image_size=1024,     # base 模式
    crop_mode=False,     # base 模式
    max_length=32768,
    no_repeat_ngram_size=35,
    ngram_window=128,
    save_results=True,
)
```

### 3.3 方式二：多页/PDF 文档解析

**多图联合解析：**

```python
# ── 多页图片联合解析（仅支持 base 模式） ──
model.infer_multi(
    tokenizer,
    prompt='<image>Multi page parsing.',
    image_files=['page1.png', 'page2.png', 'page3.png'],
    output_path='your/output/dir',
    image_size=1024,          # 仅 base 模式
    max_length=32768,
    no_repeat_ngram_size=35,
    ngram_window=1024,
    save_results=True,
)
```

**PDF 自动转图并解析：**

```python
import tempfile
import fitz  # PyMuPDF

def pdf_to_images(pdf_path, dpi=300):
    doc = fitz.open(pdf_path)
    tmp_dir = tempfile.mkdtemp(prefix='pdf_ocr_')
    mat = fitz.Matrix(dpi / 72, dpi / 72)
    paths = []
    for i, page in enumerate(doc):
        out = os.path.join(tmp_dir, f'page_{i+1:04d}.png')
        page.get_pixmap(matrix=mat).save(out)
        paths.append(out)
    doc.close()
    return paths

# PDF 解析
model.infer_multi(
    tokenizer,
    prompt='<image>Multi page parsing.',
    image_files=pdf_to_images('your_doc.pdf', dpi=300),
    output_path='your/output/dir',
    image_size=1024,
    max_length=32768,
    no_repeat_ngram_size=35,
    ngram_window=1024,
    save_results=True,
)
```

### 3.4 方式三：部署为 HTTP 服务（MCP Server 方案）

此方案适合将 Unlimited-OCR 封装为本地服务，供 Claude Code 等 MCP 客户端调用。

**第一步：克隆并安装：**

```bash
git clone <repo-url> uocr-workspace
cd uocr-workspace
conda create -n uocr python=3.10 -y
conda activate uocr
pip install torch --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
```

**第二步：启动 OCR 服务：**

```bash
# 国内用户设置镜像
export HF_ENDPOINT=https://hf-mirror.com

# 启动服务（首次下载模型约 6.3GB）
python serve_ocr.py
# 看到 "Uvicorn running on http://127.0.0.1:10000" 即成功
```

**第三步：MCP 客户端调用：**

服务启动后，对外暴露 OpenAI 兼容的 `/v1/chat/completions` 接口（端口 10000）。Claude Code 装上即可自动调用，无需手写 prompt。

**最小 Python 调用示例（单图 OCR）：**

```python
import requests
import base64

with open("your_image.jpg", "rb") as f:
    img_base64 = base64.b64encode(f.read()).decode()

response = requests.post(
    "http://127.0.0.1:10000/v1/chat/completions",
    json={
        "model": "baidu/Unlimited-OCR",
        "messages": [
            {"role": "user", "content": [
                {"type": "text", "text": "document parsing."},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_base64}"}}
            ]}
        ]
    }
)
print(response.json()["choices"][0]["message"]["content"])
```

### 3.5 方式四：SGLang 部署

Unlimited-OCR 的 SGLang 支持在 PR #29186 中。

**安装 SGLang（含 PR）：**

```bash
pip install -U uv
uv venv --python 3.12 && source .venv/bin/activate
git clone https://github.com/sgl-project/sglang.git
cd sglang
git fetch origin pull/29186/head && git checkout FETCH_HEAD
uv pip install -e python
```

**配置建议：**

- **Attention 后端**：使用 `--attention-backend fa3 --page-size 1`（page-size=1 是 prefill-aware SWA 的要求）；
- **Radix Cache**：批量 OCR 时建议 `--disable-radix-cache`；若重复处理相同图片可移除该 flag；
- **自定义 Logit Processor**：保持 `--enable-custom-logit-processor`；
- **图像模式**：支持 `tiny`、`small`、`base`、`large`、`gundam`；多图仅支持前三种。

**OpenAI 兼容 API 调用：**

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:30000/v1", api_key="EMPTY")
response = client.chat.completions.create(
    model="baidu/Unlimited-OCR",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "document parsing."},
                {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}
            ]
        }
    ]
)
print(response.choices[0].message.content)
```

### 3.6 方式五：GGUF 量化版本（llama.cpp）

对于希望在资源受限环境或 CPU 上运行的用户，社区提供了 GGUF 量化版本。

**可用量化版本：**

| 文件 | 量化 | 位数 | 大小 | 推荐场景 |
|------|------|------|------|---------|
| Unlimited-OCR-BF16.gguf | BF16 | 16 | 5.47 GiB | 全精度，参考质量 |
| Unlimited-OCR-Q8_0.gguf | Q8_0 | 8 | 2.91 GiB | 近无损，推荐有足够 RAM 时使用 |
| Unlimited-OCR-Q6_K.gguf | Q6_K | 6 | 2.43 GiB | 高质量，与 Q8_0 几乎无异 |
| Unlimited-OCR-Q5_K_M.gguf | Q5_K_M | 5 | 2.07 GiB | 高质量，平衡选择 |
| **Unlimited-OCR-Q4_K_M.gguf** | **Q4_K_M** | **4** | **1.82 GiB** | **推荐默认——最佳大小/质量平衡** |
| Unlimited-OCR-Q4_K_S.gguf | Q4_K_S | 4 | 1.68 GiB | 比 Q4_K_M 略小 |
| Unlimited-OCR-Q3_K_M.gguf | Q3_K_M | 3 | 1.45 GiB | 紧凑，内存紧张时可用 |
| Unlimited-OCR-IQ4_XS.gguf | IQ4_XS | 4 | 1.53 GiB | i-quant，比 Q4_K_S 更小 |
| Unlimited-OCR-IQ4_NL.gguf | IQ4_NL | 4 | 1.59 GiB | 4-bit，针对 ARM/边缘设备优化 |

**注意事项：**

- 需要支持 DeepSeek-OCR 的 **llama.cpp 构建**（PR #17400）；
- 上游主线尚未合并，需构建 PR 分支；
- 每次运行需要**两个文件**：语言模型 GGUF + 共享的 vision projector（mmproj，fp16 格式）。

## 四、应用场景

Unlimited-OCR 的典型应用场景包括：

| 场景 | 说明 |
|------|------|
| **RAG 文档预处理** | 将扫描 PDF、图片报告转成 Markdown，再进入切分、向量化和检索 |
| **内部资料归档** | 历史合同、培训材料、会议截图、票据凭证批量解析后统一搜索 |
| **业务系统"看图录入"** | 表单录入、发票字段提取、报价单整理、客服截图整理 |
| **Agent 视觉能力增强** | 为 AI Agent 增加"读文档的眼睛"，处理 PDF 和图片中的信息 |
| **知识库构建** | 将非结构化的视觉文档转化为可检索的结构化文本 |

## 五、总结

Unlimited-OCR 通过 R-SWA 机制解决了传统端到端 OCR 模型在长文档处理中的 KV 缓存膨胀问题，实现了**一次前向推理完整转录数十页文档**的能力。模型总参数 3B、推理激活仅 570M，支持 Transformers、vLLM、SGLang 等多种推理框架，并提供 GGUF 量化版本供资源受限场景使用。

:::: tip 延伸阅读
关于 OCR 与多模态视觉技术的关联，可参考本站《DeepSeek 视觉能力演进：从 OCR 到多模态 VLM 的技术路径》一文，了解端到端 OCR 模型在内容审核与文档理解场景中的实际应用。
::::
