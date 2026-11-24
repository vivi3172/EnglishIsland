<script setup>
// 學習進度：各母音與拼字組合的熟練度、正確率、易混淆母音、錯題紀錄、練習紀錄。
import { computed } from 'vue'
import { findCourse } from '../../data/phonics/index.js'
import { courseIndex, wordSegments } from '../../logic/phonics.js'
import { groupMastery, patternMastery, patternAccuracy, overallStats, topConfusions, MAX_BOX } from '../../logic/phonicsProgress.js'
import { phonics } from '../../store/phonics.js'
import { speak } from '../../utils/speech.js'
import Icon from '../../components/Icon.vue'
import PhonicsWord from '../../components/phonics/PhonicsWord.vue'

const props = defineProps({ course: { type: String, required: true } })
const data = findCourse(props.course)
const idx = data ? courseIndex(data) : null
const cp = computed(() => phonics.course(props.course))
const stats = computed(() => overallStats(idx, cp.value))
const confusions = computed(() => topConfusions(idx, cp.value, 5))
const wrongWords = computed(() =>
  Object.entries(cp.value.wrong)
    .map(([en, n]) => ({ word: idx.word[en], en, n }))
    .sort((a, b) => b.n - a.n),
)
const sessions = computed(() => [...cp.value.sessions].reverse().slice(0, 10))
const pct = (x) => (x === null ? '—' : `${Math.round(x * 100)}%`)
const MODE_ZH = { practice: '互動練習', daily: '每日複習', weak: '弱項加強', test: '綜合測驗', sort: '拖曳分類' }

function reset() {
  if (window.confirm('確定要清除自然發音的學習紀錄嗎？荒島求生的遊戲進度不會受影響。')) phonics.reset(props.course)
}
</script>

<template>
  <section v-if="data" class="page phonics-page">
    <router-link :to="{ name: 'phonics', params: { course } }" class="back"><Icon name="left" :size="16" /> 五指地圖</router-link>
    <div class="page-head">
      <div class="eyebrow">PROGRESS · 學習進度</div>
      <h1 class="page-title">{{ data.title }}學習進度</h1>
      <p class="muted">熟練度 0–{{ MAX_BOX }} 級：答對升一級、答錯降兩級。每日複習與弱項加強會優先安排低熟練度的拼字組合。</p>
    </div>

    <dl class="tutor-stats wide">
      <div><dt>作答題數</dt><dd class="mono">{{ stats.total }}</dd></div>
      <div><dt>正確率</dt><dd class="mono">{{ pct(stats.accuracy) }}</dd></div>
      <div><dt>整體熟練度</dt><dd class="mono">{{ pct(stats.mastery) }}</dd></div>
      <div><dt>練過的拼字組合</dt><dd class="mono">{{ stats.practiced }}/{{ idx.patterns.length }}</dd></div>
      <div><dt>每日複習</dt><dd class="mono">{{ cp.dailyDate ?? '—' }}</dd></div>
    </dl>

    <div class="mastery-grid">
      <div v-for="g in idx.groups" :key="g.id" class="panel mastery-card" :style="{ '--v': g.color }">
        <div class="bucket-head">
          <span class="vowel-key small-key">{{ g.key }}</span>
          <strong>長母音 {{ g.key }}</strong>
          <span class="mono muted">{{ pct(groupMastery(idx, cp, g.id)) }}</span>
        </div>
        <table class="mastery-table">
          <thead>
            <tr><th>拼法</th><th>熟練度</th><th>正確率</th><th>題數</th></tr>
          </thead>
          <tbody>
            <tr v-for="p in idx.patterns.filter((x) => x.groupId === g.id)" :key="p.id">
              <td class="mono">{{ p.spelling }} <small class="muted">/{{ idx.sound[p.soundId].ipa }}/</small></td>
              <td>
                <span class="mbar" role="img" :aria-label="`熟練度 ${cp.patterns[p.id]?.box ?? 0} 級`"><span :style="{ width: pct(patternMastery(cp, p.id)) }"></span></span>
              </td>
              <td class="mono">{{ pct(patternAccuracy(cp, p.id)) }}</td>
              <td class="mono">{{ cp.patterns[p.id]?.total ?? 0 }}</td>
            </tr>
          </tbody>
        </table>
        <router-link :to="{ name: 'phonics-practice', params: { course, mode: 'practice' }, query: { group: g.id } }" class="text-link small">練習 {{ g.key }} →</router-link>
      </div>
    </div>

    <div class="progress-columns">
      <div class="panel">
        <div class="eyebrow">容易混淆的母音</div>
        <p v-if="!confusions.length" class="muted small">還沒有混淆紀錄。</p>
        <ul class="plain-list">
          <li v-for="c in confusions" :key="c.soundId + c.chosen">{{ c.from }} → 聽成 {{ c.to }} <span class="mono muted">× {{ c.times }}</span></li>
        </ul>
      </div>
      <div class="panel">
        <div class="eyebrow">錯題紀錄 · {{ wrongWords.length }}</div>
        <p v-if="!wrongWords.length" class="muted small">沒有待複習的錯題。</p>
        <div class="chip-wrap">
          <button v-for="w in wrongWords" :key="w.en" class="word-chip" @click="speak(w.en)">
            <PhonicsWord v-if="w.word" :segments="wordSegments(idx, w.word)" :color="w.word.color" size="sm" />
            <span v-else>{{ w.en }}</span>
            <span class="mono muted small">× {{ w.n }}</span>
          </button>
        </div>
        <router-link v-if="wrongWords.length" :to="{ name: 'phonics-practice', params: { course, mode: 'weak' } }" class="btn xs">弱項加強</router-link>
      </div>
      <div class="panel">
        <div class="eyebrow">最近練習</div>
        <p v-if="!sessions.length" class="muted small">還沒有完成的練習。</p>
        <ul class="plain-list">
          <li v-for="(s, i) in sessions" :key="i">
            <span class="mono muted">{{ s.date }}</span> {{ MODE_ZH[s.mode] ?? s.mode }}
            <span class="mono">{{ s.correct }}/{{ s.total }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="btn-row spread">
      <router-link :to="{ name: 'phonics-practice', params: { course, mode: 'daily' } }" class="btn primary"><Icon name="retry" :size="16" /> 每日複習</router-link>
      <button class="text-link danger" @click="reset">清除自然發音紀錄</button>
    </div>
  </section>
</template>
