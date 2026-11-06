<script setup>
// 練習頁共用標頭：返回、任務名稱、分段進度
import Icon from './Icon.vue'

defineProps({
  backTo: { type: [String, Object], required: true },
  backLabel: { type: String, required: true },
  title: { type: String, required: true },
  code: { type: String, default: '' },
  current: { type: Number, default: 0 }, // 已完成題數
  total: { type: Number, default: 0 },
  results: { type: Array, default: () => [] }, // [{ correct }]，用來替進度格上色
})
</script>

<template>
  <div class="mission-head">
    <router-link :to="backTo" class="back"><Icon name="left" :size="16" /> {{ backLabel }}</router-link>
    <div class="mission-head-row">
      <h1 class="page-title">{{ title }} <small v-if="code" class="mono">{{ code }}</small></h1>
      <span v-if="total" class="mono muted">{{ String(Math.min(current + 1, total)).padStart(2, '0') }} / {{ String(total).padStart(2, '0') }}</span>
    </div>
    <div v-if="total" class="segments" aria-hidden="true">
      <span
        v-for="n in total"
        :key="n"
        :class="{
          ok: results[n - 1]?.correct === true,
          ng: results[n - 1]?.correct === false,
          now: n - 1 === current,
        }"
      ></span>
    </div>
  </div>
</template>
