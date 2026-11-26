<script setup>
// 情境插畫（原創 SVG）：角色與道具由情境資料決定（character / activity），畫面狀態由時態決定。
//   時間：過去 = 泛黃相片（回憶）、現在 = 即時、未來 = 虛線預想框
//   狀態：簡單式 = 日曆（習慣打勾 / 單次圈起來）、進行式 = 正在做（動畫）、
//         完成式 = 成果出現、完成進行式 = 一直做 + 時鐘累積
import { computed } from 'vue'
import { splitKey } from '../../data/tenses/index.js'
import { entryOf } from '../../logic/tense.js'

const props = defineProps({
  scenario: { type: Object, required: true },
  tenseKey: { type: String, required: true },
  compact: { type: Boolean, default: false },
})

const parts = computed(() => splitKey(props.tenseKey))
const entry = computed(() => entryOf(props.scenario, props.tenseKey))
const tl = computed(() => entry.value.tl)
const working = computed(() => parts.value.aspect === 'continuous' || parts.value.aspect === 'perfect-continuous')
const done = computed(() => parts.value.aspect === 'perfect')
const ERA = { past: '⏪ 回憶', present: '● 現在', future: '▶ 預想' }
const DAYS = ['一', '二', '三', '四', '五', '六', '日']
</script>

<template>
  <figure
    class="scene"
    :class="[`era-${parts.time}`, `asp-${parts.aspect}`, `char-${scenario.character}`, `act-${scenario.activity}`, { working, done, compact }]"
    role="img"
    :aria-label="`插畫：${entry.zh}`"
  >
    <svg viewBox="0 0 320 200" aria-hidden="true">
      <defs>
        <filter :id="`sepia-${scenario.id}`"><feColorMatrix type="saturate" values="0.25" /></filter>
      </defs>

      <rect class="sc-bg" x="0" y="0" width="320" height="200" rx="10" />
      <rect class="sc-floor" x="0" y="185" width="320" height="15" />

      <g class="sc-stage" :filter="parts.time === 'past' ? `url(#sepia-${scenario.id})` : undefined">
        <!-- ===== 道具：煮飯 ===== -->
        <template v-if="scenario.activity === 'cook'">
          <g class="sc-work">
            <rect x="150" y="160" width="110" height="25" rx="3" fill="#374151" />
            <circle cx="180" cy="172" r="5" fill="#ef4444" class="sc-burner" />
            <circle cx="230" cy="172" r="5" fill="#6b7280" />
            <rect x="158" y="124" width="74" height="8" rx="3" fill="#94a3b8" />
            <rect x="162" y="130" width="66" height="30" rx="6" fill="#64748b" />
            <rect x="150" y="132" width="12" height="5" rx="2" fill="#475569" />
            <rect x="228" y="132" width="12" height="5" rx="2" fill="#475569" />
            <g class="sc-steam" stroke="#e5e7eb" stroke-width="3" fill="none" stroke-linecap="round">
              <path d="M180 118c-6-8 6-12 0-22" />
              <path d="M195 116c-6-8 6-12 0-24" style="animation-delay: -0.7s" />
              <path d="M210 118c-6-8 6-12 0-22" style="animation-delay: -1.4s" />
            </g>
          </g>
          <g class="sc-result">
            <rect x="150" y="150" width="120" height="8" rx="2" fill="#a16207" />
            <rect x="160" y="158" width="6" height="27" fill="#854d0e" />
            <rect x="254" y="158" width="6" height="27" fill="#854d0e" />
            <ellipse cx="210" cy="146" rx="38" ry="7" fill="#f8fafc" />
            <path d="M188 144a22 14 0 0 1 44 0z" fill="#f59e0b" />
            <circle cx="202" cy="136" r="3" fill="#22c55e" />
            <circle cx="216" cy="138" r="3" fill="#ef4444" />
            <g class="sc-sparkle" fill="#fde68a">
              <path d="M178 116l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
              <path d="M244 112l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" style="animation-delay: -0.6s" />
            </g>
          </g>
        </template>

        <!-- ===== 道具：寫功課 ===== -->
        <template v-else-if="scenario.activity === 'homework'">
          <rect x="140" y="140" width="140" height="8" rx="2" fill="#a16207" />
          <rect x="150" y="148" width="6" height="37" fill="#854d0e" />
          <rect x="264" y="148" width="6" height="37" fill="#854d0e" />
          <g class="sc-work">
            <path d="M170 138l30-6 30 6v2h-60z" fill="#f8fafc" stroke="#cbd5e1" />
            <g class="sc-lines" stroke="#64748b" stroke-width="1.5">
              <path d="M178 136l16-3" />
              <path d="M206 133l16 3" style="animation-delay: -0.8s" />
            </g>
            <g class="sc-pencil">
              <rect x="196" y="112" width="5" height="24" rx="1" fill="#facc15" transform="rotate(25 198 124)" />
            </g>
          </g>
          <g class="sc-result">
            <rect x="180" y="124" width="48" height="16" rx="2" fill="#38bdf8" />
            <circle cx="204" cy="132" r="6" fill="#fde047" />
            <path d="M232 104a12 12 0 1 1 0 .1z" fill="#16a34a" />
            <path d="M226 104l4 4 8-8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" />
            <g class="sc-sparkle" fill="#fde68a">
              <path d="M166 110l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
            </g>
          </g>
        </template>

        <!-- ===== 角色：奶奶 ===== -->
        <g v-if="scenario.character === 'grandma'" transform="translate(50 40)">
          <path d="M20 62Q45 52 70 62L82 140H8z" fill="#7c9cbf" />
          <path d="M30 72h30l6 60H24z" fill="#f8fafc" />
          <rect x="38" y="104" width="14" height="10" rx="2" fill="#fca5a5" />
          <rect x="24" y="140" width="14" height="6" rx="2" fill="#4b5563" />
          <rect x="52" y="140" width="14" height="6" rx="2" fill="#4b5563" />
          <circle cx="45" cy="34" r="21" fill="#f2c9a0" />
          <path d="M24 32a21 21 0 0 1 42 0c-6-8-14-10-21-10s-15 2-21 10z" fill="#d1d5db" />
          <circle cx="45" cy="10" r="9" fill="#d1d5db" />
          <g stroke="#374151" stroke-width="1.6" fill="none">
            <circle cx="38" cy="35" r="6" />
            <circle cx="52" cy="35" r="6" />
            <path d="M44 35h2" />
          </g>
          <circle cx="38" cy="35" r="1.6" fill="#1f2937" />
          <circle cx="52" cy="35" r="1.6" fill="#1f2937" />
          <circle cx="32" cy="44" r="3" fill="#f9a8a8" opacity="0.7" />
          <circle cx="58" cy="44" r="3" fill="#f9a8a8" opacity="0.7" />
          <path d="M40 46q5 4 10 0" stroke="#7c2d12" stroke-width="1.6" fill="none" stroke-linecap="round" />
          <g class="sc-arm">
            <path d="M64 70q20 10 38 6" stroke="#7c9cbf" stroke-width="9" fill="none" stroke-linecap="round" />
            <circle cx="104" cy="76" r="5" fill="#f2c9a0" />
            <path class="sc-spoon" d="M104 76l24 22" stroke="#a16207" stroke-width="3" stroke-linecap="round" />
          </g>
        </g>

        <!-- ===== 角色：小朋友 ===== -->
        <g v-else-if="scenario.character === 'kid'" transform="translate(56 46)">
          <path d="M22 78q22-10 44 0l8 58H14z" fill="#fbbf24" />
          <rect x="24" y="136" width="14" height="6" rx="2" fill="#1e3a8a" />
          <rect x="50" y="136" width="14" height="6" rx="2" fill="#1e3a8a" />
          <path d="M60 40q22 4 16 28" stroke="#6b4226" stroke-width="7" fill="none" stroke-linecap="round" />
          <circle cx="44" cy="50" r="20" fill="#f2c9a0" />
          <path d="M24 48a20 20 0 0 1 40 0c-8-10-26-10-40 0z" fill="#6b4226" />
          <circle cx="62" cy="38" r="4" fill="#f472b6" />
          <circle cx="37" cy="52" r="2" fill="#1f2937" />
          <circle cx="51" cy="52" r="2" fill="#1f2937" />
          <circle cx="32" cy="58" r="3" fill="#f9a8a8" opacity="0.7" />
          <circle cx="56" cy="58" r="3" fill="#f9a8a8" opacity="0.7" />
          <path d="M39 61q5 4 10 0" stroke="#7c2d12" stroke-width="1.6" fill="none" stroke-linecap="round" />
          <g class="sc-arm">
            <path d="M62 86q20 6 36-6" stroke="#fbbf24" stroke-width="8" fill="none" stroke-linecap="round" />
            <circle cx="100" cy="79" r="4.5" fill="#f2c9a0" />
          </g>
        </g>
      </g>

      <!-- ===== 簡單式：日曆 ===== -->
      <g class="sc-calendar" transform="translate(216 12)">
        <rect width="92" height="44" rx="5" fill="#f8fafc" />
        <rect width="92" height="12" rx="5" fill="#818cf8" />
        <g v-for="(d, i) in DAYS" :key="d" :transform="`translate(${5 + i * 12} 18)`">
          <rect width="10" height="20" rx="2" fill="#e2e8f0" />
          <text x="5" y="8" text-anchor="middle" font-size="6" fill="#475569">{{ d }}</text>
          <text v-if="tl.habit" x="5" y="17" text-anchor="middle" font-size="8" fill="#4f46e5">✓</text>
        </g>
        <circle v-if="!tl.habit" cx="46" cy="28" r="9" fill="none" stroke="#4f46e5" stroke-width="2" />
      </g>

      <!-- ===== 完成進行式：時鐘累積 ===== -->
      <g class="sc-clock" transform="translate(272 38)">
        <circle r="24" fill="#f8fafc" />
        <path class="sc-clock-fill" d="M0 0V-20A20 20 0 1 1 -17.3 10z" fill="#c084fc" opacity="0.55" />
        <circle r="24" fill="none" stroke="#6b7280" stroke-width="2" />
        <path class="sc-clock-hand" d="M0 0V-17" stroke="#1f2937" stroke-width="2.5" stroke-linecap="round" />
        <circle r="2.5" fill="#1f2937" />
      </g>

      <!-- 時間框：過去像舊相片、未來是虛線預想 -->
      <rect class="sc-frame" x="3" y="3" width="314" height="194" rx="9" fill="none" />
    </svg>

    <span class="sc-era">{{ ERA[parts.time] }}</span>
    <span v-if="tl.habit || parts.aspect === 'simple'" class="sc-tag sc-tag-cal">{{ tl.ref }}</span>
    <span v-if="parts.aspect === 'perfect-continuous' && tl.duration" class="sc-tag sc-tag-clock">⟶ {{ tl.duration }}</span>
    <span v-if="tl.second" class="sc-tag sc-tag-second">◆ {{ tl.second }}</span>
    <span v-if="working" class="sc-state">▬ 正在做</span>
    <span v-else-if="done" class="sc-state">✔ 已經做好</span>
  </figure>
</template>
