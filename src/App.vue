<script setup>
import { computed, onMounted } from 'vue'
import { game } from './store/game.js'
import { ZONES, findWord } from './data/zones.js'
import { learnedWords } from './logic/review.js'
import { STATS } from './data/survival.js'
import Icon from './components/Icon.vue'
import SurvivalPanel from './components/SurvivalPanel.vue'

const reviewCount = computed(() => Object.keys(game.progress.wrongWords).filter(findWord).length)
// 有學過的單字、且今天還沒做每日複習時，導覽列亮提示
const dailyPending = computed(() => !game.dailyDone && learnedWords(game.progress, ZONES).length > 0)
const low = (v) => v <= 25

const NAV = [
  { to: '/', icon: 'map', label: '地圖', exact: true },
  { to: '/daily', icon: 'retry', label: '每日複習', daily: true },
  { to: '/review', icon: 'notes', label: '錯題複習', badge: true },
  { to: '/build', icon: 'hammer', label: '建造' },
]

onMounted(() => game.tick())
</script>

<template>
  <div class="shell">
    <!-- 桌機：左側固定側欄 -->
    <aside class="sidebar">
      <router-link to="/" class="brand">
        <span class="brand-mark">EI</span>
        <span class="brand-text">ENGLISH ISLAND<small>荒島求生</small></span>
      </router-link>
      <nav class="side-nav" aria-label="主選單">
        <router-link
          v-for="item in NAV"
          :key="item.to"
          :to="item.to"
          class="side-link"
          :exact-active-class="item.exact ? 'active' : ''"
          :active-class="item.exact ? '' : 'active'"
        >
          <Icon :name="item.icon" />
          <span>{{ item.label }}</span>
          <b v-if="item.badge && reviewCount" class="count">{{ reviewCount }}</b>
        <b v-if="item.daily && dailyPending" class="count" title="今天還沒複習">!</b>
        </router-link>
      </nav>
      <SurvivalPanel />
    </aside>

    <!-- 手機：頂部狀態列 -->
    <header class="topbar">
      <router-link to="/" class="brand"><span class="brand-mark">EI</span></router-link>
      <span class="mono top-day">DAY {{ String(game.day).padStart(2, '0') }}</span>
      <div class="top-vitals">
        <span v-for="(meta, key) in STATS" :key="key" class="top-vital mono" :class="{ low: low(game.progress.stats[key]) }" :title="meta.zh">
          <Icon :name="meta.icon" :size="13" />{{ game.progress.stats[key] }}
        </span>
      </div>
    </header>

    <main class="content">
      <router-view :key="$route.fullPath" />
    </main>

    <!-- 手機：底部導覽 -->
    <nav class="bottom-nav" aria-label="主選單">
      <router-link
        v-for="item in NAV"
        :key="item.to"
        :to="item.to"
        class="bottom-link"
        :exact-active-class="item.exact ? 'active' : ''"
        :active-class="item.exact ? '' : 'active'"
      >
        <Icon :name="item.icon" :size="20" />
        <span>{{ item.label }}</span>
        <b v-if="item.badge && reviewCount" class="count">{{ reviewCount }}</b>
        <b v-if="item.daily && dailyPending" class="count" title="今天還沒複習">!</b>
      </router-link>
    </nav>
  </div>
</template>
