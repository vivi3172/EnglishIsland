<script setup>
// 劈椰子切字：點字母之間的縫把單字劈成兩段 → 判斷前一段唸長音還是短音 → 看規則解說。
// 每個字算一題：切對且長短音也答對才算對；結果記到 phonics 存檔的 syllables 課程（每條規則一個熟練度）。
import { computed, onBeforeUnmount, ref } from 'vue'
import { SYLLABLES } from '../../data/phonics/syllables.js'
import { buildChopRound, cutOf, findRule, firstVowel, sayParts, explainCut, explainVowel } from '../../logic/syllables.js'
import { phonics } from '../../store/phonics.js'
import { speak, speakAsync, stopSpeaking } from '../../utils/speech.js'
import Icon from '../../components/Icon.vue'
import MissionHeader from '../../components/MissionHeader.vue'
import SyllableWord from '../../components/phonics/SyllableWord.vue'

const props = defineProps({ focus: { type: String, default: null } })
const course = SYLLABLES
const focusRule = computed(() => (props.focus ? findRule(course, props.focus) : null))

const words = ref([])
const index = ref(0)
const phase = ref('cut') // cut → vowel → done
const chosenCut = ref(null)
const chosenVowel = ref(null)
const active = ref(-1)
const results = ref([])
const finished = ref(false)
const showMarks = ref(true)
let token = 0

function start() {
  words.value = buildChopRound(course, { focus: focusRule.value ? props.focus : null })
  index.value = 0
  results.value = []
  finished.value = false
  reset()
}

function reset() {
  token++
  phase.value = 'cut'
  chosenCut.value = null
  chosenVowel.value = null
  active.value = -1
}

const word = computed(() => words.value[index.value])
const rule = computed(() => word.value && findRule(course, word.value.ruleId))
const answerCut = computed(() => word.value && cutOf(word.value))
const cutOk = computed(() => chosenCut.value === answerCut.value)
const expectedVowel = computed(() => word.value && firstVowel(word.value, rule.value))
const vowelOk = computed(() => expectedVowel.value === null || chosenVowel.value === expectedVowel.value)

async function sayWord(w) {
  const my = ++token
  const say = sayParts(w)
  for (let i = 0; i < 2; i++) {
    active.value = i
    await speakAsync(say[i], { rate: 0.6 })
    if (my !== token) return
  }
  active.value = 2
  await speakAsync(w.en, { rate: 0.75 })
  if (my === token) active.value = -1
}

function chop(i) {
  if (phase.value !== 'cut') return
  chosenCut.value = i
  phase.value = expectedVowel.value ? 'vowel' : 'done'
  sayWord(word.value)
  if (phase.value === 'done') record()
}

function pickVowel(v) {
  if (phase.value !== 'vowel') return
  chosenVowel.value = v
  phase.value = 'done'
  record()
}

function record() {
  results.value.push({ en: word.value.en, patternId: word.value.ruleId, soundId: null, correct: cutOk.value && vowelOk.value })
}

function next() {
  if (index.value < words.value.length - 1) {
    index.value++
    reset()
    return
  }
  phonics.record(course.id, results.value, 'chop')
  finished.value = true
}

const score = computed(() => results.value.filter((r) => r.correct).length)
const byRule = computed(() =>
  course.rules
    .map((r) => {
      const list = results.value.filter((x) => x.patternId === r.id)
      return { rule: r, correct: list.filter((x) => x.correct).length, total: list.length }
    })
    .filter((x) => x.total),
)

onBeforeUnmount(() => {
  token++
  stopSpeaking()
})
start()
</script>

<template>
  <section class="page phonics-page syl-page">
    <MissionHeader
      :back-to="{ name: 'syllables' }"
      back-label="音節切分"
      :title="focusRule ? `劈椰子 · ${focusRule.name}` : '劈椰子切字'"
      code="CHOP"
      :current="finished ? words.length : index"
      :total="words.length"
      :results="results"
    />

    <div v-if="!finished && word" class="chop-stage" :style="{ '--v': rule.color }">
      <div class="panel coconut-panel">
        <div class="eyebrow">{{ phase === 'cut' ? '找到縫，一刀劈開（點字母之間）' : '劈開了！' }}</div>
        <div class="coconut" :class="{ split: phase !== 'cut' }">
          <span class="coconut-shell" aria-hidden="true">🥥</span>
          <SyllableWord
            :en="word.en"
            :gaps="phase === 'cut'"
            :marks="showMarks || phase !== 'cut'"
            :cut="phase === 'cut' ? null : answerCut"
            :wrong="phase !== 'cut' && !cutOk ? chosenCut : null"
            :active="active"
            size="xl"
            @cut="chop"
          />
        </div>
        <p class="muted">{{ word.zh }}</p>
        <div class="btn-row center">
          <button class="btn" @click="speak(word.en)"><Icon name="sound" :size="16" /> 聽整個字（提示）</button>
          <button v-if="phase === 'cut'" class="btn" :aria-pressed="!showMarks" @click="showMarks = !showMarks">{{ showMarks ? '隱藏 V/C（挑戰）' : '顯示 V/C' }}</button>
          <button v-else class="btn" @click="sayWord(word)"><Icon name="play" :size="16" /> 分段唸</button>
        </div>
      </div>

      <div class="chop-side">
        <div v-if="phase !== 'cut'" class="verdict" :class="cutOk ? 'ok' : 'ng'" role="status">
          <div class="verdict-head">
            <Icon :name="cutOk ? 'check' : 'close'" :size="18" />
            <strong>{{ cutOk ? '切對了' : '切錯了' }}</strong>
            <span class="ph-tag">{{ rule.tag }}</span>
          </div>
          <p>{{ explainCut(course, word, chosenCut) }}</p>
        </div>

        <div v-if="phase === 'vowel'" class="panel">
          <div class="eyebrow">QUESTION · 前一段 <b class="mono">{{ word.parts[0] }}</b> 的母音唸？</div>
          <div class="options two">
            <button class="option" @click="pickVowel('long')"><span class="mono option-key">A</span><span>長音（唸字母名字）</span></button>
            <button class="option" @click="pickVowel('short')"><span class="mono option-key">B</span><span>短音</span></button>
          </div>
        </div>

        <div v-if="phase === 'done' && expectedVowel" class="verdict" :class="vowelOk ? 'ok' : 'ng'">
          <div class="verdict-head">
            <Icon :name="vowelOk ? 'check' : 'close'" :size="18" />
            <strong>{{ expectedVowel === 'long' ? '長音' : '短音' }}</strong>
          </div>
          <p>{{ explainVowel(word, rule, expectedVowel) }}</p>
        </div>

        <div v-if="phase === 'cut'" class="panel chop-hint">
          <div class="eyebrow">TIP · 怎麼找縫</div>
          <ol class="small">
            <li>是兩個認識的小字黏在一起嗎？→ 切在兩個字中間</li>
            <li>字尾是「輔音 + le」？→ 往前數三個字母</li>
            <li>看前兩個元音（V）中間：兩個 C 切中間；一個 C 先切在它前面</li>
          </ol>
        </div>

        <button v-if="phase === 'done'" class="btn primary" @click="next">
          {{ index < words.length - 1 ? '下一顆椰子' : '查看結果' }} <Icon name="right" :size="16" />
        </button>
      </div>
    </div>

    <div v-else-if="finished" class="debrief">
      <div class="debrief-score">
        <div class="eyebrow">CHOP COMPLETE</div>
        <div class="score-big mono">{{ score }}<span>/{{ words.length }}</span></div>
        <p class="muted">切對而且長短音也答對才算一題正確。</p>
      </div>
      <div class="debrief-detail">
        <ul class="rule-scores">
          <li v-for="x in byRule" :key="x.rule.id" :style="{ '--v': x.rule.color }">
            <span class="ph-tag">{{ x.rule.tag }}</span>
            <span>{{ x.rule.name }}</span>
            <span class="mono">{{ x.correct }}/{{ x.total }}</span>
          </li>
        </ul>
        <div class="btn-row">
          <button class="btn" @click="start"><Icon name="retry" :size="16" /> 再劈一輪</button>
          <router-link :to="{ name: 'syllables' }" class="btn primary">回到規則 <Icon name="right" :size="16" /></router-link>
        </div>
      </div>
    </div>
  </section>
</template>
