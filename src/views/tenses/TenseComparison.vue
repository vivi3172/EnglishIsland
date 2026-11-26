<script setup>
// 雙時態比較：並排呈現時間軸、插畫、句型、中文語感、使用時機的差異。
// 預設 5 組易混淆組合，也可以自己挑任兩個時態。
import { computed, ref, watch } from 'vue'
import {
  COMPARISONS, SCENARIOS, DEFAULT_SCENARIO, TENSE_KEYS, FORMS,
  findScenario, findComparison, comparisonFor, findTime, findAspect, splitKey, tenseName,
} from '../../data/tenses/index.js'
import { entryOf, whyNot } from '../../logic/tense.js'
import { tenses } from '../../store/tenses.js'
import { useSpeaker } from '../../components/tenses/useSpeaker.js'
import Icon from '../../components/Icon.vue'
import TenseTimeline from '../../components/tenses/TenseTimeline.vue'
import TenseScene from '../../components/tenses/TenseScene.vue'
import TenseSentence from '../../components/tenses/TenseSentence.vue'
import TenseTag from '../../components/tenses/TenseTag.vue'

const props = defineProps({
  a: { type: String, default: null },
  b: { type: String, default: null },
  pair: { type: String, default: null },
})

const preset = findComparison(props.pair)
const valid = (k) => TENSE_KEYS.includes(k)
const start = preset ?? (valid(props.a) && valid(props.b) && props.a !== props.b ? { a: props.a, b: props.b } : COMPARISONS[0])

const left = ref(start.a)
const right = ref(start.b)
const scenarioId = ref(DEFAULT_SCENARIO)
const scenario = computed(() => findScenario(scenarioId.value))
const cmp = computed(() => comparisonFor(left.value, right.value))
const sides = computed(() => [left.value, right.value].map((key) => ({ key, entry: entryOf(scenario.value, key), form: FORMS[key] })))
const { active, speakingId, say, stop } = useSpeaker()

function usePreset(c) {
  stop()
  left.value = c.a
  right.value = c.b
}

watch(
  [left, right],
  () => {
    if (left.value !== right.value) tenses.compared(left.value, right.value)
  },
  { immediate: true },
)

const ROWS = [
  { id: 'time', zh: '時間', get: (k) => `${findTime(splitKey(k).time).symbol} ${findTime(splitKey(k).time).zh}` },
  { id: 'aspect', zh: '動作狀態', get: (k) => `${findAspect(splitKey(k).aspect).symbol} ${findAspect(splitKey(k).aspect).gist}` },
  { id: 'form', zh: '句型', get: (k) => FORMS[k].formulaEn, mono: true },
  { id: 'feel', zh: '中文語感', get: (k) => entryOf(scenario.value, k).feel },
  { id: 'use', zh: '使用時機', get: (k) => FORMS[k].uses[0] },
]
</script>

<template>
  <section class="page tense-page" :class="{ 'tense-calm': tenses.calm }">
    <router-link :to="{ name: 'tenses' }" class="back"><Icon name="left" :size="16" /> 時光島</router-link>
    <div class="tx-head">
      <div>
        <div class="eyebrow">STAGE 5 · COMPARE</div>
        <h1 class="page-title">易混淆時態比較</h1>
        <p class="muted">中文翻譯常常一模一樣，英文卻選了不同的時態。並排看時間軸，就知道差在哪。看過 3 組就完成這個階段。</p>
      </div>
      <div class="seg" role="group" aria-label="情境">
        <button v-for="sc in SCENARIOS" :key="sc.id" class="seg-btn" :aria-pressed="scenarioId === sc.id" @click="scenarioId = sc.id">
          {{ sc.emoji }} {{ sc.title }}
        </button>
      </div>
    </div>

    <div class="cmp-presets" role="group" aria-label="常見易混淆組合">
      <button
        v-for="c in COMPARISONS" :key="c.id" class="cmp-preset"
        :aria-pressed="cmp && cmp.id === c.id" :class="{ seen: tenses.progress.compared[c.id] }" @click="usePreset(c)"
      >
        <strong>{{ tenseName(c.a) }} vs. {{ tenseName(c.b) }}</strong>
        <small class="muted">{{ c.title }}</small>
      </button>
    </div>

    <div class="cmp-pick">
      <label>
        <span class="small muted">左邊</span>
        <select v-model="left">
          <option v-for="k in TENSE_KEYS" :key="k" :value="k" :disabled="k === right">{{ tenseName(k) }}</option>
        </select>
      </label>
      <span class="mono faint">vs.</span>
      <label>
        <span class="small muted">右邊</span>
        <select v-model="right">
          <option v-for="k in TENSE_KEYS" :key="k" :value="k" :disabled="k === left">{{ tenseName(k) }}</option>
        </select>
      </label>
    </div>

    <div class="cmp-grid">
      <article v-for="(s, i) in sides" :key="i" class="panel cmp-side">
        <TenseTag :tense-key="s.key" />
        <TenseScene :scenario="scenario" :tense-key="s.key" compact />
        <TenseTimeline :tense-key="s.key" :tl="s.entry.tl" compact />
        <TenseSentence :marked="s.entry.en" :active="speakingId === i ? active : -1" />
        <p class="muted">{{ s.entry.zh }}</p>
        <button class="btn xs" @click="say(s.entry.en, { id: i })"><Icon name="sound" :size="14" /> 發音</button>
      </article>
    </div>

    <div class="panel cmp-why">
      <h2 class="tx-h2">為什麼中文很像，英文卻不同？</h2>
      <p v-if="cmp && scenarioId !== DEFAULT_SCENARIO" class="faint small">（以「奶奶煮飯」為例）</p>
      <p v-if="cmp">{{ cmp.note }}</p>
      <template v-else>
        <p>{{ whyNot(left, right) }}</p>
      </template>
      <ul v-if="cmp" class="tx-uses">
        <li v-for="w in cmp.when" :key="w">{{ w }}</li>
      </ul>
    </div>

    <div class="panel">
      <table class="cmp-table">
        <thead>
          <tr><th></th><th>{{ tenseName(left) }}</th><th>{{ tenseName(right) }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in ROWS" :key="r.id" :class="{ same: r.get(left) === r.get(right) }">
            <th scope="row">{{ r.zh }}</th>
            <td :class="{ mono: r.mono }">{{ r.get(left) }}</td>
            <td :class="{ mono: r.mono }">{{ r.get(right) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
