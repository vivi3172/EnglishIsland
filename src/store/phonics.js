// 自然發音的學習進度：獨立的 localStorage key，與荒島求生存檔互不影響
// （遊戲存檔版本變更時會整份重置，分開存才不會互相波及）。
import { reactive, watch } from 'vue'
import { localDateString } from '../logic/progress.js'
import {
  sanitizePhonicsProgress,
  createPhonicsProgress,
  courseProgress,
  recordResults,
  markLessonSeen,
} from '../logic/phonicsProgress.js'

const STORAGE_KEY = 'english-island-phonics'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return sanitizePhonicsProgress(raw ? JSON.parse(raw) : null)
  } catch {
    return createPhonicsProgress()
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

export const phonics = {
  course(courseId) {
    return courseProgress(state.progress, courseId)
  },
  today() {
    return localDateString()
  },
  // mode：practice | daily | weak | test | sort；null 代表單題（跟讀、比較組小測）
  record(courseId, results, mode = null) {
    state.progress = recordResults(state.progress, courseId, results, { mode, today: localDateString() })
  },
  seeLesson(courseId, groupId) {
    state.progress = markLessonSeen(state.progress, courseId, groupId)
  },
  reset(courseId) {
    const courses = { ...state.progress.courses }
    delete courses[courseId]
    state.progress = { ...state.progress, courses }
  },
}
