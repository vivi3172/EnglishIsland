<script setup>
// 顯示一個單字：元音上色並在下方標 V / C；可在字母之間的縫點擊切開（劈椰子遊戲）。
// cut：已切開的位置（第 cut 個字母前面）；wrong：切錯的位置（紅線）
// active：0 / 1 = 正在唸第幾段，2 = 整個字合起來唸
import { computed } from 'vue'
import { isVowel } from '../../logic/syllables.js'

const props = defineProps({
  en: { type: String, required: true },
  cut: { type: Number, default: null },
  wrong: { type: Number, default: null },
  marks: { type: Boolean, default: true },
  gaps: { type: Boolean, default: false },
  active: { type: Number, default: -1 },
  size: { type: String, default: 'lg' }, // md | lg | xl
})
const emit = defineEmits(['cut'])

const letters = computed(() =>
  [...props.en].map((ch, i) => ({
    ch,
    v: isVowel(ch),
    part: props.cut !== null && i >= props.cut ? 1 : 0,
  })),
)
</script>

<template>
  <span class="syl-word" :class="[`syl-${size}`, { split: cut !== null, blended: active === 2 }]" role="img" :aria-label="cut !== null ? `${en.slice(0, cut)} · ${en.slice(cut)}` : en">
    <template v-for="(l, i) in letters" :key="i">
      <span class="syl-letter" :class="{ v: l.v, now: active === l.part && cut !== null }">
        <span class="syl-ch">{{ l.ch }}</span>
        <span v-if="marks" class="syl-mark mono">{{ l.v ? 'V' : 'C' }}</span>
      </span>
      <template v-if="i < letters.length - 1">
        <button
          v-if="gaps"
          type="button"
          class="syl-gap"
          :class="{ cut: cut === i + 1, wrong: wrong === i + 1 }"
          :aria-label="`切在 ${en.slice(0, i + 1)} 後面`"
          @click="emit('cut', i + 1)"
        ><span class="syl-blade" aria-hidden="true"></span></button>
        <span v-else class="syl-gap static" :class="{ cut: cut === i + 1, wrong: wrong === i + 1 }" aria-hidden="true"><span class="syl-blade"></span></span>
      </template>
    </template>
  </span>
</template>
