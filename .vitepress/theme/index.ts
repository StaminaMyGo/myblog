import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import StatusBar from './components/StatusBar.vue'
import TerminalHome from './components/TerminalHome.vue'
import PostsList from './components/PostsList.vue'
import ReadingProgress from './components/ReadingProgress.vue'

import './style/vars.css'
import './style/nerd.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, { 'layout-top': () => h(ReadingProgress),
    'layout-bottom': () => h(StatusBar) }),
  enhanceApp({ app }) {
    app.component('TerminalHome', TerminalHome)
    app.component('PostsList', PostsList)
  },
} satisfies Theme
