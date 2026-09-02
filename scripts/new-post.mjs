// 新建文章脚手架：node scripts/new-post.mjs <分类> <标题> [--tags a,b] [--series 系列名]
import fs from 'node:fs'
import path from 'node:path'

const CATS = ['Tech', 'Product', 'ACGN', 'Project', 'Growth', 'English', 'Me', 'news']
const args = process.argv.slice(2)

function flag(name) {
  const i = args.indexOf(name)
  return i >= 0 && i + 1 < args.length ? args[i + 1] : null
}
function positional() {
  const out = []
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      i++ // 跳过 flag 与它的值
      continue
    }
    out.push(args[i])
  }
  return out
}

const cat = flag('--cat') || (positional()[0] ?? '')
const title = (positional().slice(1).join(' ') || flag('--title') ?? '').trim()
const tags = (flag('--tags') ?? '')
  .split(/,|，/)
  .map((s) => s.trim())
  .filter(Boolean)
const series = (flag('--series') ?? '').trim()

if (!CATS.includes(cat)) {
  console.error(`分类无效，请从以下选择一个：${CATS.join(' / ')}`)
  process.exit(1)
}
if (!title) {
  console.error('缺少标题，用法：node scripts/new-post.mjs <分类> "标题" [--tags a,b] [--series 系列名]')
  process.exit(1)
}

const now = new Date()
const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

const invalid = /[<>:"/\\|?*\u0000-\u001f]/
const filename = title.replace(invalid, '').replace(/[.\s]+$/, '') || title
const dir = path.join(process.cwd(), cat)
const filePath = path.join(dir, `${filename}.md`)

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
if (fs.existsSync(filePath)) {
  console.error(`文件已存在：${filePath}`)
  process.exit(1)
}

const fm = [
  '---',
  `title: ${title}`,
  `description: ${title}`,
  `date: ${date}`,
  tags.length ? `tags:\n${tags.map((t) => `  - ${t}`).join('\n')}` : 'tags: []',
  series ? `series: ${series}` : '',
  '---',
  '',
  `# ${title}`,
  '',
  '',
].join('\n')

fs.writeFileSync(filePath, fm, 'utf8')
console.log(`✅ 已创建：${filePath}`)
console.log('封面规范：title（必填）/ description / date / tags（数组）/ series（可选，系列名）')
console.log('写完后运行 pnpm check 校验，然后 git add/commit 即可自动部署。')