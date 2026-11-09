<script setup>
// 同一個元件支援三種模式：
// 1. 區域測驗（zone，有 id）：計算星星、解鎖下一區
// 2. 錯題複習（review）：從錯題清單出題，答對換草藥
// 3. 每日複習（daily）：從所有學過區域的單字疊加出題，每天第一次完成有食物與淡水
import { computed, ref, watch } from 'vue'
import { ZONES, ALL_WORDS, findZone, findWord } from '../data/zones.js'
import { game } from '../store/game.js'
import { buildQuiz, starsForScore } from '../logic/quiz.js'
import { learnedWords, pickDailyReview } from '../logic/review.js'
import { DAILY_REVIEW_BONUS } from '../logic/progress.js'
import { speak } from '../utils/speech.js'
import Icon from '../components/Icon.vue'
import MissionHeader from '../components/MissionHeader.vue'
import ExpeditionResult from '../components/ExpeditionResult.vue'

const props = defineProps({ id: { type: String, default: null }, mode: { type: String, default: 'zone' } })
const QUIZ_LENGTH = 8

const isDaily = computed(() => props.mode === 'daily')
const isReview = computed(() => props.mode !== 'zone') // 錯題或每日複習：沒有星星
const zone = computed(() => (props.id ? findZone(props.id) : null))
const allowed = computed(() => isReview.value || (zone.value && game.isUnlocked(zone.value.id)))
const learnedCount = ref(0)

function sourceWords() {
  if (isDaily.value) {
    const learned = learnedWords(game.progress, ZONES)
    learnedCount.value = learned.length
    return pickDailyReview(learned, game.progress)
  }
  if (isReview.value) return Object.keys(game.progress.wrongWords).map(findWord).filter(Boolean)
  return zone.value?.words ?? []
}

const title = computed(() => (isDaily.value ? '每日複習' : isReview.value ? '錯題複習' : '測驗'))
const code = computed(() => (isDaily.value ? 'DAILY' : isReview.value ? 'REVIEW' : 'TRIAL'))

const questions = ref([])
const index = ref(0)
const picked = ref(null)
const results = ref([])
const summary = ref(null)

function start() {
  const words = sourceWords()
  // 干擾選項：區域測驗用同區單字（較有挑戰），複習或單字不足時用全部單字
  const pool = !isReview.value && words.length >= 4 ? words : ALL_WORDS
  // 每日複習的字已經挑好數量，全部出題
  questions.value = buildQuiz(words, pool, isDaily.value ? words.length : QUIZ_LENGTH)
  index.value = 0
  picked.value = null
  results.value = []
  summary.value = null
}
start()

const q = computed(() => questions.value[index.value])
const isCorrect = computed(() => picked.value === q.value?.answer)

watch(
  q,
  (question) => {
    if (question?.type === 'listen') speak(question.word.en)
  },
  { immediate: true },
)

function choose(option) {
  if (picked.value) return
  picked.value = option.en
  results.value.push({ en: q.value.answer, correct: option.en === q.value.answer })
  speak(q.value.word.en)
}

function next() {
  if (index.value < questions.value.length - 1) {
    index.value++
    picked.value = null
    return
  }
  const correct = results.value.filter((r) => r.correct).length
  const total = results.value.length
  if (isDaily.value) {
    summary.value = { correct, total, stars: null, out: game.finishDaily(results.value) }
  } else if (isReview.value) {
    summary.value = { correct, total, stars: null, out: game.finishReview(results.value) }
  } else {
    const stars = starsForScore(correct, total)
    summary.value = { correct, total, stars, out: game.finishQuiz(zone.value.id, results.value, stars) }
  }
}

const promptText = {
  'en-to-zh': '選出正確的中文意思',
  'zh-to-en': '選出對應的英文單字',
  listen: '聽發音，選出聽到的單字',
}
const typeCode = { 'en-to-zh': 'EN → 中', 'zh-to-en': '中 → EN', listen: 'LISTEN' }

function optionClass(option) {
  if (!picked.value) return ''
  if (option.en === q.value.answer) return 'correct'
  if (option.en === picked.value) return 'wrong'
  return 'dim'
}
</script>

<template>
  <section v-if="allowed" class="page">
    <MissionHeader
      :back-to="zone ? { name: 'zone', params: { id: zone.id } } : '/'"
      :back-label="zone ? zone.zh : '地圖'"
      :title="title"
      :code="code"
      :current="summary ? questions.length : index"
      :total="questions.length"
      :results="results"
    />

    <p v-if="isDaily && questions.length && !summary && index === 0 && !picked" class="muted daily-note">
      從已學過的 {{ learnedCount }} 個單字中挑出 {{ questions.length }} 題：答錯過的字優先，其次是最久沒複習的字。
      <span v-if="!game.dailyDone">今天第一次完成可額外取得食物 +{{ DAILY_REVIEW_BONUS.food }}、淡水 +{{ DAILY_REVIEW_BONUS.water }}。</span>
    </p>

    <div v-if="questions.length === 0" class="empty-state">
      <template v-if="isDaily">
        <Icon name="book" :size="32" />
        <p>還沒有學過的單字。</p>
        <p class="muted">先到地圖上的區域翻完單字卡，學過的單字每天都會疊加進每日複習。</p>
      </template>
      <template v-else>
        <Icon name="check" :size="32" />
        <p>目前沒有需要複習的單字。</p>
        <p class="muted">測驗或拼字答錯的單字會自動收進這裡。答對可取得草藥。</p>
      </template>
      <router-link to="/" class="btn">回到地圖</router-link>
    </div>

    <div v-else-if="!summary" class="stage">
      <div class="stage-prompt panel prompt-panel">
        <div class="eyebrow">{{ typeCode[q.type] }}</div>
        <p class="muted">{{ promptText[q.type] }}</p>
        <template v-if="q.type === 'en-to-zh'">
          <p class="prompt-word">{{ q.word.en }}</p>
          <button class="btn" @click="speak(q.word.en)"><Icon name="sound" :size="16" /> 重播</button>
        </template>
        <template v-else-if="q.type === 'zh-to-en'">
          <span class="prompt-glyph">{{ q.word.emoji }}</span>
          <p class="prompt-word">{{ q.word.zh }}</p>
        </template>
        <template v-else>
          <button class="listen-btn" @click="speak(q.word.en)" aria-label="播放發音"><Icon name="sound" :size="40" /></button>
          <span class="mono muted">點擊重播</span>
        </template>
      </div>

      <div class="stage-answer">
        <div class="options">
          <button
            v-for="(option, i) in q.options"
            :key="option.en"
            class="option"
            :class="optionClass(option)"
            :disabled="!!picked"
            @click="choose(option)"
          >
            <span class="mono option-key">{{ 'ABCD'[i] }}</span>
            <span>{{ q.type === 'en-to-zh' ? option.zh : option.en }}</span>
          </button>
        </div>

        <div v-if="picked" class="verdict" :class="isCorrect ? 'ok' : 'ng'" role="status">
          <div class="verdict-head">
            <Icon :name="isCorrect ? 'check' : 'close'" :size="18" />
            <strong>{{ isCorrect ? '正確' : '錯誤' }}</strong>
            <span class="verdict-answer">{{ q.word.en }} — {{ q.word.zh }}</span>
          </div>
          <p class="muted">{{ q.word.example }}　{{ q.word.exampleZh }}</p>
          <button class="btn primary" @click="next">
            {{ index < questions.length - 1 ? '下一題' : '查看結果' }} <Icon name="right" :size="16" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="debrief">
      <div class="debrief-score">
        <div class="eyebrow">{{ isReview ? 'REVIEW COMPLETE' : 'MISSION COMPLETE' }}</div>
        <p v-if="summary.out.dailyBonus" class="accent-text">今日複習完成 · 額外取得食物與淡水</p>
        <div class="score-big mono">{{ summary.correct }}<span>/{{ summary.total }}</span></div>
        <div v-if="summary.stars !== null" class="stars-row big">
          <Icon v-for="n in 3" :key="n" name="star" :size="28" :filled="n <= summary.stars" />
        </div>
        <p v-if="summary.out.newBest" class="accent-text">新紀錄 · 每顆新星取得 1 個零件</p>
        <p v-if="summary.stars === 0" class="muted">正確率 60% 可取得第 1 顆星。</p>
        <p v-else-if="!isReview && summary.stars >= 1" class="muted">已找到通往下一區的路線。</p>
      </div>
      <div class="debrief-detail">
        <ExpeditionResult :out="summary.out" />
        <div class="btn-row">
          <button class="btn" @click="start"><Icon name="retry" :size="16" /> 再次挑戰</button>
          <router-link to="/" class="btn primary">回到地圖 <Icon name="right" :size="16" /></router-link>
        </div>
      </div>
    </div>
  </section>

  <section v-else class="page empty-state">
    <Icon name="lock" :size="32" />
    <p>這個區域尚未解鎖。</p>
    <router-link to="/" class="btn">回到地圖</router-link>
  </section>
</template>
