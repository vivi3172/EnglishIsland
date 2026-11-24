<script setup>
// 顯示一個單字，母音拼字組合用母音顏色標示、不發音的字母淡化。
// active：拼讀動畫目前唸到的 grapheme 位置；-2 代表整個字一起亮（合併發音）
defineProps({
  segments: { type: Array, required: true }, // [{ text, hl, silent, phoneme }]
  color: { type: String, default: 'var(--accent)' },
  active: { type: Number, default: -1 },
  size: { type: String, default: 'md' }, // sm | md | lg | xl
  phonemes: { type: Boolean, default: false }, // 在字母下方顯示音素
})
</script>

<template>
  <span class="ph-word" role="img" :aria-label="segments.map((s) => s.text).join('')" :class="[`ph-${size}`, { blended: active === -2, 'with-phonemes': phonemes }]" :style="{ '--v': color }">
    <span
      v-for="(seg, i) in segments"
      :key="i"
      class="ph-seg"
      :class="{ hl: seg.hl, silent: seg.silent, now: active === i }"
    >
      <span class="ph-letters">{{ seg.text }}</span>
      <span v-if="phonemes" class="ph-phoneme mono">{{ seg.silent ? '—' : `/${seg.phoneme}/` }}</span>
    </span>
  </span>
</template>
