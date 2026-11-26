<script setup>
// 學習進度：六階段、各時態熟練度與正確率、錯題清單（可直接去弱點加強）
import { computed } from 'vue'
import { TENSE_KEYS, findScenario, tenseName } from '../../data/tenses/index.js'
import { weakKeys, sentenceOf, QUIZ_TYPES } from '../../logic/tense.js'
import { tenses } from '../../store/tenses.js'
import Icon from '../../components/Icon.vue'
import TenseTag from '../../components/tenses/TenseTag.vue'

const stats = computed(() => tenses.overall())
const stages = computed(() => tenses.stages())
const pct = (v) => Math.round(v * 100)
const rows = computed(() =>
  TENSE_KEYS.map((key) => ({
    key,
    mastery: tenses.mastery(key),
    accuracy: tenses.accuracy(key),
    attempts: tenses.progress.tenses[key]?.attempts ?? 0,
  })),
)
const weak = computed(() => (stats.value.attempts ? weakKeys(tenses.progress, 3) : []))
const TYPE_ZH = Object.fromEntries(QUIZ_TYPES.map((t) => [t.id, t.zh]))

// 錯題：qid = type:scenario:key
const wrongList = computed(() =>
  Object.entries(tenses.progress.wrong)
    .map(([qid, w]) => {
      const [type, sid] = qid.split(':')
      const scenario = findScenario(sid)
      return scenario ? { qid, type, key: w.key, count: w.count, text: sentenceOf(scenario, w.key).text } : null
    })
    .filter(Boolean)
    .sort((a, b) => b.count - a.count),
)
</script>

<template>
  <section class="page tense-page">
    <router-link :to="{ name: 'tenses' }" class="back"><Icon name="left" :size="16" /> 時光島</router-link>
    <div class="page-head">
      <div class="eyebrow">PROGRESS · 學習進度</div>
      <h1 class="page-title">我的 12 時態</h1>
    </div>

    <dl class="tense-stats">
      <div><dt>已探索</dt><dd class="mono">{{ stats.seen }} / 12</dd></div>
      <div><dt>熟練度</dt><dd class="mono">{{ pct(stats.mastery) }}%</dd></div>
      <div><dt>正確率</dt><dd class="mono">{{ stats.accuracy === null ? '—' : pct(stats.accuracy) + '%' }}</dd></div>
      <div><dt>作答次數</dt><dd class="mono">{{ stats.attempts }}</dd></div>
    </dl>

    <div class="tense-home-grid">
      <div class="panel">
        <h2 class="tx-h2">各時態熟練度</h2>
        <table class="mastery-table">
          <thead><tr><th>時態</th><th>熟練度</th><th>正確率</th><th>次數</th></tr></thead>
          <tbody>
            <tr v-for="r in rows" :key="r.key">
              <td><TenseTag :tense-key="r.key" /></td>
              <td>
                <span class="tp-bar" :aria-label="`熟練度 ${pct(r.mastery)}%`"><span :style="{ width: pct(r.mastery) + '%' }"></span></span>
              </td>
              <td class="mono">{{ r.accuracy === null ? '—' : pct(r.accuracy) + '%' }}</td>
              <td class="mono">{{ r.attempts }}</td>
            </tr>
          </tbody>
        </table>
        <p class="faint small">熟練度 = 正確率 × 作答次數的信心（同一時態答 5 次以上才會滿）。</p>
      </div>

      <div class="tp-side">
        <div class="panel">
          <h2 class="tx-h2">學習路徑</h2>
          <ol class="tp-stages">
            <li v-for="s in stages" :key="s.id" :class="{ done: s.done }">
              <router-link :to="s.to">{{ s.done ? '✔' : s.no }}・{{ s.title }}</router-link>
              <span v-if="s.meta" class="mono faint small">{{ s.meta }}</span>
            </li>
          </ol>
        </div>

        <div class="panel">
          <h2 class="tx-h2">建議加強</h2>
          <p v-if="!weak.length" class="muted">還沒有作答紀錄。先去做一次綜合測驗吧！</p>
          <ul v-else class="tx-uses">
            <li v-for="k in weak" :key="k">
              <router-link :to="{ name: 'tense-explore', query: { t: k } }">{{ tenseName(k) }}</router-link>
            </li>
          </ul>
          <router-link :to="{ name: 'tense-quiz', params: { mode: stats.attempts ? 'weak' : 'mixed' } }" class="btn primary">
            {{ stats.attempts ? '弱點加強練習' : '綜合情境測驗' }} <Icon name="right" :size="16" />
          </router-link>
        </div>

        <div class="panel">
          <h2 class="tx-h2">錯題 <small class="faint">答對一次就會移除</small></h2>
          <p v-if="!wrongList.length" class="muted">目前沒有錯題。</p>
          <ul v-else class="tp-wrong">
            <li v-for="w in wrongList" :key="w.qid">
              <span class="small muted">{{ TYPE_ZH[w.type] }} · 錯 {{ w.count }} 次</span>
              <strong>{{ tenseName(w.key) }}</strong>
              <span lang="en" class="small">{{ w.text }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
