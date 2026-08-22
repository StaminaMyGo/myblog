import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

// 1) 修正三个被重复加日期前缀的文件
for (const rel of [
  'Product/Kimi-About-Us-动效拆解与分析文档.md',
  'Product/腾讯招聘首页逆向工程与原型设计规范文档.md',
  'Project/myblog-V1.md',
]) {
  const p = path.join(ROOT, rel)
  let c = fs.readFileSync(p, 'utf8')
  c = c.replace(/^title: "(\d{8})-\1-/, 'title: "$1-')
  fs.writeFileSync(p, c, 'utf8')
}

// 2) 修正两个 news 文件：去掉 BOM 与误置的 frontmatter 块，按原始 frontmatter 重写 title/category
for (const rel of ['news/ai-roundup-2026-08.md', 'news/dev-ecosystem.md']) {
  const p = path.join(ROOT, rel)
  let c = fs.readFileSync(p, 'utf8')
  c = c.replace(/\uFEFF/g, '') // 去 BOM
  c = c.replace(/^---\r?\ntitle: "\d{8}-[^\r\n]*"\r?\ncategory: \w+\r?\n---\r?\n(?:\r?\n)?/, '')

  const m = c.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const body = m[1]
  const nl = c.includes('\r\n') ? '\r\n' : '\n'
  const titleM = body.match(/^title:\s*(.*)$/m)
  const dateM = body.match(/^date:\s*(.*)$/m)
  const origTitle = titleM[1].trim().replace(/^['"]|['"]$/g, '')
  const compact = dateM[1].trim().replace(/\D/g, '').slice(0, 8)

  const lines = body.split(/\r?\n/)
  const ti = lines.findIndex((l) => /^title:/.test(l))
  lines[ti] = `title: "${compact}-${origTitle}"`
  const ci = lines.findIndex((l) => /^category:/.test(l))
  if (ci >= 0) lines[ci] = 'category: news'
  else lines.push('category: news')

  c = `---${nl}${lines.join(nl)}${nl}---` + c.slice(m[0].length)
  fs.writeFileSync(p, c, 'utf8')
}

console.log('FIX_DONE')