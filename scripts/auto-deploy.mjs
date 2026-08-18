#!/usr/bin/env node
// 自动提交并推送脚本：不执行本地构建，只负责 git add / commit / push。
// 推送到 GitHub 后，由 .github/workflows/deploy.yml 自动构建并部署。

import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

function runGit(args, options = {}) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    stdio: 'inherit',
    ...options,
  })
}

function formatTime(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

try {
  // 1. 暂存所有变更（新增、修改、删除）
  runGit(['add', '-A'])

  // 2. 如果没有实际变更，则跳过提交和推送
  let hasChanges = true
  try {
    execFileSync('git', ['diff', '--cached', '--quiet'], {
      cwd: repoRoot,
      stdio: 'ignore',
    })
    hasChanges = false
  } catch {
    // git diff --cached --quiet 返回非 0，表示暂存区有变更
    hasChanges = true
  }

  if (!hasChanges) {
    console.log('[deploy] 没有检测到变更，已跳过提交和推送。')
    process.exit(0)
  }

  // 3. 提交
  const commitMessage = `docs: auto update ${formatTime()}`
  console.log(`[deploy] 提交信息：${commitMessage}`)
  runGit(['commit', '-m', commitMessage])

  // 4. 推送到远程 main 分支
  console.log('[deploy] 正在推送到 origin/main ...')
  runGit(['push', 'origin', 'main'])
  console.log('[deploy] 推送成功，GitHub Actions 将自动构建并部署。')
} catch (error) {
  console.error('[deploy] 自动提交/推送失败，请手动检查：')
  console.error(`[deploy] ${error.message}`)
  process.exit(1)
}
