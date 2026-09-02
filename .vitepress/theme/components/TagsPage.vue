<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from '../../posts.data'

interface Post {
  url: string
  category: string
  title: string
  date: string
  tags: string[]
}

const allPosts = posts as unknown as Post[]

const tagCounts = computed<[string, number][]>(() => {
  const map = new Map<string, number>()
  for (const p of allPosts) {
    for (const t of p.tags) map.set(t, (map.get(t) || 0) + 1)
  }
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
})

/**
 * URL query 的真实数据源是 window.location.search。
 * VitePress 1.6.4 的 useRoute() 对象没有 query 属性，SPA 导航只做 history.pushState（不触发 popstate）；
 * 因此同时监听 popstate（后退/前进）与 mb-urlchange（SPA 内 URL 变更，由 theme/index.ts patch 派发）。
 */
function readTagFromUrl(): string {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get('tag') || ''
}

const selected = ref(readTagFromUrl())

/** 响应 SPA 内标签切换与浏览器前进/后退 */
function syncFromUrl() {
  selected.value = readTagFromUrl()
}

onMounted(() => {
  window.addEventListener('popstate', syncFromUrl)
  window.addEventListener('mb-urlchange', syncFromUrl)
})
onBeforeUnmount(() => {
  window.removeEventListener('popstate', syncFromUrl)
  window.removeEventListener('mb-urlchange', syncFromUrl)
})

function tagLink(t: string): string {
  return `${withBase('/tags/')}?tag=${encodeURIComponent(t)}`
}

/** 清除筛选：SPA 内写历史，被 patch 的 pushState 会派发 mb-urlchange 触发同步 */
function clearSel() {
  history.pushState({}, '', withBase('/tags/'))
}
</script>

<template>
  <!-- 页面依赖 URL query（SSG 无法在 SSR 阶段得知），整体仅客户端渲染，避免 hydration mismatch -->
  <ClientOnly>
    <div class="tags-page">
      <div class="tags-cloud">
        <a v-for="[t, c] in tagCounts" :key="t" class="tags-chip" :class="{ active: t === selected }" :href="tagLink(t)">
          {{ t }} <span class="tags-count">{{ c }}</span>
        </a>
        <button v-if="selected" type="button" class="tags-clear" @click="clearSel">✕ 清除筛选</button>
      </div>

      <PostsList v-if="selected" :tag="selected" :page-size="50" />
      <p v-else class="tags-hint">共 {{ tagCounts.length }} 个标签 · 点击标签查看相关文章</p>
    </div>
  </ClientOnly>
</template>

<style scoped>
.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 28px;
  align-items: center;
}

.tags-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 9999px;
  border: 1px solid var(--mb-ui3, #e0e0e0);
  color: var(--mb-text, #333);
  font-size: 13px;
  line-height: 1.6;
  text-decoration: none !important;
  border-bottom: none !important;
  transition: all 0.2s ease;
}

.tags-chip:hover {
  border-color: var(--mb-accent, #0052d9);
  color: var(--mb-accent, #0052d9);
}

.tags-chip.active {
  background: var(--mb-accent, #0052d9);
  border-color: var(--mb-accent, #0052d9);
  color: #fff;
}

.tags-count {
  font-size: 12px;
  opacity: 0.65;
}

.tags-clear {
  border: none;
  background: transparent;
  color: var(--mb-accent, #0052d9);
  font-size: 13px;
  cursor: pointer;
  padding: 4px 6px;
}

.tags-hint {
  color: var(--mb-ui2, #999);
  font-size: 14px;
}
</style>