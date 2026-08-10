<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from '../../posts.data'

interface Post {
  url: string
  category: string
  title: string
  date: string
  tags: string[]
  excerpt: string
}

const props = withDefaults(
  defineProps<{ category?: string; limit?: number; grouped?: boolean }>(),
  { category: '', limit: 0, grouped: false },
)

const CATS: Record<string, { label: string; icon: string }> = {
  tech: { label: '技术项', icon: '🖥️' },
  acgn: { label: 'ACGN 项', icon: '🎮' },
  news: { label: '时事热点', icon: '📡' },
}

const filtered = computed<Post[]>(() => {
  let list = posts as unknown as Post[]
  if (props.category) list = list.filter((p) => p.category === props.category)
  if (props.limit) list = list.slice(0, props.limit)
  return list
})

const groups = computed(() => {
  const map = new Map<string, Post[]>()
  for (const p of posts as unknown as Post[]) {
    if (!map.has(p.category)) map.set(p.category, [])
    map.get(p.category)!.push(p)
  }
  return Array.from(map.entries()).map(([cat, items]) => ({
    cat,
    label: CATS[cat]?.label || cat,
    icon: CATS[cat]?.icon || '📄',
    items: props.limit ? items.slice(0, props.limit) : items,
  }))
})

function fmtDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
</script>

<template>
  <div>
    <template v-if="grouped">
      <section v-for="g in groups" :key="g.cat">
        <h2 class="mb-section-title">{{ g.icon }} {{ g.label }} · {{ g.items.length }} 篇</h2>
        <ul class="mb-posts">
          <li v-for="p in g.items" :key="p.url" class="mb-post">
            <span class="mb-post-date">{{ fmtDate(p.date) }}</span>
            <div class="mb-post-main">
              <a class="mb-post-title" :href="withBase(p.url)">{{ p.title }}</a>
              <p v-if="p.excerpt" class="mb-post-excerpt">{{ p.excerpt }}</p>
              <div v-if="p.tags.length" class="mb-tags">
                <span v-for="t in p.tags" :key="t" class="mb-tag"># {{ t }}</span>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </template>

    <ul v-else class="mb-posts">
      <li v-for="p in filtered" :key="p.url" class="mb-post">
        <span class="mb-post-date">{{ fmtDate(p.date) }}</span>
        <div class="mb-post-main">
          <a class="mb-post-title" :href="withBase(p.url)">{{ p.title }}</a>
          <p v-if="p.excerpt" class="mb-post-excerpt">{{ p.excerpt }}</p>
          <div v-if="p.tags.length" class="mb-tags">
            <span v-for="t in p.tags" :key="t" class="mb-tag"># {{ t }}</span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
