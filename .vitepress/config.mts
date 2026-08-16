import { defineConfig } from 'vitepress'

// 部署时由 GitHub Actions 注入（如 /myblog/），本地开发默认 '/'（根路径）
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  title: 'myblog',
  description: '个人博客：技术分析 / 产品分析 / ACGN 评价 / 项目复盘 / 关于我',
  lang: 'zh-CN',
  base,
  cleanUrls: true,
  srcExclude: ['README.md', 'LINK_FIX_REPORT.md', '个人博客PRD.md'],
  lastUpdated: true,
  appearance: false,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: base + 'favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#0d9488' }],
    ['script', {}, `
      (function(){function s(){var id=decodeURIComponent(location.hash.slice(1));if(!id)return;var e=document.getElementById(id);if(e){e.scrollIntoView({behavior:'smooth',block:'start'})}}window.addEventListener('hashchange',function(){setTimeout(s,100)});window.addEventListener('load',function(){setTimeout(s,300)})})();
    `],
  ],

  themeConfig: {
    logo: { light: '/logo.svg', dark: '/logo.svg', alt: 'myblog' },

    nav: [
      { text: '首页', link: '/' },
      { text: '技术分析', link: '/Tech/' },
      { text: '产品分析', link: '/Product/' },
      { text: 'ACGN 评价', link: '/ACGN/' },
      { text: '项目复盘', link: '/Project/' },
      { text: '关于我', link: '/Me/' },
    ],

    sidebar: {
      '/Tech/': [
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
      ],
      '/Product/': [
        {
          text: '产品分析',
          collapsed: false,
          items: [
            { text: '栏目首页', link: '/Product/' },
            { text: 'OpenClaw 对我的启示', link: '/Product/Openclaw 对我的启示' },
            { text: '为什么我想走产品方向', link: '/Product/为什么想走产品方向' },
            { text: '微信输入法', link: '/Product/微信输入法' },
            { text: '给千问的一个建议', link: '/Product/给千问的一个建议' },
          ],
        },
      ],
      '/ACGN/': [
        {
          text: 'ACGN 评价',
          collapsed: false,
          items: [
            { text: '栏目首页', link: '/ACGN/' },
            { text: '《甜蜜夏日》', link: '/ACGN/《甜蜜夏日》' },
            { text: '《白箱》剧场版', link: '/ACGN/《白箱》剧场版' },
          ],
        },
      ],
      '/Project/': [
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
          ],
        },
      ],
      '/Me/': [
        {
          text: '关于我',
          collapsed: false,
          items: [
            { text: '栏目首页', link: '/Me/' },
            { text: '个人介绍', link: '/Me/个人介绍' },
          ],
        },
      ],
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
    theme: { light: 'github-light', dark: 'github-light' },
    image: { lazyLoading: true },
  },
})
