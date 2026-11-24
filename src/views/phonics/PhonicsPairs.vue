<script setup>
// STEP 4 長短母音比較：每組都可以分別播放，並用「聽音辨識」小測驗自我檢查（結果計入熟練度）
import { computed, ref } from 'vue'
import { findCourse } from '../../data/phonics/index.js'
import { courseIndex, buildQuestion, explainAnswer, chosenSoundOf } from '../../logic/phonics.js'
import { phonics } from '../../store/phonics.js'
import { speak } from '../../utils/speech.js'
import Icon from '../../components/Icon.vue'

const props = defineProps({ course: { type: String, required: true } })
const data = findCourse(props.course)
const idx = data ? courseIndex(data) : null

const quiz = ref({}) // { [pairId]: { q, picked, explain } }
const score = computed(() => {
  const done = Object.values(quiz.value).filter((x) => x.picked)
  return { done: done.length, correct: done.filter((x) => x.explain.correct).length }
})

function test(pair) {
  const q = buildQuestion(idx, 'pair', pair)
  quiz.value = { ...quiz.value, [pair.id]: { q, picked: null, explain: null } }
  speak(q.say, { rate: 0.75 })
}

function answer(pair, en) {
  const item = quiz.value[pair.id]
  if (!item || item.picked) return
  const explain = explainAnswer(idx, item.q, en)
  quiz.value = { ...quiz.value, [pair.id]: { ...item, picked: en, explain } }
  phonics.record(props.course, [
    { en: item.q.answer, patternId: item.q.patternId, soundId: item.q.soundId, chosenSound: chosenSoundOf(idx, item.q, en), correct: explain.correct },
  ])
}

const longSound = (pair) => idx.sound[idx.pattern[pair.patternId].soundId]
const state = (pair, en) => {
  const item = quiz.value[pair.id]
  if (!item?.picked) return ''
  if (en === item.q.answer) return 'correct'
  return en === item.picked ? 'wrong' : 'dim'
}
</script>

<template>
  <section v-if="data" class="page phonics-page">
    <router-link :to="{ name: 'phonics', params: { course } }" class="back"><Icon name="left" :size="16" /> 五指地圖</router-link>
    <div class="page-head">
      <div class="eyebrow">STEP 4 · SHORT vs LONG</div>
      <h1 class="page-title">長短母音比較</h1>
      <p class="muted">
        字尾加上不發音的 e，前面的母音就從「短音」變成「長音」（唸字母名稱）。先分別聽兩個字，再按「聽音辨識」測試自己能不能聽出差別。
        <span v-if="score.done" class="mono">　辨識 {{ score.correct }}/{{ score.done }}</span>
      </p>
    </div>

    <div class="pair-grid">
      <div v-for="pair in idx.pairs" :key="pair.id" class="panel pair-card" :style="{ '--v': idx.group[pair.groupId].color }">
        <div class="pair-sides">
          <button class="pair-side" :class="state(pair, pair.short.en)" @click="quiz[pair.id] && !quiz[pair.id].picked ? answer(pair, pair.short.en) : speak(pair.short.en, { rate: 0.75 })">
            <span class="eyebrow">短音 · /{{ idx.shortSounds[pair.shortSound].ipa }}/</span>
            <span class="pair-word">{{ pair.short.en }}</span>
            <span class="mono muted">/{{ pair.short.ipa }}/</span>
            <span class="small">{{ pair.short.zh }}</span>
          </button>
          <span class="pair-plus mono">+e</span>
          <button class="pair-side long" :class="state(pair, pair.long.en)" @click="quiz[pair.id] && !quiz[pair.id].picked ? answer(pair, pair.long.en) : speak(pair.long.en, { rate: 0.75 })">
            <span class="eyebrow">長音 · /{{ longSound(pair).ipa }}/</span>
            <span class="pair-word">{{ pair.long.en.slice(0, -1) }}<b class="silent-e">e</b></span>
            <span class="mono muted">/{{ pair.long.ipa }}/</span>
            <span class="small">{{ pair.long.zh }}</span>
          </button>
        </div>

        <details class="pair-mouth">
          <summary>口型比較</summary>
          <p class="small"><strong>短音 /{{ idx.shortSounds[pair.shortSound].ipa }}/：</strong>{{ idx.shortSounds[pair.shortSound].mouth }}</p>
          <p class="small"><strong>長音 /{{ longSound(pair).ipa }}/：</strong>{{ longSound(pair).mouth }}</p>
        </details>

        <div class="btn-row">
          <button class="btn xs" @click="test(pair)">
            <Icon name="target" :size="14" /> {{ quiz[pair.id] ? '再測一次' : '聽音辨識' }}
          </button>
          <button v-if="quiz[pair.id] && !quiz[pair.id].picked" class="btn xs" @click="speak(quiz[pair.id].q.say, { rate: 0.6 })">
            <Icon name="sound" :size="14" /> 重播
          </button>
          <span v-if="quiz[pair.id] && !quiz[pair.id].picked" class="muted small">點選你聽到的字</span>
        </div>
        <div v-if="quiz[pair.id]?.picked" class="verdict" :class="quiz[pair.id].explain.correct ? 'ok' : 'ng'" role="status">
          <div class="verdict-head">
            <Icon :name="quiz[pair.id].explain.correct ? 'check' : 'close'" :size="16" />
            <strong>{{ quiz[pair.id].explain.correct ? '聽對了' : '再聽一次' }}</strong>
          </div>
          <p v-for="(l, i) in quiz[pair.id].explain.lines" :key="i" class="small">{{ l }}</p>
        </div>
      </div>
    </div>

    <div class="lesson-footer">
      <router-link :to="{ name: 'phonics-practice', params: { course, mode: 'practice' } }" class="btn primary">
        STEP 5 互動練習 <Icon name="right" :size="16" />
      </router-link>
    </div>
  </section>
</template>
