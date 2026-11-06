<script setup>
// 生存狀態：生命數值、警告、背包物資與使用
import { computed, ref } from 'vue'
import { RESOURCES, STATS } from '../data/survival.js'
import { ITEM_EFFECTS } from '../logic/progress.js'
import { game } from '../store/game.js'
import Icon from './Icon.vue'

const message = ref('')

const warnings = computed(() => {
  const s = game.progress.stats
  const list = []
  if (s.hunger <= 25) list.push('飢餓：盡快進食')
  if (s.thirst <= 25) list.push('脫水：盡快補充水分')
  if (s.health <= 30) list.push('生命垂危：使用草藥或先吃飽喝足')
  return list
})

const useLabels = { food: '進食', water: '飲水', herb: '治療' }

function use(kind) {
  const out = game.use(kind)
  const r = RESOURCES[kind]
  const stat = STATS[ITEM_EFFECTS[kind].stat]
  if (out.ok) message.value = `消耗 ${r.zh} ×1 → ${stat.zh} +${ITEM_EFFECTS[kind].amount}`
  else if (out.reason === 'empty') message.value = `${r.zh}不足，需要出發探索`
  else if (out.reason === 'full') message.value = `${stat.zh}已滿`
}

function level(v) {
  return v <= 25 ? 'danger' : v <= 50 ? 'warn' : 'ok'
}
</script>

<template>
  <div class="survival">
    <div class="day-block">
      <span class="eyebrow">SURVIVAL LOG</span>
      <div class="day-row">
        <span class="day-num">DAY {{ String(game.day).padStart(2, '0') }}</span>
        <span v-if="game.progress.rescuedDay" class="tag good">已獲救</span>
      </div>
    </div>

    <div class="vitals">
      <div v-for="(meta, key) in STATS" :key="key" class="vital" :class="level(game.progress.stats[key])">
        <div class="vital-head">
          <span class="vital-name"><Icon :name="meta.icon" :size="14" /> {{ meta.zh }}</span>
          <span class="mono">{{ game.progress.stats[key] }}</span>
        </div>
        <div
          class="meter"
          role="meter"
          :aria-label="meta.zh"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="game.progress.stats[key]"
        >
          <div :style="{ width: game.progress.stats[key] + '%' }"></div>
        </div>
      </div>
    </div>

    <ul v-if="warnings.length" class="alerts">
      <li v-for="w in warnings" :key="w"><Icon name="alert" :size="14" /> {{ w }}</li>
    </ul>

    <div class="eyebrow">INVENTORY</div>
    <div class="inventory">
      <div v-for="(meta, key) in RESOURCES" :key="key" class="inv">
        <Icon :name="meta.icon" :size="16" />
        <span class="inv-name">{{ meta.zh }}</span>
        <span class="mono inv-count">{{ game.progress.inventory[key] }}</span>
        <button v-if="useLabels[key]" class="btn xs" :disabled="!game.progress.inventory[key]" @click="use(key)">
          {{ useLabels[key] }}
        </button>
        <span v-else class="inv-spacer"></span>
      </div>
    </div>
    <p v-if="message" class="inv-msg mono" role="status">&gt; {{ message }}</p>
  </div>
</template>
