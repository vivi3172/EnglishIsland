<script setup>
// 拖曳分類：把單字放進對應的母音手指。桌機可拖曳；觸控或鍵盤可「先點單字、再點手指」。
import { computed, ref } from 'vue'
import { findCourse } from '../../data/phonics/index.js'
import { courseIndex, wordSegments } from '../../logic/phonics.js'
import { shuffle } from '../../logic/quiz.js'
import { phonics } from '../../store/phonics.js'
import { speak } from '../../utils/speech.js'
import Icon from '../../components/Icon.vue'
import PhonicsWord from '../../components/phonics/PhonicsWord.vue'

const props = defineProps({ course: { type: String, required: true } })
const data = findCourse(props.course)
const idx = data ? courseIndex(data) : null
const PER_GROUP = 2

const words = ref([])
const placed = ref({}) // { [en]: groupId }
const selected = ref(null)
const checked = ref(false)

function start() {
  // 每個母音各挑兩個字，避免某根手指沒有字
  words.value = shuffle(idx.groups.flatMap((g) => shuffle(idx.words.filter((w) => w.groupId === g.id)).slice(0, PER_GROUP)))
  placed.value = {}
  selected.value = null
  checked.value = false
}
if (data) start()

const pool = computed(() => words.value.filter((w) => !placed.value[w.en]))
const inGroup = (gid) => words.value.filter((w) => placed.value[w.en] === gid)
const allPlaced = computed(() => words.value.length > 0 && pool.value.length === 0)
const isRight = (w) => placed.value[w.en] === w.groupId
const score = computed(() => words.value.filter(isRight).length)

function select(w) {
  if (checked.value) return
  selected.value = selected.value === w.en ? null : w.en
  speak(w.en)
}

function place(gid, en = selected.value) {
  if (checked.value || !en) return
  placed.value = { ...placed.value, [en]: gid }
  selected.value = null
}

function unplace(w) {
  if (checked.value) return
  const next = { ...placed.value }
  delete next[w.en]
  placed.value = next
}

function onDragStart(event, w) {
  event.dataTransfer.setData('text/plain', w.en)
  event.dataTransfer.effectAllowed = 'move'
}
function onDrop(event, gid) {
  place(gid, event.dataTransfer.getData('text/plain'))
}

function check() {
  checked.value = true
  phonics.record(
    props.course,
    words.value.map((w) => ({ en: w.en, patternId: w.patternId, soundId: w.soundId, chosenSound: idx.group[placed.value[w.en]]?.sounds[0].id ?? null, correct: isRight(w) })),
    'sort',
  )
}

const reason = (w) => {
  const p = idx.pattern[w.patternId]
  const s = idx.sound[w.soundId]
  return `${w.en} 的 ${p.spelling} 唸 /${s.ipa}/，屬於 ${idx.group[w.groupId].key}（不是 ${idx.group[placed.value[w.en]].key}）。${p.rule}`
}
</script>

<template>
  <section v-if="data" class="page phonics-page">
    <router-link :to="{ name: 'phonics', params: { course } }" class="back"><Icon name="left" :size="16" /> 五指地圖</router-link>
    <div class="page-head">
      <div class="eyebrow">SORT · 拖曳分類</div>
      <h1 class="page-title">把單字放進對的手指</h1>
      <p class="muted">聽一聽、看一看拼字組合，判斷每個字的長母音。可以拖曳，或先點單字再點手指；放錯了點一下單字就能拿回來。</p>
    </div>

    <div class="sort-pool panel" :class="{ empty: !pool.length }">
      <div class="eyebrow">單字 · {{ pool.length }} 個待分類</div>
      <div class="chip-wrap">
        <button
          v-for="w in pool"
          :key="w.en"
          class="word-chip sort-chip"
          :class="{ active: selected === w.en }"
          draggable="true"
          :aria-pressed="selected === w.en"
          @dragstart="onDragStart($event, w)"
          @click="select(w)"
        >
          <span class="sort-word">{{ w.en }}</span>
          <span class="muted small">{{ w.zh }}</span>
        </button>
        <p v-if="!pool.length && !checked" class="muted">全部放好了，按下「檢查答案」。</p>
      </div>
    </div>

    <div class="sort-buckets">
      <div
        v-for="g in idx.groups"
        :key="g.id"
        class="sort-bucket"
        :class="{ ready: !!selected }"
        :style="{ '--v': g.color }"
        role="button"
        tabindex="0"
        :aria-label="`放進 ${g.key}`"
        @click="place(g.id)"
        @keydown.enter.prevent="place(g.id)"
        @dragover.prevent
        @drop.prevent="onDrop($event, g.id)"
      >
        <div class="bucket-head">
          <span class="vowel-key small-key">{{ g.key }}</span>
          <span class="mono muted small">{{ g.sounds.map((s) => `/${s.ipa}/`).join(' ') }}</span>
        </div>
        <ul class="bucket-items">
          <li v-for="w in inGroup(g.id)" :key="w.en" :class="checked ? (isRight(w) ? 'ok' : 'ng') : ''">
            <button class="bucket-word" @click.stop="checked ? speak(w.en) : unplace(w)">
              <PhonicsWord v-if="checked" :segments="wordSegments(idx, w)" :color="w.color" size="sm" />
              <span v-else>{{ w.en }}</span>
              <Icon v-if="checked" :name="isRight(w) ? 'check' : 'close'" :size="14" />
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div class="btn-row">
      <button v-if="!checked" class="btn primary" :disabled="!allPlaced" @click="check"><Icon name="check" :size="16" /> 檢查答案</button>
      <button class="btn" @click="start"><Icon name="retry" :size="16" /> 換一組</button>
    </div>

    <div v-if="checked" class="report-box sort-result" role="status">
      <div class="eyebrow">結果 · {{ score }}/{{ words.length }}</div>
      <p v-if="score === words.length" class="ok-text">全部正確！</p>
      <ul class="explain-list">
        <li v-for="w in words.filter((x) => !isRight(x))" :key="w.en">{{ reason(w) }}</li>
      </ul>
    </div>
  </section>
</template>
