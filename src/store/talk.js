// 情境對話的進度：獨立的 localStorage key，與荒島求生存檔、自然發音存檔互不影響。
import { reactive, watch } from 'vue'
import { localDateString } from '../logic/progress.js'
import { sanitizeTalkProgress, createTalkProgress, recordTalk, bestStars, totalStars } from '../logic/dialogue.js'

const STORAGE_KEY = 'english-island-dialogues'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return sanitizeTalkProgress(raw ? JSON.parse(raw) : null)
  } catch {
    return createTalkProgress()
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

export const talk = {
  stars(id) {
    return bestStars(state.progress, id)
  },
  plays(id) {
    return state.progress.scenes[id]?.plays ?? 0
  },
  total(ids) {
    return totalStars(state.progress, ids)
  },
  record(id, stars) {
    state.progress = recordTalk(state.progress, id, stars, localDateString())
  },
}
