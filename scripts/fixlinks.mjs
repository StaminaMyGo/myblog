import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const files = [
  'Tech/gh-pages-ci.md',
  'Tech/vitepress-arch.md',
  'Tech/为什么GitHub page是“免费”的？.md',
  'Project/myblog.md',
  'Me/个人介绍.md',
  'Product/给千问的一个建议.md',
  'Product/Openclaw 对我的启示.md',
  'Product/微信背后的产品观-摘要与感触.md',
]

for (const rel of files) {
  const p = path.join(ROOT, rel)
  let c = fs.readFileSync(p, 'utf8')
  c = c.replaceAll('/Tech/myblog-V1', '/Project/myblog-V1')
  c = c.replaceAll('/Product/为什么想走产品方向', '/Growth/为什么想走产品方向')
  fs.writeFileSync(p, c, 'utf8')
}
console.log('LINKS_FIXED')