import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'

// 部署时由 GitHub Actions 注入（如 /myblog/），本地开发默认 '/'（根路径）
const base = process.env.BASE_PATH || '/'

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

// 1000+ 篇时的侧边栏策略：每个分类只展示最近 N 篇，完整列表统一走 /archive/ 归档
const SIDEBAR_LATEST = 10

/** 只读文件前 HEAD_SIZE 字节即可解析 frontmatter，避免 1000+ 篇时全量读文件 */
const HEAD_SIZE = 4096
const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---/

function readFrontmatter(filePath: string): { title: string; date: string } {
  const fd = fs.openSync(filePath, 'r')
  try {
    const buffer = Buffer.alloc(HEAD_SIZE)
    const bytes = fs.readSync(fd, buffer, 0, HEAD_SIZE, 0)
    const head = buffer.toString('utf8', 0, bytes)
    const match = head.match(FM_RE)
    if (!match) return { title: '', date: '' }
    const get = (key: string) => {
      const m = match[1].match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))
      return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : ''
    }
    return { title: get('title'), date: get('date') }
  } finally {
    fs.closeSync(fd)
  }
}

function latestIn(dir: string): DefaultTheme.SidebarItem[] {
  const dirPath = path.join(process.cwd(), dir)
  if (!fs.existsSync(dirPath)) return []
  const items = fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.md') && e.name !== 'index.md')
    .map((e) => {
      const name = e.name.replace(/\.md$/, '')
      const { title, date } = readFrontmatter(path.join(dirPath, e.name))
      return { text: title || name, link: `/${dir}/${name}`, date }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, SIDEBAR_LATEST)
  return items.map(({ text, link }) => ({ text, link }))
}

function buildSidebar(): Record<string, DefaultTheme.SidebarItem[]> {
  const sidebar: Record<string, DefaultTheme.SidebarItem[]> = {}
  for (const c of CATEGORIES) {
    sidebar[`/${c.dir}/`] = [
      {
        text: c.text,
        collapsed: false,
        items: [{ text: '栏目首页', link: `/${c.dir}/` }, ...latestIn(c.dir), { text: '查看全部 → 归档', link: '/archive/' }],
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
  lastUpdated: false,
  appearance: true,

  // Pagefind 的搜索结果组件 <pagefind-ui> 是自定义元素，避免 Vue 编译告警
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag: string) => tag === 'pagefind-ui',
      },
    },
  },

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
      { text: '归档', link: '/archive/' },
      { text: '标签', link: '/tags/' },
    ],

    sidebar: buildSidebar(),

    outline: { label: '文章目录', level: [2, 3] },
    lastUpdated: { text: '最后更新', formatOptions: { dateStyle: 'medium', timeStyle: 'short' } },
    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '回到顶部',
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '菜单',
    socialLinks: [{ icon: 'github', link: 'https://github.com/StaminaMyGo' }],
  },

  markdown: {
    lineNumbers: true,
    theme: { light: 'github-light', dark: 'github-dark' },
    image: { lazyLoading: true },
  },
})