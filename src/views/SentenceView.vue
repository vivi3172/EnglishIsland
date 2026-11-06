<script setup>
import { computed, ref } from 'vue'
import { findZone } from '../data/zones.js'
import { SENTENCES } from '../data/sentences.js'
import { game } from '../store/game.js'
import { buildSentenceRound, checkOrder } from '../logic/sentence.js'
import { starsForScore } from '../logic/quiz.js'
import { speak } from '../utils/speech.js'
import Icon from '../components/Icon.vue'
import MissionHeader from '../components/MissionHeader.vue'
import ExpeditionResult from '../components/ExpeditionResult.vue'

const props = defineProps({ id: { type: String, required: true } })
const ROUND_LENGTH = 6

const zone = computed(() => findZone(props.id))
const data = computed(() => SENTENCES[props.id] ?? null)
const unlocked = computed(() => zone.value && data.value && game.isUnlocked(zone.value.id))

const questions = ref([])
const index = ref(0)
const results = ref([]) // { correct }，每題只記第一次作答
const summary = ref(null)
const picked = ref(null) // 填空
const placed = ref([]) // 排序：tile ids（依點選順序）
const orderStatus = ref(null) // null | 'correct' | 'wrong'

function resetQuestionState() {
  picked.value = null
  placed.value = []
  orderStatus.value = null
}

// 不在出題時自動朗讀：唸出英文句子會直接洩漏答案
function start() {
  questions.value = data.value ? buildSentenceRound(data.value.items, ROUND_LENGTH) : []
  index.value = 0
  results.value = []
  summary.value = null
  resetQuestionState()
}

const q = computed(() => questions.value[index.value])
const recorded = computed(() => results.value.length > index.value)

function record(correct) {
  if (!recorded.value) results.value.push({ correct })
}

// ---- 填空 ----
function choose(option) {
  if (picked.value) return
  picked.value = option
  record(option === q.value.answer)
  speak(q.value.sentence.en)
}

function fillOptionClass(option) {
  if (!picked.value) return ''
  if (option === q.value.answer) return 'correct'
  if (option === picked.value) return 'wrong'
  return 'dim'
}

// ---- 排序 ----
const tileText = (id) => q.value.tokens[id]
const isPlaced = (id) => placed.value.includes(id)

function place(tile) {
  if (isPlaced(tile.id) || orderStatus.value) return
  placed.value.push(tile.id)
  if (placed.value.length === q.value.tokens.length) {
    const ok = checkOrder(placed.value.map(tileText), q.value.tokens)
    orderStatus.value = ok ? 'correct' : 'wrong'
    record(ok)
    if (ok) speak(q.value.sentence.en)
  }
}

function unplace(position) {
  if (orderStatus.value === 'correct') return
  placed.value.splice(position, 1)
  orderStatus.value = null
}

function clearOrder() {
  placed.value = []
  orderStatus.value = null
}

// ---- 流程 ----
function next() {
  record(false) // 排序答錯直接跳過時記為錯誤；已作答則不重複記錄
  if (index.value < questions.value.length - 1) {
    index.value++
    resetQuestionState()
    return
  }
  const correct = results.value.filter((r) => r.correct).length
  const total = questions.value.length
  const stars = starsForScore(correct, total)
  summary.value = { correct, total, stars, out: game.finishSentences(zone.value.id, correct, total, stars) }
}

start()
</script>

<template>
  <section v-if="unlocked" class="page">
    <MissionHeader
      :back-to="{ name: 'zone', params: { id: zone.id } }"
      :back-label="zone.zh"
      title="句型"
      code="SIGNAL"
      :current="summary ? questions.length : index"
      :total="questions.length"
      :results="results"
    />

    <div v-if="!summary && q" class="stage">
      <!-- 填空題 -->
      <template v-if="q.type === 'fill'">
        <div class="stage-prompt panel prompt-panel">
          <div class="eyebrow">FILL · 填空</div>
          <p class="sentence">
            {{ q.parts.before }}
            <span class="blank" :class="{ filled: picked }">{{ picked ? q.sentence.answer : '　　　' }}</span
            >{{ q.parts.suffix }}
            {{ q.parts.after }}
          </p>
          <p class="muted">{{ q.sentence.zh }}</p>
        </div>
        <div class="stage-answer">
          <div class="options">
            <button
              v-for="(option, i) in q.options"
              :key="option"
              class="option"
              :class="fillOptionClass(option)"
              :disabled="!!picked"
              @click="choose(option)"
            >
              <span class="mono option-key">{{ 'ABCD'[i] }}</span>
              <span>{{ option }}</span>
            </button>
          </div>
          <div v-if="picked" class="verdict" :class="picked === q.answer ? 'ok' : 'ng'" role="status">
            <div class="verdict-head">
              <Icon :name="picked === q.answer ? 'check' : 'close'" :size="18" />
              <strong>{{ picked === q.answer ? '正確' : '錯誤' }}</strong>
              <span class="verdict-answer">{{ q.sentence.en }}</span>
              <button class="icon-btn" aria-label="播放句子" @click="speak(q.sentence.en)"><Icon name="sound" :size="16" /></button>
            </div>
            <button class="btn primary" @click="next">{{ index < questions.length - 1 ? '下一題' : '查看結果' }} <Icon name="right" :size="16" /></button>
          </div>
        </div>
      </template>

      <!-- 排序題 -->
      <template v-else>
        <div class="stage-prompt panel prompt-panel">
          <div class="eyebrow">ORDER · 排序</div>
          <p class="muted">依照中文意思，把單字排成正確的句子</p>
          <p class="prompt-word">{{ q.sentence.zh }}</p>
        </div>
        <div class="stage-answer">
          <div class="panel">
            <div class="eyebrow">INPUT · 你的句子</div>
            <div class="sentence-slots" :class="orderStatus" aria-label="你的句子">
              <button
                v-for="(id, pos) in placed"
                :key="'p' + id"
                class="chip filled"
                :aria-label="`移除 ${tileText(id)}`"
                @click="unplace(pos)"
              >
                {{ tileText(id) }}
              </button>
              <span v-if="!placed.length" class="muted small">點擊下方單字依序放入</span>
              <span v-else-if="placed.length === q.tokens.length" class="punct">{{ q.punct }}</span>
            </div>
            <div class="eyebrow">WORDS · 可用單字</div>
            <div class="sentence-tiles">
              <button v-for="tile in q.tiles" :key="tile.id" class="chip" :disabled="isPlaced(tile.id) || !!orderStatus" @click="place(tile)">
                {{ tile.text }}
              </button>
            </div>
          </div>

          <div v-if="orderStatus === 'correct'" class="verdict ok" role="status">
            <div class="verdict-head">
              <Icon name="check" :size="18" />
              <strong>{{ results[index]?.correct ? '正確' : '已修正' }}</strong>
              <span class="verdict-answer">{{ q.sentence.en }}</span>
              <button class="icon-btn" aria-label="播放句子" @click="speak(q.sentence.en)"><Icon name="sound" :size="16" /></button>
            </div>
            <button class="btn primary" @click="next">{{ index < questions.length - 1 ? '下一題' : '查看結果' }} <Icon name="right" :size="16" /></button>
          </div>
          <div v-else-if="orderStatus === 'wrong'" class="verdict ng" role="status">
            <div class="verdict-head">
              <Icon name="close" :size="18" /><strong>錯誤</strong><span class="verdict-answer">正確句子：{{ q.sentence.en }}</span>
            </div>
            <p class="muted">點擊上方單字可移除並重排。此題已記為錯誤。</p>
            <div class="btn-row">
              <button class="btn" @click="clearOrder"><Icon name="retry" :size="16" /> 重新排列</button>
              <button class="btn primary" @click="next">{{ index < questions.length - 1 ? '跳過' : '查看結果' }} <Icon name="right" :size="16" /></button>
            </div>
          </div>
          <div v-else class="btn-row">
            <button class="btn" :disabled="!placed.length" @click="clearOrder"><Icon name="retry" :size="16" /> 清除</button>
          </div>
        </div>
      </template>
    </div>

    <div v-else-if="summary" class="debrief">
      <div class="debrief-score">
        <div class="eyebrow">MISSION COMPLETE</div>
        <div class="score-big mono">{{ summary.correct }}<span>/{{ summary.total }}</span></div>
        <div class="stars-row big">
          <Icon v-for="n in 3" :key="n" name="star" :size="28" :filled="n <= summary.stars" />
        </div>
        <p v-if="summary.out.newBest" class="accent-text">新紀錄 · 每顆新星取得 1 個零件</p>
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
