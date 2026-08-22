import fs from 'node:fs'
import path from 'node:path'

// 一次性重构脚本：统一标题为 YYYYMMDD-原标题，并重新划分类别
const ROOT = process.cwd()

const CONTENT_DIRS = ['Tech', 'Product', 'ACGN', 'Project', 'Me', 'news']

// 旧相对路径 -> 新分类目录（未列出的文件保持原位）
const MOVES = {
  'Tech/myblog-V1.md': 'Project',
  'Tech/Kimi-About-Us-动效拆解与分析文档.md': 'Product',
  'Tech/腾讯招聘首页逆向工程与原型设计规范文档.md': 'Product',
  'Product/为什么想走产品方向.md': 'Growth',
  'Project/个人博客提示词.md': 'Tech',
  'Project/人生经验之谈（精彩！）.md': 'Growth',
  'Project/什么是好领导.md': 'Growth',
  'Project/上班后该做的五件事.md': 'Growth',
  'Project/不要想，只要动（先开始，再学习）.md': 'Growth',
  'Project/从“溺死理想”到“重拾阶梯”：我的考研抉择录.md': 'Growth',
  'Project/知乎上的数学与408名师.md': 'Growth',
  'Project/雅思备考.md': 'English',
  'Project/雅思备考策略.md': 'English',
  'Project/英语听说-专项训练.md': 'English',
  'Project/英语对话.md': 'English',
  'Project/英语面试语料.md': 'English',
}

function compactDate(s) {
  return s.replace(/\D/g, '').slice(0, 8)
}

function stripQuotes(s) {
  s = s.trim()
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1)
  }
  return s
}

function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return null
  const body = m[1]
  const titleM = body.match(/^title:\s*(.*)$/m)
  const dateM = body.match(/^date:\s*(.*)$/m)
  return {
    title: titleM ? stripQuotes(titleM[1]) : null,
    date: dateM ? stripQuotes(dateM[1]) : null,
  }
}

function rewrite(content, newTitle, newCategory) {
  const nl = content.includes('\r\n') ? '\r\n' : '\n'
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) {
    return `---${nl}title: "${newTitle}"${nl}category: ${newCategory}${nl}---${nl}${nl}` + content
  }
  const arr = m[1].split(/\r?\n/)
  const ti = arr.findIndex((l) => /^title:/.test(l))
  if (ti >= 0) arr[ti] = `title: "${newTitle}"`
  else arr.unshift(`title: "${newTitle}"`)

  const ci = arr.findIndex((l) => /^category:/.test(l))
  if (ci >= 0) arr[ci] = `category: ${newCategory}`
  else arr.push(`category: ${newCategory}`)

  return `---${nl}${arr.join(nl)}${nl}---` + content.slice(m[0].length)
}

const logRows = []
let count = 0

for (const dir of CONTENT_DIRS) {
  const dirPath = path.join(ROOT, dir)
  if (!fs.existsSync(dirPath)) continue
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.md') || entry.name === 'index.md') continue

    const oldRel = `${dir}/${entry.name}`
    const oldPath = path.join(ROOT, oldRel)
    const content = fs.readFileSync(oldPath, 'utf8')
    const fm = parseFrontmatter(content)

    const origTitle = (fm && fm.title) || (content.match(/^#\s+(.*)$/m) || [])[1] || entry.name.replace(/\.md$/, '')
    let date = fm && fm.date ? fm.date : ''
    if (!date) {
      const d = new Date(fs.statSync(oldPath).mtime)
      date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
    const newTitle = `${compactDate(date)}-${origTitle}`

    const newCat = MOVES[oldRel] || dir
    const newRel = `${newCat}/${entry.name}`
    const newPath = path.join(ROOT, newRel)

    fs.mkdirSync(path.dirname(newPath), { recursive: true })
    fs.writeFileSync(newPath, rewrite(content, newTitle, newCat), 'utf8')
    if (oldPath !== newPath) fs.unlinkSync(oldPath)

    logRows.push(`${oldRel}\t${newTitle}\t->\t${newRel}`)
    count++
  }
}

// 迁移雅思考资产
const assetSrc = path.join(ROOT, 'Project', 'assets', '雅思备考策略')
const assetDst = path.join(ROOT, 'English', 'assets', '雅思备考策略')
if (fs.existsSync(assetSrc)) {
  fs.mkdirSync(path.dirname(assetDst), { recursive: true })
  fs.renameSync(assetSrc, assetDst)
  logRows.push(`Project/assets/雅思备考策略\t->\tEnglish/assets/雅思备考策略`)
}

// 新建 Growth / English 落地页
fs.mkdirSync(path.join(ROOT, 'Growth'), { recursive: true })
fs.mkdirSync(path.join(ROOT, 'English'), { recursive: true })
fs.writeFileSync(
  path.join(ROOT, 'Growth', 'index.md'),
  '---\ntitle: 成长思考\ndescription: 职场、成长与方法论：个人抉择、职业规划与学习方法\n---\n\n成长思考收录个人成长、职场观察、学习方法与职业规划相关的内容。\n\n<PostsList category="growth" />\n',
  'utf8',
)
fs.writeFileSync(
  path.join(ROOT, 'English', 'index.md'),
  '---\ntitle: 英语学习\ndescription: 英语听说、口语面试与雅思备考\n---\n\n英语学习收录英语听说、口语、面试语料与雅思备考的方法与笔记。\n\n<PostsList category="english" />\n',
  'utf8',
)

// 输出重构日志
fs.writeFileSync(path.join(ROOT, '重构日志.txt'), logRows.join('\n') + '\n', 'utf8')

console.log(`DONE 文章数=${count}`)
console.log(logRows.join('\n'))