import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vitepress'

// 部署时由 GitHub Actions 注入（如 /myblog/），本地开发默认 '/'（根路径）
const base = process.env.BASE_PATH || '/'
const repoRoot = process.cwd()

interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
}

const CATEGORIES: { dir: string; text: string }[] = [
  { dir: 'Tech', text: '技术笔记' },
  { dir: 'Product', text: '产品分析' },
  { dir: 'ACGN', text: 'ACGN 评价' },
  { dir: 'Project', text: '项目复盘' },
  { dir: 'Growth', text: '成长思考' },
  { dir: 'English', text: '英语学习' },
  { dir: 'Me', text: '关于我' },
  { dir: 'news', text: '资讯观察' },
]

function readFrontmatter(filePath: string): { title: string | null; date: string | null } {
  const content = fs.readFileSync(filePath, 'utf8')
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return { title: null, date: null }
  const titleMatch = match[1].match(/^title:\s*(.*)$/m)
  const dateMatch = match[1].match(/^date:\s*(.*)$/m)
  return {
    title: titleMatch ? titleMatch[1].trim().replace(/^['"]|['"]$/g, '') : null,
    date: dateMatch ? dateMatch[1].trim() : null,
  }
}

function listArticlesIn(dir: string): SidebarItem[] {
  const dirPath = path.join(repoRoot, dir)
  if (!fs.existsSync(dirPath)) return []
  const entries = fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md')
    .map((entry) => {
      const name = entry.name.replace(/\.md$/, '')
      const { title, date } = readFrontmatter(path.join(dirPath, entry.name))
      return { text: title || name, link: `/${dir}/${name}`, date: date || '' }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
  return entries.map(({ text, link }) => ({ text, link }))
}

function buildSidebar(): Record<string, SidebarItem[]> {
  const sidebar: Record<string, SidebarItem[]> = {}
  for (const c of CATEGORIES) {
    sidebar[`/${c.dir}/`] = [
      {
        text: c.text,
        collapsed: false,
        items: [{ text: '栏目首页', link: `/${c.dir}/` }, ...listArticlesIn(c.dir)],
      },
    ]
  }
  return sidebar
}

export default defineConfig({
  title: 'myblog',
  description: '个人博客：技术笔记 / 产品分析 / ACGN 评价 / 项目复盘 / 成长思考 / 英语学习',
  lang: 'zh-CN',
  base,
  cleanUrls: true,
  srcExclude: ['README.md'],
  lastUpdated: true,
  appearance: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: base + 'favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#0052d9' }],
    ['script', {}, `
      (function(){function s(){var id=decodeURIComponent(location.hash.slice(1));if(!id)return;var e=document.getElementById(id);if(e){e.scrollIntoView({behavior:'smooth',block:'start'})}}window.addEventListener('hashchange',function(){setTimeout(s,100)});window.addEventListener('load',function(){setTimeout(s,300)})})();
    `],
  ],

  themeConfig: {
    logo: { light: '/logo-light.svg', dark: '/logo.svg', alt: 'myblog' },

    nav: [
      { text: '首页', link: '/' },
      { text: '技术笔记', link: '/Tech/' },
      { text: '产品分析', link: '/Product/' },
      { text: 'ACGN 评价', link: '/ACGN/' },
      { text: '项目复盘', link: '/Project/' },
      { text: '成长思考', link: '/Growth/' },
      { text: '英语学习', link: '/English/' },
      { text: '关于我', link: '/Me/' },
    ],

    sidebar: buildSidebar(),

    outline: { label: '文章目录', level: [2, 3] },
    lastUpdated: { text: '最后更新', formatOptions: { dateStyle: 'medium', timeStyle: 'short' } },
    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '回到顶部',
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '菜单',
    search: {
      provider: 'local',
      options: { translations: { button: { buttonText: '搜索', buttonAriaLabel: '搜索' } } },
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/StaminaMyGo' }],
  },

  markdown: {
    lineNumbers: true,
    theme: { light: 'github-light', dark: 'github-dark' },
    image: { lazyLoading: true },
  },
})