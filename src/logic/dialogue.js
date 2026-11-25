// 情境對話：出題（打亂選項）、星數、存檔（純函式，有測試）。
import { shuffle } from './quiz.js'

export const TALK_VERSION = 1

// 你要回答幾輪
export const youTurnCount = (dialogue) => dialogue.lines.filter((l) => l.who === 'you').length

// 每次練習都把你的選項打亂；對方的台詞不變
export function prepareDialogue(dialogue, rng = Math.random) {
  return dialogue.lines.map((line) => (line.who === 'you' ? { ...line, options: shuffle(line.options, rng) } : line))
}

export const correctOption = (line) => line.options.find((o) => o.ok)

// 走完整段對話就至少 1 星；第一次就選對的比例越高星越多
export function starsFor(firstTry, total) {
  if (total <= 0) return 0
  const ratio = firstTry / total
  if (ratio === 1) return 3
  if (ratio >= 0.75) return 2
  return 1
}

// ---------- 存檔 ----------
export const createTalkProgress = () => ({ version: TALK_VERSION, scenes: {} })

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v)
const isDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)
const intIn = (v, min, max) => (Number.isInteger(v) && v >= min && v <= max ? v : min)

// 讀 localStorage 時使用：格式錯誤的欄位丟掉，不影響其他資料
export function sanitizeTalkProgress(raw) {
  const base = createTalkProgress()
  if (!isObj(raw) || !isObj(raw.scenes)) return base
  for (const [id, s] of Object.entries(raw.scenes)) {
    if (!isObj(s)) continue
    base.scenes[id] = {
      best: intIn(s.best, 0, 3),
      plays: intIn(s.plays, 0, Number.MAX_SAFE_INTEGER),
      last: isDate(s.last) ? s.last : null,
    }
  }
  return base
}

export function recordTalk(state, id, stars, today) {
  const prev = state.scenes[id] ?? { best: 0, plays: 0, last: null }
  return {
    ...state,
    scenes: {
      ...state.scenes,
      [id]: { best: Math.max(prev.best, stars), plays: prev.plays + 1, last: today },
    },
  }
}

export const bestStars = (state, id) => state.scenes[id]?.best ?? 0
export const totalStars = (state, ids) => ids.reduce((sum, id) => sum + bestStars(state, id), 0)
