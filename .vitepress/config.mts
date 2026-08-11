import { defineConfig } from 'vitepress'

// 部署时由 GitHub Actions 注入（如 /myblog/），本地开发默认 '/'（根路径）
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  title: 'myblog',
  description: '一个 Nerd 风的个人博客：技术项 / ACGN 项 / 时事热点',
  lang: 'zh-CN',
  base,
  cleanUrls: true,
  srcExclude: ['README.md', 'LINK_FIX_REPORT.md'],
  lastUpdated: true,
  appearance: false,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: base + 'favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#1e1e1e' }],
    ['script', {}, `
      (function(){function s(){var id=decodeURIComponent(location.hash.slice(1));if(!id)return;var e=document.getElementById(id);if(e){e.scrollIntoView({behavior:'smooth',block:'start'})}}window.addEventListener('hashchange',function(){setTimeout(s,100)});window.addEventListener('load',function(){setTimeout(s,300)})})();
    `],
  ],

  themeConfig: {
    logo: { light: '/logo.svg', dark: '/logo.svg', alt: 'myblog' },

    nav: [
      { text: '~/home', link: '/' },
      { text: '技术项', link: '/tech/' },
      { text: 'ACGN 项', link: '/acgn/' },
      { text: '时事热点', link: '/news/' },
      { text: '关于', link: '/about' },
    ],

    sidebar: {
      '/tech/': [
        {
          text: '技术项',
          collapsed: false,
          items: [
            { text: '栏目首页', link: '/tech/' },
            { text: 'GitHub Pages + CI/CD 实战', link: '/tech/gh-pages-ci' },
            { text: 'VitePress 架构笔记', link: '/tech/vitepress-arch' },
            { text: '为什么我沉迷 Markdown', link: '/tech/markdown-love' },
          ],
        },
      ],
      '/acgn/': [
        {
          text: 'ACGN 项',
          collapsed: false,
          items: [
            { text: '栏目首页', link: '/acgn/' },
            { text: '2026 夏季新番扫雷', link: '/acgn/summer-2026-anime' },
            { text: 'Galgame 安利：近期通关记录', link: '/acgn/galgame-2026' },
          ],
        },
      ],
      '/news/': [
        {
          text: '时事热点',
          collapsed: false,
          items: [
            { text: '栏目首页', link: '/news/' },
            { text: '2026-08 AI 大模型动态', link: '/news/ai-roundup-2026-08' },
            { text: '开发者生态观察', link: '/news/dev-ecosystem' },
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
    theme: { light: 'one-dark-pro', dark: 'one-dark-pro' },
    image: { lazyLoading: true },
  },
})