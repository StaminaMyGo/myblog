<script setup lang="ts">
/**
 * AboutFlowCanvas.vue
 * 粒子流 Canvas 背景（About 场景舞台 Hero 场景专用）
 * 机制翻译自 Kimi 页面"像素流光"：程序化粒子缓慢向右上漂移，无任何媒体资源。
 * 颜色跟随 --mb-ax-rgb 令牌，深浅模式切换仅重读颜色、不重建粒子。
 * 仅当场景 0 激活时挂载（父组件 v-if 控制），离开即卸载并完整清理。
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  alpha: number
  phase: number
}

let ctx: CanvasRenderingContext2D | null = null
let particles: Particle[] = []
let raf = 0
let width = 0
let height = 0
let running = false
let lastTime = 0
let rgb = '0, 82, 217' // 兜底值；挂载后由令牌覆盖
let resizeObserver: ResizeObserver | null = null
let mutationObserver: MutationObserver | null = null

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

/** 重读 --mb-ax-rgb（如 "0, 82, 217" / "51, 150, 255"） */
function readAccentRgb(): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--mb-ax-rgb')
    .trim()
  return raw || rgb
}

function initParticles() {
  const count = clamp(Math.floor(width / 20), 20, 80)
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: -0.1 + Math.random() * 0.4, // ∈ [-0.1, 0.3] 缓慢右移
    vy: -0.3 + Math.random() * 0.2, // ∈ [-0.3, -0.1] 缓慢上移
    r: 1 + Math.random(), // ∈ [1, 2]
    alpha: 0.06 + Math.random() * 0.09, // ∈ [0.06, 0.15] 低透明度
    phase: Math.random() * Math.PI * 2, // 正弦摆动相位
  }))
}

/** 尺寸重建：容器尺寸 × DPR(上限 2)，重设画布并重排粒子 */
function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.parentElement?.getBoundingClientRect()
  if (!rect || rect.width === 0 || rect.height === 0) return
  width = rect.width
  height = rect.height
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  ctx = canvas.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  initParticles()
}

function draw(time: number) {
  if (!running || !ctx) return
  // 帧时间归一：dt 以秒计，夹取上限避免切页跳帧
  const dt = Math.min((time - lastTime) / 1000, 0.05)
  lastTime = time
  ctx.clearRect(0, 0, width, height)
  for (const p of particles) {
    // 速度按 60fps 基准归一
    p.x += p.vx * dt * 60
    p.y += p.vy * dt * 60
    // 越界重置到对侧
    if (p.x < -10) p.x = width + 10
    if (p.x > width + 10) p.x = -10
    if (p.y < -10) p.y = height + 10
    if (p.y > height + 10) p.y = -10
    ctx.beginPath()
    ctx.fillStyle = `rgba(${rgb}, ${p.alpha})`
    // 轻微正弦摆动，避免直线漂移的生硬感
    ctx.arc(p.x + Math.sin(time * 0.001 + p.phase) * 2, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
  }
  raf = requestAnimationFrame(draw)
}

function start() {
  if (running) return
  // 系统偏好"减少动态"时不启动动画
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  running = true
  lastTime = performance.now()
  raf = requestAnimationFrame(draw)
}

function stop() {
  running = false
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}

function onVisibility() {
  if (document.hidden) stop()
  else start()
}

onMounted(() => {
  rgb = readAccentRgb()
  resize()

  // 容器尺寸变化 → 重建画布
  if (canvasRef.value?.parentElement) {
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvasRef.value.parentElement)
  }

  // .dark 类切换 → 仅重读颜色，不重建粒子
  mutationObserver = new MutationObserver(() => {
    rgb = readAccentRgb()
  })
  mutationObserver.observe(document.documentElement, { attributeFilter: ['class'] })

  document.addEventListener('visibilitychange', onVisibility)
  start()
})

onBeforeUnmount(() => {
  stop()
  document.removeEventListener('visibilitychange', onVisibility)
  resizeObserver?.disconnect()
  resizeObserver = null
  mutationObserver?.disconnect()
  mutationObserver = null
  ctx = null
})
</script>

<template>
  <canvas ref="canvasRef" class="about-flow-canvas" aria-hidden="true"></canvas>
</template>

<style scoped>
.about-flow-canvas {
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>