<script setup>
// 對話咖啡廳：多益情境對話列表
import { computed } from 'vue'
import { DIALOGUES } from '../../data/dialogues.js'
import { youTurnCount } from '../../logic/dialogue.js'
import { talk } from '../../store/talk.js'
import Icon from '../../components/Icon.vue'

const ids = DIALOGUES.map((d) => d.id)
const earned = computed(() => talk.total(ids))
</script>

<template>
  <section class="page talk-page">
    <router-link to="/" class="back"><Icon name="left" :size="16" /> 星球</router-link>
    <div class="page-head">
      <div class="eyebrow">CONVERSATION CAFÉ · 對話咖啡廳</div>
      <h1 class="page-title">情境對話練習</h1>
      <p class="muted">
        多益最常見的生活與職場情境。對方先開口，輪到你時從 3 句中選最合適的回應。錯的選項都是多益聽力常見的陷阱：
        聽到相同的字就選、問「哪裡」卻答「時間」、身分或語氣不對。答錯會告訴你為什麼。
      </p>
    </div>

    <p class="talk-total mono"><Icon name="star" :size="14" :filled="true" /> {{ earned }} / {{ ids.length * 3 }}</p>

    <ul class="talk-grid">
      <li v-for="d in DIALOGUES" :key="d.id" :style="{ '--isl': d.color }">
        <router-link :to="{ name: 'talk-scene', params: { id: d.id } }" class="talk-card">
          <span class="talk-emoji" aria-hidden="true">{{ d.emoji }}</span>
          <span class="talk-card-body">
            <strong>{{ d.title }}</strong>
            <small class="mono">{{ d.en }}</small>
            <span class="muted small">{{ d.scene }}</span>
            <span class="talk-card-meta">
              <span class="stars-row" :aria-label="`${talk.stars(d.id)} 星`">
                <Icon v-for="n in 3" :key="n" name="star" :size="13" :filled="n <= talk.stars(d.id)" />
              </span>
              <span class="mono faint">{{ youTurnCount(d) }} 輪 · 你是{{ d.youRole }}</span>
            </span>
          </span>
          <Icon name="right" :size="16" />
        </router-link>
      </li>
    </ul>
  </section>
</template>
