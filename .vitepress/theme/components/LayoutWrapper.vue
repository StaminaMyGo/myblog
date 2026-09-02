<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import PagefindSearch from './PagefindSearch.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <template #navbar-search>
      <PagefindSearch />
    </template>
    <template #nav-screen-content-after>
      <PagefindSearch mobile />
    </template>
  </DefaultTheme.Layout>
</template>