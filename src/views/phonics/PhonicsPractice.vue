<script setup>
// STEP 5 互動練習。模式：practice（可指定母音）、daily 每日複習、weak 弱項加強、test 綜合測驗。
// 題目由 planSession 依熟練度自動調整；答錯一定顯示規則說明與錯誤原因。
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { findCourse } from '../../data/phonics/index.js'
import { courseIndex, wordSegments, explainAnswer, chosenSoundOf, TYPE_LABELS } from '../../logic/phonics.js'
import { planSession, LEVEL_INFO } from '../../logic/phonicsProgress.js'
import { starsForScore } from '../../logic/quiz.js'
import { phonics } from '../../store/phonics.js'
import { speak } from '../../utils/speech.js'
import Icon from '../../components/Icon.vue'
import MissionHeader from '../../components/MissionHeader.vue'
import PhonicsWord from '../../components/phonics/PhonicsWord.vue'

const props = defineProps({ course: { type: String, required: true }, mode: { type: String, required: true } })
const route = useRoute()
const data = findCourse(props.course)
const idx = data ? courseIndex(data) : null

const MODES = {
  practice: { title: '互動練習', code: 'PRACTICE' },
  daily: { title: '每日複習', code: 'DAILY' },
  weak: { title: '弱項加強', code: 'FOCUS' },
  test: { title: '五大長母音綜合測驗', code: 'TEST' },
}
const mode = MODES[props.mode] ? props.mode : 'practice'
const groupId = mode === 'practice' && idx?.group[route.query.group] ? route.query.group : null
const title = computed(() => (groupId ? `練習長母音 ${idx.group[groupId].key}` : MODES[mode].title))

const level = ref(1)
const questions = ref([])
const index = ref(0)
const picked = ref(null)
const results = ref([])
const explanation = ref(null)
const finished = ref(false)

function start() {
  const plan = planSession(data, phonics.course(props.course), { mode, groupId })
  level.value = plan.level
  questions.value = plan.questions
  index.value = 0
  picked.value = null
  results.value = []
  explanation.value = null
  finished.value = false
}
if (data) start()

const q = computed(() => questions.value[index.value])
const AUTO_PLAY = new Set(['listen-word', 'listen-vowel', 'pair', 'fill-blank', 'pick-pattern'])
watch(
  q,
  (question) => {
    if (question && AUTO_PLAY.has(question.type)) speak(question.say)
  },
  { immediate: true },
)

const answerWord = computed(() => (q.value?.word ? q.value.word : null))
const color = computed(() => (q.value ? idx.sound[q.value.soundId].color : 'var(--accent)'))

function choose(option) {
  if (picked.value) return
  picked.value = option.value
  const question = q.value
  explanation.value = explainAnswer(idx, question, option.value)
  results.value.push({
    en: question.word?.en ?? question.answer,
    patternId: question.patternId,
    soundId: question.soundId,
    chosenSound: chosenSoundOf(idx, question, option.value),
    correct: explanation.value.correct,
    type: question.type,
    question,
    chosen: option.label,
    lines: explanation.value.lines,
  })
  speak(question.say)
}

function next() {
  if (index.value < questions.value.length - 1) {
    index.value++
    picked.value = null
    explanation.value = null
    return
  }
  finished.value = true
  phonics.record(
    props.course,
    results.value.map(({ en, patternId, soundId, chosenSound, correct }) => ({ en, patternId, soundId, chosenSound, correct })),
    mode,
  )
}

const summary = computed(() => {
  const correct = results.value.filter((r) => r.correct).length
  return { correct, total: results.value.length, stars: starsForScore(correct, results.value.length), wrong: results.value.filter((r) => !r.correct) }
})

function optionClass(option) {
  if (!picked.value) return ''
  if (option.value === q.value.answer) return 'correct'
  if (option.value === picked.value) return 'wrong'
  return 'dim'
}
const promptFor = (question) => {
  if (question.type === 'pick-pattern') return `這個字的長母音 /${idx.sound[question.soundId].ipa}/ 是用哪一個字母組合拼的？`
  return TYPE_LABELS[question.type].zh
}
</script>

<template>
  <section v-if="data" class="page phonics-page">
    <MissionHeader
      :back-to="{ name: 'phonics', params: { course } }"
      back-label="五指地圖"
      :title="title"
      :code="MODES[mode].code"
      :current="finished ? questions.length : index"
      :total="questions.length"
      :results="results"
    />

    <p v-if="!finished && index === 0 && !picked" class="muted daily-note">
      難度：{{ LEVEL_INFO[level].label }} — {{ LEVEL_INFO[level].desc }}
      <template v-if="mode === 'daily'">錯題優先，其次是最久沒練的字。</template>
      <template v-if="mode === 'weak'">集中練習錯題、熟練度最低的拼字組合與容易混淆的母音。</template>
    </p>

    <div v-if="!questions.length" class="empty-state">
      <Icon name="check" :size="32" />
      <p>目前沒有可以出題的單字。</p>
      <router-link :to="{ name: 'phonics', params: { course } }" class="btn">回到五指地圖</router-link>
    </div>

    <div v-else-if="!finished" class="stage">
      <div class="stage-prompt panel prompt-panel" :style="{ '--v': color }">
        <div class="eyebrow">{{ TYPE_LABELS[q.type].code }}</div>
        <p class="muted">{{ promptFor(q) }}</p>

        <template v-if="q.type === 'fill-blank'">
          <span class="ph-word ph-xl masked-word">
            <span v-for="(m, i) in q.masked" :key="i" class="ph-seg" :class="{ blank: m.blank }">{{ m.text }}</span>
          </span>
          <p class="prompt-sub">{{ q.word.zh }} <span class="mono muted">/{{ q.word.ipa }}/</span></p>
        </template>
        <template v-else-if="q.type === 'decode'">
          <span class="tag accent">沒學過的字</span>
          <PhonicsWord :segments="wordSegments(idx, q.word)" :color="'var(--text)'" size="xl" />
          <p class="muted small">提示：標底線的字母組合決定母音</p>
        </template>
        <template v-else-if="q.type === 'pick-pattern'">
          <p class="prompt-word">{{ q.word.en }}</p>
          <p class="prompt-sub">{{ q.word.zh }}</p>
        </template>
        <template v-else>
          <button class="listen-btn" aria-label="播放發音" @click="speak(q.say)"><Icon name="sound" :size="40" /></button>
        </template>

        <div v-if="q.type !== 'decode' || picked" class="btn-row center">
          <button class="btn xs" @click="speak(q.say)"><Icon name="sound" :size="14" /> 重播</button>
          <button class="btn xs" @click="speak(q.say, { rate: 0.45 })"><Icon name="sound" :size="14" /> 慢速</button>
        </div>
      </div>

      <div class="stage-answer">
        <div class="options">
          <button
            v-for="(option, i) in q.options"
            :key="option.value"
            class="option"
            :class="optionClass(option)"
            :disabled="!!picked"
            @click="choose(option)"
          >
            <span class="mono option-key">{{ 'ABCD'[i] }}</span>
            <span class="option-text">
              <span :class="{ mono: q.type !== 'listen-word' && q.type !== 'pair' }" :style="option.color ? { color: option.color } : null">{{ option.label }}</span>
              <small v-if="option.sub && (q.type === 'listen-vowel' || q.type === 'decode')" class="muted">{{ option.sub }}</small>
            </span>
          </button>
        </div>

        <div v-if="picked" class="verdict" :class="explanation.correct ? 'ok' : 'ng'" role="status">
          <div class="verdict-head">
            <Icon :name="explanation.correct ? 'check' : 'close'" :size="18" />
            <strong>{{ explanation.correct ? '正確' : '再想想看' }}</strong>
            <span v-if="answerWord" class="verdict-answer">
              <PhonicsWord :segments="wordSegments(idx, answerWord)" :color="color" size="sm" />
              <span class="mono muted">/{{ answerWord.ipa }}/</span> {{ answerWord.zh }}
            </span>
            <span v-else class="verdict-answer">{{ q.answer }}</span>
          </div>
          <ul class="explain-list">
            <li v-for="(l, i) in explanation.lines" :key="i">{{ l }}</li>
          </ul>
          <button class="btn primary" @click="next">
            {{ index < questions.length - 1 ? '下一題' : '查看結果' }} <Icon name="right" :size="16" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="debrief">
      <div class="debrief-score">
        <div class="eyebrow">{{ MODES[mode].code }} COMPLETE</div>
        <div class="score-big mono">{{ summary.correct }}<span>/{{ summary.total }}</span></div>
        <div class="stars-row big">
          <Icon v-for="n in 3" :key="n" name="star" :size="28" :filled="n <= summary.stars" />
        </div>
        <p class="muted">熟練度已更新。導師會依這次的結果調整下一回的題目與難度。</p>
      </div>
      <div class="debrief-detail">
        <div class="report-box">
          <div class="eyebrow">錯題解說 · {{ summary.wrong.length }} 題</div>
          <p v-if="!summary.wrong.length" class="muted">全部答對！可以挑戰綜合測驗或陌生單字拼讀。</p>
          <ul class="wrong-review">
            <li v-for="(r, i) in summary.wrong" :key="i">
              <div class="wrong-head">
                <button class="icon-btn" aria-label="播放" @click="speak(r.question.say)"><Icon name="sound" :size="16" /></button>
                <strong>{{ r.question.word?.en ?? r.question.answer }}</strong>
                <span class="muted small">你選了 {{ r.chosen }}</span>
              </div>
              <p v-for="(l, j) in r.lines" :key="j" class="small">{{ l }}</p>
            </li>
          </ul>
        </div>
        <div class="btn-row">
          <button class="btn" @click="start"><Icon name="retry" :size="16" /> 再練一回</button>
          <router-link :to="{ name: 'phonics', params: { course } }" class="btn primary">回到五指地圖 <Icon name="right" :size="16" /></router-link>
        </div>
      </div>
    </div>
  </section>
</template>
