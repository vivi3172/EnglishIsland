<script setup>
// 12 時態總覽：欄 = 時間（過去 / 現在 / 未來），列 = 動作狀態。點任一格切換時態。
import { TIMES, ASPECTS, tenseKey, tenseName } from '../../data/tenses/index.js'
import { verbPhrase } from '../../logic/tense.js'
import { tenses } from '../../store/tenses.js'

defineProps({
  scenario: { type: Object, required: true },
  selected: { type: String, default: null },
  showMastery: { type: Boolean, default: true },
})
const emit = defineEmits(['select'])
const pct = (v) => Math.round(v * 100)
</script>

<template>
  <div class="tm" role="group" aria-label="12 時態總覽">
    <div class="tm-row tm-head">
      <span class="tm-corner"></span>
      <span v-for="t in TIMES" :key="t.id" class="tm-col" :style="{ '--c': t.color }">{{ t.symbol }} {{ t.zh }}</span>
    </div>
    <div v-for="a in ASPECTS" :key="a.id" class="tm-row">
      <span class="tm-rowhead" :style="{ '--c': a.color }">{{ a.symbol }} {{ a.zh }}</span>
      <button
        v-for="t in TIMES"
        :key="t.id"
        class="tm-cell"
        :class="{ on: selected === tenseKey(t.id, a.id), seen: tenses.progress.seen[tenseKey(t.id, a.id)] }"
        :style="{ '--tc': t.color, '--ac': a.color }"
        :aria-label="`${tenseName(tenseKey(t.id, a.id))}：${verbPhrase(scenario, tenseKey(t.id, a.id)).join(' ')}`"
        :aria-pressed="selected === tenseKey(t.id, a.id)"
        @click="emit('select', tenseKey(t.id, a.id))"
      >
        <span class="tm-phrase mono" lang="en">{{ verbPhrase(scenario, tenseKey(t.id, a.id)).join(' ') }}</span>
        <span v-if="showMastery" class="tm-bar"><span :style="{ width: pct(tenses.mastery(tenseKey(t.id, a.id))) + '%' }"></span></span>
      </button>
    </div>
  </div>
</template>
