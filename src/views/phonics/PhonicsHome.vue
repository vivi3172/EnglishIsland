<script setup>
// 自然發音首頁：五指手掌地圖（點手指展開母音）、學習步驟、AI 導師建議、練習模式。
import { computed, ref } from 'vue'
import { PHONICS_COURSES, findCourse } from '../../data/phonics/index.js'
import { courseIndex, wordSegments } from '../../logic/phonics.js'
import { groupMastery, tutorReport } from '../../logic/phonicsProgress.js'
import { phonics } from '../../store/phonics.js'
import { speak } from '../../utils/speech.js'
import Icon from '../../components/Icon.vue'
import HandMap from '../../components/phonics/HandMap.vue'
import PhonicsWord from '../../components/phonics/PhonicsWord.vue'

const props = defineProps({ course: { type: String, required: true } })
const data = findCourse(props.course)
const idx = data ? courseIndex(data) : null

const cp = computed(() => phonics.course(props.course))
const report = computed(() => tutorReport(data, cp.value, phonics.today()))
const mastery = computed(() => Object.fromEntries(idx.groups.map((g) => [g.id, groupMastery(idx, cp.value, g.id)])))
const selectedId = ref(idx?.groups[0].id ?? null)
const group = computed(() => idx.group[selectedId.value])
const pct = (x) => `${Math.round((x ?? 0) * 100)}%`
const params = (extra = {}) => ({ course: props.course, ...extra })

const STEPS = computed(() => [
  { no: 1, title: '認識聲音', desc: '先聽母音，再看字母', to: { name: 'phonics-lesson', params: params({ group: selectedId.value }), query: { step: 1 } } },
  { no: 2, title: '拼字規則', desc: '同一個音的不同拼法', to: { name: 'phonics-lesson', params: params({ group: selectedId.value }), query: { step: 2 } } },
  { no: 3, title: '拆解拼讀', desc: '音素一個一個合起來', to: { name: 'phonics-lesson', params: params({ group: selectedId.value }), query: { step: 3 } } },
  { no: 4, title: '長短母音', desc: 'cap / cape 聽得出來', to: { name: 'phonics-pairs', params: params() } },
  { no: 5, title: '互動練習', desc: '依程度自動調整題目', to: { name: 'phonics-practice', params: params({ mode: 'practice' }) } },
])

const MODES = computed(() => [
  { icon: 'retry', title: '每日複習', desc: report.value.dailyDone ? '今天已完成 ✓' : '錯題優先，輪替舊單字', to: { name: 'phonics-practice', params: params({ mode: 'daily' }) } },
  { icon: 'target', title: '弱項加強', desc: report.value.wrongCount ? `${report.value.wrongCount} 個錯題待重練` : '針對不熟的拼字組合', to: { name: 'phonics-practice', params: params({ mode: 'weak' }) } },
  { icon: 'star', title: '綜合測驗', desc: '六個長母音 × 所有題型', to: { name: 'phonics-practice', params: params({ mode: 'test' }) } },
  { icon: 'type', title: '音節切分（一元一輔切）', desc: '長單字切成小塊來唸 · 劈椰子遊戲', to: { name: 'syllables' } },
  { icon: 'layers', title: '拖曳分類', desc: '把單字放進對的手指', to: { name: 'phonics-sort', params: params() } },
  { icon: 'chart', title: '學習進度', desc: '熟練度、正確率、錯題', to: { name: 'phonics-progress', params: params() } },
])
</script>

<template>
  <section v-if="data" class="page phonics-page">
    <div class="page-head">
      <div class="eyebrow">PHONICS · 自然發音 · {{ data.en }}</div>
      <h1 class="page-title">{{ data.title }}</h1>
      <p class="muted">{{ data.intro }}</p>
    </div>

    <div class="hand-layout">
      <div class="panel hand-panel">
        <HandMap :groups="idx.groups" :selected="selectedId" :mastery="mastery" @select="selectedId = $event" />
        <p class="muted small hand-note">手指內的色塊高度 = 該母音的熟練度</p>
      </div>

      <div class="panel vowel-panel" :style="{ '--v': group.color }" aria-live="polite">
        <div class="vowel-head">
          <span class="vowel-key">{{ group.key }}</span>
          <div>
            <div class="eyebrow">{{ group.finger }} · 熟練度 {{ pct(mastery[group.id]) }}</div>
            <div class="vowel-sounds">
              <button v-for="s in group.sounds" :key="s.id" class="sound-chip" @click="speak(s.say, { rate: 0.7 })">
                <Icon name="sound" :size="14" /> <span class="mono">/{{ s.ipa }}/</span> {{ s.label }}
              </button>
            </div>
          </div>
        </div>

        <div v-for="s in group.sounds" :key="s.id" class="vowel-sound-block">
          <p v-if="group.sounds.length > 1" class="eyebrow">/{{ s.ipa }}/ · {{ s.label }}</p>
          <p class="muted small">{{ s.why }}</p>
          <ul class="pattern-list">
            <li v-for="p in s.patterns" :key="p.id">
              <span class="pattern-spelling mono">{{ p.spelling }}</span>
              <span class="pattern-pos muted small">{{ p.position }}</span>
              <span class="pattern-words">
                <button v-for="w in p.words.slice(0, 3)" :key="w.en" class="word-chip" :title="w.zh" @click="speak(w.en)">
                  <PhonicsWord :segments="wordSegments(idx, idx.word[w.en])" :color="group.color" size="sm" />
                </button>
              </span>
            </li>
          </ul>
        </div>
        <p class="muted small"><Icon name="alert" :size="14" /> 規則不是絕對的：這個母音有 {{ group.exceptions.length }} 個常見例外，課程裡會說明。</p>

        <div class="btn-row">
          <router-link :to="{ name: 'phonics-lesson', params: params({ group: group.id }) }" class="btn primary">進入 {{ group.key }} 課程 <Icon name="right" :size="16" /></router-link>
          <router-link :to="{ name: 'phonics-practice', params: params({ mode: 'practice' }), query: { group: group.id } }" class="btn">練習 {{ group.key }}</router-link>
        </div>
      </div>
    </div>

    <div class="section-head"><div class="eyebrow">LEARNING PATH · 學習步驟</div></div>
    <ol class="step-strip">
      <li v-for="s in STEPS" :key="s.no">
        <router-link :to="s.to" class="step-card">
          <span class="mono step-no">STEP {{ s.no }}</span>
          <strong>{{ s.title }}</strong>
          <span class="muted small">{{ s.desc }}</span>
        </router-link>
      </li>
    </ol>

    <div class="tutor-layout">
      <div class="panel tutor-panel">
        <div class="tutor-head">
          <span class="tutor-badge"><Icon name="spark" :size="18" /></span>
          <div>
            <div class="eyebrow">AI TUTOR · 發音導師</div>
            <strong>目前難度：{{ report.levelInfo.label }}</strong>
            <span class="muted small">　{{ report.levelInfo.desc }}</span>
          </div>
        </div>
        <dl class="tutor-stats">
          <div><dt>作答題數</dt><dd class="mono">{{ report.stats.total }}</dd></div>
          <div><dt>正確率</dt><dd class="mono">{{ report.stats.accuracy === null ? '—' : pct(report.stats.accuracy) }}</dd></div>
          <div><dt>整體熟練度</dt><dd class="mono">{{ pct(report.stats.mastery) }}</dd></div>
        </dl>
        <ul class="tutor-messages">
          <li v-for="(m, i) in report.messages" :key="i">{{ m }}</li>
        </ul>
        <div v-if="report.extension.length" class="tutor-extension">
          <div class="eyebrow">延伸單字 · 用同樣的規則讀讀看</div>
          <div class="chip-wrap">
            <button v-for="w in report.extension" :key="w.en" class="word-chip" :title="w.zh" @click="speak(w.en)">
              <PhonicsWord :segments="wordSegments(idx, w)" :color="w.color" size="sm" />
              <span class="muted small">{{ w.zh }}</span>
            </button>
          </div>
        </div>
        <router-link :to="report.next.to" class="btn primary tutor-next">{{ report.next.text }} <Icon name="right" :size="16" /></router-link>
      </div>

      <div class="mode-list">
        <router-link v-for="m in MODES" :key="m.title" :to="m.to" class="mission">
          <Icon :name="m.icon" :size="20" />
          <span class="mission-body">
            <span class="mission-title">{{ m.title }}</span>
            <span class="mission-desc">{{ m.desc }}</span>
          </span>
          <Icon name="right" :size="16" />
        </router-link>
      </div>
    </div>

    <div class="section-head"><div class="eyebrow">COURSES · 自然發音課程</div></div>
    <ul class="course-roadmap">
      <li v-for="c in PHONICS_COURSES" :key="c.id" :class="{ ready: c.status === 'ready' }">
        <router-link v-if="c.to" :to="c.to" class="course-link"><strong>{{ c.title }}</strong></router-link>
        <strong v-else>{{ c.title }}</strong>
        <span class="muted small">{{ c.en }}</span>
        <span class="tag" :class="{ accent: c.status === 'ready' }">{{ c.status === 'ready' ? '學習中' : '即將推出' }}</span>
      </li>
    </ul>
  </section>

  <section v-else class="page empty-state">
    <Icon name="book" :size="32" />
    <p>找不到這個課程。</p>
    <router-link to="/phonics" class="btn">回到自然發音</router-link>
  </section>
</template>
