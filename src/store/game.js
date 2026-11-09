import { reactive, watch } from 'vue'
import { ZONES, findZone } from '../data/zones.js'
import {
  sanitizeProgress,
  completeActivity,
  dailyTick,
  useItem,
  build,
  islandDay,
  localDateString,
  isZoneUnlocked,
  zoneStars,
} from '../logic/progress.js'

const STORAGE_KEY = 'english-island-progress'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return sanitizeProgress(raw ? JSON.parse(raw) : null)
  } catch {
    return sanitizeProgress(null)
  }
}

const state = reactive({
  progress: load(),
  dailyReport: null, // 離開島嶼幾天後回來的結算，地圖頁顯示一次
})

watch(
  () => state.progress,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // 無痕模式或儲存空間被封鎖：遊戲照常進行，只是不會保存
    }
  },
  { deep: true },
)

function run(input) {
  const out = completeActivity(state.progress, { ...input, today: localDateString() })
  state.progress = out.progress
  return out
}

export const game = {
  get progress() {
    return state.progress
  },
  get dailyReport() {
    return state.dailyReport
  },
  dismissReport() {
    state.dailyReport = null
  },
  get day() {
    return islandDay(state.progress, localDateString())
  },
  // App 啟動時呼叫：結算離開期間的每日消耗
  tick() {
    const out = dailyTick(state.progress, localDateString())
    state.progress = out.progress
    if (out.report.days > 0) state.dailyReport = out.report
  },
  seeIntro() {
    state.progress = { ...state.progress, introSeen: true }
  },
  stars(zoneId) {
    return zoneStars(state.progress, zoneId)
  },
  sentenceStars(zoneId) {
    return state.progress.zones[zoneId]?.sentenceStars ?? 0
  },
  isUnlocked(zoneId) {
    return isZoneUnlocked(state.progress, ZONES, zoneId)
  },
  finishFlashcards(zoneId) {
    return run({ kind: 'cards', zoneId, resource: findZone(zoneId)?.resource })
  },
  finishQuiz(zoneId, results, stars) {
    return run({ kind: 'quiz', zoneId, resource: findZone(zoneId)?.resource, results, stars })
  },
  finishSpelling(zoneId, results) {
    return run({ kind: 'spell', zoneId, resource: findZone(zoneId)?.resource, results })
  },
  finishSentences(zoneId, correct, total, stars) {
    return run({ kind: 'sentence', zoneId, resource: findZone(zoneId)?.resource, correct, total, stars })
  },
  finishReview(results) {
    return run({ kind: 'review', results })
  },
  finishDaily(results) {
    return run({ kind: 'daily', results })
  },
  // 今天是否已完成每日複習
  get dailyDone() {
    return state.progress.dailyReviewDate === localDateString()
  },
  use(kind) {
    const out = useItem(state.progress, kind)
    state.progress = out.progress
    return out
  },
  build(building) {
    const out = build(state.progress, building, localDateString())
    state.progress = out.progress
    return out
  },
  reset() {
    state.progress = sanitizeProgress(null)
    state.dailyReport = null
    this.tick()
  },
}
