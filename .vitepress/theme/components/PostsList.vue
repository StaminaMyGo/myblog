<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter, withBase } from 'vitepress'
import { data as posts } from '../../posts.data'

interface Post {
  url: string
  category: string
  title: string
  date: string
  tags: string[]
  series: string
  excerpt: string
}

const props = withDefaults(
  defineProps<{ category?: string; tag?: string; limit?: number; grouped?: boolean; pageSize?: number }>(),
  { category: '', tag: '', limit: 0, grouped: false, pageSize: 20 },
)

const route = useRoute()
const router = useRouter()

const CATS: Record<string, { label: string; icon: string }> = {
  tech: { label: '技术笔记', icon: '🖥️' },
  product: { label: '产品分析', icon: '📱' },
  acgn: { label: 'ACGN 评价', icon: '🎮' },
  project: { label: '项目复盘', icon: '🧩' },
  growth: { label: '成长思考', icon: '🌱' },
  english: { label: '英语学习', icon: '📚' },
  me: { label: '关于我', icon: '👤' },
  news: { label: '资讯观察（归档）', icon: '📡' },
}

/* ---------- 数据过滤 ---------- */
const allPosts = posts as unknown as Post[]

const filtered = computed<Post[]>(() => {
  let list = allPosts
  if (props.category) list = list.filter((p) => p.category === props.category)
  if (props.tag) list = list.filter((p) => p.tags.includes(props.tag))
  return list
})

/* ---------- 年份筛选（仅非分组模式） ---------- */
const years = computed<string[]>(() => {
  const set = new Set<string>()
  for (const p of filtered.value) {
    const y = p.date.slice(0, 4)
    if (y) set.add(y)
  }
  return Array.from(set).sort().reverse()
})

/* ---------- 年份与分页状态 ----------
 * SSG 站点 SSR 阶段 useRoute().query 恒为空，hydration 后也不会自动补上，
 * 因此初始值从 window.location.search 解析，翻页等 SPA 导航则通过 watch route.query 同步。
 */
function readLocationQuery(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  return Object.fromEntries(new URLSearchParams(window.location.search))
}

function applyQuery(q: Record<string, string | number | undefined>) {
  const n = parseInt(String(q.page ?? '1'), 10)
  currentPage.value = Number.isNaN(n) || n < 1 ? 1 : n
  const y = String(q.year ?? '')
  activeYear.value = years.value.includes(y) ? y : ''
}

const currentPage = ref(1)
const activeYear = ref('')

onMounted(() => applyQuery(readLocationQuery()))
watch(
  () => route.query,
  (q) => applyQuery(q as Record<string, string>),
)

const byYear = computed<Post[]>(() =>
  activeYear.value ? filtered.value.filter((p) => p.date.startsWith(activeYear.value)) : filtered.value,
)

const totalPages = computed(() => Math.max(1, Math.ceil(byYear.value.length / props.pageSize)))

const paged = computed<Post[]>(() => {
  if (props.grouped) return byYear.value
  const start = (currentPage.value - 1) * props.pageSize
  return byYear.value.slice(start, start + props.pageSize)
})

function setQuery(patch: Record<string, string | number | undefined>) {
  const query: Record<string, string | number> = {}
  for (const [k, v] of Object.entries({ ...readLocationQuery(), ...patch })) {
    if (v !== undefined && v !== '' && v !== 1) query[k] = v
  }
  router.replace({ path: route.path, query })
  if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
}

function goPage(n: number) {
  if (n < 1 || n > totalPages.value) return
  setQuery({ page: n === 1 ? undefined : n })
}

function pickYear(y: string) {
  setQuery({ year: y || undefined, page: undefined })
}

/* ---------- 分组模式（保持原有行为） ---------- */
const groups = computed(() => {
  const map = new Map<string, Post[]>()
  for (const p of allPosts) {
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

/** 标签统一跳到 /tags/?tag=xxx，与 TagsPage 的选中逻辑保持一致 */
function tagLink(t: string): string {
  return `${withBase('/tags/')}?tag=${encodeURIComponent(t)}`
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
                <a v-for="t in p.tags" :key="t" class="mb-tag" :href="tagLink(t)"># {{ t }}</a>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </template>

    <template v-else>
      <!-- 列表/筛选/分页依赖 URL query（SSG 的 SSR 阶段无法得知），仅客户端渲染，避免 hydration mismatch -->
      <ClientOnly>
        <div>
          <!-- 年份筛选 -->
          <div v-if="years.length > 1" class="mb-filters">
            <button
              type="button"
              class="mb-chip"
              :class="{ active: !activeYear }"
              @click="pickYear('')"
            >全部 · {{ filtered.length }} 篇</button>
            <button
              v-for="y in years"
              :key="y"
              type="button"
              class="mb-chip"
              :class="{ active: activeYear === y }"
              @click="pickYear(y)"
            >{{ y }}</button>
          </div>

          <ul class="mb-posts">
            <li v-for="p in paged" :key="p.url" class="mb-post">
              <span class="mb-post-date">{{ fmtDate(p.date) }}</span>
              <div class="mb-post-main">
                <a class="mb-post-title" :href="withBase(p.url)">{{ p.title }}</a>
                <p v-if="p.excerpt" class="mb-post-excerpt">{{ p.excerpt }}</p>
                <div v-if="p.tags.length" class="mb-tags">
                  <a v-for="t in p.tags" :key="t" class="mb-tag" :href="tagLink(t)"># {{ t }}</a>
                </div>
              </div>
            </li>
          </ul>

          <!-- 分页器 -->
          <nav v-if="totalPages > 1" class="mb-pager" aria-label="分页">
            <button type="button" class="mb-pager-btn" :disabled="currentPage <= 1" @click="goPage(currentPage - 1)">
              上一页
            </button>
        <span class="mb-pager-info">第 {{ Math.min(currentPage, totalPages) }} / {{ totalPages }} 页</span>
        <button
          type="button"
          class="mb-pager-btn"
          :disabled="currentPage >= totalPages"
          @click="goPage(currentPage + 1)"
        >
          下一页
        </button>
      </nav>
        </div>
      </ClientOnly>
    </template>
  </div>
</template>

<style scoped>
.mb-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.mb-chip {
  border: 1px solid var(--mb-ui3, #e0e0e0);
  background: transparent;
  color: var(--mb-text, #333);
  border-radius: 9999px;
  padding: 4px 14px;
  font-size: 13px;
  line-height: 1.6;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mb-chip:hover {
  border-color: var(--mb-accent, #0052d9);
  color: var(--mb-accent, #0052d9);
}

.mb-chip.active {
  background: var(--mb-accent, #0052d9);
  border-color: var(--mb-accent, #0052d9);
  color: #fff;
}

.mb-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px dashed var(--mb-ui3, #e0e0e0);
}

.mb-pager-btn {
  border: 1px solid var(--mb-ui3, #e0e0e0);
  background: transparent;
  color: var(--mb-text, #333);
  border-radius: 6px;
  padding: 6px 18px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mb-pager-btn:hover:not(:disabled) {
  border-color: var(--mb-accent, #0052d9);
  color: var(--mb-accent, #0052d9);
}

.mb-pager-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.mb-pager-info {
  font-size: 13px;
  font-family: var(--mb-mono, monospace);
  color: var(--mb-ui2, #999);
}
</style>