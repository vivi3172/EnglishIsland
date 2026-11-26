<script setup>
// 節奏與口訣記憶：四拍節奏帶出口訣 → 朗讀例句（逐字高亮）→（跟讀模式）留時間給你跟著唸。
// 播放時同步更新時間軸與插畫；支援暫停、重播、上一句、下一句、慢速、循環、隱藏中文。
import { computed, onBeforeUnmount, ref } from 'vue'
import { PLAY_ORDER, SCENARIOS, DEFAULT_SCENARIO, CHANTS, findScenario, splitKey, tenseName } from '../../data/tenses/index.js'
import { entryOf, parseSentence } from '../../logic/tense.js'
import { tenses } from '../../store/tenses.js'
import { useSpeaker, RATES } from '../../components/tenses/useSpeaker.js'
import Icon from '../../components/Icon.vue'
import TenseTimeline from '../../components/tenses/TenseTimeline.vue'
import TenseScene from '../../components/tenses/TenseScene.vue'
import TenseSentence from '../../components/tenses/TenseSentence.vue'
import TenseTag from '../../components/tenses/TenseTag.vue'

const scenarioId = ref(DEFAULT_SCENARIO)
const index = ref(0)
const playing = ref(false)
const speed = ref('normal')
const loop = ref(false)
const hideZh = ref(false)
const shadowMode = ref(false)
const beat = ref(-1)
const phase = ref('idle') // idle | beat | say | shadow
const played = ref(new Set())

const scenario = computed(() => findScenario(scenarioId.value))
const key = computed(() => PLAY_ORDER[index.value])
const entry = computed(() => entryOf(scenario.value, key.value))
const parts = computed(() => splitKey(key.value))
const { active, say, stop } = useSpeaker()

let run = 0
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const beatMs = () => (speed.value === 'slow' ? 650 : 450)
const shadowMs = () => parseSentence(entry.value.en).words.length * (speed.value === 'slow' ? 700 : 520) + 800

async function playFrom(i) {
  const token = ++run
  playing.value = true
  let idx = i
  while (token === run) {
    index.value = idx
    phase.value = 'beat'
    for (let b = 0; b < 4; b++) {
      if (token !== run) return
      beat.value = b
      await wait(beatMs())
    }
    if (token !== run) return
    beat.value = -1
    phase.value = 'say'
    await say(entry.value.en, { rate: RATES[speed.value] })
    if (token !== run) return
    if (shadowMode.value) {
      phase.value = 'shadow'
      await wait(shadowMs())
      if (token !== run) return
    }
    played.value = new Set([...played.value, `${scenarioId.value}:${key.value}`])
    if ([...played.value].filter((p) => p.startsWith(`${scenarioId.value}:`)).length === PLAY_ORDER.length) tenses.stage('rhythm')
    phase.value = 'idle'
    if (idx === PLAY_ORDER.length - 1) {
      if (!loop.value) break
      idx = 0
    } else idx++
    await wait(350)
  }
  if (token === run) {
    playing.value = false
    phase.value = 'idle'
  }
}

function pause() {
  run++
  playing.value = false
  beat.value = -1
  phase.value = 'idle'
  stop()
}

function toggle() {
  if (playing.value) pause()
  else playFrom(index.value)
}

function go(i) {
  const was = playing.value
  pause()
  index.value = (i + PLAY_ORDER.length) % PLAY_ORDER.length
  if (was) playFrom(index.value)
}

function replay() {
  pause()
  playFrom(index.value)
}

function switchScenario(id) {
  pause()
  scenarioId.value = id
}

onBeforeUnmount(pause)
</script>

<template>
  <section class="page tense-page" :class="{ 'tense-calm': tenses.calm }">
    <router-link :to="{ name: 'tenses' }" class="back"><Icon name="left" :size="16" /> 時光島</router-link>
    <div class="tx-head">
      <div>
        <div class="eyebrow">STAGE 4 · RHYTHM & SHADOWING</div>
        <h1 class="page-title">節奏口訣與跟讀</h1>
        <p class="muted">跟著四拍節奏念口訣，再聽例句。12 句從「現在」開始，依序是過去、未來；每句都會同步更新時間軸和插畫。</p>
      </div>
      <div class="seg" role="group" aria-label="情境">
        <button v-for="sc in SCENARIOS" :key="sc.id" class="seg-btn" :aria-pressed="scenarioId === sc.id" @click="switchScenario(sc.id)">
          {{ sc.emoji }} {{ sc.title }}
        </button>
      </div>
    </div>

    <div class="tx-layout">
      <div class="tx-visual">
        <TenseScene :scenario="scenario" :tense-key="key" />
        <TenseTimeline :tense-key="key" :tl="entry.tl" compact />
      </div>

      <div class="tx-info">
        <div class="panel rp-card" aria-live="polite">
          <div class="tx-name">
            <TenseTag :tense-key="key" />
            <span class="mono faint">{{ index + 1 }} / {{ PLAY_ORDER.length }}</span>
          </div>
          <div class="rp-beats" aria-hidden="true">
            <span v-for="b in 4" :key="b" :class="{ on: beat === b - 1 }"></span>
          </div>
          <p class="rp-chant">♪ {{ CHANTS.time[parts.time] }}</p>
          <p class="rp-chant">♪ {{ CHANTS.aspect[parts.aspect] }}</p>
          <TenseSentence :marked="entry.en" :active="active" size="lg" />
          <p v-if="!hideZh" class="muted">{{ entry.zh }}<span class="faint">（{{ entry.feel }}）</span></p>
          <p v-if="phase === 'shadow'" class="rp-shadow" role="status"><Icon name="mic" :size="16" /> 換你跟著唸一次！</p>
        </div>

        <div class="panel rp-controls">
          <div class="btn-row">
            <button class="btn" aria-label="上一句" @click="go(index - 1)"><Icon name="left" :size="16" /></button>
            <button class="btn primary" @click="toggle">
              <Icon :name="playing ? 'pause' : 'play'" :size="16" /> {{ playing ? '暫停' : '播放' }}
            </button>
            <button class="btn" aria-label="下一句" @click="go(index + 1)"><Icon name="right" :size="16" /></button>
            <button class="btn" @click="replay"><Icon name="retry" :size="16" /> 重播</button>
          </div>
          <div class="btn-row rp-toggles">
            <button class="btn xs" :aria-pressed="speed === 'slow'" @click="speed = speed === 'slow' ? 'normal' : 'slow'">
              {{ speed === 'slow' ? '慢速 ✔' : '慢速' }}
            </button>
            <button class="btn xs" :aria-pressed="loop" @click="loop = !loop">{{ loop ? '循環 ✔' : '循環' }}</button>
            <button class="btn xs" :aria-pressed="shadowMode" @click="shadowMode = !shadowMode">{{ shadowMode ? '跟讀模式 ✔' : '跟讀模式' }}</button>
            <button class="btn xs" :aria-pressed="hideZh" @click="hideZh = !hideZh">{{ hideZh ? '隱藏中文 ✔' : '隱藏中文' }}</button>
          </div>
        </div>

        <ol class="rp-list">
          <li v-for="(k, i) in PLAY_ORDER" :key="k">
            <button class="rp-item" :class="{ on: i === index, done: played.has(`${scenarioId}:${k}`) }" @click="go(i)">
              <span class="mono">{{ String(i + 1).padStart(2, '0') }}</span> {{ tenseName(k) }}
            </button>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
