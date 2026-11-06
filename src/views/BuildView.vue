<script setup>
import { ref } from 'vue'
import { BUILDINGS, RESOURCES } from '../data/survival.js'
import { canAfford } from '../logic/progress.js'
import { game } from '../store/game.js'
import Icon from '../components/Icon.vue'

const message = ref('')

function doBuild(b) {
  const out = game.build(b)
  if (out.ok) {
    message.value =
      b.id === 'radio'
        ? '無線電修復完成。「SOS, SOS. Help! I am on the island.」——訊號已送出，救援隊收到了。'
        : `${b.name} 建造完成。`
  } else if (out.reason === 'not-enough') {
    message.value = '材料不足。'
  }
}

function have(k) {
  return game.progress.inventory[k] ?? 0
}

function reset() {
  if (confirm('確定要重新開始求生嗎？所有進度（包含學習紀錄）都會清除，無法復原。')) {
    game.reset()
    message.value = '已重新開始。'
  }
}
</script>

<template>
  <section class="page">
    <div class="page-head">
      <div>
        <div class="eyebrow">FABRICATION · 建造</div>
        <h1 class="page-title">營地設施</h1>
        <p class="muted">用探索帶回的物資建造設施。設施會在每過一天時自動運作。最終目標是修復求救無線電。</p>
      </div>
    </div>

    <p v-if="message" class="banner good" role="status"><Icon name="check" :size="18" /> {{ message }}</p>

    <div class="blueprints">
      <article
        v-for="b in BUILDINGS"
        :key="b.id"
        class="blueprint"
        :class="{ goal: b.id === 'radio', built: game.progress.built.includes(b.id) }"
      >
        <div class="bp-head">
          <span class="bp-icon"><Icon :name="b.icon" :size="28" /></span>
          <div>
            <div class="eyebrow">{{ b.en }}</div>
            <h2 class="bp-title">{{ b.name }}</h2>
          </div>
          <span v-if="b.id === 'radio'" class="tag accent">最終目標</span>
        </div>
        <p class="bp-effect">{{ b.effect }}</p>
        <ul class="bp-cost">
          <li v-for="(n, k) in b.cost" :key="k" :class="{ short: have(k) < n }">
            <Icon :name="RESOURCES[k].icon" :size="14" />
            <span>{{ RESOURCES[k].zh }}</span>
            <span class="mono">{{ have(k) }}/{{ n }}</span>
            <span class="bp-bar"><span :style="{ width: Math.min(100, (have(k) / n) * 100) + '%' }"></span></span>
          </li>
        </ul>
        <button v-if="game.progress.built.includes(b.id)" class="btn" disabled><Icon name="check" :size="16" /> 已建造</button>
        <button v-else class="btn primary" :disabled="!canAfford(game.progress.inventory, b.cost)" @click="doBuild(b)">
          <Icon name="hammer" :size="16" /> {{ canAfford(game.progress.inventory, b.cost) ? '建造' : '材料不足' }}
        </button>
      </article>
    </div>

    <p class="footer-actions">
      <button class="text-link danger" @click="reset">重新開始求生</button>
    </p>
  </section>
</template>
