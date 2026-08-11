<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import ReadingProgress from './ReadingProgress.vue'
import StatusBar from './StatusBar.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <template #layout-top>
      <ReadingProgress />
    </template>
    <template #layout-bottom>
      <StatusBar />
    </template>
  </DefaultTheme.Layout>
</template>
