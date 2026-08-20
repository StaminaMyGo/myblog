import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import TencentHome from './components/TencentHome.vue'
import PostsList from './components/PostsList.vue'

import './style/vars.css'
import './style/minimal.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('TencentHome', TencentHome)
    app.component('PostsList', PostsList)
  },
} satisfies Theme
