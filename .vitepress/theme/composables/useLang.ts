import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { readLang, setLang, strings, type Lang } from '../../i18n'

/* 全站共享一个 lang ref（模块级单例），避免每个组件各注册一个监听器 */
const lang = ref<Lang>('zh')
let subscribers = 0

function onLangChange(e: Event) {
  const detail = (e as CustomEvent<{ lang?: Lang }>).detail
  lang.value = detail?.lang === 'en' ? 'en' : 'zh'
}

/**
 * 语言状态的唯一入口。
 *
 * - SSR 阶段 lang 恒为 'zh'，与首屏 HTML 一致，不会产生 hydration mismatch；
 * - 第一个使用方挂载时才读 `<html data-lang>`（阻塞式脚本已写好）并挂上唯一的监听；
 * - 返回的 t 是 computed，语言切换广播后所有使用方自动重渲染。
 */
export function useLang() {
  onMounted(() => {
    if (subscribers === 0) {
      lang.value = readLang()
      window.addEventListener('mb-langchange', onLangChange)
    }
    subscribers++
  })

  onBeforeUnmount(() => {
    subscribers--
    if (subscribers === 0) window.removeEventListener('mb-langchange', onLangChange)
  })

  return { lang, setLang, t: computed(() => strings[lang.value]) }
}
