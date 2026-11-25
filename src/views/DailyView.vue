<script setup>
// 每日單字：每天海浪沖上 5 個漂流瓶（今天的新單字），全部打開後進入每日測驗（新字 + 舊字疊加）。
import { computed, ref } from 'vue'
import { ZONES } from '../data/zones.js'
import { DAILY_WORDS } from '../data/dailyWords.js'
import { game } from '../store/game.js'
import { learnedWords, DAILY_OLD_COUNT, DAILY_REVIEW_LENGTH } from '../logic/review.js'
import { DAILY_REVIEW_BONUS } from '../logic/progress.js'
import { speak } from '../utils/speech.js'
import Icon from '../components/Icon.vue'

const words = game.startDailyWords()
const opened = ref(new Set())
const current = ref(null)

const allOpened = computed(() => words.length > 0 && opened.value.size === words.length)
const learnedTotal = computed(() => learnedWords(game.progress, ZONES, DAILY_WORDS).length)
const oldCount = computed(() => Math.min(learnedTotal.value - words.length, words.length ? DAILY_OLD_COUNT : DAILY_REVIEW_LENGTH))

function open(w) {
  opened.value = new Set(opened.value).add(w.en)
  current.value = w
  speak(w.en)
}
</script>

<template>
  <section class="page daily-page">
    <div class="page-head">
      <div class="eyebrow">DAILY WORDS · DAY {{ String(game.day).padStart(2, '0') }}</div>
      <h1 class="page-title">今日漂流瓶</h1>
      <p class="muted">每天海浪會沖上 5 個漂流瓶，每個瓶子裝著一個新單字。打開全部瓶子，再和之前學過的單字一起測驗——每天都在舊字上疊加新字。</p>
    </div>

    <dl class="daily-stats">
      <div><dt>今日新字</dt><dd class="mono">{{ words.length }}</dd></div>
      <div><dt>累積學過</dt><dd class="mono">{{ learnedTotal }}</dd></div>
      <div><dt>題庫剩下</dt><dd class="mono">{{ game.dailyWordsLeft }}</dd></div>
    </dl>

    <template v-if="words.length">
      <ul class="bottle-row">
        <li v-for="(w, i) in words" :key="w.en">
        <button
          class="bottle"
          :class="{ opened: opened.has(w.en), now: current?.en === w.en }"
          :style="{ '--i': i }"
          :aria-label="opened.has(w.en) ? w.en : `打開第 ${i + 1} 個漂流瓶`"
          @click="open(w)"
        >
          <span class="bottle-glyph" aria-hidden="true">{{ opened.has(w.en) ? w.emoji : '🍾' }}</span>
          <span class="bottle-label">{{ opened.has(w.en) ? w.en : `#${i + 1}` }}</span>
        </button>
        </li>
      </ul>

      <div v-if="current" class="panel bottle-card" aria-live="polite">
        <span class="card-glyph">{{ current.emoji }}</span>
        <div class="bottle-card-body">
          <div class="bottle-card-word">{{ current.en }}</div>
          <div class="accent-text">{{ current.zh }}</div>
          <p>{{ current.example }}</p>
          <p class="muted">{{ current.exampleZh }}</p>
          <div class="btn-row">
            <button class="btn" @click="speak(current.en)"><Icon name="sound" :size="16" /> 單字</button>
            <button class="btn" @click="speak(current.example)"><Icon name="sound" :size="16" /> 例句</button>
          </div>
        </div>
      </div>
      <p v-else class="muted bottle-hint">點一個漂流瓶打開它。</p>
    </template>

    <div v-else class="panel">
      <p><Icon name="check" :size="16" /> 題庫裡的新單字都學完了！</p>
      <p class="muted">每日測驗會繼續從你學過的 {{ learnedTotal }} 個單字中輪流複習。</p>
    </div>

    <div class="panel daily-go">
      <div>
        <div class="eyebrow">TODAY'S DRILL · 今日測驗</div>
        <p>
          <template v-if="words.length">今天的 {{ words.length }} 個新字</template>
          <template v-if="words.length && oldCount > 0"> + </template>
          <template v-if="oldCount > 0">{{ oldCount }} 個舊字（答錯過的優先）</template>
        </p>
        <p v-if="!game.dailyDone" class="muted small">今天第一次完成：食物 +{{ DAILY_REVIEW_BONUS.food }}、淡水 +{{ DAILY_REVIEW_BONUS.water }}</p>
        <p v-else class="ok-text small"><Icon name="check" :size="14" /> 今天已完成，可以再練一次</p>
      </div>
      <router-link v-if="allOpened || !words.length" to="/daily/quiz" class="btn primary">開始測驗 <Icon name="right" :size="16" /></router-link>
      <span v-else class="muted small">先打開全部 {{ words.length }} 個瓶子（{{ opened.size }}/{{ words.length }}）</span>
    </div>
  </section>
</template>
