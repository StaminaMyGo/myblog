<script setup lang="ts">
import { withBase } from 'vitepress'

const banner = [
  '  ███╗   ███╗██╗   ██╗██████╗ ██╗      ██████╗  ██████╗ ',
  '  ████╗ ████║╚██╗ ██╔╝██╔══██╗██║     ██╔═══██╗██╔════╝ ',
  '  ██╔████╔██║ ╚████╔╝ ██████╔╝██║     ██║   ██║██║  ███╗',
  '  ██║╚██╔╝██║  ╚██╔╝  ██╔══██╗██║     ██║   ██║██║   ██║',
  '  ██║ ╚═╝ ██║   ██║   ██████╔╝███████╗╚██████╔╝╚██████╔╝',
  '  ╚═╝     ╚═╝   ╚═╝   ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝ ',
].join('\n')

const cats = [
  { href: '/tech/', icon: '🖥️', title: '技术项', desc: '编程 / 框架 / DevOps / 学习笔记，把踩过的坑写成文档。' },
  { href: '/acgn/', icon: '🎮', title: 'ACGN 项', desc: '动画 · 漫画 · 游戏 · 轻小说，二次元浓度报告。' },
  { href: '/news/', icon: '📡', title: '时事热点', desc: 'AI、科技与行业观察，及时跟进值得关注的热点。' },
]
</script>

<template>
  <div class="term-shell">
    <div class="term-window">
      <div class="term-titlebar">
        <span class="term-dot r"></span>
        <span class="term-dot y"></span>
        <span class="term-dot g"></span>
        <span class="term-title">myblog — zsh — 80×24</span>
      </div>
      <div class="term-body">
        <pre class="term-banner">{{ banner }}</pre>
        <p class="term-line">
          <span class="term-prompt">$ </span><span class="term-cmd">whoami</span>
        </p>
        <p class="term-line"><span class="term-out">LyY — 全栈学习者 / ACGN 爱好者</span></p>
        <p class="term-line">
          <span class="term-prompt">$ </span><span class="term-cmd">ls categories/</span>
        </p>
        <p class="term-line">
          <span class="term-out">
            <a :href="withBase('/tech/')">技术项/</a>&nbsp;&nbsp;
            <a :href="withBase('/acgn/')">ACGN 项/</a>&nbsp;&nbsp;
            <a :href="withBase('/news/')">时事热点/</a>
          </span>
        </p>
        <p class="term-line">
          <span class="term-prompt">$ </span><span class="term-cmd">./deploy --ci</span>
        </p>
        <p class="term-line"><span class="term-out">> pnpm build ............... <span class="term-ok">OK</span></span></p>
        <p class="term-line"><span class="term-out">> deploy to GitHub Pages ... <span class="term-ok">OK ✓</span></span></p>
        <p class="term-line">
          <span class="term-prompt">$ </span><span class="term-cursor"></span>
        </p>
      </div>
    </div>

    <div class="mb-cats">
      <a v-for="c in cats" :key="c.href" class="mb-card" :href="withBase(c.href)">
        <div class="mb-card-icon">{{ c.icon }}</div>
        <div class="mb-card-title">{{ c.title }}</div>
        <div class="mb-card-desc">{{ c.desc }}</div>
        <div class="mb-card-more">打开目录 →</div>
      </a>
    </div>
  </div>
</template>
