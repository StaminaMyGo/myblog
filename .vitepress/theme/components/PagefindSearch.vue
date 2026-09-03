<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, useRouter, withBase } from 'vitepress'
import { useLang } from '../composables/useLang'

const props = withDefaults(defineProps<{ mobile?: boolean }>(), { mobile: false })

const { theme } = useData()
const router = useRouter()
const { lang, t } = useLang()

/**
 * 按当前语言从双语 HTML 中取出纯文本。
 * config.mts 的 nav.text 现在是 `<span class="lang-zh">…</span><span class="lang-en">…</span>`，
 * 直接插值会把标签源码显示到面板里；这里先还原成纯文本再参与搜索过滤。
 * 依赖 lang，语言切换后列表自动重算。
 */
function plain(html: string): string {
  const cls = lang.value === 'en' ? 'lang-en' : 'lang-zh'
  const m = html.match(new RegExp(`<span class="${cls}"[^>]*>([\\s\\S]*?)</span>`))
  return m ? m[1] : html.replace(/<[^>]*>/g, '')
}

// 顶栏导航即「快捷跳转」数据源（分类 / 标签 / 归档 / 首页），与 config.mts 的 nav 同步
const navItems = computed(() =>
  ((theme.value.nav ?? []) as { text?: string; link?: string }[])
    .filter((i) => i.link)
    .map((i) => ({ type: 'nav' as const, text: plain(i.text ?? i.link!), link: i.link! })),
)
const navFiltered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return navItems.value
  return navItems.value.filter((i) => i.text.toLowerCase().includes(q))
})

const open = ref(false)
const query = ref('')
const active = ref(0)
const loading = ref(false)
const inputEl = ref<HTMLInputElement>()
const pagefindReady = ref(false)
const pagefindError = ref(false)
// 构建版本标识（CI 注入 VITE_BUILD_SHA，如 19bcd0e），用于排查“线上是否最新版”的缓存误判；
// 本地 dev/preview 无该环境变量时显示 dev。
const buildSha = String(import.meta.env.VITE_BUILD_SHA ?? 'dev').slice(0, 7)
let pagefindMod: { init?: (o?: Record<string, unknown>) => Promise<void>; search: (q: string) => Promise<{ results: { data: () => Promise<Record<string, any>> }[] }> } | null = null
let timer: ReturnType<typeof setTimeout> | undefined

// 文章搜索结果（Pagefind）
const articles = ref<{ type: 'page'; text: string; link: string; excerpt: string }[]>([])

// 合并列表：快捷跳转在前，文章结果在后，active 索引跨两者
const combined = computed(() => [
  ...navFiltered.value.map((i) => ({ type: 'nav' as const, text: i.text, link: i.link, excerpt: '' })),
  ...articles.value,
])

async function ensurePagefind() {
  if (pagefindReady.value || pagefindError.value) return
  try {
    // 运行时加载构建产物中的 pagefind.js（其相对路径自带 bundlePath），而非打包 npm 包
    const url = withBase('/pagefind/pagefind.js')
    const mod = (await import(/* @vite-ignore */ url)) as unknown as {
      init?: (o?: Record<string, unknown>) => Promise<void>
      search: (q: string) => Promise<{ results: { data: () => Promise<Record<string, any>> }[] }>
    }
    await mod.init?.()
    pagefindMod = mod
    pagefindReady.value = true
  } catch {
    pagefindError.value = true
  }
}

async function runSearch() {
  const q = query.value.trim()
  if (!q) {
    articles.value = []
    return
  }
  await ensurePagefind()
  if (pagefindError.value || !pagefindMod) return
  loading.value = true
  try {
    const res = await pagefindMod.search(q)
    const datas = await Promise.all(res.results.slice(0, 8).map((r) => r.data()))
    articles.value = datas.map((d) => ({
      type: 'page' as const,
      text: (d.meta?.title as string) || d.url,
      link: d.url,
      excerpt: d.excerpt || '',
    }))
  } catch {
    articles.value = []
  } finally {
    loading.value = false
  }
}

watch(query, () => {
  active.value = 0
  clearTimeout(timer)
  if (!query.value.trim()) {
    articles.value = []
    return
  }
  timer = setTimeout(runSearch, 160)
})

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (open.value) close()
    return
  }
  if (props.mobile) return
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    open.value ? close() : openPanel()
  }
}

function onInputKey(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (combined.value.length) active.value = Math.min(active.value + 1, combined.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    active.value = Math.max(active.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const item = combined.value[active.value]
    if (item) go(item)
  }
}

function go(item: { link: string; type: 'nav' | 'page' }) {
  // Pagefind 返回的文章 url 已含 base（如 /myblog/Tech/xxx），原样传给 router.go；
  // nav 快捷项的 link 来自 config.nav（不含 base，如 /Tech/），而 VitePress 的
  // Router.go() 不会自动拼接 base——缺失时 pushState 到站点根会 404，故需 withBase。
  router.go(item.type === 'page' ? item.link : withBase(item.link))
  close()
}

async function openPanel() {
  open.value = true
  query.value = ''
  articles.value = []
  active.value = 0
  await nextTick()
  inputEl.value?.focus()
  ensurePagefind() // 预热索引，输入时即可搜文章
}

function close() {
  open.value = false
  query.value = ''
  articles.value = []
  clearTimeout(timer)
}

onMounted(() => document.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeyDown)
  clearTimeout(timer)
})

watch(active, (i) => {
  const el = document.getElementById(`pfind-item-${i}`)
  el?.scrollIntoView({ block: 'nearest' })
})
</script>

<template>
  <div class="pfind-nav" :class="{ 'pfind-nav-mobile': mobile }">
    <button type="button" class="pfind-nav-btn" :aria-label="t.searchOpen" @click="openPanel">
      <svg class="pfind-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <span class="pfind-nav-text">{{ t.searchShort }}</span>
      <kbd v-if="!mobile" class="pfind-nav-kbd">Ctrl K</kbd>
    </button>

    <Teleport to="body">
      <Transition name="pfind-fade">
        <div v-if="open" class="pfind-overlay" @click.self="close">
          <div class="pfind-panel" role="dialog" aria-modal="true" :aria-label="t.searchPanelAria">
            <div class="pfind-searchbox">
              <svg class="pfind-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref="inputEl"
                v-model="query"
                class="pfind-input"
                type="text"
                :placeholder="t.searchPlaceholder"
                :aria-label="t.searchShort"
                @keydown="onInputKey"
              />
              <kbd class="pfind-nav-kbd">Esc</kbd>
            </div>

            <ul class="pfind-list">
              <template v-if="navFiltered.length">
                <li class="pfind-group">{{ t.searchGroupNav }}</li>
                <li
                  v-for="(item, i) in navFiltered"
                  :id="`pfind-item-${i}`"
                  :key="'nav-' + item.link"
                  class="pfind-item"
                  :class="{ active: i === active }"
                  @mouseenter="active = i"
                  @click="go(item)"
                >
                  <span class="pfind-item-text">{{ item.text }}</span>
                  <span class="pfind-item-tag">{{ t.searchNavTag }}</span>
                </li>
              </template>

              <template v-if="query.trim() && articles.length">
                <li class="pfind-group">{{ t.searchGroupPosts }}</li>
                <li
                  v-for="(item, j) in articles"
                  :id="`pfind-item-${navFiltered.length + j}`"
                  :key="'page-' + item.link"
                  class="pfind-item"
                  :class="{ active: navFiltered.length + j === active }"
                  @mouseenter="active = navFiltered.length + j"
                  @click="go(item)"
                >
                  <span class="pfind-item-text">{{ item.text }}</span>
                  <span class="pfind-item-excerpt" v-html="item.excerpt"></span>
                </li>
              </template>

              <li v-if="loading" class="pfind-empty">{{ t.searchLoading }}</li>
              <li v-else-if="query.trim() && !navFiltered.length && !articles.length" class="pfind-empty">{{ t.searchEmpty }}</li>
              <li v-else-if="query.trim() && pagefindError" class="pfind-empty">{{ t.searchDevHint }}</li>
            </ul>

            <div class="pfind-version" title="当前构建版本标识，用于排查缓存导致的旧版问题">build {{ buildSha }}</div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.pfind-nav {
  display: flex;
  align-items: center;
}

.pfind-nav-mobile {
  width: 100%;
}

.pfind-nav-mobile .pfind-nav-btn {
  width: 100%;
  justify-content: flex-start;
  height: 36px;
}

.pfind-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-2);
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.pfind-nav-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.pfind-nav-icon {
  width: 15px;
  height: 15px;
}

.pfind-nav-kbd {
  font-family: inherit;
  font-size: 11px;
  color: var(--vp-c-text-3);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 1px 5px;
  background: var(--vp-c-bg);
}

.pfind-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 10vh 20px 40px;
}

.pfind-panel {
  position: relative;
  width: min(680px, 100%);
  max-height: 70vh;
  overflow-y: auto;
  border-radius: 10px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.24);
  padding: 12px;
}

.pfind-searchbox {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
}

.pfind-input {
  flex: 1;
  height: 40px;
  border: none;
  outline: none;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 15px;
}

.pfind-input::placeholder {
  color: var(--vp-c-text-3);
}

.pfind-list {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
}

.pfind-group {
  padding: 10px 8px 4px;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
}

.pfind-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
}

.pfind-item.active {
  background: var(--vp-c-default-soft);
}

.pfind-item-text {
  font-size: 14px;
  color: var(--vp-c-text-1);
}

.pfind-item-tag {
  align-self: flex-end;
  font-size: 11px;
  color: var(--vp-c-brand-1);
}

.pfind-item-excerpt {
  font-size: 12px;
  color: var(--vp-c-text-3);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pfind-item-excerpt :deep(mark) {
  background: var(--vp-c-yellow-soft);
  color: var(--vp-c-text-1);
}

.pfind-empty {
  padding: 14px 8px;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.pfind-version {
  padding: 10px 8px 2px;
  font-size: 11px;
  text-align: right;
  color: var(--vp-c-text-3);
  border-top: 1px solid var(--vp-c-divider);
  margin-top: 6px;
}

@media (max-width: 640px) {
  .pfind-nav-text,
  .pfind-nav-kbd {
    display: none;
  }
}

.pfind-fade-enter-active,
.pfind-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.pfind-fade-enter-from,
.pfind-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
