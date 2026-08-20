import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import SixScreens from './components/SixScreens.vue'
import PostsList from './components/PostsList.vue'

import './style/vars.css'
import './style/minimal.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('SixScreens', SixScreens)
    app.component('PostsList', PostsList)
  },
} satisfies Theme
