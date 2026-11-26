<script setup>
// 上色的例句：助動詞（雙底線）、主要動詞（粗底線）、時間提示詞（點狀底線）。
// 不只靠顏色：三種底線樣式不同，並可顯示圖例。active = 正在唸的第幾個字（逐字高亮）。
import { computed } from 'vue'
import { parseSentence } from '../../logic/tense.js'

const props = defineProps({
  marked: { type: String, required: true },
  active: { type: Number, default: -1 },
  legend: { type: Boolean, default: false },
  size: { type: String, default: 'md' },
})

// 句尾標點不跟著上色（p.m. 這類縮寫保留）
const parsed = computed(() => ({
  words: parseSentence(props.marked).words.map((w) => {
    const m = /^(.*?[^.!?,])([.!?,]+)$/.exec(w.text)
    if (!m || /(^|\.)[a-z]\.$/i.test(w.text)) return { ...w, core: w.text, tail: '' }
    return { ...w, core: m[1], tail: m[2] }
  }),
}))
const ROLE_ZH = { aux: '助動詞', verb: '主要動詞', time: '時間提示詞' }
</script>

<template>
  <div class="ts" :class="`ts-${size}`">
    <p class="ts-line" lang="en">
      <template v-for="(w, i) in parsed.words" :key="i">
        <span class="ts-w" :class="[`r-${w.role}`, { now: i === active }]" :title="ROLE_ZH[w.role]">{{ w.core }}</span>{{ w.tail }}{{ ' ' }}
      </template>
    </p>
    <p v-if="legend" class="ts-legend">
      <span class="ts-w r-aux">助動詞</span>
      <span class="ts-w r-verb">主要動詞</span>
      <span class="ts-w r-time">時間提示詞</span>
    </p>
  </div>
</template>
