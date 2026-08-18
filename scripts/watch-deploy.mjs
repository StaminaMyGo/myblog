#!/usr/bin/env node
// 文件监听器：监听内容目录下的 Markdown 文件变化，自动执行提交 + 推送。
// 不执行本地构建，构建由 GitHub Actions 在推送后自动完成。

import chokidar from 'chokidar'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

const WATCH_TARGETS = [
  'index.md',
  'about.md',
  '.vitepress/config.mts',
  '.vitepress/posts.data.ts',
  'Tech',
  'Product',
  'ACGN',
  'Project',
  'Me',
  'news',
].map((target) => path.join(repoRoot, target))

const DEBOUNCE_MS = 3000

function shouldIgnore(filePath, stats) {
  const relative = path.relative(repoRoot, filePath).replaceAll('\\', '/')

  // 始终忽略这些目录
  if (
    relative === '.git' ||
    relative.startsWith('.git/') ||
    relative.startsWith('node_modules/') ||
    relative.startsWith('.vitepress/dist/') ||
    relative.startsWith('.vitepress/cache/') ||
    relative.startsWith('scripts/') ||
    relative.endsWith('.log')
  ) {
    return true
  }

  // 目录本身继续递归监听，便于发现子目录中的 .md
  if (stats?.isDirectory()) {
    return false
  }

  // 文件只关心 Markdown 和 VitePress 核心配置
  if (stats?.isFile()) {
    return !(
      relative.endsWith('.md') ||
      relative === '.vitepress/config.mts' ||
      relative === '.vitepress/posts.data.ts'
    )
  }

  return false
}

let timer = null
let running = false

function runAutoDeploy() {
  if (running) {
    console.log('[deploy] 上一次部署仍在进行，本次变更将等待下一轮处理。')
    return
  }

  running = true
  console.log(`[deploy] 开始自动提交并推送：${new Date().toLocaleString()}`)

  try {
    execFileSync(process.execPath, [path.join(__dirname, 'auto-deploy.mjs')], {
      cwd: repoRoot,
      stdio: 'inherit',
    })
    console.log('[deploy] 已完成，等待 GitHub Actions 构建部署。')
  } catch (error) {
    console.error('[deploy] 自动提交/推送失败，请手动检查 Git 状态。')
    console.error(`[deploy] ${error.message}`)
  } finally {
    running = false
  }
}

function scheduleDeploy() {
  clearTimeout(timer)
  timer = setTimeout(runAutoDeploy, DEBOUNCE_MS)
}

const watcher = chokidar.watch(WATCH_TARGETS, {
  ignoreInitial: true,
  ignored: shouldIgnore,
  awaitWriteFinish: {
    stabilityThreshold: 1500,
    pollInterval: 200,
  },
})

watcher.on('all', (event, filePath) => {
  console.log(`[watch] ${event}: ${filePath}`)
  scheduleDeploy()
})

watcher.on('error', (error) => {
  console.error(`[watch] 监听器错误：${error.message}`)
})

console.log('文件监听器已启动。')
console.log('监听范围：')
for (const target of WATCH_TARGETS) {
  console.log(`  ${target}`)
}
console.log(`防抖时间：${DEBOUNCE_MS / 1000} 秒`)
console.log('在内容目录中新增/修改/删除 .md 文件后，将自动提交并推送。')
