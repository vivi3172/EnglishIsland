<script setup>
// 五指手掌互動地圖：每根手指代表一個母音群組，可用滑鼠、觸控或鍵盤（Tab + Enter）選取。
import { computed } from 'vue'

const props = defineProps({
  groups: { type: Array, required: true }, // course.groups（依拇指→小指順序）
  selected: { type: String, default: null },
  mastery: { type: Object, default: () => ({}) }, // { [groupId]: 0–1 }
})
const emit = defineEmits(['select'])

// 手指幾何：x/y/h 為旋轉前的位置，繞手指底部中心旋轉 angle 度
const GEOMETRY = [
  { x: 62, y: 196, h: 106, angle: -36 },
  { x: 86, y: 50, h: 150, angle: -8 },
  { x: 136, y: 24, h: 172, angle: 0 },
  { x: 186, y: 42, h: 158, angle: 7 },
  { x: 232, y: 92, h: 120, angle: 16 },
]
const W = 44

const fingers = computed(() =>
  props.groups.slice(0, 5).map((group, i) => {
    const g = GEOMETRY[i]
    const base = { x: g.x + W / 2, y: g.y + g.h }
    const label = { x: g.x + W / 2, y: g.y + 36 }
    const ipas = group.sounds.map((s) => `/${s.ipa}/`).join(' ')
    const level = props.mastery[group.id] ?? 0
    return { group, g, base, label, ipas, level, fillH: Math.max(0, (g.h - 12) * level) }
  }),
)

function onKey(event, id) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('select', id)
  }
}
</script>

<template>
  <svg class="hand-map" viewBox="0 0 320 360" role="group" aria-label="五指母音地圖">
    <rect class="palm" x="78" y="166" width="182" height="176" rx="54" />
    <text class="palm-title" x="169" y="270" text-anchor="middle">LONG VOWELS</text>
    <text class="palm-hint" x="169" y="292" text-anchor="middle">點選手指展開母音</text>

    <g
      v-for="f in fingers"
      :key="f.group.id"
      class="finger"
      :class="{ active: selected === f.group.id }"
      :style="{ '--v': f.group.color }"
      :transform="`rotate(${f.g.angle} ${f.base.x} ${f.base.y})`"
      role="button"
      tabindex="0"
      :aria-pressed="selected === f.group.id"
      :aria-label="`${f.group.finger} ${f.group.key}，${f.ipas}，熟練度 ${Math.round(f.level * 100)}%`"
      @click="emit('select', f.group.id)"
      @keydown="onKey($event, f.group.id)"
    >
      <rect class="finger-body" :x="f.g.x" :y="f.g.y" :width="W" :height="f.g.h" :rx="W / 2" />
      <rect
        v-if="f.fillH > 0"
        class="finger-fill"
        :x="f.g.x + 6"
        :y="f.g.y + f.g.h - 6 - f.fillH"
        :width="W - 12"
        :height="f.fillH"
        :rx="(W - 12) / 2"
      />
      <g :transform="`rotate(${-f.g.angle} ${f.label.x} ${f.label.y})`">
        <text class="finger-key" :x="f.label.x" :y="f.label.y" text-anchor="middle">{{ f.group.key }}</text>
        <text class="finger-ipa" :x="f.label.x" :y="f.label.y + 20" text-anchor="middle">{{ f.group.sounds.length > 1 ? '2 音' : f.ipas }}</text>
      </g>
    </g>
  </svg>
</template>
