<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from '../../posts.data'
import { useLang } from '../composables/useLang'

const { t } = useLang()

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
const listAnchor = ref<HTMLElement>()

/** 标签云可高达 2000px+，选中后文章列表位于视口之外，用户会误以为“没跳转”；
 * 选中非空标签（点击切换 / 直链进入 / 后退前进）后平滑滚动到列表顶部。
 * 注意：VitePress loadPage 在其 nextTick 里执行 window.scrollTo(0,0)，会打断平滑滚动，
 * 因此延迟一帧级时间待其重置完成后滚动，避免竞态。 */
async function scrollToList() {
  await nextTick()
  setTimeout(() => {
    listAnchor.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 120)
}

/** 响应 SPA 内标签切换与浏览器前进/后退 */
function syncFromUrl() {
  const t = readTagFromUrl()
  if (t === selected.value) return
  selected.value = t
  if (t) scrollToList()
}

onMounted(() => {
  if (selected.value) scrollToList()
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
        <button v-if="selected" type="button" class="tags-clear" @click="clearSel">{{ t.tagsClear }}</button>
      </div>

      <div v-if="selected" ref="listAnchor" class="tags-list">
        <PostsList :tag="selected" :page-size="50" />
      </div>
      <p v-else class="tags-hint">{{ t.tagsHint(tagCounts.length) }}</p>
    </div>
  </ClientOnly>
</template>

<style scoped>
.tags-list {
  /* 顶栏 64px + 呼吸留白，滚动定位时不被吸顶导航遮住 */
  scroll-margin-top: 88px;
}

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