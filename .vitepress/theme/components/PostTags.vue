<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data as posts } from '../../posts.data'

interface Post {
  url: string
  tags: string[]
}

const { page } = useData()

/**
 * relativePath 形如 "Tech/xxx.md"，p.url 形如 "/Tech/xxx"。
 * 统一成 "/Tech/xxx" 再比对，避免 base 与扩展名差异导致匹配失败。
 */
function normalize(p: string): string {
  return '/' + String(p).replace(/^\/+/, '').replace(/\.(md|html)$/, '')
}

const current = computed(() => {
  const key = normalize(page.value.relativePath || '')
  return (posts as unknown as Post[]).find((p) => normalize(p.url) === key)
})

function tagLink(t: string): string {
  return `${withBase('/tags/')}?tag=${encodeURIComponent(t)}`
}
</script>

<template>
  <div v-if="current && current.tags.length" class="mb-post-tags">
    <span class="mb-post-tags-label">标签</span>
    <a v-for="t in current.tags" :key="t" class="mb-tag" :href="tagLink(t)"># {{ t }}</a>
  </div>
</template>

<style scoped>
.mb-post-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 40px;
}

.mb-post-tags-label {
  font-size: 12px;
  font-family: var(--mb-mono, monospace);
  color: var(--mb-ui2, #999);
  margin-right: 2px;
}
</style>
