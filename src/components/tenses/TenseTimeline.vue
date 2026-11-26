<script setup>
// 視覺化時間軸：過去（灰）→ 現在（綠）→ 未來（藍）。
// 元素的 id 固定（ref / main / link / second），切換時態時同一個元素平滑移動、變形。
import { computed } from 'vue'
import { TIMES, findAspect, splitKey, tenseName } from '../../data/tenses/index.js'
import { timelineFor } from '../../logic/tense.js'

const props = defineProps({
  tenseKey: { type: String, required: true },
  tl: { type: Object, default: () => ({}) },
  compact: { type: Boolean, default: false },
})

const ZONES = [
  { ...TIMES[0], from: 0, to: 42 },
  { ...TIMES[1], from: 42, to: 58 },
  { ...TIMES[2], from: 58, to: 100 },
]

const parts = computed(() => splitKey(props.tenseKey))
const aspect = computed(() => findAspect(parts.value.aspect))
const items = computed(() => timelineFor(props.tenseKey, props.tl))
const byId = computed(() => Object.fromEntries(items.value.map((i) => [i.id, i])))
const ORDER = ['link', 'main', 'second']
const shapes = computed(() => ORDER.map((id) => byId.value[id]).filter(Boolean))

const label = computed(() => {
  const ref = props.tl.ref ? `，參考時間：${props.tl.ref}` : ''
  const second = props.tl.second ? `，另一件事：${props.tl.second}` : ''
  return `時間軸，${tenseName(props.tenseKey)}：${aspect.value.shape}${ref}${second}`
})

const pos = (it) => ({ left: `${it.x}%`, width: `${it.w ?? 0}%` })
</script>

<template>
  <figure class="tl" :class="[{ compact }, `tl-aspect-${parts.aspect}`]" :style="{ '--asp': aspect.color }" role="img" :aria-label="label">
    <div class="tl-zones" aria-hidden="true">
      <span
        v-for="z in ZONES"
        :key="z.id"
        class="tl-zone"
        :class="{ on: z.id === parts.time }"
        :style="{ left: `${z.from}%`, width: `${z.to - z.from}%`, '--tc': z.color }"
      >
        <b>{{ z.symbol }} {{ z.zh }}</b>
      </span>
    </div>

    <div class="tl-track" aria-hidden="true">
      <span class="tl-axis"></span>
      <span class="tl-now" style="left: 50%"><i>NOW</i></span>

      <span class="tl-ref" :style="{ left: `${byId.ref.x}%` }">
        <em v-if="byId.ref.label">{{ byId.ref.label }}</em>
      </span>

      <span v-for="it in shapes" :key="it.id" class="tl-el" :class="[`tl-${it.id}`, `k-${it.kind}`]" :style="pos(it)">
        <template v-if="it.kind === 'repeat'">
          <i v-for="x in it.xs" :key="x" class="tl-rep" :style="{ left: `${((x - it.x) / it.w) * 100}%` }"></i>
        </template>
        <i v-else-if="it.kind === 'check'" class="tl-check">✔</i>
        <i v-else-if="it.kind === 'dot'" class="tl-dot"></i>
        <i v-else-if="it.kind === 'second'" class="tl-diamond">◆</i>
        <small v-if="it.kind === 'run' && it.label" class="tl-run-label">{{ it.label }}</small>
        <small v-if="it.kind === 'second'" class="tl-second-label">{{ it.label }}</small>
      </span>
    </div>

    <figcaption v-if="!compact" class="tl-caption">
      <span class="tl-key" :style="{ '--c': aspect.color }"><b>{{ aspect.symbol }}</b> {{ aspect.zh }}：{{ aspect.shape }}</span>
      <span class="tl-key ref"><b>┆</b> 參考時間{{ tl.ref ? `：${tl.ref}` : '' }}</span>
      <span v-if="tl.second" class="tl-key"><b>◆</b> 另一件事：{{ tl.second }}</span>
    </figcaption>
  </figure>
</template>
