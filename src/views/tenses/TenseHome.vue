<script setup>
// 時光島首頁：六階段學習路徑、12 時態總覽矩陣、練習入口、進度摘要
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { findScenario, DEFAULT_SCENARIO } from '../../data/tenses/index.js'
import { QUIZ_MODES } from '../../logic/tense.js'
import { tenses } from '../../store/tenses.js'
import Icon from '../../components/Icon.vue'
import TenseMatrix from '../../components/tenses/TenseMatrix.vue'

const router = useRouter()
const scenario = findScenario(DEFAULT_SCENARIO)
const stages = computed(() => tenses.stages())
const stats = computed(() => tenses.overall())
const next = computed(() => stages.value.find((s) => !s.done) ?? null)
const pct = (v) => Math.round(v * 100)

const open = (key) => router.push({ name: 'tense-explore', query: { t: key } })
</script>

<template>
  <section class="page tense-page" :class="{ 'tense-calm': tenses.calm }">
    <router-link to="/" class="back"><Icon name="left" :size="16" /> 星球</router-link>
    <div class="page-head">
      <div class="eyebrow">TENSE EXPLORER · 時光島</div>
      <h1 class="page-title">英文 12 時態攻略</h1>
      <p class="muted">
        不背公式，先看懂畫面。12 種時態其實是「3 種時間 × 4 種動作狀態」：先分清楚事情發生在過去、現在還是未來，
        再看動作是一個點、正在進行、已經發生，還是一路持續。看到情境就想到時態，聽到句子就知道時間和狀態。
      </p>
    </div>

    <dl class="tense-stats">
      <div><dt>已探索</dt><dd class="mono">{{ stats.seen }} / 12</dd></div>
      <div><dt>熟練度</dt><dd class="mono">{{ pct(stats.mastery) }}%</dd></div>
      <div><dt>正確率</dt><dd class="mono">{{ stats.accuracy === null ? '—' : pct(stats.accuracy) + '%' }}</dd></div>
      <div><dt>錯題</dt><dd class="mono">{{ stats.wrong }}</dd></div>
    </dl>

    <h2 class="tx-h2">學習路徑</h2>
    <ol class="tense-path">
      <li v-for="s in stages" :key="s.id" :class="{ done: s.done, next: next && next.id === s.id }">
        <router-link :to="s.to" class="tense-stage">
          <span class="tense-stage-no mono">{{ s.done ? '✔' : s.no }}</span>
          <span class="tense-stage-body">
            <strong>{{ s.title }}</strong>
            <small class="muted">{{ s.desc }}<template v-if="s.meta"> · <span class="mono">{{ s.meta }}</span></template></small>
          </span>
          <span v-if="next && next.id === s.id" class="tense-next mono">NEXT</span>
          <Icon name="right" :size="16" />
        </router-link>
      </li>
    </ol>

    <div class="tense-home-grid">
      <div class="panel">
        <h2 class="tx-h2">12 時態總覽 <small class="faint">點一格進入探索器</small></h2>
        <TenseMatrix :scenario="scenario" @select="open" />
      </div>

      <div class="panel">
        <h2 class="tx-h2">練習</h2>
        <ul class="tense-modes">
          <li v-for="m in QUIZ_MODES" :key="m.id">
            <router-link :to="{ name: 'tense-quiz', params: { mode: m.id } }" class="tense-mode">
              <strong>{{ m.zh }}</strong>
              <small class="muted">{{ m.desc }}</small>
            </router-link>
          </li>
        </ul>
        <router-link :to="{ name: 'tense-progress' }" class="btn"><Icon name="chart" :size="16" /> 學習進度與錯題</router-link>
      </div>
    </div>
  </section>
</template>
