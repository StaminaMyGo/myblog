---
title: "20260820-dsh 自制开源插件加载报错排查记录"
description: 记录 @dsh-external/dsh-super-injector 运行时注入机制导致 dsh-prompt-tags 插件 404 加载失败的完整排查与修复过程。
date: 2026-08-20
tags: [插件系统, 排障记录, 环境配置, dsh]
category: Tech
---

# dsh 自制开源插件加载报错排查记录

本文记录一次 dsh 平台插件加载失败的排查与修复过程。问题表现为服务端日志出现 `Failed to load plugins`，前端页面长时间停留在加载页，根因与插件本身的代码无关，而是由超级模组注入器（`@dsh-external/dsh-super-injector`）的运行时注入机制引起。

## 一、问题现象

- 服务重启后，启动清单中仍引用插件 `dsh-prompt-tags`。
- 该插件的 client bundle 路由无法匹配，请求返回 `404`。
- 控制台报错 `Failed to load plugins`，页面停留在加载态无法进入。

## 二、问题根因

::: warning 关键结论
问题根因不是插件本身，而是安装的 `@dsh-external/dsh-super-injector`（超级模组注入器）在维护注入清单并重建注入目标。
:::

该注入器的工作机制如下：

1. **持久化注入清单**：它维护着一张持久化清单 `~/.dsh/super-injector/registry.json`，其中登记着映射关系 `dsh-prompt-tags → F:\dsh-prompt-tags`。
2. **重启时自动重建**：每次 `dsh-web` 重启，注入器都会按清单自动重建软链，并通过 `loader.create` 完成运行时插件注入。
3. **配置补丁不生效**：此前在 `cordis.patch.yml` 中写入的 `disabled: true` 无法阻止该行为——这条补丁只作用于「bundle 自装配」路径，不作用于「运行时注入」路径。
4. **软链被重建**：此前手动删除的软链在重启后（约 21:51）被注入器再次重建。

上述机制叠加的结果是：启动清单仍引用 `dsh-prompt-tags`，但其 client bundle 路由已经无法对应，请求返回 `404`，进而触发 `Failed to load plugins`，页面卡在加载页。

## 三、修复步骤

共三步操作：

1. **备份并清空注入清单**：将 `registry.json` 内容清空为 `[]`，原内容备份为 `registry.json.bak`。
2. **删除软链**：删除 `node_modules/dsh-prompt-tags` 软链。源目录 `F:\dsh-prompt-tags` 原样保留，未做任何修改。
3. **重启服务**：执行 `pm2 restart dsh-web`（或 `pm2 reload dsh-web`）。

对应命令示意：

```bash
# 1. 备份并清空注入清单
cp ~/.dsh/super-injector/registry.json ~/.dsh/super-injector/registry.json.bak
echo '[]' > ~/.dsh/super-injector/registry.json

# 2. 删除软链（源目录不受影响）
rm node_modules/dsh-prompt-tags

# 3. 重启服务
pm2 restart dsh-web
```

::: info 说明
具体命令路径需按实际部署环境调整，以上为操作流程示意。Windows 环境下软链操作可通过 `cmd /c rmdir` 或 `Remove-Item` 完成。
:::

## 四、修复验证

重启完成后，验证结果如下：

- 服务返回 `HTTP 200`，启动清单中 `dsh-prompt-tags` 已消失。
- 全部 40 个插件 bundle 端点均返回 `200`，无 `404`。
- 软链未被注入器再次重建。

## 五、客户端操作

如果浏览器仍停留在 `Failed to load plugins` 页面，需要清除浏览器缓存的旧启动清单：

- 硬刷新：`Ctrl + Shift + R`（Windows）或 `Ctrl + F5`。
- 刷新后即可正常进入页面。

::: tip 原理说明
浏览器可能缓存了旧的启动清单响应，硬刷新会绕过缓存重新请求，使客户端获取到修复后的清单数据。
:::

## 六、可选清理

以下操作不影响服务运行，可按需处理：

| 项目 | 路径 | 说明 |
| --- | --- | --- |
| 死配置 | `~/.dsh/profiles/web/cordis.patch.yml` | 其中 `- id: dsh-prompt-tags` / `disabled: true` 已无目标，属于无效配置，可删可留 |
| 遗留数据 | `~/.dsh/data/prompt-tags.json` | 插件遗留的标签数据文件；彻底清理则删除，保留则便于日后重装恢复 |

## 七、重新安装建议

如果后续需要重新启用 `dsh-prompt-tags`，应使用注入器自带的安装 / 卸载工具：

```bash
# 卸载
dev_uninject_plugin dsh-prompt-tags

# 重新安装
dev_inject_plugin dsh-prompt-tags
```

::: warning 注意
不要再通过手动修改 `cordis.patch.yml` 的方式处理该插件——手动修改无法拦截运行时注入这一层，容易出现「配置已禁用但插件仍在运行」的假象。
:::

## 八、经验总结

本次排查的核心经验：

1. **区分注入路径**：插件的加载可能经过「bundle 自装配」与「运行时注入」两条路径，配置补丁通常只对其中一条生效，排查时需先确认故障发生在哪条路径。
2. **持久化状态优先于手工操作**：注入器、安装器等工具会维护持久化状态（如注入清单），手工删除文件或修改配置可能被工具在下次重启时覆盖。
3. **先验证后收尾**：修复完成后应通过 HTTP 状态码、日志与页面实际表现三层验证，再考虑是否清理遗留配置与数据。