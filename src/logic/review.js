// 純邏輯：每日單字與每日複習出題。
// 題庫 = 所有學過區域的單字 + 每天發的新單字，學越久題庫越大（疊加複習）。
import { shuffle } from './quiz.js'

export const DAILY_REVIEW_LENGTH = 12 // 沒有今日新字時（題庫用完）的舊字題數
export const DAILY_NEW_COUNT = 5 // 每天發幾個新字
export const DAILY_OLD_COUNT = 10 // 每日測驗搭配幾個舊字

// 翻過單字卡、或測驗／句型拿過星星的區域，都算學過；之前每天發過的新字也算。
export function learnedWords(progress, zones, bank = []) {
  const zoneWords = zones
    .filter((zone) => {
      const z = progress.zones[zone.id]
      return z && (z.learned || (z.stars ?? 0) > 0 || (z.sentenceStars ?? 0) > 0)
    })
    .flatMap((zone) => zone.words.map((w) => ({ ...w, zoneId: zone.id })))
  const assigned = new Set(progress.dailyLearned ?? [])
  return [...zoneWords, ...bank.filter((w) => assigned.has(w.en))]
}

// 優先順序：答錯次數多 → 從沒複習過 → 最久沒複習。同順位隨機。
// 每次複習會更新 wordLog 的日期，所以每天輪到的字會自動往後輪替。
export function pickDailyReview(words, progress, count = DAILY_REVIEW_LENGTH, rng = Math.random) {
  const wrong = progress.wrongWords ?? {}
  const log = progress.wordLog ?? {}
  return shuffle(words, rng)
    .sort((a, b) => (wrong[b.en] ?? 0) - (wrong[a.en] ?? 0) || (log[a.en] ?? '').localeCompare(log[b.en] ?? ''))
    .slice(0, count)
}

// 今天第一次進「每日單字」時發新字：依題庫順序取還沒發過的 count 個。
// 同一天重複呼叫不會再發；沒來的日子不會累積欠帳（一天最多 count 個）。
export function assignDailyWords(progress, bank, today, count = DAILY_NEW_COUNT) {
  if (!today || progress.dailyNew?.date === today) return progress
  const assigned = new Set(progress.dailyLearned ?? [])
  const words = bank.filter((w) => !assigned.has(w.en)).slice(0, count).map((w) => w.en)
  return {
    ...progress,
    dailyNew: { date: today, words },
    dailyLearned: [...(progress.dailyLearned ?? []), ...words],
  }
}

// 今天發的新字（還沒發或不是今天發的就是空陣列）
export function todayNewWords(progress, bank, today) {
  if (progress.dailyNew?.date !== today) return []
  const set = new Set(progress.dailyNew.words)
  return bank.filter((w) => set.has(w.en))
}

// 每日測驗：今天的新字全部出 + 舊字依優先順序挑。
// 今天沒有新字（題庫已用完）時，舊字出 DAILY_REVIEW_LENGTH 題。
export function buildDailySession(progress, zones, bank, today, rng = Math.random) {
  const fresh = todayNewWords(progress, bank, today)
  const freshSet = new Set(fresh.map((w) => w.en))
  const old = learnedWords(progress, zones, bank).filter((w) => !freshSet.has(w.en))
  const oldPicked = pickDailyReview(old, progress, fresh.length ? DAILY_OLD_COUNT : DAILY_REVIEW_LENGTH, rng)
  return { fresh, old: oldPicked, learnedTotal: old.length + fresh.length }
}
