<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import PagefindSearch from './PagefindSearch.vue'
import PostTags from './PostTags.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <template #navbar-search>
      <PagefindSearch />
    </template>
    <template #nav-screen-content-after>
      <PagefindSearch mobile />
    </template>
    <template #doc-after>
      <PostTags />
    </template>
  </DefaultTheme.Layout>
</template>