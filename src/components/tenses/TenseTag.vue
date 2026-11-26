<script setup>
// 時態名稱標籤：時間顏色 + 狀態顏色分開呈現，各自附符號（不只靠顏色辨識）
import { computed } from 'vue'
import { findTime, findAspect, splitKey } from '../../data/tenses/index.js'

const props = defineProps({ tenseKey: { type: String, required: true } })
const time = computed(() => findTime(splitKey(props.tenseKey).time))
const aspect = computed(() => findAspect(splitKey(props.tenseKey).aspect))
</script>

<template>
  <span class="ttag">
    <span class="ttag-t" :style="{ '--c': time.color }">{{ time.symbol }} {{ time.zh }}</span>
    <span class="ttag-a" :style="{ '--c': aspect.color }">{{ aspect.symbol }} {{ aspect.zh }}</span>
  </span>
</template>
