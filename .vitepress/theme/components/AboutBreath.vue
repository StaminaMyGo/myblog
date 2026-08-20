<script setup lang="ts">
/**
 * AboutBreath.vue
 * 呼吸式提示组件（规格 5.3 E2 / 10.4）：
 * 双层同文案 span 绝对叠放，各自独立 2s 呼吸动画（delay 0 / 1s 互补），
 * 容器整体附带 translateY(0→6px) 位移动画。样式见 about.css。
 */
defineProps<{ text: string }>()
</script>

<template>
  <span class="about-breath" aria-hidden="true">
    <span>{{ text }}</span>
    <span>{{ text }}</span>
  </span>
</template>