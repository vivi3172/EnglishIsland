<script setup>
import { computed, ref, watch } from 'vue'
import { findZone } from '../data/zones.js'
import { game } from '../store/game.js'
import { speak } from '../utils/speech.js'
import Icon from '../components/Icon.vue'
import MissionHeader from '../components/MissionHeader.vue'
import ExpeditionResult from '../components/ExpeditionResult.vue'

const props = defineProps({ id: { type: String, required: true } })
const zone = computed(() => findZone(props.id))
const unlocked = computed(() => zone.value && game.isUnlocked(zone.value.id))

const index = ref(0)
const flipped = ref(false)
const finished = ref(false)
const out = ref(null)
const seen = ref(new Set([0]))

const word = computed(() => zone.value?.words[index.value])
const isLast = computed(() => zone.value && index.value === zone.value.words.length - 1)

watch(
  word,
  (w) => {
    flipped.value = false
    if (w) speak(w.en)
  },
  { immediate: true },
)

function goTo(i) {
  index.value = i
  seen.value.add(i)
}

function next() {
  if (isLast.value) {
    out.value = game.finishFlashcards(zone.value.id)
    finished.value = true
    return
  }
  goTo(index.value + 1)
}

function restart() {
  index.value = 0
  seen.value = new Set([0])
  finished.value = false
}
</script>

<template>
  <section v-if="zone && unlocked" class="page">
    <MissionHeader
      :back-to="{ name: 'zone', params: { id: zone.id } }"
      :back-label="zone.zh"
      title="單字卡"
      code="RECON"
      :current="finished ? zone.words.length : index"
      :total="zone.words.length"
    />

    <div v-if="!finished" class="stage">
      <div class="stage-prompt">
        <button class="flashcard" :class="{ flipped }" @click="flipped = !flipped" aria-label="翻面">
          <div class="face front">
            <span class="card-glyph">{{ word.emoji }}</span>
            <span class="card-word">{{ word.en }}</span>
            <span class="card-hint mono">點擊翻面</span>
          </div>
          <div class="face back">
            <span class="card-word">{{ word.zh }}</span>
            <span class="card-example">{{ word.example }}</span>
            <span class="muted">{{ word.exampleZh }}</span>
          </div>
        </button>
      </div>

      <div class="stage-answer">
        <div class="panel">
          <div class="eyebrow">AUDIO · 發音</div>
          <div class="btn-row">
            <button class="btn" @click="speak(word.en)"><Icon name="sound" :size="16" /> 單字</button>
            <button class="btn" @click="speak(word.example)"><Icon name="sound" :size="16" /> 例句</button>
          </div>
        </div>

        <div class="panel">
          <div class="eyebrow">INDEX · 本區單字</div>
          <div class="word-index">
            <button
              v-for="(w, i) in zone.words"
              :key="w.en"
              class="index-item"
              :class="{ now: i === index, seen: seen.has(i) }"
              @click="goTo(i)"
            >
              {{ w.en }}
            </button>
          </div>
        </div>

        <div class="btn-row spread">
          <button class="btn" :disabled="index === 0" @click="goTo(index - 1)"><Icon name="left" :size="16" /> 上一張</button>
          <button class="btn primary" @click="next">
            {{ isLast ? '完成偵察' : '下一張' }} <Icon :name="isLast ? 'check' : 'right'" :size="16" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="debrief">
      <div class="debrief-score">
        <div class="eyebrow">MISSION COMPLETE</div>
        <div class="score-big mono">{{ zone.words.length }}</div>
        <div class="muted">個單字已記錄</div>
      </div>
      <div class="debrief-detail">
        <ExpeditionResult v-if="out" :out="out" />
        <div class="btn-row">
          <button class="btn" @click="restart"><Icon name="retry" :size="16" /> 再看一次</button>
          <router-link :to="{ name: 'quiz', params: { id: zone.id } }" class="btn primary">前往測驗 <Icon name="right" :size="16" /></router-link>
        </div>
      </div>
    </div>
  </section>

  <section v-else class="page empty-state">
    <Icon name="lock" :size="32" />
    <p>這個區域尚未解鎖。</p>
    <router-link to="/" class="btn">回到地圖</router-link>
  </section>
</template>
