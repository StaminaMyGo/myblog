---
title: "20260819-VitePress 目标目录与格式参考"
description: 个人博客 VitePress 项目的目标目录结构、文章格式要求与内容分类参考。
date: 2026-08-19
tags:
  - VitePress
  - 个人博客
  - 排版规范
  - 参考文档
category: Tech
---

# VitePress 目标目录与格式参考

::: tip 用途
本文用于说明个人博客 `myblog` 的 VitePress 项目结构、文章存放目录和 Markdown 格式规范。将文章整理为符合本文要求的 Markdown 文件后，放入对应目录即可被 VitePress 自动收录。
:::

## 一、项目位置

- 博客项目根目录：`E:\E_projects\myblog`
- VitePress 配置文件：`E:\E_projects\myblog\.vitepress\config.mts`
- 文章数据加载器：`E:\E_projects\myblog\.vitepress\posts.data.ts`
- 构建输出目录：`E:\E_projects\myblog\.vitepress\dist`

## 二、目标目录结构

博客按内容类型划分为多个栏目目录：

| 目录 | 栏目 | 内容定位 |
| --- | --- | --- |
| `Tech/` | 技术分析 | 编程、框架、DevOps、技术原理、工具实践 |
| `Product/` | 产品分析 | 产品拆解、用户体验、商业逻辑、功能分析 |
| `ACGN/` | ACGN 评价 | 动画、漫画、游戏、轻小说及相关文化评论 |
| `Project/` | 项目复盘 | 项目复盘、生活记录、个人感悟、流程规范；无法归入前三类的内容 |
| `Me/` | 关于我 | 个人介绍、职业背景、联系方式 |
| `news/` | 时事归档 | AI、科技、行业观察，不在主导航中展示 |

完整目录示意：

```text
myblog/
├── .vitepress/
│   ├── config.mts                  # 站点主配置
│   ├── posts.data.ts               # 文章数据加载器
│   └── theme/                      # 自定义主题
├── public/                         # 静态资源
├── Tech/                           # 技术分析
│   └── index.md
├── Product/                        # 产品分析
│   └── index.md
├── ACGN/                           # ACGN 评价
│   └── index.md
├── Project/                        # 项目复盘
│   └── index.md
├── Me/                             # 关于我
│   └── index.md
├── news/                           # 时事归档
│   └── index.md
├── index.md                        # 站点首页
└── package.json
```

## 三、文章存放规则

1. 每篇文章是一个独立的 `.md` 文件。
2. 根据内容分类放入对应栏目目录。
3. 文件名建议使用文章主题的关键词，中英文均可，例如 `微信输入法.md`、`myblog.md`。
4. `index.md` 是栏目首页，不作为普通文章。
5. 新增文章不需要手动修改侧边栏配置：`config.mts` 中的 `withAutoSidebar` 会自动读取目录下的 Markdown 文件，并从 frontmatter 读取标题。

## 四、Frontmatter 格式

每篇文章需要在文件开头使用 `---` 包裹的 YAML frontmatter：

```yaml
---
title: 文章标题
description: 一句话摘要，用于文章列表展示
date: 2026-08-19
tags:
  - 标签一
  - 标签二
---
```

字段说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 文章标题，侧边栏和列表显示 |
| `description` | 推荐 | 文章摘要，用于列表卡片和搜索 |
| `date` | 推荐 | 发布日期，格式如 `2026-08-19` |
| `tags` | 推荐 | 标签数组，用于内容检索和分类 |

## 五、Markdown 格式要求

### 5.1 标题层级

- 一篇文档只保留一个一级标题 `#`。
- 使用 `##` 划分章节。
- 使用 `###` 划分章节内的小节。
- 不要跳级使用标题，例如从 `#` 直接跳到 `###`。

### 5.2 常用排版元素

VitePress 支持标准 Markdown，并支持以下增强写法：

**表格**

```markdown
| 分类 | 目录 | 说明 |
| --- | --- | --- |
| 技术分析 | `Tech/` | 编程与工具实践 |
| 产品分析 | `Product/` | 产品与体验分析 |
```

**自定义容器**

```markdown
::: tip 提示
适合放补充说明。
:::

::: warning 注意
适合放需要警惕的内容。
:::

::: danger 危险
适合放错误操作或高风险提醒。
:::
```

**引用块**

```markdown
> 这里是引用内容。
```

**代码块**

````markdown
```ts
const message = 'hello'
```
````

### 5.3 可读性建议

- 长文使用清晰的小标题分段。
- 并列信息使用列表。
- 对比信息使用表格。
- 关键结论可以加粗或放在引用块中。
- 避免大段文字堆叠，适当使用空行分隔。

## 六、内容分类优先级

1. 技术分析
2. 产品分析
3. ACGN 评价
4. 项目复盘（兜底分类）

无法归入前三类的内容，例如生活记录、书籍感悟、流程规范、个人复盘，统一放入 `Project/`。

## 七、常用命令

在博客项目根目录 `E:\E_projects\myblog` 下执行：

```bash
# 本地开发预览
pnpm dev

# 构建静态站点
pnpm build

# 本地预览构建产物
pnpm preview

# 自动构建并部署
pnpm deploy
```

## 八、相关参考文件

| 文件 | 作用 |
| --- | --- |
| `.vitepress/config.mts` | 导航、侧边栏、搜索、Markdown 配置 |
| `.vitepress/posts.data.ts` | 自动扫描文章 frontmatter 并生成列表数据 |
| `Product/微信输入法.md` | 产品分析文章格式示例 |
| `Project/myblog.md` | 项目复盘长文格式示例 |
| `Tech/vitepress-arch.md` | 技术分析文章格式示例 |
| `ACGN/《白箱》剧场版.md` | ACGN 评价文章格式示例 |
