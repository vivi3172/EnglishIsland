<script setup>
import { computed, ref } from 'vue'
import { ZONES } from '../data/zones.js'
import { BUILDINGS, RESOURCES, MISSIONS } from '../data/survival.js'
import { EXPEDITION_COST } from '../logic/progress.js'
import { game } from '../store/game.js'
import Icon from '../components/Icon.vue'
import SurvivalPanel from '../components/SurvivalPanel.vue'

const builtItems = computed(() => BUILDINGS.filter((b) => game.progress.built.includes(b.id)))
const nextZone = computed(() => ZONES.find((z) => game.isUnlocked(z.id) && game.stars(z.id) < 1) ?? null)
const report = computed(() => game.dailyReport)
const explored = computed(() => ZONES.filter((z) => game.stars(z.id) >= 1).length)

const selectedId = ref(null)
const selected = computed(() => ZONES.find((z) => z.id === selectedId.value) ?? null)
const selectedIndex = computed(() => ZONES.findIndex((z) => z.id === selectedId.value))

const code = (i) => String(i + 1).padStart(2, '0')

function select(zone) {
  selectedId.value = selectedId.value === zone.id ? null : zone.id
}
</script>

<template>
  <section class="map-page">
    <!-- 第一次登島 -->
    <div v-if="!game.progress.introSeen" class="modal-backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="story-title">
        <div class="eyebrow">INCIDENT REPORT · 事故紀錄</div>
        <h2 id="story-title" class="modal-title">船難後第 1 天</h2>
        <p>暴風雨打翻了你的船。你在一片陌生的沙灘上醒來，四周只有叢林、溪谷，和遠方一座廢棄燈塔。</p>
        <p>殘骸中的補給箱、前人留下的日記、燈塔裡的無線電——<strong>上面全是英文。</strong></p>
        <div class="brief-list">
          <div><span class="mono">01</span> 每完成一項英語任務，就是一次外出探索，會消耗飽足與水分。</div>
          <div><span class="mono">02</span> 表現越好，帶回的物資越多。</div>
          <div><span class="mono">03</span> 島上的時間與現實同步。每過一天，飽足與水分都會下降。</div>
          <div><span class="mono">04</span> 收集零件與木材，修好無線電，發出求救訊號。</div>
        </div>
        <button class="btn primary" @click="game.seeIntro()">開始求生 <Icon name="right" :size="16" /></button>
      </div>
    </div>

    <div v-if="report" class="banner" role="status">
      <Icon name="alert" :size="18" />
      <div>
        <strong>你離開了 {{ report.days }} 天。</strong> 飽足與水分持續下降。
        <span v-if="Object.keys(report.gained).length">
          設施產出：
          <span v-for="(n, k) in report.gained" :key="k" class="chip-inline mono"><Icon :name="RESOURCES[k].icon" :size="13" /> +{{ n }}</span>
        </span>
        <span v-if="report.fainted" class="danger-text">期間你昏倒了，物資損失一半。</span>
      </div>
      <button class="icon-btn" aria-label="關閉" @click="game.dismissReport()"><Icon name="close" /></button>
    </div>

    <div v-if="game.progress.rescuedDay" class="banner good" role="status">
      <Icon name="radio" :size="18" />
      <div>
        <strong>第 {{ game.progress.rescuedDay }} 天，救援確認。</strong>
        無線電傳來回應：「We are coming. Stay there.」你仍可繼續在島上練習。
      </div>
    </div>

    <div class="map-head">
      <div>
        <div class="eyebrow">SURVEY MAP · 島嶼地圖</div>
        <h1 class="page-title">未命名島嶼</h1>
      </div>
      <div class="map-meta mono">
        <span>已探索 {{ explored }}/{{ ZONES.length }}</span>
        <span>設施 {{ game.progress.built.length }}/{{ BUILDINGS.length }}</span>
      </div>
    </div>

    <div class="map-stage">
      <div class="map" role="group" aria-label="島嶼地圖">
        <div class="terrain"></div>
        <div class="coords coords-x mono" aria-hidden="true">
          <span v-for="c in ['A', 'B', 'C', 'D', 'E', 'F']" :key="c">{{ c }}</span>
        </div>
        <div class="coords coords-y mono" aria-hidden="true">
          <span v-for="n in 4" :key="n">{{ n }}</span>
        </div>
        <div class="compass" aria-hidden="true"><Icon name="compass" :size="28" /><span class="mono">N</span></div>

        <span
          v-for="b in builtItems"
          :key="b.id"
          class="structure"
          :style="{ left: b.pos.x + '%', top: b.pos.y + '%' }"
          :title="b.name"
          ><Icon :name="b.icon" :size="16"
        /></span>

        <button
          v-for="(zone, i) in ZONES"
          :key="zone.id"
          class="marker"
          :class="{
            locked: !game.isUnlocked(zone.id),
            next: nextZone?.id === zone.id,
            active: selectedId === zone.id,
            done: game.stars(zone.id) >= 1,
          }"
          :style="{ left: zone.pos.x + '%', top: zone.pos.y + '%', '--zone': zone.color }"
          :aria-label="game.isUnlocked(zone.id) ? `${zone.zh} ${zone.name}` : '未知區域（未解鎖）'"
          @click="select(zone)"
        >
          <span class="marker-dot"></span>
          <span class="marker-label">
            <span class="mono marker-code">{{ code(i) }}</span>
            <span>{{ game.isUnlocked(zone.id) ? zone.zh : '未知區域' }}</span>
            <span v-if="game.isUnlocked(zone.id)" class="marker-stars" :aria-label="`${game.stars(zone.id)} 星`">
              <Icon v-for="n in 3" :key="n" name="star" :size="10" :filled="n <= game.stars(zone.id)" />
            </span>
          </span>
        </button>
      </div>

      <!-- 區域簡報 -->
      <transition name="slide">
        <aside v-if="selected" class="briefing" :style="{ '--zone': selected.color }" aria-live="polite">
          <button class="icon-btn briefing-close" aria-label="關閉" @click="selectedId = null"><Icon name="close" /></button>
          <div class="eyebrow">SECTOR {{ code(selectedIndex) }}</div>

          <template v-if="game.isUnlocked(selected.id)">
            <h2 class="briefing-title">{{ selected.zh }}</h2>
            <div class="briefing-sub">{{ selected.name }}</div>
            <p class="briefing-text">{{ selected.intro }}</p>
            <dl class="specs">
              <div>
                <dt>可取得</dt>
                <dd><Icon :name="RESOURCES[selected.resource].icon" :size="14" /> {{ RESOURCES[selected.resource].zh }}</dd>
              </div>
              <div>
                <dt>每次消耗</dt>
                <dd class="mono">飽足 -{{ EXPEDITION_COST.hunger }} · 水分 -{{ EXPEDITION_COST.thirst }}</dd>
              </div>
              <div>
                <dt>測驗評等</dt>
                <dd class="stars-row"><Icon v-for="n in 3" :key="n" name="star" :size="14" :filled="n <= game.stars(selected.id)" /></dd>
              </div>
            </dl>

            <div class="eyebrow">MISSIONS · 任務</div>
            <div class="mission-list">
              <router-link
                v-for="(m, i) in MISSIONS"
                :key="m.route"
                :to="{ name: m.route, params: { id: selected.id } }"
                class="mission"
              >
                <span class="mono mission-no">{{ code(i) }}</span>
                <Icon :name="m.icon" :size="20" />
                <span class="mission-body">
                  <span class="mission-title">{{ m.title }} <small class="mono">{{ m.en }}</small></span>
                  <span class="mission-desc">{{ m.desc }}</span>
                </span>
                <Icon name="right" :size="16" />
              </router-link>
            </div>
            <router-link :to="{ name: 'zone', params: { id: selected.id } }" class="text-link">
              查看單字表與句型 <Icon name="right" :size="14" />
            </router-link>
          </template>

          <template v-else>
            <h2 class="briefing-title">未知區域</h2>
            <p class="briefing-text">
              <Icon name="lock" :size="16" />
              還找不到通往這裡的路。先在「{{ ZONES[selectedIndex - 1].zh }}」的測驗取得至少 1 星。
            </p>
          </template>
        </aside>
      </transition>
    </div>

    <p class="map-hint">
      <template v-if="nextZone">
        建議目標：<button class="text-link" @click="selectedId = nextZone.id">{{ nextZone.zh }}</button>
        — 可取得{{ RESOURCES[nextZone.resource].zh }}
      </template>
      <template v-else-if="!game.progress.rescuedDay">
        所有區域都已探索。收集零件，前往 <router-link to="/build" class="text-link">建造</router-link> 修復無線電。
      </template>
    </p>

    <!-- 手機版：側欄隱藏，背包與生存狀態放在地圖下方（天數已顯示在頂部列） -->
    <div class="mobile-only panel mobile-survival">
      <SurvivalPanel />
    </div>
  </section>
</template>
