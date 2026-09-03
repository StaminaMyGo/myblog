<script setup lang="ts">
import { useLang } from '../composables/useLang'

const props = withDefaults(defineProps<{ mobile?: boolean }>(), { mobile: false })

const { lang, setLang, t } = useLang()

function toggle() {
  setLang(lang.value === 'zh' ? 'en' : 'zh')
}
</script>

<template>
  <button
    type="button"
    class="mb-lang"
    :class="{ 'mb-lang-mobile': props.mobile }"
    :aria-label="t.langSwitchAria"
    :title="t.langSwitchAria"
    @click="toggle"
  >
    <svg
      class="mb-lang-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
    </svg>
    <!-- 按钮文案同样走 CSS 双语：不依赖 Vue 挂载，与首屏语言状态天然一致 -->
    <span class="lang-zh" data-pagefind-ignore>中文</span>
    <span class="lang-en" data-pagefind-ignore>EN</span>
  </button>
</template>

<style scoped>
.mb-lang {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  margin-left: 8px;
  padding: 0 12px;
  border: 1px solid var(--mb-border, #e0e0e0);
  border-radius: var(--mb-radius-pill, 9999px);
  background: var(--mb-bg-soft);
  color: var(--mb-text-dim, #666);
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: border-color var(--mb-duration-fast) ease, color var(--mb-duration-fast) ease;
}

.mb-lang:hover {
  border-color: var(--mb-accent, #0052d9);
  color: var(--mb-accent, #0052d9);
}

.mb-lang-icon {
  width: 15px;
  height: 15px;
  flex: 0 0 auto;
}

/* 移动端汉堡菜单内：与 PagefindSearch(mobile) 一样占满整行 */
.mb-lang-mobile {
  width: 100%;
  height: 36px;
  margin-left: 0;
  justify-content: flex-start;
}
</style>
