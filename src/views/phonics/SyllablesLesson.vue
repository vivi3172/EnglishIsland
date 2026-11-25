<script setup>
// 音節切分課程頁：元音／輔音、開音節／閉音節、五條切分規則、示範台、自己輸入單字試切。
import { computed, onBeforeUnmount, ref } from 'vue'
import { SYLLABLES } from '../../data/phonics/syllables.js'
import { analyze, cutOf, courseWords, sayParts, suggestCut, findRule } from '../../logic/syllables.js'
import { MAX_BOX } from '../../logic/phonicsProgress.js'
import { phonics } from '../../store/phonics.js'
import { speak, speakAsync, stopSpeaking } from '../../utils/speech.js'
import Icon from '../../components/Icon.vue'
import SyllableWord from '../../components/phonics/SyllableWord.vue'

const course = SYLLABLES
const all = courseWords(course)
const cp = computed(() => phonics.course(course.id))
const mastery = (ruleId) => (cp.value.patterns[ruleId]?.box ?? 0) / MAX_BOX
const pct = (x) => `${Math.round(x * 100)}%`

const STEPS = [
  { no: 1, title: '標出元音', desc: 'a e i o u 標 V，其他標 C' },
  { no: 2, title: '數中間的輔音', desc: '前兩個元音中間夾幾個 C？' },
  { no: 3, title: '下刀', desc: '依規則決定切哪裡' },
  { no: 4, title: '一段一段唸', desc: '每段只有一個元音的聲音' },
  { no: 5, title: '合起來', desc: '唸快一點就是整個字' },
]

// ---------- 示範台 ----------
const demo = ref(all.find((w) => w.en === 'paper'))
const demoRule = computed(() => findRule(course, demo.value.ruleId))
const demoInfo = computed(() => analyze(demo.value.en))
const demoCut = ref(null)
const demoActive = ref(-1)
let token = 0

async function play(word) {
  const my = ++token
  demo.value = word
  demoCut.value = null
  demoActive.value = -1
  await new Promise((r) => setTimeout(r, 350))
  if (my !== token) return
  demoCut.value = cutOf(word)
  const say = sayParts(word)
  for (let i = 0; i < 2; i++) {
    demoActive.value = i
    await speakAsync(say[i], { rate: 0.6 })
    if (my !== token) return
  }
  demoActive.value = 2
  await speakAsync(word.en, { rate: 0.75 })
  if (my === token) demoActive.value = -1
}
onBeforeUnmount(() => {
  token++
  stopSpeaking()
})

// ---------- 自己試切 ----------
const RULE_NOTE = {
  'vcv-open': '一元一輔：先切在輔音前，前一段唸長音。唸起來怪怪的話，往後移一格切在輔音後（短音）。',
  vccv: '兩輔切中間：前一段被輔音關住，唸短音。',
  cle: '字尾是輔音 + le：從字尾往前數三個字母切。',
  digraph: '中間的兩個字母是一起發音的組合（如 ck、sh），當成一個輔音，不切開。',
  vv: '兩個元音相鄰但分開發音（如 li·on），切在兩個元音中間。若它們其實是一組（ea、ai），這個字可能只有一個音節。',
  vcccv: '三個輔音：通常切在第一個輔音後，後面兩個是常見的組合（如 hun·dred）。',
}
const tryText = ref('')
const tryWord = computed(() => tryText.value.trim().toLowerCase().replace(/[^a-z]/g, ''))
const trySuggest = computed(() => (tryWord.value ? suggestCut(tryWord.value, course.digraphs) : null))
</script>

<template>
  <section class="page phonics-page syl-page">
    <router-link to="/phonics" class="back"><Icon name="left" :size="16" /> 自然發音</router-link>
    <div class="page-head">
      <div class="eyebrow">PHONICS · {{ course.en }}</div>
      <h1 class="page-title">一元一輔切：把長單字切成小塊</h1>
      <p class="muted">{{ course.intro }}</p>
    </div>

    <div class="syl-basics">
      <div class="panel">
        <div class="eyebrow">VOWEL · CONSONANT · 元音與輔音</div>
        <div class="vowel-tiles">
          <button v-for="v in 'aeiou'" :key="v" class="vowel-tile" @click="speak(v.toUpperCase())">{{ v }}</button>
        </div>
        <p class="small">a e i o u 是<strong class="v-text">元音（V）</strong>，其他字母都是<strong>輔音（C）</strong>。元音是音節的心臟：<strong>每一段（音節）只會有一個元音的聲音</strong>，所以有幾組元音，大概就能切成幾段。</p>
        <p class="muted small">連在一起的元音（ai、ee、ou）通常一起發一個音，算一組。</p>
      </div>
      <div class="panel">
        <div class="eyebrow">OPEN · CLOSED · 為什麼切的位置很重要</div>
        <div class="open-closed">
          <div>
            <SyllableWord en="pa" size="md" />
            <strong>開音節</strong>
            <span class="muted small">以元音結尾，母音「門沒關」→ 唸<b class="v-text">長音</b>（字母名字 /eɪ/）</span>
          </div>
          <div>
            <SyllableWord en="pap" size="md" />
            <strong>閉音節</strong>
            <span class="muted small">被輔音關住 → 唸<b>短音</b> /æ/</span>
          </div>
        </div>
        <p class="small">所以刀切在哪裡，會決定前面的母音唸長音還是短音。這就是「一元一輔」要先切在輔音前的原因。</p>
      </div>
    </div>

    <ol class="step-strip">
      <li v-for="s in STEPS" :key="s.no">
        <div class="step-card">
          <span class="mono step-no">STEP {{ s.no }}</span>
          <strong>{{ s.title }}</strong>
          <span class="muted small">{{ s.desc }}</span>
        </div>
      </li>
    </ol>

    <div class="panel syl-demo" :style="{ '--v': demoRule.color }" aria-live="polite">
      <div class="eyebrow">DEMO · 示範台（點下面任何一個例字）</div>
      <div class="syl-demo-word">
        <SyllableWord :en="demo.en" :cut="demoCut" :active="demoActive" size="xl" />
      </div>
      <p class="syl-demo-explain">
        <span class="ph-tag">{{ demoRule.tag }}</span>
        <template v-if="demoInfo">前兩個元音中間夾 <b>{{ demoInfo.consonants }}</b> 個輔音（{{ demoInfo.pattern }}）→ </template>
        {{ demoRule.short }}
      </p>
      <p class="muted">{{ demo.parts.join(' · ') }}　{{ demo.zh }}</p>
      <div class="btn-row center">
        <button class="btn primary" @click="play(demo)"><Icon name="play" :size="16" /> 切開並唸唸看</button>
        <button class="btn" @click="speak(demo.en)"><Icon name="sound" :size="16" /> 整個字</button>
      </div>
    </div>

    <div class="section-head"><div class="eyebrow">RULES · 五條切分規則（依先後順序檢查）</div></div>
    <div class="syl-rules">
      <article v-for="(rule, i) in course.rules" :key="rule.id" class="panel syl-rule" :style="{ '--v': rule.color }">
        <div class="syl-rule-head">
          <span class="mono step-no">RULE {{ i + 1 }}</span>
          <span class="ph-tag">{{ rule.tag }}</span>
        </div>
        <h2 class="syl-rule-name">{{ rule.name }}</h2>
        <p class="small">{{ rule.rule }}</p>
        <div class="chip-wrap">
          <button v-for="w in rule.words.slice(0, 6)" :key="w.en" class="word-chip" :class="{ active: demo.en === w.en }" :title="w.zh" @click="play({ ...w, ruleId: rule.id })">
            <span class="mono">{{ w.parts[0] }}<span class="syl-dot">·</span>{{ w.parts[1] }}</span>
          </button>
        </div>
        <div class="syl-rule-foot">
          <span class="mastery-bar" :title="`熟練度 ${pct(mastery(rule.id))}`"><span :style="{ width: pct(mastery(rule.id)) }"></span></span>
          <router-link :to="{ name: 'syllable-chop', query: { focus: rule.id } }" class="btn small-btn">只練這條</router-link>
        </div>
      </article>

      <article class="panel syl-rule syl-warn">
        <div class="syl-rule-head"><span class="mono step-no">NOTE</span><Icon name="alert" :size="16" /></div>
        <h2 class="syl-rule-name">好朋友不分開</h2>
        <p class="small">ck、sh、ch、th、ph、wh、ng 兩個字母一起發一個音，切的時候當成「一個輔音」，刀不能從中間切下去：rock·et、fin·ish、moth·er。</p>
      </article>
    </div>

    <div class="panel syl-try">
      <div class="eyebrow">TRY · 輸入任何單字，看看第一刀切哪裡</div>
      <input v-model="tryText" class="syl-input" type="text" autocomplete="off" spellcheck="false" placeholder="例如 robot、rocket、hundred" aria-label="輸入英文單字" maxlength="20" />
      <template v-if="tryWord">
        <div class="syl-demo-word">
          <SyllableWord :en="tryWord" :cut="trySuggest?.cut ?? null" size="lg" />
        </div>
        <p v-if="trySuggest" class="small">{{ RULE_NOTE[trySuggest.ruleId] }}</p>
        <p v-else class="small muted">只有一組元音 → 只有一個音節，不用切。</p>
        <p class="muted small">提醒：規則是幫你「猜出唸法」的起點，不是絕對的；複合字要自己先找小字。</p>
        <button class="btn" @click="speak(tryWord)"><Icon name="sound" :size="16" /> 聽發音</button>
      </template>
    </div>

    <div class="panel daily-go syl-cta">
      <div>
        <div class="eyebrow">GAME · 劈椰子切字</div>
        <p>每顆椰子上寫著一個單字，找到正確的縫一刀劈開，再判斷前一段唸長音還是短音。</p>
      </div>
      <router-link :to="{ name: 'syllable-chop' }" class="btn primary">🥥 開始劈椰子 <Icon name="right" :size="16" /></router-link>
    </div>
  </section>
</template>
