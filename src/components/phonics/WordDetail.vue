<script setup>
// 單字詳情：拼字上色、IPA、中文、正常／慢速發音、音素拆解拼讀動畫、例句、口型說明、麥克風跟讀。
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { wordSegments, blendSteps, matchesSpoken } from '../../logic/phonics.js'
import { speak, speakAsync, stopSpeaking, speechSupported } from '../../utils/speech.js'
import { recognitionSupported, listenOnce } from '../../utils/recognition.js'
import Icon from '../Icon.vue'
import PhonicsWord from './PhonicsWord.vue'

const props = defineProps({
  idx: { type: Object, required: true },
  word: { type: Object, required: true },
})

const RATE = { normal: 0.85, slow: 0.45 }
const segments = computed(() => wordSegments(props.idx, props.word))
const steps = computed(() => blendSteps(props.idx, props.word))
const sound = computed(() => props.idx.sound[props.word.soundId])
const pattern = computed(() => props.idx.pattern[props.word.patternId])

// ---- 拼讀動畫 ----
const active = ref(-1)
const stepNo = ref(-1)
let run = 0 // 每次播放的序號；切換單字或離開頁面時讓舊的動畫自行停止
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function blend() {
  const token = ++run
  for (let i = 0; i < steps.value.length; i++) {
    if (token !== run) return
    stepNo.value = i
    active.value = steps.value[i].index
    await speakAsync(steps.value[i].say, { rate: 0.6 })
    await wait(250)
  }
  if (token !== run) return
  stepNo.value = steps.value.length
  active.value = -2
  await speakAsync(props.word.en, { rate: RATE.slow })
  await wait(200)
  if (token !== run) return
  await speakAsync(props.word.en, { rate: RATE.normal })
  if (token === run) active.value = -1
}

function stop() {
  run++
  active.value = -1
  stepNo.value = -1
  stopSpeaking()
}

// ---- 麥克風跟讀 ----
const mic = ref({ state: 'idle', heard: '' }) // idle | listening | ok | retry | error
const MIC_ERRORS = {
  'not-allowed': '沒有麥克風權限，請在瀏覽器網址列允許使用麥克風。',
  'no-speech': '沒有聽到聲音，靠近麥克風再試一次。',
  network: '語音辨識需要網路連線，請確認網路後再試。',
  'audio-capture': '找不到麥克風裝置。',
}

async function shadow() {
  stop()
  mic.value = { state: 'listening', heard: '' }
  try {
    const heard = await listenOnce()
    const ok = matchesSpoken(props.word, heard)
    mic.value = { state: ok ? 'ok' : 'retry', heard: heard[0] ?? '' }
  } catch (e) {
    mic.value = { state: 'error', heard: MIC_ERRORS[e.message] ?? '語音辨識沒有成功，請再試一次。' }
  }
}

watch(
  () => props.word.en,
  () => {
    stop()
    mic.value = { state: 'idle', heard: '' }
  },
)
onBeforeUnmount(stop)
</script>

<template>
  <div class="word-detail" :style="{ '--v': sound.color }">
    <div class="wd-head">
      <PhonicsWord :segments="segments" :color="sound.color" :active="active" size="xl" />
      <div class="wd-meta">
        <span class="mono wd-ipa">/{{ word.ipa }}/</span>
        <span class="wd-zh">{{ word.zh }}</span>
        <span class="ph-tag" :style="{ '--v': sound.color }">{{ pattern.spelling }} → /{{ sound.ipa }}/</span>
      </div>
    </div>

    <div class="btn-row">
      <button class="btn" @click="speak(word.en, { rate: RATE.normal })"><Icon name="sound" :size="16" /> 正常速度</button>
      <button class="btn" @click="speak(word.en, { rate: RATE.slow })"><Icon name="sound" :size="16" /> 慢速</button>
      <button v-if="active === -1" class="btn primary" @click="blend"><Icon name="play" :size="16" /> 拼讀示範</button>
      <button v-else class="btn primary" @click="stop"><Icon name="close" :size="16" /> 停止</button>
    </div>
    <p v-if="!speechSupported" class="muted small">這個瀏覽器不支援語音播放，可以改用 Chrome、Edge 或 Safari。</p>

    <div class="eyebrow">音素拆解 · BLENDING</div>
    <ol class="blend-row" aria-label="音素拆解">
      <li v-for="(s, i) in steps" :key="i" :class="{ now: stepNo === i, done: stepNo > i }" :style="s.hl ? { '--c': sound.color } : null">
        <span class="blend-g" :class="{ hl: s.hl }">{{ s.text }}</span>
        <span class="mono blend-p">/{{ s.phoneme }}/</span>
        <span class="blend-hint">{{ s.hint }}</span>
      </li>
      <li class="blend-sum" :class="{ now: stepNo === steps.length }">
        <span class="blend-g">= {{ word.en }}</span>
        <span class="mono blend-p">/{{ word.ipa }}/</span>
        <span class="blend-hint">合併唸</span>
      </li>
    </ol>
    <p class="muted small">
      {{ steps.map((s) => `/${s.phoneme}/`).join(' + ') }} → {{ word.en }}。
      子音示範會帶一點輕母音（例如 buh），自己唸時只留前面的氣音。
      <template v-if="segments.some((s) => s.silent)">淡色字母不發音。</template>
    </p>

    <div class="wd-example">
      <button class="icon-btn" aria-label="播放例句" @click="speak(word.example, { rate: 0.8 })"><Icon name="sound" :size="18" /></button>
      <div>
        <p>{{ word.example }}</p>
        <p class="muted">{{ word.exampleZh }}</p>
      </div>
    </div>

    <div class="wd-mouth">
      <div class="eyebrow">口型與舌位 · /{{ sound.ipa }}/</div>
      <p>{{ sound.mouth }}</p>
    </div>

    <div v-if="recognitionSupported" class="wd-mic">
      <button class="btn" :disabled="mic.state === 'listening'" @click="shadow">
        <Icon name="mic" :size="16" /> {{ mic.state === 'listening' ? '聆聽中…請唸出單字' : '跟讀練習' }}
      </button>
      <span v-if="mic.state === 'ok'" class="ok-text" role="status"><Icon name="check" :size="16" /> 很好！聽到「{{ mic.heard }}」</span>
      <span v-else-if="mic.state === 'retry'" class="ng-text" role="status">
        聽到「{{ mic.heard }}」。注意 {{ pattern.spelling }} 要唸 /{{ sound.ipa }}/，先按「慢速」聽一次再試。
      </span>
      <span v-else-if="mic.state === 'error'" class="muted small" role="status">{{ mic.heard }}</span>
    </div>
    <p v-else class="muted small">這個瀏覽器不支援語音辨識，跟讀練習可改用 Chrome 或 Edge。</p>
  </div>
</template>
