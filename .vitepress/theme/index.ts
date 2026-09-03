import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import LayoutWrapper from './components/LayoutWrapper.vue'
import TencentHome from './components/TencentHome.vue'
import PostsList from './components/PostsList.vue'
import TagsPage from './components/TagsPage.vue'
import AboutSceneDeck from './components/AboutSceneDeck.vue'

import './style/vars.css'
import './style/minimal.css'
import './style/about.css'
import './style/i18n.css'

/* SPA URL query 同步桥：
 * VitePress 1.6.4 的 useRoute() 返回对象没有 query 属性（route = reactive({ path, component, data })），
 * SPA 导航仅调用 history.pushState/replaceState 且不触发 popstate。
 * 这里 patch 二者并派发 mb-urlchange 事件，供 TagsPage / PostsList 等组件同步 window.location.search。
 * 注意：本模块在 SSR 构建阶段也会执行，window 不存在时跳过。 */
if (typeof window !== 'undefined') {
  for (const type of ['pushState', 'replaceState'] as const) {
    const original = history[type].bind(history)
    history[type] = ((...args: unknown[]) => {
      const result = (original as (...a: unknown[]) => void)(...args)
      window.dispatchEvent(new CustomEvent('mb-urlchange'))
      return result
    }) as typeof history[type]
  }
}

export default {
  extends: DefaultTheme,
  Layout: LayoutWrapper,
  enhanceApp({ app }) {
    app.component('TencentHome', TencentHome)
    app.component('PostsList', PostsList)
    app.component('TagsPage', TagsPage)
    app.component('AboutSceneDeck', AboutSceneDeck)
  },
} satisfies Theme