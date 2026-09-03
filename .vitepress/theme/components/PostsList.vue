<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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
  series: string
  excerpt: string
}

const props = withDefaults(
  defineProps<{ category?: string; tag?: string; limit?: number; grouped?: boolean; pageSize?: number }>(),
  { category: '', tag: '', limit: 0, grouped: false, pageSize: 20 },
)

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
 * 数据源是 window.location.search（VitePress 1.6.4 的 useRoute() 对象没有 query 属性）；
 * SPA 内导航由被 patch 的 history.replaceState 派发 mb-urlchange（见 theme/index.ts），
 * 浏览器前进/后退触发 popstate，两者都经 syncFromUrl 同步本组件状态。
 */
function readLocationQuery(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  return Object.fromEntries(new URLSearchParams(window.location.search))
}

function applyQuery(q: Record<string, string | number | undefined>) {
  const y = String(q.year ?? '')
  activeYear.value = years.value.includes(y) ? y : ''
  // 先定年份再算页码：切换年份后总页数会变小，直链 ?page=999 要收敛到末页，否则渲染空列表
  const total = Math.max(1, Math.ceil(byYear.value.length / (props.pageSize || 20)))
  const n = parseInt(String(q.page ?? '1'), 10)
  currentPage.value = Number.isNaN(n) || n < 1 ? 1 : Math.min(n, total)
}

const currentPage = ref(1)
const activeYear = ref('')

function syncFromUrl() {
  applyQuery(readLocationQuery())
}

onMounted(() => {
  syncFromUrl()
  window.addEventListener('popstate', syncFromUrl)
  window.addEventListener('mb-urlchange', syncFromUrl)
  // pointerup 兜底：指针离开捕获元素/移动过快时，元素上的 pointerup 可能丢失，
  // window 级别的监听保证滑动松手必定被处理（防抖由 dragging 标志保证）。
  window.addEventListener('pointerup', onWindowPointerUp)
  window.addEventListener('pointercancel', onWindowPointerUp)
})
onBeforeUnmount(() => {
  window.removeEventListener('popstate', syncFromUrl)
  window.removeEventListener('mb-urlchange', syncFromUrl)
  window.removeEventListener('pointerup', onWindowPointerUp)
  window.removeEventListener('pointercancel', onWindowPointerUp)
})

/** window 兜底处理：若事件已由元素层处理（dragging 已复位），此处自动跳过 */
function onWindowPointerUp(e: PointerEvent) {
  if (!dragging.value) return
  if (activePointerId !== -1 && e.pointerId !== activePointerId) return
  onPointerUp(e)
}

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
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) qs.set(k, String(v))
  const search = qs.toString()
  // 被 patch 的 replaceState 会自动派发 mb-urlchange → syncFromUrl 同步分页/年份
  history.replaceState({}, '', location.pathname + (search ? `?${search}` : ''))
  window.scrollTo({ top: 0 })
}

function goPage(n: number) {
  if (n < 1 || n > totalPages.value) return
  setQuery({ page: n === 1 ? undefined : n })
}

function pickYear(y: string) {
  setQuery({ year: y || undefined, page: undefined })
}

/* ---------- 循环滑动翻页 ----------
 * 鼠标与触摸统一走 Pointer Events：一套代码，不会出现两套事件重复触发。
 * 翻页仍复用 goPage → setQuery → replaceState，不碰路由，
 * 因此与年份筛选、浏览器前进/后退、URL 分享行为完全一致。
 */
const swipeEl = ref<HTMLElement>()
const dragging = ref(false)
const dragX = ref(0)

let startX = 0
let startY = 0
let axis: 'x' | 'y' | null = null
let moved = 0
let suppressClick = false
let captured = false
let activePointerId = -1

/** 翻页阈值：最多 80px，窄屏按列表宽度的 18% 收敛 */
function swipeThreshold(): number {
  return Math.min(80, (swipeEl.value?.clientWidth ?? 480) * 0.18)
}

function onPointerDown(e: PointerEvent) {
  if (totalPages.value < 2) return
  if (e.pointerType === 'mouse' && e.button !== 0) return
  // 阻止文本选择与原生链接/图片拖拽：按住列表内 <a>（标题/标签）拖动时，
  // 若不禁用默认行为，浏览器会启动 HTML5 drag 并吞掉后续 pointermove/pointerup，
  // 导致“按住左右滑动换页”在链接上完全失效。preventDefault 不影响 click 派发。
  e.preventDefault()
  startX = e.clientX
  startY = e.clientY
  axis = null
  moved = 0
  dragX.value = 0
  dragging.value = true
  captured = false
  activePointerId = e.pointerId
  // 注意：不能在 pointerdown 时 setPointerCapture。
  // 一旦 capture，浏览器会把后续 click 也重定向到本元素，
  // 列表内按钮/链接的点击将全部失效（历史教训：“上一页/下一页”按钮点不动）。
  // 等到 onPointerMove 确认横向意图后再 capture，普通点击不受影响。
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  if (!axis) {
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
    // 方向锁：只有横向意图才劫持手势，纵向照常滚动页面（移动端列表仍可上下滑）
    axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    if (axis === 'x') {
      window.getSelection()?.removeAllRanges()
      try {
        ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
        captured = true
      } catch {
        /* capture 失败时仍依赖事件冒泡 */
      }
    }
  }
  if (axis !== 'x') return
  moved = Math.max(moved, Math.abs(dx))
  dragX.value = dx * 0.35 // 阻尼跟手
}

function onPointerUp(e: PointerEvent) {
  if (!dragging.value) return
  dragging.value = false
  if (captured) {
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture?.(activePointerId)
    } catch {
      /* 忽略释放异常 */
    }
    captured = false
  }
  if (axis === 'x') {
    const dx = e.clientX - startX
    if (Math.abs(dx) > swipeThreshold()) {
      goPageCyclic(currentPage.value + (dx < 0 ? 1 : -1))
    }
  }
  dragX.value = 0
  // 拖拽过就抑制紧随其后的 click，否则会误开文章链接
  if (moved > 8) {
    suppressClick = true
    setTimeout(() => {
      suppressClick = false
    }, 300)
  }
}

function onPointerCancel(e: PointerEvent) {
  dragging.value = false
  axis = null
  dragX.value = 0
  if (captured) {
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture?.(activePointerId)
    } catch {
      /* 忽略释放异常 */
    }
    captured = false
  }
}

/** capture 阶段拦下拖拽尾随的 click */
function onClickCapture(e: MouseEvent) {
  if (!suppressClick) return
  suppressClick = false
  e.preventDefault()
  e.stopPropagation()
}

/** 循环翻页：末页再往后回到第 1 页，第 1 页往前到末页 */
function goPageCyclic(n: number) {
  const total = totalPages.value
  goPage(((n - 1) % total + total) % total + 1)
}

/** 页码指示器：页数过多时只渲染当前页附近的窗口，避免几十个圆点换行 */
const dotPages = computed<(number | '...')[]>(() => {
  const total = totalPages.value
  if (total <= 12) return Array.from({ length: total }, (_, i) => i + 1)
  const c = currentPage.value
  const out: (number | '...')[] = [1]
  const start = Math.max(2, c - 2)
  const end = Math.min(total - 1, c + 2)
  if (start > 2) out.push('...')
  for (let i = start; i <= end; i++) out.push(i)
  if (end < total - 1) out.push('...')
  out.push(total)
  return out
})

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
                <a v-for="tag in p.tags" :key="tag" class="mb-tag" :href="tagLink(tag)"># {{ tag }}</a>
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
            >{{ t.archiveAll(filtered.length) }}</button>
            <button
              v-for="y in years"
              :key="y"
              type="button"
              class="mb-chip"
              :class="{ active: activeYear === y }"
              @click="pickYear(y)"
            >{{ y }}</button>
          </div>

          <!-- 滑动区：鼠标与触摸统一走 Pointer Events -->
          <div
            ref="swipeEl"
            class="mb-swipe"
            :class="{ dragging }"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerCancel"
            @click.capture="onClickCapture"
            @dragstart.prevent
          >
            <ul class="mb-posts" :style="{ transform: `translateX(${dragX}px)` }">
              <li v-for="p in paged" :key="p.url" class="mb-post">
                <span class="mb-post-date">{{ fmtDate(p.date) }}</span>
                <div class="mb-post-main">
                  <a class="mb-post-title" :href="withBase(p.url)">{{ p.title }}</a>
                  <p v-if="p.excerpt" class="mb-post-excerpt">{{ p.excerpt }}</p>
                  <div v-if="p.tags.length" class="mb-tags">
                    <a v-for="tag in p.tags" :key="tag" class="mb-tag" :href="tagLink(tag)"># {{ tag }}</a>
                  </div>
                </div>
              </li>
            </ul>

            <p v-if="!paged.length" class="mb-empty">{{ t.archiveEmpty }}</p>

            <!-- 分页器（保留：鼠标与键盘的可达性，滑动是叠加能力） -->
            <nav v-if="totalPages > 1" class="mb-pager" :aria-label="t.pagerAria">
              <button type="button" class="mb-pager-btn" :disabled="currentPage <= 1" @click="goPage(currentPage - 1)">
                {{ t.pagerPrev }}
              </button>
              <span class="mb-pager-info">{{ t.pagerInfo(Math.min(currentPage, totalPages), totalPages) }}</span>
              <button
                type="button"
                class="mb-pager-btn"
                :disabled="currentPage >= totalPages"
                @click="goPage(currentPage + 1)"
              >
                {{ t.pagerNext }}
              </button>
            </nav>

            <!-- 页码指示器：可点击直达，与滑动互补 -->
            <div v-if="totalPages > 1" class="mb-dots">
              <template v-for="(n, i) in dotPages" :key="`${n}-${i}`">
                <span v-if="n === '...'" class="mb-dots-gap">···</span>
                <button
                  v-else
                  type="button"
                  class="mb-dot"
                  :class="{ active: n === currentPage }"
                  :aria-label="t.pagerInfo(n, totalPages)"
                  :aria-current="n === currentPage ? 'true' : undefined"
                  @click="goPage(n)"
                />
              </template>
            </div>
          </div>
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

/* ---------- 循环滑动翻页 ---------- */
.mb-swipe {
  /* 关键：横向手势交给脚本，纵向滚动仍归浏览器，否则移动端列表滑不动 */
  touch-action: pan-y;
}

.mb-swipe.dragging {
  cursor: grabbing;
  user-select: none;
}

.mb-swipe .mb-posts {
  transition: transform 0.28s cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: transform;
}

/* 拖拽过程中取消过渡，保证跟手；松手后恢复过渡做回弹 */
.mb-swipe.dragging .mb-posts {
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  .mb-swipe .mb-posts {
    transition: none;
  }
}

/* ---------- 页码指示器 ---------- */
.mb-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.mb-dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: 0;
  border-radius: 9999px;
  background: var(--mb-ui3, #e0e0e0);
  cursor: pointer;
  transition: width 0.25s ease, background 0.25s ease;
}

.mb-dot:hover {
  background: var(--mb-accent, #0052d9);
}

.mb-dot.active {
  width: 24px;
  background: var(--mb-accent, #0052d9);
}

.mb-dots-gap {
  font-size: 12px;
  color: var(--mb-ui2, #999);
  user-select: none;
}
</style>