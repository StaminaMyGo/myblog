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

/* ---------- 数据 ---------- */
const CAT_LABELS: Record<string, string> = {
  tech: '技术笔记',
  product: '产品分析',
  acgn: 'ACGN 评价',
  project: '项目复盘',
  growth: '成长思考',
  english: '英语学习',
  me: '关于我',
  news: '资讯观察',
}

const latestPosts = computed(() => allPosts.slice(0, 8))
const postCount = allPosts.length
const categoryCount = new Set(allPosts.map((p) => p.category)).size

function fmtDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/* ---------- 专区卡片（腾讯「招聘项目」类比） ---------- */
interface Zone {
  label: string
  title: string
  desc: string
  link: string
  icon: string
}

const zones: Zone[] = [
  {
    label: 'TECH',
    title: '技术笔记',
    desc: '编程、框架、DevOps 与行业猜想，把踩过的坑写成文档。',
    link: '/Tech/',
    icon: 'm16 18 6-6-6-6M8 6l-6 6 6 6',
  },
  {
    label: 'PRODUCT',
    title: '产品分析',
    desc: '以产品视角拆解 AI 与效率工具，关注用户价值与体验。',
    link: '/Product/',
    icon: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Zm-17.7-.7L12 12l8.7-4.7M12 22V12',
  },
  {
    label: 'ACGN',
    title: 'ACGN 评价',
    desc: '动画 · 漫画 · 游戏 · 轻小说，二次元浓度报告。',
    link: '/ACGN/',
    icon: 'M6 11h4M8 9v4M15 12h.01M18 10h.01M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z',
  },
  {
    label: 'PROJECT',
    title: '项目复盘',
    desc: '每一个项目都是一次完整的从 0 到 1 与复盘。',
    link: '/Project/',
    icon: 'm12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83ZM22 17.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65M22 12.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65',
  },
  {
    label: 'GROWTH',
    title: '成长思考',
    desc: '职场、成长与学习方法，记录从考研到产品路上的思考。',
    link: '/Growth/',
    icon: 'M22 7l-8.5 8.5-5-5L2 17M16 7h6v6',
  },
  {
    label: 'ENGLISH',
    title: '英语学习',
    desc: '听说、口语面试与雅思备考的方法与语料积累。',
    link: '/English/',
    icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z',
  },
]

/* ---------- N 个理由（腾讯「加入腾讯的N个理由」类比） ---------- */
interface Reason {
  title: string
  desc: string
  icon: string
}

const reasons: Reason[] = [
  {
    title: '全栈双修',
    desc: '前端 Vue/React，后端 Python/FastAPI，完整走通开发到上线的全流程。',
    icon: 'm18 16 4-4-4-4M6 8l-4 4 4 4m8.5-12-5 16',
  },
  {
    title: '产品思维',
    desc: '不只写代码，更关心「技术价值 → 用户价值」的转化。',
    icon: 'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5M9 18h6m-5 4h4',
  },
  {
    title: '持续输出',
    desc: '把踩过的坑写成文档，技术、产品、ACGN 三线更新。',
    icon: 'M12 20h9m-4.624-16.378a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z',
  },
  {
    title: '工程实践',
    desc: '组件化开发、CI/CD 自动部署、Git 规范提交，博客本身即作品。',
    icon: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Zm7.5-1.5-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2ZM9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0m1 4v5s3.03-.55 4-2c1.08-1.62 0-5 0-5',
  },
  {
    title: '审美在线',
    desc: '关注设计系统与微交互，让每一个页面都经得起推敲。',
    icon: 'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0ZM20 3v4m1-2h-4M4 17v2m1-1H3',
  },
  {
    title: '真诚分享',
    desc: '不灌水、不追热点，只写真实经历与独立思考。',
    icon: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
  },
]

/* ---------- 关于我轮播（腾讯「师兄师姐说」类比） ---------- */
interface Quote {
  quote: string
  author: string
  role: string
}

const quotes: Quote[] = [
  { quote: '白天写代码，晚上刷番打游戏——把踩过的坑写成文档，是我的浪漫。', author: 'LyY', role: '博主自白' },
  { quote: '从软件开发到产品经理，我相信好的产品能真正服务大众。', author: 'LyY', role: '职业宣言' },
  { quote: '沟通与协作能把团队带向同一个目标，这就是我理解的产品力。', author: 'LyY', role: '团队观' },
  { quote: '关注 AI Agent 与效率工具，保持好奇，拥抱变化。', author: 'LyY', role: '技术观' },
]

const aboutIdx = ref(0)
let timer: number | undefined

function play() {
  stop()
  timer = window.setInterval(() => {
    aboutIdx.value = (aboutIdx.value + 1) % quotes.length
  }, 4500)
}
function stop() {
  if (timer !== undefined) {
    window.clearInterval(timer)
    timer = undefined
  }
}
function next() {
  aboutIdx.value = (aboutIdx.value + 1) % quotes.length
}
function prev() {
  aboutIdx.value = (aboutIdx.value - 1 + quotes.length) % quotes.length
}
function goTo(i: number) {
  aboutIdx.value = i
}

onMounted(play)
onBeforeUnmount(stop)

/* ---------- 社交关注 ---------- */
interface Social {
  label: string
  href: string
  icon: string
  fill: boolean
}

const socials: Social[] = [
  {
    label: 'GitHub 主页',
    href: 'https://github.com/StaminaMyGo',
    fill: true,
    icon: 'M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4M9 18c-4.51 2-5-2-7-2',
  },
  {
    label: '博客仓库',
    href: 'https://github.com/StaminaMyGo/myblog',
    fill: false,
    icon: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
  },
  {
    label: '线上地址',
    href: 'https://staminamygo.github.io/myblog/',
    fill: false,
    icon: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0 0a14.5 14.5 0 0 0 0-20 14.5 14.5 0 0 0 0 20ZM2 12h20',
  },
]
</script>

<template>
  <div class="tencent-home">
    <!-- ==================== 1. Hero ==================== -->
    <section class="tq-hero">
      <div class="tq-hero-decor" aria-hidden="true"></div>
      <div class="tq-inner tq-hero-inner">
        <p class="tq-eyebrow">LYY · 求职作品集 / 个人博客</p>
        <h1 class="tq-hero-title">以代码为笔，以产品为书</h1>
        <p class="tq-hero-sub">
          软件工程方向的全栈学习者与准产品经理 —— 技术分析、产品拆解、项目复盘与 ACGN 热爱，都沉淀在这里。
        </p>
        <div class="tq-hero-cta">
          <a class="tq-btn tq-btn-primary" :href="withBase('/Project/')">查看作品集</a>
          <a class="tq-btn tq-btn-ghost" :href="withBase('/Tech/')">浏览技术博客</a>
        </div>
        <p class="tq-stats">
          <span>{{ postCount }} 篇文章</span>
          <span class="tq-stats-sep" aria-hidden="true">·</span>
          <span>{{ categoryCount }} 个内容分区</span>
          <span class="tq-stats-sep" aria-hidden="true">·</span>
          <span>CI/CD 自动部署</span>
        </p>
      </div>
    </section>

    <!-- ==================== 2. 内容专区（4 列卡片） ==================== -->
    <section class="tq-section">
      <div class="tq-inner">
        <div class="tq-head">
          <span class="tq-label">CONTENT ZONES</span>
          <h2>四大内容专区</h2>
          <p class="tq-sub">技术、产品、ACGN 与项目 —— 总有一块符合你的口味</p>
        </div>
        <div class="tq-zone-grid">
          <a v-for="z in zones" :key="z.link" class="tq-card tq-zone-card" :href="withBase(z.link)">
            <svg
              class="tq-icon tq-icon-zone"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path :d="z.icon" />
            </svg>
            <span class="tq-zone-tag">{{ z.label }}</span>
            <h3 class="tq-zone-title">{{ z.title }}</h3>
            <p class="tq-zone-desc">{{ z.desc }}</p>
            <span class="tq-zone-more">进入专区 →</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ==================== 3. 最新动态（公告列表） ==================== -->
    <section class="tq-section">
      <div class="tq-inner">
        <div class="tq-head tq-head-row">
          <div>
            <span class="tq-label">LATEST POSTS</span>
            <h2>最新动态</h2>
            <p class="tq-sub">最近更新的文章，点击直达全文</p>
          </div>
          <a class="tq-link-more" :href="withBase('/Tech/')">查看更多 →</a>
        </div>
        <div class="tq-news">
          <a v-for="p in latestPosts" :key="p.url" class="tq-news-item" :href="withBase(p.url)">
            <span class="tq-news-date">{{ fmtDate(p.date) }}</span>
            <span class="tq-news-cat">{{ CAT_LABELS[p.category] || p.category }}</span>
            <span class="tq-news-title">{{ p.title }}</span>
            <span class="tq-news-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ==================== 4. N 个理由（3 列特性卡片） ==================== -->
    <section class="tq-reasons">
      <div class="tq-inner">
        <div class="tq-head">
          <span class="tq-label">WHY MY BLOG</span>
          <h2>关注我的 N 个理由</h2>
        </div>
        <div class="tq-reason-grid">
          <div v-for="r in reasons" :key="r.title" class="tq-card tq-reason-card">
            <svg
              class="tq-icon tq-icon-reason"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path :d="r.icon" />
            </svg>
            <h3 class="tq-reason-title">{{ r.title }}</h3>
            <p class="tq-reason-desc">{{ r.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== 5. 关于我（证言轮播） ==================== -->
    <section class="tq-about">
      <div class="tq-inner">
        <div class="tq-head">
          <span class="tq-label">ABOUT ME</span>
          <h2>他们说 · 关于我</h2>
        </div>
        <div class="tq-carousel" aria-live="polite" @mouseenter="stop" @mouseleave="play">
          <span class="tq-quote-mark" aria-hidden="true">“</span>
          <Transition name="tq-fade" mode="out-in">
            <figure class="tq-quote" :key="aboutIdx">
              <blockquote>{{ quotes[aboutIdx].quote }}</blockquote>
              <figcaption>
                <strong>{{ quotes[aboutIdx].author }}</strong>
                <span class="tq-quote-role">{{ quotes[aboutIdx].role }}</span>
              </figcaption>
            </figure>
          </Transition>
          <div class="tq-carousel-controls">
            <button type="button" class="tq-arrow" aria-label="上一条" @click="prev">←</button>
            <div class="tq-dots">
              <button
                v-for="(q, i) in quotes"
                :key="i"
                type="button"
                class="tq-dot"
                :class="{ active: i === aboutIdx }"
                :aria-label="`第 ${i + 1} 条：${q.role}`"
                :aria-selected="i === aboutIdx"
                @click="goTo(i)"
              />
            </div>
            <button type="button" class="tq-arrow" aria-label="下一条" @click="next">→</button>
          </div>
        </div>
        <div class="tq-about-more">
          <a class="tq-link-more" :href="withBase('/Me/')">完整个人介绍 →</a>
        </div>
      </div>
    </section>

    <!-- ==================== 6. 社交关注 ==================== -->
    <section class="tq-section">
      <div class="tq-inner">
        <div class="tq-head tq-head-center">
          <span class="tq-label">FOLLOW ME</span>
          <h2>关注我</h2>
        </div>
        <div class="tq-socials">
          <a
            v-for="s in socials"
            :key="s.label"
            class="tq-social"
            :href="s.href"
            target="_blank"
            rel="noopener"
            :title="s.label"
          >
            <svg
              class="tq-icon tq-icon-social"
              viewBox="0 0 24 24"
              :fill="s.fill ? 'currentColor' : 'none'"
              :stroke="s.fill ? 'none' : 'currentColor'"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path :d="s.icon" />
            </svg>
            <span class="tq-social-label">{{ s.label }}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ==================== 7. 页脚（深色） ==================== -->
    <footer class="tq-footer">
      <div class="tq-inner">
        <div class="tq-footer-grid">
          <div class="tq-footer-col">
            <p class="tq-footer-brand">myblog</p>
            <p class="tq-footer-desc">LyY 的个人博客 · 求职作品集</p>
          </div>
          <div class="tq-footer-col">
            <p class="tq-footer-title">内容专区</p>
            <a :href="withBase('/Tech/')">技术笔记</a>
            <a :href="withBase('/Product/')">产品分析</a>
            <a :href="withBase('/ACGN/')">ACGN 评价</a>
            <a :href="withBase('/Project/')">项目复盘</a>
            <a :href="withBase('/Growth/')">成长思考</a>
            <a :href="withBase('/English/')">英语学习</a>
            <a :href="withBase('/Me/')">关于我</a>
          </div>
          <div class="tq-footer-col">
            <p class="tq-footer-title">更多</p>
            <a href="https://github.com/StaminaMyGo" target="_blank" rel="noopener">GitHub</a>
            <a href="https://github.com/StaminaMyGo/myblog" target="_blank" rel="noopener">博客仓库</a>
            <a href="https://staminamygo.github.io/myblog/" target="_blank" rel="noopener">线上地址</a>
          </div>
        </div>
        <div class="tq-footer-bottom">
          <span>© 2026 LyY · myblog</span>
          <span>Powered by VitePress · Hosted on GitHub Pages</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* ---------- 通用 ---------- */
.tq-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.tencent-home :deep(a) {
  text-decoration: none !important;
  border-bottom: none !important;
}

/* 区块头（腾讯排版：Label 14px/500 蓝 · H2 24px/600 · 正文 14px） */
.tq-head {
  margin-bottom: 32px;
}
.tq-head h2 {
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  color: var(--tq-text-1);
  margin: 8px 0 4px;
  padding: 0;
  border: none;
  letter-spacing: 0;
}
.tq-label {
  display: inline-block;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--tq-blue);
}
.tq-sub {
  font-size: 14px;
  color: var(--tq-text-2);
  margin: 0;
  line-height: 22px;
}
.tq-link-more {
  font-size: 14px;
  font-weight: 600;
  color: var(--tq-blue);
  transition: color 0.2s ease;
}
.tq-link-more:hover {
  color: var(--tq-blue-deep);
}

/* ---------- 1. Hero ---------- */
.tq-hero {
  position: relative;
  overflow: hidden;
  min-height: 480px;
  display: flex;
  align-items: center;
  background: var(--tq-hero-bg);
  color: #fff;
  padding: 88px 0;
}
.tq-hero-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 56px 56px;
}
.tq-hero-inner {
  position: relative;
  z-index: 1;
  width: 100%;
}
.tq-eyebrow {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 16px;
}
.tq-hero-title {
  font-size: 46px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: #fff;
  margin: 0 0 18px;
  border: none;
  padding: 0;
}
.tq-hero-sub {
  font-size: 17px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.88);
  max-width: 640px;
  margin: 0 0 36px;
}
.tq-hero-cta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.tq-btn {
  display: inline-block;
  padding: 11px 34px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease, box-shadow 0.3s ease;
}
.tq-btn-primary {
  background: #fff;
  color: var(--tq-blue);
}
.tq-btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  color: var(--tq-blue-deep);
}
.tq-btn-ghost {
  border: 1px solid rgba(255, 255, 255, 0.7);
  color: #fff;
}
.tq-btn-ghost:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: scale(1.03);
}
.tq-stats {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin: 40px 0 0;
  font-size: 13px;
  font-family: var(--mb-mono);
  color: rgba(255, 255, 255, 0.8);
}
.tq-stats-sep {
  opacity: 0.5;
}

/* ---------- 通用区块与卡片（腾讯卡片规范：12px 圆角 + 双层阴影） ---------- */
.tq-section {
  padding: 80px 0;
}
.tq-card {
  background: var(--tq-card-bg);
  border-radius: var(--tq-radius-card);
  box-shadow: var(--tq-shadow-card);
  transition: var(--tq-transition);
}
.tq-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--tq-shadow-hover);
}

/* ---------- 2. 内容专区 ---------- */
.tq-zone-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
.tq-zone-card {
  display: flex;
  flex-direction: column;
  padding: 32px;
}
.tq-icon {
  display: block;
}
.tq-icon-zone {
  width: 48px;
  height: 48px;
  color: var(--tq-text-3);
  margin-bottom: 20px;
  transition: color var(--tq-transition);
}
.tq-zone-card:hover .tq-icon-zone {
  color: var(--tq-blue);
}
.tq-zone-tag {
  align-self: flex-start;
  font-size: 12px;
  font-weight: 500;
  color: var(--tq-blue);
  background: var(--tq-blue-soft);
  border-radius: 4px;
  padding: 2px 10px;
  margin-bottom: 12px;
}
.tq-zone-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--tq-text-1);
  margin: 0 0 8px;
  line-height: 1.4;
}
.tq-zone-desc {
  font-size: 14px;
  color: var(--tq-text-2);
  line-height: 1.7;
  margin: 0 0 20px;
}
.tq-zone-more {
  margin-top: auto;
  font-size: 14px;
  font-weight: 600;
  color: var(--tq-blue);
  transition: color var(--tq-transition);
}
.tq-zone-card:hover .tq-zone-more {
  color: var(--tq-blue-deep);
}

/* ---------- 3. 最新动态（公告列表：56px 行 + 虚线分隔） ---------- */
.tq-head-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
}
.tq-news {
  border-top: 1px dashed var(--tq-border);
}
.tq-news-item {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 56px;
  padding: 0 12px;
  border-bottom: 1px dashed var(--tq-border);
  transition: background var(--tq-transition);
}
.tq-news-item:hover {
  background: var(--tq-blue-soft);
}
.tq-news-date {
  flex: 0 0 auto;
  font-size: 13px;
  font-family: var(--mb-mono);
  color: var(--tq-text-3);
}
.tq-news-cat {
  flex: 0 0 auto;
  font-size: 12px;
  color: var(--tq-blue);
  background: var(--tq-blue-soft);
  border-radius: 4px;
  padding: 2px 10px;
  white-space: nowrap;
}
.tq-news-title {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--tq-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color var(--tq-transition);
}
.tq-news-item:hover .tq-news-title {
  color: var(--tq-blue);
}
.tq-news-arrow {
  flex: 0 0 auto;
  color: var(--tq-blue);
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity var(--tq-transition), transform var(--tq-transition);
}
.tq-news-item:hover .tq-news-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* ---------- 4. N 个理由（3 列） ---------- */
.tq-reasons {
  padding: 80px 0;
}
.tq-reason-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
.tq-reason-card {
  padding: 32px;
}
.tq-icon-reason {
  width: 48px;
  height: 48px;
  color: var(--tq-blue);
  margin-bottom: 20px;
}
.tq-reason-card:hover .tq-icon-reason {
  animation: tq-wiggle 0.3s ease;
}
@keyframes tq-wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-8deg); }
  75% { transform: rotate(8deg); }
}
.tq-reason-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--tq-text-1);
  margin: 0 0 10px;
}
.tq-reason-desc {
  font-size: 13.5px;
  color: var(--tq-text-2);
  line-height: 1.75;
  margin: 0;
}

/* ---------- 5. 关于我（证言轮播 · 浅灰分区） ---------- */
.tq-about {
  background: var(--tq-bg-band);
  padding: 80px 0;
}
.tq-carousel {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 0 12px;
}
.tq-quote-mark {
  position: absolute;
  top: -16px;
  left: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 120px;
  line-height: 1;
  color: var(--tq-blue);
  opacity: 0.18;
  pointer-events: none;
  user-select: none;
}
.tq-quote {
  margin: 0;
  padding: 16px 8px 8px 32px;
  text-align: left;
}
.tq-quote blockquote {
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.7;
  color: var(--tq-text-1);
}
.tq-quote figcaption {
  margin-top: 20px;
  font-size: 14px;
  color: var(--tq-text-2);
}
.tq-quote figcaption strong {
  color: var(--tq-blue);
  font-weight: 600;
  margin-right: 10px;
}
.tq-quote-role {
  opacity: 0.85;
}
.tq-carousel-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 28px;
}
.tq-arrow {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--tq-border);
  background: var(--tq-card-bg);
  color: var(--tq-text-2);
  font-size: 15px;
  cursor: pointer;
  transition: var(--tq-transition);
}
.tq-arrow:hover {
  border-color: var(--tq-blue);
  color: var(--tq-blue);
}
.tq-dots {
  display: flex;
  gap: 8px;
}
.tq-dot {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  border: 2px solid var(--tq-border);
  background: transparent;
  padding: 0;
  cursor: pointer;
  transition: var(--tq-transition);
}
.tq-dot:hover {
  border-color: var(--tq-blue);
}
.tq-dot.active {
  background: var(--tq-blue);
  border-color: var(--tq-blue);
  width: 22px;
}
.tq-about-more {
  margin-top: 24px;
  text-align: center;
}
/* 轮播切换过渡 */
.tq-fade-enter-active,
.tq-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.tq-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.tq-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ---------- 6. 社交关注 ---------- */
.tq-head-center {
  text-align: center;
}
.tq-socials {
  display: flex;
  justify-content: center;
  gap: 48px;
  flex-wrap: wrap;
}
.tq-social {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.tq-icon-social {
  width: 32px;
  height: 32px;
  color: #999;
  transition: color var(--tq-transition), transform var(--tq-transition);
}
.tq-social:hover .tq-icon-social {
  color: var(--tq-blue);
  transform: translateY(-3px);
}
.tq-social-label {
  font-size: 13px;
  color: var(--tq-text-2);
  transition: color var(--tq-transition);
}
.tq-social:hover .tq-social-label {
  color: var(--tq-blue);
}

/* ---------- 7. 页脚（Minimal: #f5f5f7 / #7a7a7a / 12px） ---------- */
.tq-footer {
  background: var(--tq-footer-bg);
  color: var(--tq-footer-text);
  font-size: 12px;
  padding: 56px 0 32px;
}
.tq-footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 40px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--mb-ui2);
}
.tq-footer-brand {
  font-size: 16px;
  font-weight: 700;
  color: var(--mb-text);
  margin: 0 0 8px;
}
.tq-footer-desc {
  margin: 0;
}
.tq-footer-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tq-footer-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--mb-text);
  margin: 0 0 4px;
}
.tq-footer-col a {
  color: var(--tq-footer-text);
  transition: color 0.2s ease;
}
.tq-footer-col a:hover {
  color: var(--mb-accent);
}
.tq-footer-bottom {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 24px;
}

/* ---------- 响应式 ---------- */
/* 移动端：单列 → 平板：2 列 → 桌面：专区 4 列 / 理由 3 列 */
@media (min-width: 640px) {
  .tq-zone-grid,
  .tq-reason-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .tq-zone-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .tq-reason-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .tq-hero {
    min-height: 420px;
    padding: 64px 0;
  }
  .tq-hero-title {
    font-size: 36px;
  }
}

@media (max-width: 640px) {
  .tq-section,
  .tq-reasons,
  .tq-about {
    padding: 48px 0;
  }
  .tq-hero {
    min-height: auto;
    padding: 48px 0;
  }
  .tq-hero-title {
    font-size: 30px;
  }
  .tq-hero-sub {
    font-size: 15px;
  }
  .tq-hero-cta {
    flex-direction: column;
    align-items: stretch;
  }
  .tq-btn {
    text-align: center;
  }
  .tq-head-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .tq-news-item {
    flex-wrap: wrap;
    row-gap: 4px;
    padding: 12px;
  }
  .tq-news-title {
    flex-basis: 100%;
    white-space: normal;
  }
  .tq-quote-mark {
    font-size: 80px;
    top: -8px;
  }
  .tq-quote blockquote {
    font-size: 17px;
  }
  .tq-socials {
    gap: 24px;
  }
  .tq-footer-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  .tq-footer-bottom {
    flex-direction: column;
  }
}
</style>