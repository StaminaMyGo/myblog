<script setup lang="ts">
import { nextTick, onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import PagefindSearch from './PagefindSearch.vue'
import PostTags from './PostTags.vue'
import LangSwitcher from './LangSwitcher.vue'
import { useLang } from '../composables/useLang'
import { strings } from '../../i18n'

const route = useRoute()
const { lang } = useLang()

/**
 * VitePress 内置文案是**文本插值**渲染（不是 v-html），塞不进双语 span，
 * 只能在运行时替换 DOM 文本。两个时机都要重跑：
 * 1. 切换语言；
 * 2. 路由变化 —— 目标组件重渲染会把文本还原成 config.mts 里的中文。
 * 目标表在 i18n.ts 的 themeLabels，新增条目无需改这里。
 */
function applyThemeLabels() {
  if (typeof document === 'undefined') return
  const labels = strings[lang.value].themeLabels
  for (const [selector, text] of Object.entries(labels)) {
    document.querySelectorAll(selector).forEach((el) => {
      el.textContent = text
    })
  }
}

function scheduleApplyThemeLabels() {
  nextTick(applyThemeLabels)
  // 路由切换后内容组件可能晚于 nextTick 挂载，补一次兜底
  setTimeout(applyThemeLabels, 60)
}

watch(lang, scheduleApplyThemeLabels)
watch(() => route.path, scheduleApplyThemeLabels)
onMounted(scheduleApplyThemeLabels)
</script>

<template>
  <DefaultTheme.Layout>
    <template #nav-bar-content-after>
      <PagefindSearch />
      <LangSwitcher />
    </template>
    <template #nav-screen-content-after>
      <PagefindSearch mobile />
      <LangSwitcher mobile />
    </template>
    <template #doc-after>
      <PostTags />
    </template>
  </DefaultTheme.Layout>
</template>
