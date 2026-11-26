<script setup>
// 時態練習：看圖選時態、聽力辨識、動詞填空、句型組合、時態轉換、情境造句（綜合 / 弱點 / 單一題型）。
// 答錯時說明：動作發生在哪個時間、是什麼狀態、為什麼用這個助動詞、為什麼其他時態不適合。
import { computed, nextTick, ref } from 'vue'
import { TIMES, ASPECTS, SCENARIOS, DEFAULT_SCENARIO, findScenario, tenseKey, tenseName } from '../../data/tenses/index.js'
import { buildQuiz, checkAnswer, explain, entryOf, sentenceOf, findQuizMode, QUIZ_PASS } from '../../logic/tense.js'
import { tenses } from '../../store/tenses.js'
import { speechSupported } from '../../utils/speech.js'
import { useSpeaker, RATES } from '../../components/tenses/useSpeaker.js'
import Icon from '../../components/Icon.vue'
import TenseTimeline from '../../components/tenses/TenseTimeline.vue'
import TenseScene from '../../components/tenses/TenseScene.vue'
import TenseSentence from '../../components/tenses/TenseSentence.vue'
import TenseTag from '../../components/tenses/TenseTag.vue'

const props = defineProps({ mode: { type: String, required: true } })
const modeInfo = findQuizMode(props.mode)

const questions = ref([])
const index = ref(0)
const results = ref([]) // { q, ok }
const feedback = ref(null) // { ok, picked, exp }
const input = ref('')
const pickTime = ref(null)
const pickAspect = ref(null)
const built = ref([]) // 句型組合：已選的字卡
const showText = ref(false) // 聽力題：沒有語音時可顯示文字
const inputEl = ref(null)

const q = computed(() => questions.value[index.value] ?? null)
const scenario = computed(() => (q.value ? findScenario(q.value.sid) : null))
const entry = computed(() => (q.value ? entryOf(scenario.value, q.value.key) : null))
const finished = computed(() => questions.value.length > 0 && index.value >= questions.value.length)
const score = computed(() => results.value.filter((r) => r.ok).length)
const { active, say, stop } = useSpeaker()

function start() {
  stop()
  questions.value = buildQuiz({
    mode: props.mode,
    scenarios: SCENARIOS,
    state: tenses.progress,
    count: props.mode === 'mixed' || props.mode === 'weak' ? 10 : 8,
  })
  index.value = 0
  results.value = []
  reset()
}

function reset() {
  feedback.value = null
  input.value = ''
  pickTime.value = null
  pickAspect.value = null
  built.value = []
  showText.value = false
  const cur = questions.value[index.value]
  if (cur?.type === 'listen') nextTick(() => playListen())
  if (cur && ['fill', 'transform', 'write'].includes(cur.type)) nextTick(() => inputEl.value?.focus())
}

const playListen = (rate = RATES.normal) => say(entry.value.en, { rate })

const canSubmit = computed(() => {
  if (!q.value || feedback.value) return false
  switch (q.value.type) {
    case 'listen':
      return pickTime.value && pickAspect.value
    case 'order':
      return built.value.length === q.value.chips.length
    case 'fill':
    case 'transform':
    case 'write':
      return input.value.trim().length > 0
    default:
      return false
  }
})

function submit(answer) {
  if (!q.value || feedback.value) return
  let value = answer
  if (q.value.type === 'listen') value = tenseKey(pickTime.value, pickAspect.value)
  if (q.value.type === 'order') value = built.value.map((c) => c.text)
  if (['fill', 'transform', 'write'].includes(q.value.type)) value = input.value
  const { ok, picked } = checkAnswer(q.value, scenario.value, value)
  feedback.value = { ok, picked, exp: explain(scenario.value, q.value.key, picked) }
  results.value.push({ q: q.value, ok })
  tenses.answer(q.value, ok)
}

function next() {
  stop()
  index.value++
  if (finished.value) {
    if (props.mode === 'mixed' && score.value / questions.value.length >= QUIZ_PASS) tenses.stage('quiz')
    return
  }
  reset()
}

function addChip(chip) {
  if (feedback.value || built.value.includes(chip)) return
  built.value = [...built.value, chip]
}
function removeChip(chip) {
  if (feedback.value) return
  built.value = built.value.filter((c) => c !== chip)
}

const TYPE_ZH = { picture: '看圖選時態', listen: '聽力辨識', fill: '動詞填空', order: '句型組合', transform: '時態轉換', write: '情境造句' }

if (modeInfo) start()
</script>

<template>
  <section v-if="modeInfo" class="page tense-page qz" :class="{ 'tense-calm': tenses.calm }">
    <router-link :to="{ name: 'tenses' }" class="back"><Icon name="left" :size="16" /> 時光島</router-link>
    <div class="tx-head">
      <div>
        <div class="eyebrow">{{ mode === 'mixed' ? 'STAGE 6 · ' : '' }}PRACTICE</div>
        <h1 class="page-title">{{ modeInfo.zh }}</h1>
      </div>
      <span v-if="!finished && q" class="mono muted">{{ index + 1 }} / {{ questions.length }}</span>
    </div>

    <div v-if="!finished && q" class="segments" aria-hidden="true">
      <span v-for="(x, i) in questions" :key="i" :class="{ now: i === index, ok: results[i]?.ok, ng: results[i] && !results[i].ok }"></span>
    </div>

    <!-- ===== 題目 ===== -->
    <div v-if="!finished && q" class="qz-body">
      <div class="panel qz-card">
        <div class="eyebrow">{{ TYPE_ZH[q.type] }} · {{ scenario.emoji }} {{ scenario.title }}</div>

        <!-- 看圖選時態 -->
        <template v-if="q.type === 'picture'">
          <p class="qz-prompt">看插畫和時間軸，這是哪一個時態？</p>
          <div class="qz-visual">
            <TenseScene :scenario="scenario" :tense-key="q.key" compact />
            <TenseTimeline :tense-key="q.key" :tl="entry.tl" compact />
          </div>
          <div class="options qz-options">
            <button
              v-for="o in q.options" :key="o" class="option"
              :class="{ correct: feedback && o === q.key, wrong: feedback && o === feedback.picked && !feedback.ok, dim: feedback && o !== q.key && o !== feedback.picked }"
              :disabled="!!feedback" @click="submit(o)"
            >
              {{ tenseName(o) }}
            </button>
          </div>
        </template>

        <!-- 聽力辨識 -->
        <template v-else-if="q.type === 'listen'">
          <p class="qz-prompt">聽句子，動作發生在什麼時間？是什麼狀態？</p>
          <div class="btn-row">
            <button class="btn" @click="playListen()"><Icon name="sound" :size="16" /> 再聽一次</button>
            <button class="btn" @click="playListen(RATES.slow)"><Icon name="sound" :size="16" /> 慢速</button>
            <button v-if="speechSupported && !showText && !feedback" class="btn xs" @click="showText = true">聽不到？顯示文字</button>
          </div>
          <TenseSentence v-if="feedback || showText || !speechSupported" :marked="entry.en" :active="active" />
          <fieldset class="qz-pick">
            <legend>時間</legend>
            <button
              v-for="t in TIMES" :key="t.id" class="seg-btn" :style="{ '--c': t.color }"
              :aria-pressed="pickTime === t.id" :disabled="!!feedback" @click="pickTime = t.id"
            >{{ t.symbol }} {{ t.zh }}</button>
          </fieldset>
          <fieldset class="qz-pick">
            <legend>動作狀態</legend>
            <button
              v-for="a in ASPECTS" :key="a.id" class="seg-btn" :style="{ '--c': a.color }"
              :aria-pressed="pickAspect === a.id" :disabled="!!feedback" @click="pickAspect = a.id"
            >{{ a.symbol }} {{ a.zh }}</button>
          </fieldset>
        </template>

        <!-- 動詞填空 / 時態轉換 -->
        <template v-else-if="q.type === 'fill' || q.type === 'transform'">
          <template v-if="q.type === 'transform'">
            <p class="qz-prompt">把這句改成 <TenseTag :tense-key="q.key" />：</p>
            <p class="qz-source" lang="en">{{ q.source }}</p>
          </template>
          <template v-else>
            <p class="qz-prompt">填入正確的動詞變化（<span class="mono">{{ q.baseVerb }}</span>・{{ tenseName(q.key) }}）</p>
            <TenseTimeline :tense-key="q.key" :tl="entry.tl" compact />
          </template>
          <form class="qz-blank" lang="en" @submit.prevent="canSubmit && submit()">
            <span>{{ q.before }}</span>
            <input
              ref="inputEl" v-model="input" class="qz-input" :disabled="!!feedback" autocomplete="off" autocapitalize="off" spellcheck="false"
              :aria-label="`填入 ${q.baseVerb} 的${tenseName(q.key)}`" :placeholder="q.type === 'fill' ? q.baseVerb : '…'"
            />
            <span>{{ q.after }}</span>
          </form>
          <p class="muted small">{{ entry.zh }}</p>
        </template>

        <!-- 句型組合 -->
        <template v-else-if="q.type === 'order'">
          <p class="qz-prompt">把單字排成正確的句子（<TenseTag :tense-key="q.key" />）</p>
          <p class="muted small">{{ entry.zh }}</p>
          <div class="qz-built" aria-label="你排的句子" lang="en">
            <button v-for="c in built" :key="c.id" class="chip filled" @click="removeChip(c)">{{ c.text }}</button>
            <span v-if="!built.length" class="faint small">點下面的字卡</span>
          </div>
          <div class="qz-chips" lang="en">
            <button v-for="c in q.chips" :key="c.id" class="chip" :disabled="built.includes(c) || !!feedback" @click="addChip(c)">{{ c.text }}</button>
          </div>
        </template>

        <!-- 情境造句 -->
        <template v-else-if="q.type === 'write'">
          <p class="qz-prompt">看情境和時間條件，用英文寫出這句話（動詞：<span class="mono">{{ scenario.verb.base }}</span>）</p>
          <div class="qz-visual">
            <TenseScene :scenario="scenario" :tense-key="q.key" compact />
            <TenseTimeline :tense-key="q.key" :tl="entry.tl" compact />
          </div>
          <p class="qz-zh">{{ entry.zh }}</p>
          <form @submit.prevent="canSubmit && submit()">
            <input
              ref="inputEl" v-model="input" class="qz-input wide" lang="en" :disabled="!!feedback" autocomplete="off" spellcheck="false"
              aria-label="你的英文句子" :placeholder="`${scenario.id === 'grandma' ? 'Grandma' : 'Lily'} ...`"
            />
          </form>
          <p class="faint small">系統只檢查你用的時態（助動詞 + 動詞），不檢查其他文法。</p>
        </template>

        <div v-if="!feedback && q.type !== 'picture'" class="btn-row">
          <button class="btn primary" :disabled="!canSubmit" @click="submit()">確認答案</button>
        </div>
      </div>

      <!-- ===== 回饋與解析 ===== -->
      <div v-if="feedback" class="panel qz-feedback" :class="feedback.ok ? 'ok' : 'ng'" role="alert">
        <p class="qz-verdict">
          <Icon :name="feedback.ok ? 'check' : 'alert'" :size="18" />
          {{ feedback.ok ? '答對了！' : '不太對，看看為什麼：' }}
        </p>
        <div class="qz-answer">
          <TenseTag :tense-key="q.key" />
          <TenseSentence :marked="entry.en" :active="active" />
          <button class="icon-btn" aria-label="唸出正確句子" @click="say(entry.en)"><Icon name="sound" :size="16" /></button>
        </div>
        <dl class="qz-exp">
          <div><dt>⏱ 什麼時間？</dt><dd>{{ feedback.exp.time }}</dd></div>
          <div><dt>▶ 什麼狀態？</dt><dd>{{ feedback.exp.aspect }}</dd></div>
          <div><dt>🔧 為什麼用這個助動詞？</dt><dd>{{ feedback.exp.aux }}</dd></div>
          <div v-if="!feedback.ok">
            <dt>✖ 為什麼其他時態不適合？</dt>
            <dd>
              <p v-if="feedback.exp.picked"><strong>你用的是 {{ feedback.exp.picked.text }}</strong></p>
              <p v-if="feedback.exp.picked?.note" class="muted">
                <template v-if="q.sid !== DEFAULT_SCENARIO">（以「奶奶煮飯」為例）</template>{{ feedback.exp.picked.note }}
              </p>
              <p v-if="!feedback.exp.picked && ['fill', 'transform', 'write'].includes(q.type)" class="muted">看不出你用了哪個時態，檢查助動詞和動詞形式是否完整。</p>
              <p v-for="o in feedback.exp.others" :key="o.key" class="muted">{{ o.text }}</p>
            </dd>
          </div>
        </dl>
        <div class="btn-row">
          <button class="btn primary" @click="next">{{ index + 1 < questions.length ? '下一題' : '看結果' }} <Icon name="right" :size="16" /></button>
        </div>
      </div>
    </div>

    <!-- ===== 結果 ===== -->
    <div v-else-if="finished" class="panel qz-done">
      <div class="eyebrow">RESULT · 練習完成</div>
      <p class="qz-score mono">{{ score }} / {{ questions.length }}</p>
      <p v-if="mode === 'mixed'">
        <template v-if="score / questions.length >= QUIZ_PASS"><strong class="accent-text">✔ 第 6 階段完成！</strong></template>
        <template v-else>正確率 80% 以上就能完成第 6 階段，再挑戰一次吧。</template>
      </p>
      <ul v-if="results.some((r) => !r.ok)" class="qz-missed">
        <li v-for="(r, i) in results.filter((x) => !x.ok)" :key="i">
          <span class="small muted">{{ TYPE_ZH[r.q.type] }}</span>
          {{ tenseName(r.q.key) }}：<span lang="en">{{ sentenceOf(findScenario(r.q.sid), r.q.key).text }}</span>
        </li>
      </ul>
      <div class="btn-row">
        <button class="btn" @click="start"><Icon name="retry" :size="16" /> 再練一次</button>
        <router-link :to="{ name: 'tense-quiz', params: { mode: 'weak' } }" class="btn">弱點加強</router-link>
        <router-link :to="{ name: 'tense-progress' }" class="btn primary">看學習進度 <Icon name="right" :size="16" /></router-link>
      </div>
    </div>
  </section>

  <section v-else class="page">
    <p>找不到這個練習。</p>
    <router-link :to="{ name: 'tenses' }" class="btn">回到時光島</router-link>
  </section>
</template>
