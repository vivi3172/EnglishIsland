<script setup>
// 一段情境對話：對方的台詞自動出現並唸出；輪到你時選回應，答錯說明原因、可再選。
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { findDialogue } from '../../data/dialogues.js'
import { prepareDialogue, correctOption, youTurnCount, starsFor } from '../../logic/dialogue.js'
import { talk } from '../../store/talk.js'
import { speak, speakAsync, stopSpeaking } from '../../utils/speech.js'
import Icon from '../../components/Icon.vue'

const props = defineProps({ id: { type: String, required: true } })
const dialogue = findDialogue(props.id)

const lines = ref([])
const step = ref(0) // 目前走到 lines 的哪一行
const transcript = ref([]) // 已出現的台詞：{ who, en, zh }
const wrongPicks = ref([]) // 這一輪選錯的選項
const firstTry = ref(0)
const showZh = ref(true)
const finished = ref(false)
const stars = ref(0)
const playing = ref(false)
const logEl = ref(null)

const total = dialogue ? youTurnCount(dialogue) : 0
const turnNo = computed(() => transcript.value.filter((l) => l.who === 'you').length)
const current = computed(() => lines.value[step.value] ?? null)
const lastWrong = computed(() => wrongPicks.value.at(-1) ?? null)

function scrollDown() {
  nextTick(() => logEl.value?.lastElementChild?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }))
}

// 把對方的台詞一路放出來，直到輪到你或對話結束
function advance() {
  while (current.value && current.value.who === 'them') {
    const line = current.value
    transcript.value.push(line)
    speak(line.en)
    step.value++
  }
  if (!current.value && !finished.value) finish()
  scrollDown()
}

function start() {
  stopSpeaking()
  lines.value = prepareDialogue(dialogue)
  step.value = 0
  transcript.value = []
  wrongPicks.value = []
  firstTry.value = 0
  finished.value = false
  stars.value = 0
  advance()
}

function pick(option) {
  if (!current.value || current.value.who !== 'you' || wrongPicks.value.includes(option)) return
  if (!option.ok) {
    wrongPicks.value.push(option)
    return
  }
  if (wrongPicks.value.length === 0) firstTry.value++
  wrongPicks.value = []
  transcript.value.push({ who: 'you', en: option.en, zh: option.zh })
  speak(option.en)
  step.value++
  advance()
}

function finish() {
  finished.value = true
  stars.value = starsFor(firstTry.value, total)
  talk.record(dialogue.id, stars.value)
}

// 依序唸完整段對話（用正確回應）
async function playAll() {
  if (playing.value) {
    playing.value = false
    stopSpeaking()
    return
  }
  playing.value = true
  for (const line of dialogue.lines) {
    if (!playing.value) break
    const text = line.who === 'you' ? correctOption(line).en : line.en
    await speakAsync(text, { timeout: 8000 })
  }
  playing.value = false
}

onBeforeUnmount(() => {
  playing.value = false
  stopSpeaking()
})

if (dialogue) start()
</script>

<template>
  <section v-if="dialogue" class="page talk-scene" :style="{ '--isl': dialogue.color }">
    <router-link :to="{ name: 'talk' }" class="back"><Icon name="left" :size="16" /> 對話咖啡廳</router-link>
    <div class="talk-head">
      <div>
        <div class="eyebrow">{{ dialogue.en }}</div>
        <h1 class="page-title">{{ dialogue.emoji }} {{ dialogue.title }}</h1>
        <p class="muted">{{ dialogue.scene }}你是<strong>{{ dialogue.youRole }}</strong>，對方是{{ dialogue.themRole }}。</p>
      </div>
      <div class="talk-tools">
        <span class="mono muted">{{ Math.min(turnNo + (finished ? 0 : 1), total) }} / {{ total }}</span>
        <button class="btn" :aria-pressed="showZh" @click="showZh = !showZh">{{ showZh ? '隱藏中文' : '顯示中文' }}</button>
      </div>
    </div>

    <ol ref="logEl" class="talk-log" aria-live="polite">
      <li v-for="(line, i) in transcript" :key="i" class="bubble-row" :class="line.who">
        <span class="bubble-who mono">{{ line.who === 'you' ? 'YOU' : dialogue.themRole }}</span>
        <div class="bubble">
          <p class="bubble-en">{{ line.en }}</p>
          <p v-if="showZh" class="bubble-zh">{{ line.zh }}</p>
        </div>
        <button class="icon-btn" :aria-label="`唸出：${line.en}`" @click="speak(line.en)"><Icon name="sound" :size="16" /></button>
      </li>
    </ol>

    <!-- 輪到你 -->
    <div v-if="current && current.who === 'you'" class="panel talk-choices">
      <div class="eyebrow">YOUR TURN · 你要怎麼回？</div>
      <div class="talk-options">
        <div v-for="o in current.options" :key="o.en" class="talk-option-row">
          <button class="option talk-option" :class="{ wrong: wrongPicks.includes(o) }" :disabled="wrongPicks.includes(o)" @click="pick(o)">
            <span>{{ o.en }}</span>
            <small v-if="showZh || wrongPicks.includes(o)" class="muted">{{ o.zh }}</small>
          </button>
          <button class="icon-btn" :aria-label="`唸出：${o.en}`" @click="speak(o.en)"><Icon name="sound" :size="16" /></button>
        </div>
      </div>
      <p v-if="lastWrong" class="talk-why" role="alert">
        <Icon name="alert" :size="16" /> <span><strong>不太對：</strong>{{ lastWrong.why }} 再選一次。</span>
      </p>
    </div>

    <!-- 完成 -->
    <div v-if="finished" class="panel talk-done">
      <div class="eyebrow">SCENE COMPLETE · 對話完成</div>
      <div class="stars-row big" :aria-label="`${stars} 星`">
        <Icon v-for="n in 3" :key="n" name="star" :size="28" :filled="n <= stars" />
      </div>
      <p>第一次就選對 <strong class="mono">{{ firstTry }} / {{ total }}</strong> 句。<span v-if="stars < 3" class="muted">全部一次選對可以拿 3 星。</span></p>
      <div class="btn-row">
        <button class="btn" @click="playAll"><Icon name="sound" :size="16" /> {{ playing ? '停止播放' : '聽完整對話' }}</button>
        <button class="btn" @click="start"><Icon name="retry" :size="16" /> 再練一次</button>
        <router-link :to="{ name: 'talk' }" class="btn primary">選下一個情境 <Icon name="right" :size="16" /></router-link>
      </div>
    </div>
  </section>

  <section v-else class="page">
    <p>找不到這個對話。</p>
    <router-link :to="{ name: 'talk' }" class="btn">回到對話咖啡廳</router-link>
  </section>
</template>
