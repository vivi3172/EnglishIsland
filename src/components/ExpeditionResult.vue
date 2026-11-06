<script setup>
// 每個挑戰結束時共用的「行動報告」：獲得物資、消耗、是否昏倒
import { RESOURCES, STATS } from '../data/survival.js'
import Icon from './Icon.vue'

defineProps({ out: { type: Object, required: true } })
</script>

<template>
  <div class="report-box">
    <div class="eyebrow">FIELD REPORT · 行動報告</div>
    <ul class="ledger">
      <li v-for="(n, k) in out.rewards" :key="'g' + k" class="gain">
        <Icon :name="RESOURCES[k].icon" :size="16" />
        <span>{{ RESOURCES[k].zh }}</span>
        <span class="mono">+{{ n }}</span>
      </li>
      <li v-if="!Object.keys(out.rewards).length" class="muted">
        <Icon name="close" :size="16" /><span>未取得物資</span><span></span>
      </li>
      <li v-for="(n, k) in out.cost" :key="'c' + k" class="loss">
        <Icon :name="STATS[k].icon" :size="16" />
        <span>{{ STATS[k].zh }}</span>
        <span class="mono">-{{ n }}</span>
      </li>
    </ul>
    <p v-if="out.fainted" class="alert-box">
      <Icon name="alert" :size="16" />
      體力耗盡，你昏倒了。醒來後背包物資損失一半。先回營地進食、飲水。
    </p>
  </div>
</template>
