<script setup>
// 階段 1：認識過去、現在、未來；階段 2：理解四種動作狀態。
// 每張卡片點開都會更新時間軸、插畫與例句；全部看過就完成該階段。
import { computed, ref } from 'vue'
import { TIMES, ASPECTS, CHANTS, findScenario, DEFAULT_SCENARIO, tenseKey } from '../../data/tenses/index.js'
import { entryOf } from '../../logic/tense.js'
import { tenses } from '../../store/tenses.js'
import { useSpeaker } from '../../components/tenses/useSpeaker.js'
import Icon from '../../components/Icon.vue'
import TenseTimeline from '../../components/tenses/TenseTimeline.vue'
import TenseScene from '../../components/tenses/TenseScene.vue'
import TenseSentence from '../../components/tenses/TenseSentence.vue'
import TenseTag from '../../components/tenses/TenseTag.vue'

const props = defineProps({ step: { type: String, required: true } })

const isTime = props.step !== 'aspect'
const cards = isTime ? TIMES : ASPECTS
const scenario = findScenario(DEFAULT_SCENARIO)
const current = ref(cards[0].id)
const viewed = ref(new Set([cards[0].id]))

// 階段 1 固定用簡單式比較三種時間；階段 2 固定用現在比較四種狀態
const key = computed(() => (isTime ? tenseKey(current.value, 'simple') : tenseKey('present', current.value)))
const entry = computed(() => entryOf(scenario, key.value))
const chant = computed(() => (isTime ? CHANTS.time[current.value] : CHANTS.aspect[current.value]))
const allSeen = computed(() => viewed.value.size === cards.length)
const { active, say, stop } = useSpeaker()

function choose(id) {
  stop()
  current.value = id
  viewed.value = new Set([...viewed.value, id])
  if (viewed.value.size === cards.length) tenses.stage(isTime ? 'time' : 'aspect')
}
</script>

<template>
  <section class="page tense-page" :class="{ 'tense-calm': tenses.calm }">
    <router-link :to="{ name: 'tenses' }" class="back"><Icon name="left" :size="16" /> 時光島</router-link>
    <nav class="step-tabs" aria-label="基礎階段">
      <router-link :to="{ name: 'tense-basics', params: { step: 'time' } }" class="step-tab" :class="{ active: isTime }"><span class="mono">01</span>過去、現在、未來</router-link>
      <router-link :to="{ name: 'tense-basics', params: { step: 'aspect' } }" class="step-tab" :class="{ active: !isTime }"><span class="mono">02</span>四種動作狀態</router-link>
    </nav>

    <div class="page-head">
      <div class="eyebrow">STAGE {{ isTime ? 1 : 2 }} · {{ isTime ? 'TIME' : 'ASPECT' }}</div>
      <h1 class="page-title">{{ isTime ? '先看時間：過去、現在、未來' : '再看動作：四種狀態' }}</h1>
      <p class="muted">
        <template v-if="isTime">時間軸由左到右是過去 → 現在 → 未來。同一句「奶奶煮晚餐」，換個時間，動詞就跟著變。逐一點開三張卡片。</template>
        <template v-else>同樣是「現在」，動作可以是一個點、一段正在進行的色塊、一個勾勾，或一路延伸的箭頭。逐一點開四張卡片。</template>
      </p>
    </div>

    <ul class="basics-cards">
      <li v-for="c in cards" :key="c.id">
        <button class="basics-card" :style="{ '--c': c.color }" :aria-pressed="current === c.id" @click="choose(c.id)">
          <span class="basics-sym" aria-hidden="true">{{ c.symbol }}</span>
          <strong>{{ c.zh }}</strong>
          <small class="mono">{{ c.en }}</small>
          <span v-if="viewed.has(c.id)" class="basics-seen" aria-label="已看過">✔</span>
        </button>
      </li>
    </ul>

    <div class="tx-layout">
      <div class="tx-visual">
        <TenseScene :scenario="scenario" :tense-key="key" />
        <TenseTimeline :tense-key="key" :tl="entry.tl" />
      </div>
      <div class="tx-info">
        <div class="panel tx-sentence" aria-live="polite">
          <TenseTag :tense-key="key" />
          <p class="basics-intro">{{ cards.find((c) => c.id === current).intro }}</p>
          <p class="basics-chant">♪ {{ chant }}</p>
          <TenseSentence :marked="entry.en" :active="active" size="lg" />
          <p class="muted">{{ entry.zh }}</p>
          <div class="tx-say">
            <button class="btn" @click="say(entry.en)"><Icon name="sound" :size="16" /> 發音</button>
          </div>
        </div>
        <div v-if="allSeen" class="panel basics-done" role="status">
          <p><strong>✔ 這一階段完成了！</strong></p>
          <router-link v-if="isTime" :to="{ name: 'tense-basics', params: { step: 'aspect' } }" class="btn primary">
            下一步：四種動作狀態 <Icon name="right" :size="16" />
          </router-link>
          <router-link v-else :to="{ name: 'tense-explore' }" class="btn primary">
            下一步：組合成 12 種時態 <Icon name="right" :size="16" />
          </router-link>
        </div>
        <p v-else class="muted small">還有 {{ cards.length - viewed.size }} 張卡片沒看。</p>
      </div>
    </div>
  </section>
</template>
