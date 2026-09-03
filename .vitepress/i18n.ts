/**
 * 站点 UI 文案词条表（中英双语）
 *
 * 语言偏好由 config.mts 注入的**阻塞式内联脚本**在首屏渲染前写到 `<html data-lang>` 上，
 * 因此本模块只负责「读当前语言 / 写新语言 / 广播变更」，不参与首屏判定。
 *
 * 作用域（策略 A）：仅切换界面文案 —— 导航、按钮、归档页/标签页提示、搜索面板。
 * 文章正文不参与切换；将来升级到「内容级多语言」（策略 C）时，
 * 只需在这里补词条 + 扩展数据层，组件无需改动。
 */

export type Lang = 'zh' | 'en'

const STORAGE_KEY = 'blog-lang'

/**
 * 读取当前语言。
 * SSR 阶段 document 不存在，统一返回 'zh'，与首屏 HTML 一致，避免 hydration mismatch。
 */
export function readLang(): Lang {
  if (typeof document === 'undefined') return 'zh'
  return document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'zh'
}

/** 写入语言偏好：同步 <html data-lang> 与 lang 属性，持久化，并广播 mb-langchange */
export function setLang(lang: Lang): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-lang', lang)
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    /* 隐私模式 / 禁用存储时忽略 */
  }
  window.dispatchEvent(new CustomEvent('mb-langchange', { detail: { lang } }))
}

export const strings = {
  zh: {
    /* 语言切换按钮 */
    langSwitchAria: '切换语言 / Switch language',

    /* 搜索面板 */
    searchShort: '搜索',
    searchOpen: '搜索文章',
    searchPanelAria: '搜索与快捷跳转',
    searchPlaceholder: '搜索文章，或跳转到栏目 / 标签 / 归档…',
    searchGroupNav: '快捷跳转',
    searchGroupPosts: '文章',
    searchNavTag: '跳转',
    searchLoading: '搜索中…',
    searchEmpty: '没有匹配的结果',
    searchDevHint: '当前为开发模式，搜索索引尚未生成，请先执行 build 后再预览。',

    /* 归档页 */
    archiveEmpty: '没有匹配的文章',
    pagerAria: '分页',
    pagerPrev: '上一页',
    pagerNext: '下一页',
    pagerInfo: (current: number, total: number) => `第 ${current} / ${total} 页`,
    archiveAll: (n: number) => `全部 · ${n} 篇`,

    /* 标签页 */
    tagsHint: (n: number) => `共 ${n} 个标签 · 点击标签查看相关文章`,
    tagsClear: '✕ 清除筛选',

    /**
     * VitePress 内置文案（文本插值渲染，塞不进双语 span，只能运行时替换 DOM 文本）。
     * 新增条目只需在这里加「CSS 选择器 → 文案」，LayoutWrapper 的注入器会自动处理。
     */
    themeLabels: {
      '.VPDocAsideOutline .outline-title': '文章目录',
    },
  },

  en: {
    langSwitchAria: 'Switch language / 切换语言',

    searchShort: 'Search',
    searchOpen: 'Search posts',
    searchPanelAria: 'Search and quick links',
    searchPlaceholder: 'Search posts, or jump to a category / tag / archive…',
    searchGroupNav: 'Quick links',
    searchGroupPosts: 'Posts',
    searchNavTag: 'Jump',
    searchLoading: 'Searching…',
    searchEmpty: 'No matching results',
    searchDevHint: 'Dev mode: the search index is not built yet. Run build before previewing.',

    archiveEmpty: 'No matching posts',
    pagerAria: 'Pagination',
    pagerPrev: 'Prev',
    pagerNext: 'Next',
    pagerInfo: (current: number, total: number) => `Page ${current} / ${total}`,
    archiveAll: (n: number) => `All · ${n}`,

    tagsHint: (n: number) => `${n} tags · click a tag to see related posts`,
    tagsClear: '✕ Clear filter',

    themeLabels: {
      '.VPDocAsideOutline .outline-title': 'On this page',
    },
  },
} as const

export type Dict = (typeof strings)['zh']
