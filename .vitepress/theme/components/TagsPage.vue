<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { data as posts } from '../../posts.data'

interface Post {
  url: string
  category: string
  title: string
  date: string
  tags: string[]
}

const route = useRoute()
const allPosts = posts as unknown as Post[]

const tagCounts = computed<[string, number][]>(() => {
  const map = new Map<string, number>()
  for (const p of allPosts) {
    for (const t of p.tags) map.set(t, (map.get(t) || 0) + 1)
  }
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
})

const selected = computed(() => String(route.query?.tag || ''))

function tagLink(t: string): string {
  return `${withBase('/tags/')}?tag=${encodeURIComponent(t)}`
}

function clearSel() {
  window.location.href = withBase('/tags/')
}
</script>

<template>
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