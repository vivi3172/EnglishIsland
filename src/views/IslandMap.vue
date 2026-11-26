<script setup>
// 首頁：英語星球。拖曳旋轉星球、‹ › 切換島嶼、點島名進入；右側（手機在下方）列出每座島的進度。
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ZONES, findWord } from '../data/zones.js'
import { DAILY_WORDS } from '../data/dailyWords.js'
import { BUILDINGS, RESOURCES } from '../data/survival.js'
import { PLANET_ISLANDS } from '../data/planet.js'
import { LONG_VOWELS } from '../data/phonics/longVowels.js'
import { SYLLABLES } from '../data/phonics/syllables.js'
import { courseIndex } from '../logic/phonics.js'
import { overallStats, patternMastery } from '../logic/phonicsProgress.js'
import { project, rotationFor, frontIndex, stepIndex } from '../logic/planet.js'
import { game } from '../store/game.js'
import { phonics } from '../store/phonics.js'
import { talk } from '../store/talk.js'
import { tenses } from '../store/tenses.js'
import { DIALOGUES } from '../data/dialogues.js'
import Icon from '../components/Icon.vue'
import SurvivalPanel from '../components/SurvivalPanel.vue'

const router = useRouter()
const report = computed(() => game.dailyReport)
const explored = computed(() => ZONES.filter((z) => game.stars(z.id) >= 1).length)
const longVowelIdx = courseIndex(LONG_VOWELS)

// ---------- 每座島的進度 ----------
const pct = (v) => Math.round(v * 100)

function statusOf(isl) {
  switch (isl.kind) {
    case 'zone': {
      if (!game.isUnlocked(isl.id)) return { locked: true, value: 0, meta: '未解鎖' }
      const s = game.stars(isl.id)
      return { value: s / 3, meta: `★ ${s} / 3` }
    }
    case 'daily': {
      const n = game.progress.dailyLearned.length
      return { value: n / DAILY_WORDS.length, meta: `${n} / ${DAILY_WORDS.length} 字`, alert: game.dailyDone ? null : '今日新字' }
    }
    case 'review': {
      const n = Object.keys(game.progress.wrongWords).filter(findWord).length
      return { value: null, meta: n ? `${n} 隻怪獸` : '沒有怪獸', alert: n ? '待複習' : null }
    }
    case 'phonics': {
      const m = overallStats(longVowelIdx, phonics.course(LONG_VOWELS.id ?? 'long-vowels')).mastery
      return { value: m, meta: `熟練 ${pct(m)}%` }
    }
    case 'syllables': {
      const cp = phonics.course(SYLLABLES.id)
      const m = SYLLABLES.rules.reduce((s, r) => s + patternMastery(cp, r.id), 0) / SYLLABLES.rules.length
      return { value: m, meta: `熟練 ${pct(m)}%` }
    }
    case 'talk': {
      const max = DIALOGUES.length * 3
      const n = talk.total(DIALOGUES.map((d) => d.id))
      return { value: n / max, meta: `★ ${n} / ${max}` }
    }
    case 'tenses': {
      const o = tenses.overall()
      return { value: o.mastery, meta: `探索 ${o.seen} / 12 · 熟練 ${pct(o.mastery)}%` }
    }
    case 'build': {
      const n = game.progress.built.length
      return { value: n / BUILDINGS.length, meta: game.progress.rescuedDay ? '已獲救' : `設施 ${n} / ${BUILDINGS.length}` }
    }
    default:
      return { value: null, meta: '' }
  }
}

const islands = computed(() => PLANET_ISLANDS.map((isl) => ({ ...isl, status: statusOf(isl) })))
// 建議下一站：第一個還沒拿到星星的已解鎖區域
const nextZone = computed(() => ZONES.find((z) => game.isUnlocked(z.id) && game.stars(z.id) < 1) ?? null)

// ---------- 旋轉 ----------
const startIndex = Math.max(0, PLANET_ISLANDS.findIndex((i) => i.id === (nextZone.value?.id ?? 'daily')))
const rot = ref(rotationFor(PLANET_ISLANDS[startIndex].lon, 0))
const front = computed(() => frontIndex(PLANET_ISLANDS, rot.value))
const frontIsland = computed(() => islands.value[front.value])
const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

let raf = 0
function spinTo(target) {
  cancelAnimationFrame(raf)
  if (reduceMotion) {
    rot.value = target
    return
  }
  const tick = () => {
    const d = target - rot.value
    if (Math.abs(d) < 0.1) {
      rot.value = target
      return
    }
    rot.value += d * 0.14
    raf = requestAnimationFrame(tick)
  }
  tick()
}
const focusIsland = (i) => spinTo(rotationFor(PLANET_ISLANDS[i].lon, rot.value))
const step = (dir) => focusIsland(stepIndex(front.value, dir, PLANET_ISLANDS.length))
onBeforeUnmount(() => cancelAnimationFrame(raf))

function enter(isl) {
  if (!isl.status.locked) router.push(isl.to)
}

// 投影：島在星球表面的位置、大小與遠近
const placed = computed(() =>
  islands.value.map((isl, i) => {
    const p = project(isl.lon, isl.lat, rot.value)
    return {
      ...isl,
      index: i,
      visible: p.z > 0.02,
      showLabel: p.z > 0.5,
      style: {
        left: `${50 + p.x * 44}%`,
        top: `${50 + p.y * 44}%`,
        '--isl': isl.color,
        '--depth': p.z.toFixed(3),
        zIndex: Math.round(p.z * 100) + 10,
      },
    }
  }),
)

// ---------- 拖曳 ----------
const DRAG_SPEED = 0.35 // 每拖 1px 轉幾度
let drag = null
let suppressClick = false

function onPointerDown(e) {
  if (e.button !== 0) return
  cancelAnimationFrame(raf)
  drag = { x: e.clientX, rot: rot.value, moved: false, id: e.pointerId }
}
function onPointerMove(e) {
  if (!drag || e.pointerId !== drag.id) return
  const dx = e.clientX - drag.x
  if (!drag.moved && Math.abs(dx) > 5) {
    drag.moved = true
    // 真的開始拖曳才 capture，避免點島名時 click 被改到舞台上
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  if (drag.moved) rot.value = drag.rot + dx * DRAG_SPEED
}
function onPointerUp() {
  if (!drag) return
  if (drag.moved) {
    // 只吞掉拖曳結束時「緊接著」的那個 click；瀏覽器不一定會送出它，所以下一輪事件就清掉，免得吃掉真正的點擊
    suppressClick = true
    setTimeout(() => (suppressClick = false), 0)
    focusIsland(front.value) // 放手後吸附到最近的島
  }
  drag = null
}
function onClickCapture(e) {
  if (suppressClick) {
    e.stopPropagation()
    e.preventDefault()
    suppressClick = false
  }
}
function onKey(e) {
  if (e.key === 'ArrowLeft') step(-1)
  else if (e.key === 'ArrowRight') step(1)
  else if (e.key === 'Enter') enter(frontIsland.value)
  else return
  e.preventDefault()
}
</script>

<template>
  <section class="map-page planet-page">
    <!-- 第一次登島 -->
    <div v-if="!game.progress.introSeen" class="modal-backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="story-title">
        <div class="eyebrow">INCIDENT REPORT · 事故紀錄</div>
        <h2 id="story-title" class="modal-title">船難後第 1 天</h2>
        <p>你搭郵輪前往國際商務會議，途中遇上暴風雨。醒來時你漂到一顆陌生的星球，上面散落著一座座小島。</p>
        <p>飯店告示、商店收據、辦公室報告、燈塔裡的通訊紀錄——<strong>全是多益常見的英文。</strong></p>
        <div class="brief-list">
          <div><span class="mono">01</span> 拖曳旋轉星球，點島名登島。每完成一項英語任務，就是一次外出探索，會消耗飽足與水分。</div>
          <div><span class="mono">02</span> 表現越好，帶回的物資越多。</div>
          <div><span class="mono">03</span> 星球上的時間與現實同步。每過一天，飽足與水分都會下降。</div>
          <div><span class="mono">04</span> 收集零件與木材，到無線電塔修好無線電，發出求救訊號。</div>
        </div>
        <button class="btn primary" @click="game.seeIntro()">開始求生 <Icon name="right" :size="16" /></button>
      </div>
    </div>

    <div v-if="report" class="banner" role="status">
      <Icon name="alert" :size="18" />
      <div>
        <strong>你離開了 {{ report.days }} 天。</strong> 飽足與水分持續下降。
        <span v-if="Object.keys(report.gained).length">
          設施產出：
          <span v-for="(n, k) in report.gained" :key="k" class="chip-inline mono"><Icon :name="RESOURCES[k].icon" :size="13" /> +{{ n }}</span>
        </span>
        <span v-if="report.fainted" class="danger-text">期間你昏倒了，物資損失一半。</span>
      </div>
      <button class="icon-btn" aria-label="關閉" @click="game.dismissReport()"><Icon name="close" /></button>
    </div>

    <div v-if="game.progress.rescuedDay" class="banner good" role="status">
      <Icon name="radio" :size="18" />
      <div>
        <strong>第 {{ game.progress.rescuedDay }} 天，救援確認。</strong>
        無線電傳來回應：「We are coming. Stay there.」你仍可繼續在星球上練習。
      </div>
    </div>

    <div class="planet-layout">
      <!-- 星球 -->
      <div class="planet-col">
        <div
          class="planet-stage"
          tabindex="0"
          role="group"
          :aria-label="`英語星球，正面是 ${frontIsland.title}。左右方向鍵旋轉，Enter 登島`"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @click.capture="onClickCapture"
          @keydown="onKey"
        >
          <div class="planet" :style="{ '--spin': rot }">
            <div class="planet-ring back" aria-hidden="true"></div>
            <div class="planet-body" aria-hidden="true">
              <div class="planet-surface"></div>
              <div class="planet-shade"></div>
            </div>
            <template v-for="isl in placed" :key="isl.id">
              <div v-show="isl.visible" class="isle" :class="{ locked: isl.status.locked, front: isl.index === front }" :style="isl.style">
                <button class="isle-land" tabindex="-1" :aria-hidden="true" @click="focusIsland(isl.index)">
                  <span>{{ isl.status.locked ? '🔒' : isl.emoji }}</span>
                </button>
                <button
                  v-if="isl.showLabel"
                  class="isle-label"
                  tabindex="-1"
                  :aria-hidden="true"
                  @click="isl.index === front ? enter(isl) : focusIsland(isl.index)"
                >
                  <small class="mono">{{ isl.tag }}</small>
                  <strong>{{ isl.status.locked ? '未知島嶼' : isl.title }}</strong>
                </button>
              </div>
            </template>
            <div class="planet-ring front" aria-hidden="true"></div>
          </div>
        </div>

        <div class="planet-controls">
          <button class="btn" @click="step(-1)"><Icon name="left" :size="16" /> 上一座</button>
          <span class="muted small planet-hint">拖曳旋轉，點島名進入</span>
          <button class="btn" @click="step(1)">下一座 <Icon name="right" :size="16" /></button>
        </div>
      </div>

      <!-- 島嶼清單 -->
      <div class="planet-side">
        <div class="map-head">
          <div>
            <div class="eyebrow">ENGLISH PLANET · 英語星球</div>
            <h1 class="page-title">英語群島星球</h1>
          </div>
          <div class="map-meta mono">
            <span>已探索 {{ explored }}/{{ ZONES.length }}</span>
            <span>設施 {{ game.progress.built.length }}/{{ BUILDINGS.length }}</span>
          </div>
        </div>

        <ul class="isle-list">
          <li v-for="(isl, i) in islands" :key="isl.id" :style="{ '--isl': isl.color }" :class="{ active: i === front }">
            <component
              :is="isl.status.locked ? 'div' : 'router-link'"
              :to="isl.status.locked ? undefined : isl.to"
              class="isle-row"
              :class="{ locked: isl.status.locked }"
              @mouseenter="focusIsland(i)"
              @focus="focusIsland(i)"
            >
              <span class="isle-dot" aria-hidden="true"></span>
              <span class="isle-name">
                <strong>{{ isl.status.locked ? '未知島嶼' : isl.title }}</strong>
                <small>{{ isl.status.locked ? '???' : isl.en }}</small>
              </span>
              <span class="isle-bar" aria-hidden="true">
                <span v-if="isl.status.value !== null" :style="{ width: pct(isl.status.value) + '%' }"></span>
              </span>
              <span class="isle-meta mono">
                <b v-if="isl.status.alert" class="isle-alert">{{ isl.status.alert }}</b>
                {{ isl.status.meta }}
              </span>
              <span class="isle-go">
                <template v-if="isl.status.locked"><Icon name="lock" :size="14" /></template>
                <template v-else>出發 <Icon name="right" :size="14" /></template>
              </span>
            </component>
          </li>
        </ul>

        <p class="map-hint">
          <template v-if="nextZone">建議下一站：<button class="text-link" @click="focusIsland(PLANET_ISLANDS.findIndex((i) => i.id === nextZone.id))">{{ nextZone.zh }}</button>（測驗拿 1 星解鎖下一座島）</template>
          <template v-else-if="!game.progress.rescuedDay">所有區域都已探索。收集零件，到 <router-link to="/build" class="text-link">無線電塔</router-link> 修好無線電。</template>
        </p>
      </div>
    </div>

    <!-- 手機版：側欄隱藏，背包與生存狀態放在最下方 -->
    <div class="mobile-only panel mobile-survival">
      <SurvivalPanel />
    </div>
  </section>
</template>
