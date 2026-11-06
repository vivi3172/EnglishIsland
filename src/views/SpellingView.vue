<script setup>
import { computed, ref, watch } from 'vue'
import { findZone } from '../data/zones.js'
import { game } from '../store/game.js'
import { shuffle, scrambleLetters, checkSpelling, isSpellable } from '../logic/quiz.js'
import { speak } from '../utils/speech.js'
import Icon from '../components/Icon.vue'
import MissionHeader from '../components/MissionHeader.vue'
import ExpeditionResult from '../components/ExpeditionResult.vue'

const props = defineProps({ id: { type: String, required: true } })
const ROUND_LENGTH = 5

const zone = computed(() => findZone(props.id))
const unlocked = computed(() => zone.value && game.isUnlocked(zone.value.id))

const words = ref([])
const index = ref(0)
const tiles = ref([]) // { id, letter, used }
const answer = ref([]) // tile ids
const status = ref(null) // null | 'correct' | 'wrong'
const results = ref([])
const summary = ref(null)

function setupTiles(w) {
  tiles.value = scrambleLetters(w.en).map((letter, i) => ({ id: i, letter, used: false }))
  answer.value = []
  status.value = null
}

function start() {
  const spellable = (zone.value?.words ?? []).filter(isSpellable)
  words.value = shuffle(spellable).slice(0, ROUND_LENGTH)
  index.value = 0
  results.value = []
  summary.value = null
  // 若新一輪第一題與上一輪相同，watch 不會觸發，所以這裡直接重設
  if (words.value[0]) setupTiles(words.value[0])
}

const word = computed(() => words.value[index.value])

watch(word, (w) => {
  if (!w) return
  setupTiles(w)
  speak(w.en)
})

const answerText = computed(() => answer.value.map((id) => tiles.value[id].letter).join(''))

function pick(tile) {
  if (tile.used || status.value) return
  tile.used = true
  answer.value.push(tile.id)
  if (answer.value.length === tiles.value.length) check()
}

function unpick(position) {
  if (status.value === 'correct') return
  const [id] = answer.value.splice(position, 1)
  tiles.value[id].used = false
  status.value = null
}

function clearAll() {
  answer.value = []
  tiles.value.forEach((t) => (t.used = false))
  status.value = null
}

function check() {
  const ok = checkSpelling(answerText.value, word.value.en)
  status.value = ok ? 'correct' : 'wrong'
  // 每個單字只記錄第一次的結果
  if (!results.value.some((r) => r.en === word.value.en)) results.value.push({ en: word.value.en, correct: ok })
}

function next() {
  if (index.value < words.value.length - 1) {
    index.value++
    return
  }
  summary.value = {
    correct: results.value.filter((r) => r.correct).length,
    total: results.value.length,
    out: game.finishSpelling(zone.value.id, results.value),
  }
}

start()
if (word.value) speak(word.value.en)
</script>

<template>
  <section v-if="zone && unlocked" class="page">
    <MissionHeader
      :back-to="{ name: 'zone', params: { id: zone.id } }"
      :back-label="zone.zh"
      title="拼字"
      code="DECODE"
      :current="summary ? words.length : index"
      :total="words.length"
      :results="results"
    />

    <div v-if="!summary && word" class="stage">
      <div class="stage-prompt panel prompt-panel">
        <div class="eyebrow">TARGET</div>
        <span class="prompt-glyph">{{ word.emoji }}</span>
        <p class="prompt-word">{{ word.zh }}</p>
        <button class="btn" @click="speak(word.en)"><Icon name="sound" :size="16" /> 播放發音</button>
      </div>

      <div class="stage-answer">
        <div class="panel">
          <div class="eyebrow">INPUT · 你的答案</div>
          <div class="slots" :class="status" aria-label="你的答案">
            <button
              v-for="(id, pos) in answer"
              :key="'a' + id"
              class="tile filled mono"
              :aria-label="`移除字母 ${tiles[id].letter}`"
              @click="unpick(pos)"
            >
              {{ tiles[id].letter }}
            </button>
            <span v-for="n in tiles.length - answer.length" :key="'e' + n" class="tile empty-slot"></span>
          </div>
          <div class="eyebrow">LETTERS · 可用字母</div>
          <div class="letters">
            <button v-for="tile in tiles" :key="tile.id" class="tile mono" :disabled="tile.used || !!status" @click="pick(tile)">
              {{ tile.letter }}
            </button>
          </div>
        </div>

        <div v-if="status === 'correct'" class="verdict ok" role="status">
          <div class="verdict-head">
            <Icon name="check" :size="18" /><strong>正確</strong><span class="verdict-answer">{{ word.en }}</span>
          </div>
          <p class="muted">{{ word.example }}　{{ word.exampleZh }}</p>
          <button class="btn primary" @click="next">{{ index < words.length - 1 ? '下一個' : '查看結果' }} <Icon name="right" :size="16" /></button>
        </div>
        <div v-else-if="status === 'wrong'" class="verdict ng" role="status">
          <div class="verdict-head">
            <Icon name="close" :size="18" /><strong>錯誤</strong><span class="verdict-answer">正確拼法：{{ word.en }}</span>
          </div>
          <p class="muted">點擊上方字母可移除，重新排列。此題已記為錯誤。</p>
          <div class="btn-row">
            <button class="btn" @click="clearAll"><Icon name="retry" :size="16" /> 重新排列</button>
            <button class="btn primary" @click="next">{{ index < words.length - 1 ? '跳過' : '查看結果' }} <Icon name="right" :size="16" /></button>
          </div>
        </div>
        <div v-else class="btn-row">
          <button class="btn" :disabled="!answer.length" @click="clearAll"><Icon name="retry" :size="16" /> 清除</button>
        </div>
      </div>
    </div>

    <div v-else-if="summary" class="debrief">
      <div class="debrief-score">
        <div class="eyebrow">MISSION COMPLETE</div>
        <div class="score-big mono">{{ summary.correct }}<span>/{{ summary.total }}</span></div>
        <div class="muted">拼寫正確</div>
      </div>
      <div class="debrief-detail">
        <ExpeditionResult :out="summary.out" />
        <div class="btn-row">
          <button class="btn" @click="start"><Icon name="retry" :size="16" /> 再玩一次</button>
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
