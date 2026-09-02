<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import '@pagefind/default-ui/css/ui.css'

const props = withDefaults(defineProps<{ mobile?: boolean }>(), { mobile: false })

const open = ref(false)
const root = ref<HTMLElement>()
let pagefindUI: { destroy?: () => void } | null = null

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

async function openPanel() {
  open.value = true
  await nextTick()
  if (!root.value) return
  root.value.replaceChildren()
  // 动态加载 default-ui（避免拖累首屏 JS），并用其 PagefindUI 构造器显式初始化
  const mod = await import('@pagefind/default-ui')
  const PagefindUI = mod.default ?? (mod as { PagefindUI?: typeof import('@pagefind/default-ui').default }).PagefindUI
  if (typeof PagefindUI !== 'function') return
  pagefindUI = new (PagefindUI as new (o: Record<string, unknown>) => { destroy?: () => void })({
    element: root.value,
    bundlePath: withBase('/pagefind/'),
    showSubResults: false,
  })
}

function close() {
  open.value = false
  pagefindUI?.destroy?.()
  pagefindUI = null
}

onMounted(() => document.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeyDown)
  close()
})
</script>

<template>
  <div class="pfind-nav" :class="{ 'pfind-nav-mobile': mobile }">
    <button type="button" class="pfind-nav-btn" aria-label="搜索文章" @click="openPanel">
      <svg class="pfind-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <span class="pfind-nav-text">搜索</span>
      <kbd v-if="!mobile" class="pfind-nav-kbd">Ctrl K</kbd>
    </button>

    <Teleport to="body">
      <Transition name="pfind-fade">
        <div v-if="open" class="pfind-overlay" @click.self="close">
          <div class="pfind-panel" role="dialog" aria-modal="true" aria-label="搜索文章">
            <div ref="root" class="pfind-root"></div>
            <button type="button" class="pfind-close" aria-label="关闭搜索" @click="close">Esc</button>
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
  padding: 16px;
}

.pfind-panel :deep(.pagefind-ui__search-clear) {
  display: none;
}

.pfind-close {
  position: sticky;
  bottom: 12px;
  float: right;
  font-size: 12px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
}

.pfind-close:hover {
  color: var(--vp-c-text-1);
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