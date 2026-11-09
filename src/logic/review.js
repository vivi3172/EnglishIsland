// 純邏輯：每日複習出題。題庫 = 所有學過區域的單字，學越多區題庫越大（疊加複習）。
import { shuffle } from './quiz.js'

export const DAILY_REVIEW_LENGTH = 12

// 翻過單字卡、或測驗／句型拿過星星的區域，都算學過
export function learnedWords(progress, zones) {
  return zones
    .filter((zone) => {
      const z = progress.zones[zone.id]
      return z && (z.learned || (z.stars ?? 0) > 0 || (z.sentenceStars ?? 0) > 0)
    })
    .flatMap((zone) => zone.words.map((w) => ({ ...w, zoneId: zone.id })))
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
