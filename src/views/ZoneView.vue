<script setup>
import { computed } from 'vue'
import { ZONES, findZone } from '../data/zones.js'
import { SENTENCES } from '../data/sentences.js'
import { RESOURCES, MISSIONS } from '../data/survival.js'
import { EXPEDITION_COST } from '../logic/progress.js'
import { game } from '../store/game.js'
import { speak, speechSupported } from '../utils/speech.js'
import Icon from '../components/Icon.vue'

const props = defineProps({ id: { type: String, required: true } })
const zone = computed(() => findZone(props.id))
const index = computed(() => ZONES.findIndex((z) => z.id === props.id))
const unlocked = computed(() => zone.value && game.isUnlocked(zone.value.id))
const zoneProgress = computed(() => game.progress.zones[props.id] ?? {})
const patterns = computed(() => SENTENCES[props.id]?.patterns ?? [])
const code = (i) => String(i + 1).padStart(2, '0')

function missionStatus(route) {
  if (route === 'cards') return zoneProgress.value.learned ? '已完成' : ''
  if (route === 'quiz') return game.stars(props.id) ? `${game.stars(props.id)} 星` : ''
  if (route === 'sentence') return game.sentenceStars(props.id) ? `${game.sentenceStars(props.id)} 星` : ''
  return ''
}
</script>

<template>
  <section v-if="zone && unlocked" class="page">
    <router-link to="/" class="back"><Icon name="left" :size="16" /> 地圖</router-link>

    <div class="zone-layout" :style="{ '--zone': zone.color }">
      <div class="zone-side">
        <div class="panel zone-card">
          <div class="eyebrow">SECTOR {{ code(index) }}</div>
          <h1 class="page-title">{{ zone.zh }}</h1>
          <div class="briefing-sub">{{ zone.name }}</div>
          <p class="briefing-text">{{ zone.intro }}</p>
          <dl class="specs">
            <div>
              <dt>可取得</dt>
              <dd><Icon :name="RESOURCES[zone.resource].icon" :size="14" /> {{ RESOURCES[zone.resource].zh }}</dd>
            </div>
            <div>
              <dt>每次消耗</dt>
              <dd class="mono">飽足 -{{ EXPEDITION_COST.hunger }} · 水分 -{{ EXPEDITION_COST.thirst }}</dd>
            </div>
          </dl>
        </div>

        <div class="eyebrow">MISSIONS · 任務</div>
        <div class="mission-list">
          <router-link v-for="(m, i) in MISSIONS" :key="m.route" :to="{ name: m.route, params: { id: zone.id } }" class="mission">
            <span class="mono mission-no">{{ code(i) }}</span>
            <Icon :name="m.icon" :size="20" />
            <span class="mission-body">
              <span class="mission-title">{{ m.title }} <small class="mono">{{ m.en }}</small></span>
              <span class="mission-desc">{{ m.desc }}</span>
            </span>
            <span v-if="missionStatus(m.route)" class="tag">{{ missionStatus(m.route) }}</span>
            <Icon name="right" :size="16" />
          </router-link>
        </div>
      </div>

      <div class="zone-main">
        <div class="section-head">
          <div class="eyebrow">VOCABULARY · 單字表</div>
          <span class="muted small">點擊單字播放發音</span>
        </div>
        <p v-if="!speechSupported" class="muted small">此瀏覽器不支援語音朗讀，建議使用 Chrome 或 Edge。</p>
        <div class="word-table">
          <button v-for="w in zone.words" :key="w.en" class="word-row" @click="speak(w.en)">
            <span class="word-glyph">{{ w.emoji }}</span>
            <span class="word-en">{{ w.en }}</span>
            <span class="word-zh">{{ w.zh }}</span>
            <span class="word-ex">{{ w.example }}</span>
            <Icon name="sound" :size="16" />
          </button>
        </div>

        <template v-if="patterns.length">
          <div class="section-head">
            <div class="eyebrow">PATTERNS · 句型</div>
          </div>
          <div class="pattern-grid">
            <div v-for="p in patterns" :key="p.en" class="pattern">
              <span class="pattern-en">{{ p.en }}</span>
              <span class="muted">{{ p.zh }}</span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </section>

  <section v-else class="page empty-state">
    <Icon name="lock" :size="32" />
    <p>{{ zone ? '這個區域尚未解鎖。' : '找不到這個區域。' }}</p>
    <router-link to="/" class="btn">回到地圖</router-link>
  </section>
</template>
