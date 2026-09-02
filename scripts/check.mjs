// 文章规范性校验：node scripts/check.mjs
// 检查 frontmatter 必备字段、日期格式、tags 数组，以及全局重复标题
import fs from 'node:fs'
import path from 'node:path'

const CATS = ['Tech', 'Product', 'ACGN', 'Project', 'Growth', 'English', 'Me', 'news']

function walk(dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      // 文章资产目录只存图片，不参与校验
      if (entry.name === 'assets') continue
      out.push(...walk(full))
    } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md') {
      out.push(full)
    }
  }
  return out
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return null
  const data = {}
  const lines = match[1].split(/\r?\n/)
  let inTags = false
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    if (inTags) {
      if (line.startsWith('- ')) {
        data.tags = data.tags || []
        data.tags.push(line.slice(2).trim())
      } else {
        inTags = false
      }
      continue
    }
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const val = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
    if (!key) continue
    if (key === 'tags') {
      if (val === '[]' || val === '' ) data.tags = []
      else if (val) {
        data.tags = (val.startsWith('[') ? val.replace(/^\[|\]$/g, '') : val)
          .split(/,|，/)
          .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean)
      } else inTags = true
    } else {
      data[key] = val
    }
  }
  return data
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}(T.*)?$/
const errors = []
const warnings = []
const titleSet = new Map()
let total = 0

for (const cat of CATS) {
  const files = walk(path.join(process.cwd(), cat))
  for (const file of files) {
    total++
    const content = fs.readFileSync(file, 'utf8')
    const fm = parseFrontmatter(content)
    const rel = path.relative(process.cwd(), file)

    if (!fm) {
      errors.push(`缺少 frontmatter：${rel}`)
      continue
    }
    if (!fm.title) errors.push(`缺少 title：${rel}`)
    else {
      const key = fm.title
      if (titleSet.has(key)) {
        warnings.push(`重复标题 [${key}]：${titleSet.get(key)} 与 ${rel}`)
      } else {
        titleSet.set(key, rel)
      }
    }
    if (!fm.date) {
      errors.push(`缺少 date：${rel}`)
    } else if (!DATE_RE.test(fm.date)) {
      errors.push(`date 格式应为 YYYY-MM-DD：${rel}（当前：${fm.date}）`)
    }
    if (!Array.isArray(fm.tags) || fm.tags.length === 0) {
      warnings.push(`缺少 tags：${rel}`)
    }
  }
}

console.log(`共扫描 ${total} 篇文章\n`)
if (warnings.length) {
  console.log(`⚠️  ${warnings.length} 条警告`)
  for (const w of warnings) console.log(`  - ${w}`)
} else {
  console.log('无警告')
}
if (errors.length) {
  console.log(`\n❌ ${errors.length} 条错误`)
  for (const e of errors) console.log(`  - ${e}`)
  process.exit(1)
} else {
  console.log('✅ 全部通过，可提交部署。')
}