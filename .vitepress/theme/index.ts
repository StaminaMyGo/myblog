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