<script setup lang="ts">
/**
 * AboutSceneDeck.vue
 * About 场景舞台主组件（/Me/ 页面重构核心）
 * - 固定视口舞台：6 场景绝对叠放，仅激活场景可见（SSR 输出全部文案）
 * - 状态机 go(target)：边界钳制 + 450ms 换场锁（防连跳）
 * - 输入矩阵：滚轮(≥40) / 触控(≥24, passive 管理) / 键盘(↑↓ 空格 Home End) / 圆点点击
 * - 词条逐条点亮：CSS 自定义属性 --d 控制 transition-delay，无需 JS 定时器
 * - 根节点为 div[role=region]（VitePress 已提供 main，避免嵌套）
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import AboutFlowCanvas from './AboutFlowCanvas.vue'
import AboutBreath from './AboutBreath.vue'

/* ---------- 状态机 ---------- */
const scene = ref(0)
const total = 6
let locked = false
let lockTimer: number | undefined
let touchStartY = 0
const deckRef = ref<HTMLElement | null>(null)

const sceneNames = [
  'Hero 身份锚点',
  '我的转变',
  '我的行事准则',
  '能力光谱',
  '与我合作的预期',
  '代表项目',
]

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

function go(target: number) {
  const t = clamp(target, 0, total - 1)
  if (locked || t === scene.value) return
  locked = true
  scene.value = t
  window.clearTimeout(lockTimer)
  lockTimer = window.setTimeout(() => {
    locked = false
  }, 450)
}

/** 转场延迟工具：生成 CSS 自定义属性 style 对象 */
function d(ms: number) {
  return { '--d': `${ms}ms` }
}

/* ---------- 输入驱动 ---------- */
function onWheel(e: WheelEvent) {
  if (Math.abs(e.deltaY) < 40) return
  e.preventDefault()
  go(scene.value + (e.deltaY > 0 ? 1 : -1))
}

function isInteractiveTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false
  const tag = t.tagName
  return (
    tag === 'A' || tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA' ||
    tag === 'SELECT' || t.isContentEditable || t.hasAttribute('tabindex')
  )
}

function onKeydown(e: KeyboardEvent) {
  // 忽略输入法组合键与修饰键组合
  if (e.isComposing || e.keyCode === 229 || e.metaKey || e.ctrlKey || e.altKey) return
  // 焦点在可交互元素内部时不劫持按键（让链接/按钮正常获得 Enter/Space）
  if (isInteractiveTarget(e.target)) return
  switch (e.key) {
    case 'ArrowDown':
    case 'PageDown':
    case ' ':
      e.preventDefault()
      go(scene.value + 1)
      break
    case 'ArrowUp':
    case 'PageUp':
      e.preventDefault()
      go(scene.value - 1)
      break
    case 'Home':
      e.preventDefault()
      go(0)
      break
    case 'End':
      e.preventDefault()
      go(total - 1)
      break
  }
}

function onTouchStart(e: TouchEvent) {
  touchStartY = e.touches[0].clientY
}

function onTouchEnd(e: TouchEvent) {
  const dy = touchStartY - e.changedTouches[0].clientY
  if (Math.abs(dy) < 24) return
  e.preventDefault()
  go(scene.value + (dy > 0 ? 1 : -1))
}

/* ---------- 生命周期：滚动锁 + 事件注册/注销 ---------- */
onMounted(() => {
  document.documentElement.classList.add('about-deck-active')
  const el = deckRef.value
  if (el) {
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: false })
  }
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove('about-deck-active')
  const el = deckRef.value
  if (el) {
    el.removeEventListener('wheel', onWheel)
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchend', onTouchEnd)
  }
  window.removeEventListener('keydown', onKeydown)
  window.clearTimeout(lockTimer)
})

/* ---------- 计数器 / 播报 ---------- */
const counterLabel = computed(() => String(scene.value + 1).padStart(2, '0'))
const liveText = computed(() => `第 ${scene.value + 1} 屏：${sceneNames[scene.value]}`)

/* ---------- S1 对照数据 ---------- */
const pastItems = [
  '只写课堂作业代码',
  '单打独斗',
  '追求绩点高分',
  '技术至上',
  '跟随共识',
]
const nowItems = [
  '走完开发→构建→部署→测试→上线全流程',
  '小组协作（乡村助学平台）',
  '用 3.7 绩点换来行业视野',
  '技术价值 → 用户价值',
  '宁准不快 · 宁深不广 · 独立思考',
]

/* ---------- S2 行事准则 ---------- */
interface Principle {
  num: string
  text: string
}
const principles: Principle[] = [
  { num: '①', text: '宁准不快 —— 在 deadline 前规划好步骤' },
  { num: '②', text: '宁深不广 —— 按兴趣选课，深挖不铺开' },
  { num: '③', text: '先独立思考，再协同对齐' },
]

/* ---------- S3 能力光谱 ---------- */
interface Ability {
  name: string
  fit: string
  unfit: string
}
const abilities: Ability[] = [
  { name: '需求洞察', fit: '沟通厘清真实诉求', unfit: '无对象信息的判断' },
  { name: 'vibe-coding', fit: '快速 demo 与可视化', unfit: '深度后端专项' },
  { name: '文档整理', fit: '复杂文本→结构化结论', unfit: '纯装饰排版' },
  { name: '多视角分析', fit: '平衡多方角色诉求', unfit: '单点执行' },
  { name: '沟通协作', fit: '把握交际距离推进共识', unfit: '纯应酬' },
]

/* ---------- S4 合作承诺 ---------- */
const commitments = [
  '你将会获得一份把模糊诉求整理成清晰清单的需求拆解',
  '你将会获得可运行的 demo 与可视化结果，而不是口头概念',
  '你将会获得 deadline 前的完整交付和一份可执行的复盘结论',
]

/* ---------- S5 项目卡（固定清单，lucide 线描图标 stroke-width 1.8） ---------- */
interface ProjectCard {
  title: string
  desc: string
  link: string
  icon: string[]
}
const projects: ProjectCard[] = [
  {
    title: 'myblog 博客站',
    desc: '本博客 · VitePress + GitHub Actions 自动构建部署',
    link: '/Project/myblog',
    icon: [
      'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z',
      'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
    ],
  },
  {
    title: 'LifeTracker 番茄钟',
    desc: '跨端时间管理 / 番茄钟应用（PWA + Android APK）',
    link: '/Project/LifeTracker',
    icon: [
      'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
      'M12 6v6l4 2',
    ],
  },
  {
    title: 'Everything Agent',
    desc: 'DeepSeek 大模型 + Everything 索引的自然语言文件检索',
    link: '/Project/BasedOnEverythingAgent',
    icon: [
      'M21 21l-4.35-4.35',
      'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
    ],
  },
  {
    title: 'TimeLine 学习时间线',
    desc: '以 PRD 形式设计的个人学习时间线 Web 应用',
    link: '/Project/PRD_TimeLine个人学习时间线',
    icon: [
      'M3 3v18h18',
      'M7 14l4-4 3 3 5-6',
    ],
  },
  {
    title: '乡村助学平台',
    desc: '小组合作项目 · React + TypeScript Web 前端',
    link: '/Project/乡村建议平台-小组合作',
    icon: [
      'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2',
      'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'M23 21v-2a4 4 0 0 0-3-3.87',
      'M16 3.13a4 4 0 0 1 0 7.75',
    ],
  },
]

/* ---------- 社交链接（复用 TencentHome socials 数据与图标） ---------- */
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
  <div ref="deckRef" class="about-scene-deck" role="region" aria-label="关于我 · 场景导航">
    <!-- 背景层：S1 使用 --mb-bg-alt 表面 -->
    <div class="about-layer" :class="{ lit: scene === 1 }" aria-hidden="true"></div>

    <!-- 粒子流背景（仅 Hero 激活时挂载） -->
    <AboutFlowCanvas v-if="scene === 0" />

    <!-- 六个场景（全部常驻 DOM，SSR 输出全部文案） -->
    <div class="about-scenes">
      <!-- S0 · Hero -->
      <section
        class="scene scene-hero"
        :class="{ active: scene === 0 }"
        :aria-hidden="scene !== 0"
        aria-labelledby="scene-title-0"
      >
        <div class="scene-body scene-hero-body">
          <p class="scene-eyebrow" :style="d(0)">$ whoami</p>
          <h1 id="scene-title-0" class="scene-name" :style="d(80)">
            LyY<span class="scene-cursor" aria-hidden="true">▌</span>
          </h1>
          <p class="scene-subtitle" :style="d(160)">软件工程在读 · 准产品经理 · ENTJ 实干家</p>
          <p class="scene-intro" :style="d(240)">需求洞察 × vibe-coding × 文档整理 —— 白天写代码，晚上刷番打游戏</p>
          <p class="scene-hint" :style="d(320)">
            <AboutBreath :text="'下滑，认识我 · 一共六屏'" />
            <span class="about-chevron" aria-hidden="true"></span>
          </p>
        </div>
      </section>

      <!-- S1 · 我的转变（双列对比） -->
      <section
        class="scene"
        :class="{ active: scene === 1 }"
        :aria-hidden="scene !== 1"
        aria-labelledby="scene-title-1"
      >
        <div class="scene-body">
          <div class="scene-head">
            <span class="scene-no">02 / 06</span>
            <h2 id="scene-title-1">我的转变</h2>
            <p class="scene-sub">从学习者走向实践者的五组对照</p>
          </div>
          <div class="s1-cols">
            <div class="s1-col s1-col--past">
              <p class="s1-col-title" :style="d(0)">过去的我</p>
              <p
                v-for="(it, i) in pastItems"
                :key="'p' + i"
                class="s1-item item"
                :style="d(120 + i * 40)"
              >{{ it }}</p>
            </div>
            <div class="s1-divider" :style="d(380)" aria-hidden="true"></div>
            <div class="s1-col s1-col--now">
              <p class="s1-col-title" :style="d(0)">现在的我</p>
              <p
                v-for="(it, i) in nowItems"
                :key="'n' + i"
                class="s1-item item"
                :style="d(120 + i * 40)"
              >{{ it }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- S2 · 我的行事准则 -->
      <section
        class="scene"
        :class="{ active: scene === 2 }"
        :aria-hidden="scene !== 2"
        aria-labelledby="scene-title-2"
      >
        <div class="scene-body">
          <div class="scene-head">
            <span class="scene-no">03 / 06</span>
            <h2 id="scene-title-2">我的行事准则</h2>
            <p class="scene-sub">行动逻辑与取舍立场</p>
          </div>
          <div class="s2-list">
            <p
              v-for="(p, i) in principles"
              :key="p.num"
              class="s2-item item"
              :style="d(i * 120)"
            >
              <span class="s2-num" aria-hidden="true">{{ p.num }}</span>
              <span>{{ p.text }}</span>
            </p>
            <!-- 强调条：取舍立场（在 ④ 点亮后淡入） -->
            <p class="s2-card" :style="d(3 * 120 + 200)">
              <span class="s2-num" aria-hidden="true">④</span>
              <span>用视野换绩点 —— 主动放弃水课刷分，3.7 绩点换来行业视野</span>
            </p>
          </div>
        </div>
      </section>

      <!-- S3 · 能力光谱 -->
      <section
        class="scene"
        :class="{ active: scene === 3 }"
        :aria-hidden="scene !== 3"
        aria-labelledby="scene-title-3"
      >
        <div class="scene-body">
          <div class="scene-head">
            <span class="scene-no">04 / 06</span>
            <h2 id="scene-title-3">能力光谱</h2>
            <p class="scene-sub">适用于什么，不适用于什么</p>
          </div>
          <div class="s3-list">
            <div
              v-for="(a, i) in abilities"
              :key="a.name"
              class="s3-row item"
              :style="d(i * 80)"
            >
              <span class="s3-name">{{ a.name }}</span>
              <span class="s3-line" aria-hidden="true"></span>
              <span class="s3-bound">
                <span>{{ a.fit }}</span>
                <span aria-hidden="true">|</span>
                <span>{{ a.unfit }}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- S4 · 与我合作的预期 -->
      <section
        class="scene"
        :class="{ active: scene === 4 }"
        :aria-hidden="scene !== 4"
        aria-labelledby="scene-title-4"
      >
        <div class="scene-body">
          <div class="scene-head">
            <span class="scene-no">05 / 06</span>
            <h2 id="scene-title-4">与我合作的预期</h2>
          </div>
          <div class="s4-list">
            <p
              v-for="(c, i) in commitments"
              :key="i"
              class="s4-item item"
              :style="d(i * 150)"
            >
              <span class="s4-arrow" aria-hidden="true">→</span>
              <span>{{ c }}</span>
            </p>
          </div>
          <a class="about-cta" :style="d(3 * 150 + 300)" :href="withBase('/Me/个人介绍')">
            查看完整个人介绍 →
          </a>
        </div>
      </section>

      <!-- S5 · 代表项目 & 联系 -->
      <section
        class="scene"
        :class="{ active: scene === 5 }"
        :aria-hidden="scene !== 5"
        aria-labelledby="scene-title-5"
      >
        <div class="scene-body">
          <div class="scene-head">
            <span class="scene-no">06 / 06</span>
            <h2 id="scene-title-5">代表项目</h2>
            <p class="scene-sub">每一个项目都是一次完整的从 0 到 1</p>
          </div>
          <div class="s5-grid">
            <a
              v-for="(p, i) in projects"
              :key="p.link"
              class="s5-card"
              :style="d(i * 60)"
              :href="withBase(p.link)"
            >
              <svg
                class="s5-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path v-for="(path, pi) in p.icon" :key="pi" :d="path" />
              </svg>
              <span class="s5-title">{{ p.title }}</span>
              <span class="s5-desc">{{ p.desc }}</span>
              <span class="s5-more">阅读复盘 →</span>
            </a>
          </div>
          <div class="about-socials" :style="d(5 * 60 + 100)">
            <a
              v-for="s in socials"
              :key="s.label"
              class="about-social"
              :href="s.href"
              target="_blank"
              rel="noopener"
              :title="s.label"
            >
              <svg
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
              <span>{{ s.label }}</span>
            </a>
          </div>
          <p class="s5-end" :style="d(5 * 60 + 160)">
            <AboutBreath :text="'欢迎通过 GitHub 找到我 —— 向上滚动重新开始'" />
          </p>
        </div>
      </section>
    </div>

    <!-- 侧边圆点导航 -->
    <nav class="about-dots" aria-label="场景导航">
      <button
        v-for="(name, i) in sceneNames"
        :key="i"
        type="button"
        :class="{ active: scene === i }"
        :aria-label="`第 ${i + 1} 屏：${name}`"
        :aria-current="scene === i ? 'true' : undefined"
        @click="go(i)"
      />
    </nav>

    <!-- 场景计数器 -->
    <header class="about-counter" aria-hidden="true">
      <span class="current">{{ counterLabel }}</span> / 0{{ total }}
    </header>

    <!-- aria-live 播报区 -->
    <div class="about-live" aria-live="polite">{{ liveText }}</div>
  </div>
</template>