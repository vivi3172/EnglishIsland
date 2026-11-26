<script setup>
// 互動式時態探索器：切換「時間 × 動作狀態」，時間軸、插畫、例句、翻譯、語感、動詞變化、
// 公式、發音、使用情境、容易混淆的時態全部同步更新。
import { computed, ref, watch } from 'vue'
import {
  TIMES, ASPECTS, FORMS, SCENARIOS, DEFAULT_SCENARIO, TENSE_KEYS,
  findScenario, splitKey, tenseKey, tenseName, tenseNameEn, comparisonFor,
} from '../../data/tenses/index.js'
import { entryOf, verbChange, spokenMatch, parseSentence } from '../../logic/tense.js'
import { tenses } from '../../store/tenses.js'
import { recognitionSupported, listenOnce } from '../../utils/recognition.js'
import { useSpeaker, RATES } from '../../components/tenses/useSpeaker.js'
import Icon from '../../components/Icon.vue'
import TenseTimeline from '../../components/tenses/TenseTimeline.vue'
import TenseScene from '../../components/tenses/TenseScene.vue'
import TenseSentence from '../../components/tenses/TenseSentence.vue'
import TenseMatrix from '../../components/tenses/TenseMatrix.vue'
import TenseTag from '../../components/tenses/TenseTag.vue'

const props = defineProps({
  t: { type: String, default: null },
  s: { type: String, default: null },
})

const startKey = TENSE_KEYS.includes(props.t) ? props.t : 'present-simple'
const scenarioId = ref(findScenario(props.s) ? props.s : DEFAULT_SCENARIO)
const time = ref(splitKey(startKey).time)
const aspect = ref(splitKey(startKey).aspect)

const scenario = computed(() => findScenario(scenarioId.value))
const key = computed(() => tenseKey(time.value, aspect.value))
const entry = computed(() => entryOf(scenario.value, key.value))
const form = computed(() => FORMS[key.value])
const change = computed(() => verbChange(scenario.value, key.value))
const showZh = ref(true)

const VERB_FORMS = [
  { id: 'base', zh: '原形' },
  { id: 's', zh: '第三人稱單數' },
  { id: 'past', zh: '過去式' },
  { id: 'pp', zh: '過去分詞 p.p.' },
  { id: 'ing', zh: '現在分詞 V-ing' },
]

const { active, say, stop } = useSpeaker()
const mic = ref({ state: 'idle', text: '', ratio: 0 })

function select(k) {
  const p = splitKey(k)
  time.value = p.time
  aspect.value = p.aspect
}

watch(
  [key, scenarioId],
  () => {
    stop()
    mic.value = { state: 'idle', text: '', ratio: 0 }
    tenses.see(key.value)
  },
  { immediate: true },
)

const MIC_ERRORS = {
  'not-allowed': '沒有麥克風權限，請在瀏覽器網址列允許使用麥克風。',
  'no-speech': '沒有聽到聲音，靠近麥克風再試一次。',
  network: '語音辨識需要網路連線，請確認網路後再試。',
  'audio-capture': '找不到麥克風裝置。',
}

async function shadow() {
  stop()
  mic.value = { state: 'listening', text: '', ratio: 0 }
  try {
    const heard = await listenOnce()
    const m = spokenMatch(parseSentence(entry.value.en).text, heard)
    mic.value = { state: 'heard', text: m.text, ratio: m.ratio }
  } catch (e) {
    mic.value = { state: 'error', text: MIC_ERRORS[e.message] ?? '語音辨識沒有成功，請再試一次。', ratio: 0 }
  }
}

const compareLink = (other) => ({ name: 'tense-compare', query: { a: key.value, b: other } })
</script>

<template>
  <section class="page tense-page" :class="{ 'tense-calm': tenses.calm }">
    <router-link :to="{ name: 'tenses' }" class="back"><Icon name="left" :size="16" /> 時光島</router-link>
    <div class="tx-head">
      <div>
        <div class="eyebrow">STAGE 3 · TENSE EXPLORER</div>
        <h1 class="page-title">時態探索器</h1>
      </div>
      <div class="tx-tools">
        <div class="seg" role="group" aria-label="情境">
          <button v-for="sc in SCENARIOS" :key="sc.id" class="seg-btn" :aria-pressed="scenarioId === sc.id" @click="scenarioId = sc.id">
            {{ sc.emoji }} {{ sc.title }}
          </button>
        </div>
        <button v-if="!tenses.systemCalm" class="btn xs" :aria-pressed="tenses.progress.calm" @click="tenses.toggleCalm()">
          {{ tenses.progress.calm ? '開啟動畫' : '減少動畫' }}
        </button>
      </div>
    </div>

    <!-- 兩組切換控制 -->
    <div class="tx-controls">
      <div class="tx-group">
        <span class="tx-label">① 時間</span>
        <div class="seg seg-fill" role="group" aria-label="時間">
          <button
            v-for="tm in TIMES" :key="tm.id" class="seg-btn" :style="{ '--c': tm.color }"
            :aria-pressed="time === tm.id" @click="time = tm.id"
          >
            {{ tm.symbol }} {{ tm.zh }}<small>{{ tm.en }}</small>
          </button>
        </div>
      </div>
      <div class="tx-group">
        <span class="tx-label">② 動作狀態</span>
        <div class="seg seg-fill" role="group" aria-label="動作狀態">
          <button
            v-for="a in ASPECTS" :key="a.id" class="seg-btn" :style="{ '--c': a.color }"
            :aria-pressed="aspect === a.id" @click="aspect = a.id"
          >
            {{ a.symbol }} {{ a.zh }}<small>{{ a.en }}</small>
          </button>
        </div>
      </div>
    </div>

    <div class="tx-layout">
      <div class="tx-visual">
        <TenseScene :scenario="scenario" :tense-key="key" />
        <TenseTimeline :tense-key="key" :tl="entry.tl" />
      </div>

      <div class="tx-info">
        <div class="panel tx-sentence" aria-live="polite">
          <div class="tx-name">
            <TenseTag :tense-key="key" />
            <span class="mono faint small">{{ tenseNameEn(key) }}</span>
          </div>
          <TenseSentence :marked="entry.en" :active="active" size="lg" legend />
          <div class="tx-say">
            <button class="btn" @click="say(entry.en, { rate: RATES.normal })"><Icon name="sound" :size="16" /> 發音</button>
            <button class="btn" @click="say(entry.en, { rate: RATES.slow })"><Icon name="sound" :size="16" /> 慢速</button>
            <button v-if="recognitionSupported" class="btn" :disabled="mic.state === 'listening'" @click="shadow">
              <Icon name="mic" :size="16" /> {{ mic.state === 'listening' ? '聽你說…' : '跟讀' }}
            </button>
            <button class="btn xs" :aria-pressed="!showZh" @click="showZh = !showZh">{{ showZh ? '隱藏中文' : '顯示中文' }}</button>
          </div>
          <p v-if="mic.state === 'heard'" class="tx-mic" role="status">
            辨識到：「<span lang="en">{{ mic.text }}</span>」・對上 {{ Math.round(mic.ratio * 100) }}% 的單字
            <small class="faint">（這是語音辨識的文字比對，不是發音評分）</small>
          </p>
          <p v-else-if="mic.state === 'error'" class="tx-mic error" role="status">{{ mic.text }}</p>

          <dl class="tx-facts">
            <div v-if="showZh"><dt>中文翻譯</dt><dd>{{ entry.zh }}</dd></div>
            <div><dt>中文語感</dt><dd class="tx-feel">{{ entry.feel }}</dd></div>
            <div>
              <dt>動詞變化</dt>
              <dd>
                <span class="mono">{{ change.base }}</span> → <strong class="mono" lang="en">{{ change.phrase }}</strong>
              </dd>
            </div>
          </dl>
          <ul class="tx-forms" aria-label="動詞的五種形式">
            <li v-for="f in VERB_FORMS" :key="f.id" :class="{ on: f.id === change.form }">
              <b class="mono" lang="en">{{ scenario.verb[f.id] }}</b><small>{{ f.zh }}</small>
            </li>
          </ul>
        </div>

        <details class="panel tx-formula">
          <summary><Icon name="book" :size="16" /> 文法公式（點開看）</summary>
          <p class="tx-formula-main"><span class="mono">{{ form.formulaEn }}</span><span class="muted">{{ form.formula }}</span></p>
          <p>{{ form.auxWhy }}</p>
        </details>

        <div class="panel">
          <h2 class="tx-h2">常見使用情境</h2>
          <ul class="tx-uses">
            <li v-for="u in form.uses" :key="u">{{ u }}</li>
          </ul>
        </div>

        <div class="panel">
          <h2 class="tx-h2">容易混淆的時態</h2>
          <ul class="tx-confused">
            <li v-for="c in form.confused" :key="c">
              <button class="btn xs" @click="select(c)">{{ tenseName(c) }}</button>
              <span class="muted small">{{ comparisonFor(key, c)?.title ?? `${tenseName(key)} vs. ${tenseName(c)}` }}</span>
              <router-link :to="compareLink(c)" class="tx-cmp-link small">並排比較 <Icon name="right" :size="13" /></router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="panel tx-matrix">
      <h2 class="tx-h2">12 時態總覽 <small class="faint">點任一格直接切換</small></h2>
      <TenseMatrix :scenario="scenario" :selected="key" @select="select" />
    </div>
  </section>
</template>
