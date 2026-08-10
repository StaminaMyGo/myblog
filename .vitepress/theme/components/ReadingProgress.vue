<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const progress = ref(0)
let raf = 0

function update() {
  const doc = document.documentElement
  const total = doc.scrollHeight - window.innerHeight
  progress.value = total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0
  raf = 0
}

function onScroll() {
  if (!raf) raf = requestAnimationFrame(update)
}

onMounted(() => {
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <div class="mb-progress" aria-hidden="true">
    <div class="mb-progress-bar" :style="{ width: progress + '%' }"></div>
  </div>
</template>
