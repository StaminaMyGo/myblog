<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from '../../posts.data'

interface Post {
  url: string
  category: string
  title: string
  date: string
  tags: string[]
  excerpt: string
}

const allPosts = posts as unknown as Post[]
const byCat = (cat: string) => allPosts.filter((p) => p.category === cat)

/* ---------- 第二屏：项目复盘（双行，左右滑动） ---------- */
const projectPosts = computed(() => byCat('project'))
const projectRows = computed(() => {
  const items = projectPosts.value
  const half = Math.ceil(items.length / 2)
  return [items.slice(0, half), items.slice(half)]
})

/* ---------- 第三屏：产品分析（最新 4 篇，四列） ---------- */
const productPosts = computed(() => byCat('product').slice(0, 4))

/* ---------- 第四屏：技术分析（4×4 网格） ---------- */
const techPosts = computed(() => byCat('tech'))

/* ---------- 第一屏：标签云 ---------- */
const tagCloud = [
  { text: 'Python', tier: 3 }, { text: 'FastAPI', tier: 2 }, { text: 'SQLite', tier: 2 },
  { text: 'React', tier: 3 }, { text: 'Vue 3', tier: 3 }, { text: 'TypeScript', tier: 2 },
  { text: 'VitePress', tier: 2 }, { text: 'Markdown', tier: 3 }, { text: 'Tailwind', tier: 1 },
  { text: 'GitHub Actions', tier: 2 }, { text: 'Docker', tier: 1 }, { text: 'CI/CD', tier: 2 },
  { text: 'AI Agent', tier: 2 }, { text: 'DeepSeek', tier: 2 }, { text: '产品思维', tier: 2 },
  { text: '用户研究', tier: 1 }, { text: 'ACGN', tier: 3 }, { text: '动画', tier: 2 },
  { text: 'GalGame', tier: 1 }, { text: '轻小说', tier: 1 }, { text: 'PWA', tier: 1 },
]

/* ---------- 第六屏：技术栈 ---------- */
const stack = [
  { name: 'VitePress', desc: '静态站点生成器' },
  { name: 'Vue 3', desc: '组件化开发' },
  { name: 'TypeScript', desc: '类型安全' },
  { name: 'Markdown', desc: '内容即文件' },
  { name: 'GitHub Actions', desc: 'CI/CD 自动部署' },
  { name: 'GitHub Pages', desc: '免费静态托管' },
  { name: 'minisearch', desc: '本地全文搜索' },
  { name: 'Shiki', desc: '代码高亮' },
]

/* ---------- 滚动监听：当前屏高亮 ---------- */
const screenEls = ref<HTMLElement[]>([])
const active = ref(0)
const total = 6
let observer: IntersectionObserver | null = null

function bindScreen(i: number) {
  return (el: unknown) => {
    if (el) screenEls.value[i] = el as HTMLElement
  }
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const idx = Number((entry.target as HTMLElement).dataset.index)
          if (!Number.isNaN(idx)) active.value = idx
        }
      }
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
  )
  screenEls.value.forEach((el) => el && observer!.observe(el))
})

onBeforeUnmount(() => observer?.disconnect())

function go(i: number) {
  const el = screenEls.value[i]
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function fmtDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
</script>

<template>
  <div class="six-screens">
    <!-- 右侧圆点导航 -->
    <nav class="ss-dots" aria-label="屏幕导航">
      <button
        v-for="i in total"
        :key="i"
        type="button"
        :class="{ active: active === i - 1 }"
        :aria-label="`第 ${i} 屏`"
        @click="go(i - 1)"
      />
    </nav>

    <!-- 第一屏：个人简介 -->
    <section class="ss-screen ss-hero" data-index="0" :ref="bindScreen(0)">
      <div class="ss-hero-inner">
        <p class="ss-eyebrow">$ whoami</p>
        <h1 class="ss-name">LyY <span class="ss-cursor">▌</span></h1>
        <p class="ss-tagline">
          全栈学习者 · ACGN 爱好者 · 准产品经理
          <br />
          白天写代码，晚上刷番打游戏，把踩过的坑写成文档。
        </p>
        <div class="ss-cloud" aria-label="技能与兴趣标签云">
          <span
            v-for="(t, i) in tagCloud"
            :key="i"
            class="ss-tag"
            :class="`t${t.tier}`"
          >{{ t.text }}</span>
        </div>
        <p class="ss-hint">下滑，认识我 · 一共六屏</p>
      </div>
    </section>

    <!-- 第二屏：项目复盘 -->
    <section class="ss-screen" data-index="1" :ref="bindScreen(1)">
      <div class="ss-head">
        <span class="ss-no">02 / 06</span>
        <h2>项目复盘</h2>
        <p class="ss-sub">双行滑动 · 每一个项目都是一次完整的从 0 到 1</p>
      </div>
      <div class="ss-rows">
        <div v-for="(row, ri) in projectRows" :key="ri" class="ss-row">
          <a
            v-for="p in row"
            :key="p.url"
            class="ss-card ss-card-row"
            :href="withBase(p.url)"
          >
            <span class="ss-card-date">{{ fmtDate(p.date) }}</span>
            <span class="ss-card-title">{{ p.title }}</span>
            <span class="ss-card-excerpt">{{ p.excerpt || '项目复盘 · 点击阅读' }}</span>
            <span class="ss-card-more">阅读复盘 →</span>
          </a>
        </div>
      </div>
      <a class="ss-link-all" :href="withBase('/Project/')">查看全部项目复盘 →</a>
    </section>

    <!-- 第三屏：产品分析 -->
    <section class="ss-screen" data-index="2" :ref="bindScreen(2)">
      <div class="ss-head">
        <span class="ss-no">03 / 06</span>
        <h2>产品分析</h2>
        <p class="ss-sub">最新 4 篇 · 以产品视角拆解 AI 与效率工具</p>
      </div>
      <div class="ss-grid ss-grid-4">
        <a v-for="p in productPosts" :key="p.url" class="ss-card" :href="withBase(p.url)">
          <span class="ss-card-date">{{ fmtDate(p.date) }}</span>
          <span class="ss-card-title">{{ p.title }}</span>
          <span class="ss-card-excerpt">{{ p.excerpt || '产品分析 · 点击阅读' }}</span>
          <span class="ss-card-more">阅读分析 →</span>
        </a>
      </div>
      <a class="ss-link-all" :href="withBase('/Product/')">查看全部产品分析 →</a>
    </section>

    <!-- 第四屏：技术分析 -->
    <section class="ss-screen" data-index="3" :ref="bindScreen(3)">
      <div class="ss-head">
        <span class="ss-no">04 / 06</span>
        <h2>技术分析</h2>
        <p class="ss-sub">4×4 网格 · 编程、框架、DevOps 与行业猜想</p>
      </div>
      <div class="ss-grid ss-grid-16">
        <a v-for="p in techPosts" :key="p.url" class="ss-card" :href="withBase(p.url)">
          <span class="ss-card-date">{{ fmtDate(p.date) }}</span>
          <span class="ss-card-title">{{ p.title }}</span>
          <span class="ss-card-excerpt">{{ p.excerpt || '技术分析 · 点击阅读' }}</span>
          <span class="ss-card-more">阅读笔记 →</span>
        </a>
      </div>
      <a class="ss-link-all" :href="withBase('/Tech/')">查看全部技术分析 →</a>
    </section>

    <!-- 第五屏：个人自我介绍 -->
    <section class="ss-screen ss-about" data-index="4" :ref="bindScreen(4)">
      <div class="ss-head">
        <span class="ss-no">05 / 06</span>
        <h2>自我介绍</h2>
      </div>
      <div class="ss-about-grid">
        <div class="ss-about-card">
          <h3>🎓 职业背景</h3>
          <p>
            软件工程方向学生，经历过软件开发、构建、部署、测试、上线的全流程练习，
            在实践中逐渐明确了自己「用产品连接人」的职业方向。
          </p>
        </div>
        <div class="ss-about-card">
          <h3>🛠️ 技术方向</h3>
          <p>
            前端（Vue / React / VitePress）与后端（Python / FastAPI）双线并进，
            关注 AI Agent 与效率工具，注重「技术价值 → 用户价值」的转化。
          </p>
        </div>
        <div class="ss-about-card">
          <h3>🧭 职业目标</h3>
          <p>
            产品经理。我相信好的产品能真正服务大众，也相信沟通与协作能把团队带向同一个目标。
          </p>
        </div>
      </div>
      <a class="ss-link-all" :href="withBase('/Me/')">完整个人介绍 →</a>
    </section>

    <!-- 第六屏：网站技术栈与相关信息 -->
    <section class="ss-screen ss-stack" data-index="5" :ref="bindScreen(5)">
      <div class="ss-head">
        <span class="ss-no">06 / 06</span>
        <h2>本站技术栈</h2>
        <p class="ss-sub">开源 · 静态 · 自动部署</p>
      </div>
      <div class="ss-stack-grid">
        <div v-for="s in stack" :key="s.name" class="ss-stack-chip">
          <span class="ss-stack-name">{{ s.name }}</span>
          <span class="ss-stack-desc">{{ s.desc }}</span>
        </div>
      </div>
      <ul class="ss-links">
        <li>
          <a :href="withBase('/Tech/myblog-V1')">博客源码架构 → Tech 分区</a>
        </li>
        <li>
          <a href="https://github.com/StaminaMyGo/myblog" target="_blank" rel="noopener">
            GitHub 仓库：StaminaMyGo/myblog ↗
          </a>
        </li>
        <li>
          <a href="https://staminamygo.github.io/myblog/" target="_blank" rel="noopener">
            线上地址：staminamygo.github.io/myblog ↗
          </a>
        </li>
        <li>
          <a href="https://github.com/StaminaMyGo" target="_blank" rel="noopener">
            更多项目：github.com/StaminaMyGo ↗
          </a>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.six-screens {
  position: relative;
}

/* 右侧圆点导航 */
.ss-dots {
  position: fixed;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 50;
}
.ss-dots button {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--mb-primary);
  background: transparent;
  padding: 0;
  cursor: pointer;
  transition: all var(--mb-duration-fast) ease;
}
.ss-dots button.active {
  background: var(--mb-primary);
  transform: scale(1.25);
}

/* 屏幕通用 */
.ss-screen {
  min-height: calc(100vh - var(--vp-nav-height, 56px));
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 0 40px;
  scroll-margin-top: var(--vp-nav-height, 56px);
}
.ss-head {
  margin-bottom: 20px;
}
.ss-no {
  font-family: var(--mb-mono);
  font-size: 12.5px;
  color: var(--mb-text-faint);
  letter-spacing: 0.08em;
}
.ss-head h2 {
  font-size: 30px;
  margin: 6px 0 4px;
  color: var(--mb-text);
  border: none;
  padding: 0;
}
.ss-sub {
  color: var(--mb-text-dim);
  font-size: 14px;
  margin: 0;
}

/* 第一屏：Hero */
.ss-hero {
  text-align: left;
}
.ss-hero-inner {
  max-width: 720px;
}
.ss-eyebrow {
  font-family: var(--mb-mono);
  color: var(--mb-primary);
  font-size: 14px;
  margin-bottom: 8px;
}
.ss-name {
  font-size: 56px;
  font-weight: 800;
  color: var(--mb-text);
  margin: 0 0 12px;
  border: none;
}
.ss-cursor {
  color: var(--mb-primary);
  animation: mb-blink 1.1s steps(2, start) infinite;
}
.ss-tagline {
  font-size: 18px;
  line-height: 1.8;
  color: var(--mb-text-dim);
  margin: 0 0 28px;
}
.ss-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 640px;
}
.ss-tag {
  display: inline-block;
  padding: 5px 13px;
  border-radius: 999px;
  background: var(--mb-primary-soft);
  border: 1px solid var(--mb-primary-border);
  color: var(--mb-primary-deep);
  font-size: 13px;
  font-weight: 600;
}
.ss-tag.t3 { font-size: 16px; padding: 7px 16px; }
.ss-tag.t2 { font-size: 13.5px; }
.ss-tag.t1 { font-size: 12px; opacity: 0.85; }
.ss-hint {
  margin-top: 36px;
  font-size: 13px;
  color: var(--mb-text-faint);
  font-family: var(--mb-mono);
}

/* 第二屏：项目复盘双行 */
.ss-rows {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.ss-row {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding: 4px 2px 10px;
  scrollbar-width: thin;
}
.ss-card-row {
  flex: 0 0 260px;
}

/* 卡片 */
.ss-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--mb-card-bg);
  border: 1px solid var(--mb-border);
  border-radius: 10px;
  padding: 16px 18px;
  text-decoration: none !important;
  border-bottom-width: 1px !important;
  transition: border-color var(--mb-duration-fast) ease, transform var(--mb-duration-fast) ease, box-shadow var(--mb-duration-fast) ease;
}
.ss-card:hover {
  border-color: var(--mb-accent);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(234, 88, 12, 0.12);
}
.ss-card-date {
  font-family: var(--mb-mono);
  font-size: 11.5px;
  color: var(--mb-text-faint);
}
.ss-card-title {
  font-size: 15.5px;
  font-weight: 700;
  color: var(--mb-text);
  line-height: 1.45;
}
.ss-card:hover .ss-card-title { color: var(--mb-accent-deep); }
.ss-card-excerpt {
  font-size: 12.5px;
  color: var(--mb-text-dim);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ss-card-more {
  margin-top: auto;
  font-size: 12px;
  color: var(--mb-accent-deep);
  font-weight: 600;
}

/* 三屏四列 / 四屏 4×4 网格 */
.ss-grid {
  display: grid;
  gap: 14px;
}
.ss-grid-4 {
  grid-template-columns: repeat(4, 1fr);
}
.ss-grid-16 {
  grid-template-columns: repeat(4, 1fr);
}

.ss-link-all {
  display: inline-block;
  margin-top: 22px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--mb-accent-deep);
  transition: color var(--mb-duration-fast) ease;
}
.ss-link-all:hover {
  color: var(--mb-primary-deep);
}

/* 第五屏：自我介绍 */
.ss-about-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.ss-about-card {
  background: var(--mb-card-bg);
  border: 1px solid var(--mb-border);
  border-radius: 10px;
  padding: 20px;
}
.ss-about-card h3 {
  font-size: 16px;
  margin: 0 0 10px;
  color: var(--mb-primary-deep);
}
.ss-about-card p {
  font-size: 13.5px;
  line-height: 1.8;
  color: var(--mb-text-dim);
  margin: 0;
}

/* 第六屏：技术栈 */
.ss-stack-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.ss-stack-chip {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--mb-card-bg);
  border: 1px solid var(--mb-border);
  border-radius: 8px;
  padding: 14px 16px;
}
.ss-stack-name {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--mb-text);
  font-family: var(--mb-mono);
}
.ss-stack-desc {
  font-size: 12px;
  color: var(--mb-text-dim);
}
.ss-links {
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ss-links a {
  font-size: 14px;
  font-weight: 600;
  color: var(--mb-accent-deep);
  transition: color var(--mb-duration-fast) ease;
}
.ss-links a:hover {
  color: var(--mb-primary-deep);
}

@media (max-width: 900px) {
  .ss-grid-4, .ss-grid-16, .ss-stack-grid, .ss-about-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .ss-name { font-size: 42px; }
}

@media (max-width: 640px) {
  .ss-screen {
    min-height: 100vh;
    padding: 40px 0 32px;
  }
  .ss-grid-4, .ss-grid-16, .ss-stack-grid, .ss-about-grid {
    grid-template-columns: 1fr 1fr;
  }
  .ss-about-grid { grid-template-columns: 1fr; }
  .ss-dots { right: 8px; }
  .ss-dots button { width: 8px; height: 8px; }
}
</style>
