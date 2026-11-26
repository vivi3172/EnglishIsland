// 12 時態的學習進度：獨立的 localStorage key，與其他模組的存檔互不影響。
import { reactive, watch } from 'vue'
import { localDateString } from '../logic/progress.js'
import {
  sanitizeTenseProgress, createTenseProgress, recordAnswer, markSeen, markStage, markCompared,
  mastery, accuracy, overall, stageStatus, pairId,
} from '../logic/tense.js'

const STORAGE_KEY = 'english-island-tenses'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return sanitizeTenseProgress(raw ? JSON.parse(raw) : null)
  } catch {
    return createTenseProgress()
  }
}

const state = reactive({ progress: load() })

watch(
  () => state.progress,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // 無痕模式或儲存空間被封鎖：照常練習，只是不會保存
    }
  },
  { deep: true },
)

// 系統設定「減少動態效果」或模組內開關，任一個開著就不播動畫
const systemCalm = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export const tenses = {
  get progress() {
    return state.progress
  },
  get calm() {
    return systemCalm || state.progress.calm
  },
  get systemCalm() {
    return systemCalm
  },
  toggleCalm() {
    state.progress = { ...state.progress, calm: !state.progress.calm }
  },
  see(key) {
    state.progress = markSeen(state.progress, key)
  },
  stage(flag) {
    state.progress = markStage(state.progress, flag)
  },
  compared(a, b) {
    state.progress = markCompared(state.progress, pairId(a, b))
  },
  answer(q, ok) {
    state.progress = recordAnswer(state.progress, q, ok, localDateString())
  },
  mastery: (key) => mastery(state.progress, key),
  accuracy: (key) => accuracy(state.progress, key),
  overall: () => overall(state.progress),
  stages: () => stageStatus(state.progress),
}
