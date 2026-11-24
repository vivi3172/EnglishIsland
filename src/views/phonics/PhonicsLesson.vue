<script setup>
// 母音課程：STEP 1 認識聲音 → STEP 2 拼字規則 → STEP 3 單字拆解與拼讀
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { findCourse } from '../../data/phonics/index.js'
import { courseIndex, wordSegments } from '../../logic/phonics.js'
import { phonics } from '../../store/phonics.js'
import { speak } from '../../utils/speech.js'
import Icon from '../../components/Icon.vue'
import PhonicsWord from '../../components/phonics/PhonicsWord.vue'
import WordDetail from '../../components/phonics/WordDetail.vue'

const props = defineProps({ course: { type: String, required: true }, group: { type: String, required: true } })
const route = useRoute()
const data = findCourse(props.course)
const idx = data ? courseIndex(data) : null
const g = idx?.group[props.group] ?? null

const initialStep = Number(route.query.step)
const step = ref([1, 2, 3].includes(initialStep) ? initialStep : 1)
const words = computed(() => idx.words.filter((w) => w.groupId === props.group))
const selected = ref(words.value[0]?.en ?? null)
const selectedWord = computed(() => idx.word[selected.value])

// STEP 1：先聽聲音，聽過之後才顯示字母與拼法
const heard = ref({})
function playSound(s) {
  speak(s.say, { rate: 0.7 })
  heard.value = { ...heard.value, [s.id]: (heard.value[s.id] ?? 0) + 1 }
}

// 只切換畫面、不改網址：App 以 fullPath 當 router-view 的 key，改網址會重建頁面、丟掉已選的單字
function goStep(n) {
  step.value = n
  window.scrollTo({ top: 0 })
}

function pickWord(en, play = true) {
  selected.value = en
  if (play) speak(en)
}

const order = idx ? idx.groups.map((x) => x.id) : []
const pos = order.indexOf(props.group)
const prevGroup = pos > 0 ? idx.group[order[pos - 1]] : null
const nextGroup = pos >= 0 && pos < order.length - 1 ? idx.group[order[pos + 1]] : null

onMounted(() => {
  if (g) phonics.seeLesson(props.course, props.group)
})

const STEP_TABS = [
  { n: 1, title: '認識聲音' },
  { n: 2, title: '拼字規則' },
  { n: 3, title: '拆解拼讀' },
]
</script>

<template>
  <section v-if="g" class="page phonics-page" :style="{ '--v': g.color }">
    <router-link :to="{ name: 'phonics', params: { course } }" class="back"><Icon name="left" :size="16" /> 五指地圖</router-link>
    <div class="lesson-head">
      <span class="vowel-key">{{ g.key }}</span>
      <div>
        <div class="eyebrow">{{ g.finger }} · LONG {{ g.key }}</div>
        <h1 class="page-title">長母音 {{ g.key }} <small class="mono">{{ g.sounds.map((s) => `/${s.ipa}/`).join(' ') }}</small></h1>
      </div>
    </div>

    <div class="step-tabs" role="tablist">
      <button
        v-for="t in STEP_TABS"
        :key="t.n"
        role="tab"
        class="step-tab"
        :class="{ active: step === t.n }"
        :aria-selected="step === t.n"
        @click="goStep(t.n)"
      >
        <span class="mono">STEP {{ t.n }}</span> {{ t.title }}
      </button>
    </div>

    <!-- STEP 1 -->
    <div v-if="step === 1" class="lesson-grid">
      <div v-for="s in g.sounds" :key="s.id" class="panel sound-card">
        <div class="eyebrow">{{ s.label }}</div>
        <button class="listen-btn big-listen" :aria-label="`播放 ${s.label}`" @click="playSound(s)"><Icon name="sound" :size="44" /></button>
        <p class="muted small">{{ heard[s.id] ? `已聽 ${heard[s.id]} 次` : '先按下播放，閉上眼睛聽這個母音' }}</p>
        <transition name="fade">
          <div v-if="heard[s.id]" class="sound-reveal">
            <p class="sound-ipa mono">/{{ s.ipa }}/</p>
            <p>這個聲音可以拼成：</p>
            <div class="chip-wrap">
              <span v-for="p in s.patterns" :key="p.id" class="pattern-spelling mono">{{ p.spelling }}</span>
            </div>
            <button class="btn xs" @click="pickWord(s.anchor)"><Icon name="sound" :size="14" /> 關鍵字 {{ s.anchor }}</button>
          </div>
        </transition>
        <div class="wd-mouth">
          <div class="eyebrow">口型與舌位</div>
          <p>{{ s.mouth }}</p>
        </div>
      </div>
      <div class="lesson-next">
        <button class="btn primary" @click="goStep(2)">下一步：拼字規則 <Icon name="right" :size="16" /></button>
      </div>
    </div>

    <!-- STEP 2 -->
    <div v-else-if="step === 2" class="lesson-stack">
      <div v-for="s in g.sounds" :key="s.id" class="lesson-stack">
        <div class="banner">
          <Icon name="sound" :size="18" />
          <div>
            <strong>為什麼不同拼法會唸同一個音 /{{ s.ipa }}/？</strong>
            <p class="muted">{{ s.why }}</p>
          </div>
        </div>
        <div class="pattern-cards">
          <div v-for="p in s.patterns" :key="p.id" class="panel pattern-card">
            <div class="pattern-card-head">
              <span class="pattern-spelling big mono">{{ p.spelling }}</span>
              <span class="mono muted">→ /{{ s.ipa }}/</span>
            </div>
            <p class="small"><strong>位置：</strong>{{ p.position }}</p>
            <p class="muted small">{{ p.rule }}</p>
            <div class="chip-wrap">
              <button v-for="w in p.words" :key="w.en" class="word-chip" @click="pickWord(w.en)">
                <PhonicsWord :segments="wordSegments(idx, idx.word[w.en])" :color="g.color" />
                <span class="muted small">{{ w.zh }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="panel exception-panel">
        <div class="eyebrow"><Icon name="alert" :size="14" /> 例外 · 規則不是絕對的</div>
        <ul class="exception-list">
          <li v-for="e in g.exceptions" :key="e.word">
            <button class="btn xs" :aria-label="`播放 ${e.word}`" @click="speak(e.word.split(' / ')[0])"><Icon name="sound" :size="14" /></button>
            <strong>{{ e.word }}</strong> <span class="mono muted">/{{ e.ipa }}/</span> <span class="muted">{{ e.zh }}</span>
            <p class="small">{{ e.note }}</p>
          </li>
        </ul>
      </div>
      <div class="lesson-next">
        <button class="btn" @click="goStep(1)"><Icon name="left" :size="16" /> 認識聲音</button>
        <button class="btn primary" @click="goStep(3)">下一步：拆解拼讀 <Icon name="right" :size="16" /></button>
      </div>
    </div>

    <!-- STEP 3 -->
    <div v-else class="blend-layout">
      <div class="panel blend-picker">
        <div class="eyebrow">選一個字來拼讀</div>
        <div class="chip-wrap">
          <button
            v-for="w in words"
            :key="w.en"
            class="word-chip"
            :class="{ active: selected === w.en }"
            @click="pickWord(w.en, false)"
          >
            <PhonicsWord :segments="wordSegments(idx, w)" :color="g.color" size="sm" />
          </button>
        </div>
      </div>
      <div class="panel">
        <WordDetail v-if="selectedWord" :idx="idx" :word="selectedWord" />
      </div>
    </div>

    <div class="lesson-footer">
      <router-link v-if="prevGroup" :to="{ name: 'phonics-lesson', params: { course, group: prevGroup.id } }" class="btn">
        <Icon name="left" :size="16" /> 長母音 {{ prevGroup.key }}
      </router-link>
      <router-link :to="{ name: 'phonics-practice', params: { course, mode: 'practice' }, query: { group: g.id } }" class="btn primary">
        <Icon name="target" :size="16" /> 練習長母音 {{ g.key }}
      </router-link>
      <router-link v-if="nextGroup" :to="{ name: 'phonics-lesson', params: { course, group: nextGroup.id } }" class="btn">
        長母音 {{ nextGroup.key }} <Icon name="right" :size="16" />
      </router-link>
      <router-link v-else :to="{ name: 'phonics-pairs', params: { course } }" class="btn">
        STEP 4 長短母音 <Icon name="right" :size="16" />
      </router-link>
    </div>
  </section>

  <section v-else class="page empty-state">
    <Icon name="book" :size="32" />
    <p>找不到這個母音課程。</p>
    <router-link to="/phonics" class="btn">回到自然發音</router-link>
  </section>
</template>
