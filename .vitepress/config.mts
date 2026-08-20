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

function readFrontmatterTitle(filePath: string): string | null {
  const content = fs.readFileSync(filePath, 'utf8')
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return null
  const titleMatch = match[1].match(/^title:\s*(.*)$/m)
  if (!titleMatch) return null
  return titleMatch[1].trim().replace(/^['"]|['"]$/g, '')
}

function listMarkdownSidebarItems(dir: string): SidebarItem[] {
  const dirPath = path.join(repoRoot, dir)
  if (!fs.existsSync(dirPath)) return []
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md')
    .map((entry) => {
      const name = entry.name.replace(/\.md$/, '')
      const text = readFrontmatterTitle(path.join(dirPath, entry.name)) || name
      return { text, link: `/${dir}/${name}` }
    })
}

// 在手动侧边栏基础上，自动追加该目录下尚未手动添加的文章
function withAutoSidebar(dir: string, groups: SidebarItem[]): SidebarItem[] {
  const manualLinks = new Set<string>()
  for (const group of groups) {
    for (const item of group.items ?? []) {
      if (item.link) manualLinks.add(item.link)
    }
  }

  const autoItems = listMarkdownSidebarItems(dir).filter((item) => !manualLinks.has(item.link))
  if (autoItems.length === 0) return groups

  return groups.map((group, index) => {
    if (index === 0) {
      return { ...group, items: [...(group.items ?? []), ...autoItems] }
    }
    return group
  })
}

export default defineConfig({
  title: 'myblog',
  description: '个人博客：技术分析 / 产品分析 / ACGN 评价 / 项目复盘 / 关于我',
  lang: 'zh-CN',
  base,
  cleanUrls: true,
  srcExclude: ['README.md', 'LINK_FIX_REPORT.md', '个人博客PRD.md'],
  lastUpdated: true,
  appearance: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: base + 'favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#f5f5f7' }],
    ['script', {}, `
      (function(){function s(){var id=decodeURIComponent(location.hash.slice(1));if(!id)return;var e=document.getElementById(id);if(e){e.scrollIntoView({behavior:'smooth',block:'start'})}}window.addEventListener('hashchange',function(){setTimeout(s,100)});window.addEventListener('load',function(){setTimeout(s,300)})})();
    `],
  ],

  themeConfig: {
    logo: { light: '/logo-light.svg', dark: '/logo.svg', alt: 'myblog' },

    nav: [
      { text: '首页', link: '/' },
      { text: '技术分析', link: '/Tech/' },
      { text: '产品分析', link: '/Product/' },
      { text: 'ACGN 评价', link: '/ACGN/' },
      { text: '项目复盘', link: '/Project/' },
      { text: '关于我', link: '/Me/' },
    ],

    sidebar: {
      '/Tech/': withAutoSidebar('Tech', [
        {
          text: '技术分析',
          collapsed: false,
          items: [
            { text: '栏目首页', link: '/Tech/' },
            { text: 'GitHub Pages + CI/CD 实战', link: '/Tech/gh-pages-ci' },
            { text: 'VitePress 架构笔记', link: '/Tech/vitepress-arch' },
            { text: '为什么我沉迷 Markdown', link: '/Tech/markdown-love' },
            { text: 'myblog V1 技术架构复盘', link: '/Tech/myblog-V1' },
            { text: '对 AI 不同发展阶段的猜想', link: '/Tech/对AI不同发展阶段的猜想' },
          ],
        },
      ]),
      '/Product/': withAutoSidebar('Product', [
        {
          text: '产品分析',
          collapsed: false,
          items: [
            { text: '栏目首页', link: '/Product/' },
            { text: 'OpenClaw 对我的启示', link: '/Product/Openclaw 对我的启示' },
            { text: '为什么我想走产品方向', link: '/Product/为什么想走产品方向' },
            { text: '微信输入法', link: '/Product/微信输入法' },
            { text: '给千问的一个建议', link: '/Product/给千问的一个建议' },
            { text: 'B站听视频模式', link: '/Product/B站听视频模式' },
          ],
        },
      ]),
      '/ACGN/': [
        {
          text: 'ACGN 评价',
          collapsed: false,
          items: [{ text: '栏目首页', link: '/ACGN/' }],
        },
        {
          text: '作品评测',
          collapsed: false,
          items: [
            { text: '《甜蜜夏日》', link: '/ACGN/《甜蜜夏日》' },
            { text: '《白箱》剧场版', link: '/ACGN/《白箱》剧场版' },
            { text: 'Galgame 游玩记录与评价', link: '/ACGN/acgs作品评价' },
            { text: '《装甲恶鬼村正》的“善恶相抵”', link: '/ACGN/善恶相抵' },
          ],
        },
        {
          text: '知识笔记',
          collapsed: false,
          items: [
            { text: '剧本创作参考标准', link: '/ACGN/ACGN作品剧情结构分析' },
            { text: 'Galgame 会社与剧本：clochette 与新岛夕', link: '/ACGN/galgame会社与剧本' },
            { text: '型月 × 飞碟社 × FGO 制作公司', link: '/ACGN/型月公司和飞碟社（鬼灭之刃制作公司）和FGO制作公司的关系' },
          ],
        },
        {
          text: '实用指南',
          collapsed: false,
          items: [
            { text: 'Switch 模拟器键盘键位设置', link: '/ACGN/switch模拟器使用指南' },
            { text: '解决游戏不在显示屏内的问题', link: '/ACGN/解决游戏不在显示屏内的问题' },
            { text: 'Steam 折扣节点与促销时间表', link: '/ACGN/steam折扣节点' },
            { text: 'Limbus 英文深度考据社区', link: '/ACGN/论坛与帖子搜索' },
          ],
        },
        {
          text: '作品记录',
          collapsed: false,
          items: [
            { text: 'ACGN 作品记录', link: '/ACGN/ACGN作品记录' },
            { text: 'ACGS 时间线', link: '/ACGN/acgs时间线' },
            { text: '轻音乐 · ACG', link: '/ACGN/轻音乐-ACG' },
          ],
        },
      ],
      '/Project/': withAutoSidebar('Project', [
        {
          text: '项目复盘',
          collapsed: false,
          items: [
            { text: '栏目首页', link: '/Project/' },
            { text: 'myblog 项目复盘', link: '/Project/myblog' },
            { text: 'Everything Agent 文件检索', link: '/Project/BasedOnEverythingAgent' },
            { text: 'LifeTracker 番茄钟', link: '/Project/LifeTracker' },
            { text: 'TimeLine 学习时间线', link: '/Project/PRD_TimeLine个人学习时间线' },
            { text: '乡村助学平台', link: '/Project/乡村建议平台-小组合作' },
            { text: '人生经验之谈（精彩！）', link: '/Project/人生经验之谈（精彩！）' },
            { text: '什么是好领导', link: '/Project/什么是好领导' },
          ],
        },
      ]),
      '/Me/': withAutoSidebar('Me', [
        {
          text: '关于我',
          collapsed: false,
          items: [
            { text: '栏目首页', link: '/Me/' },
            { text: '个人介绍', link: '/Me/个人介绍' },
          ],
        },
      ]),
    },

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
