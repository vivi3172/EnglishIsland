import { describe, it, expect } from 'vitest'
import { learnedWords, pickDailyReview, DAILY_REVIEW_LENGTH } from '../src/logic/review.js'
import { createInitialProgress } from '../src/logic/progress.js'
import { ZONES } from '../src/data/zones.js'

const withZones = (zones, extra = {}) => ({ ...createInitialProgress(), zones, ...extra })
const ens = (words) => words.map((w) => w.en)

describe('learnedWords', () => {
  it('is empty before studying any zone', () => {
    expect(learnedWords(createInitialProgress(), ZONES)).toEqual([])
  })

  it('accumulates words of every zone studied so far', () => {
    const one = learnedWords(withZones({ beach: { learned: true } }), ZONES)
    expect(ens(one)).toEqual(ens(ZONES[0].words))

    // 第二區只有測驗星星、沒翻單字卡，也算學過
    const two = learnedWords(withZones({ beach: { learned: true }, spring: { stars: 1 } }), ZONES)
    expect(ens(two)).toEqual([...ens(ZONES[0].words), ...ens(ZONES[1].words)])
  })
})

describe('pickDailyReview', () => {
  const words = [...ZONES[0].words, ...ZONES[1].words] // 16 個字
  const fixed = () => 0.5

  it('limits the session length and never repeats a word', () => {
    const picked = pickDailyReview(words, createInitialProgress(), DAILY_REVIEW_LENGTH, fixed)
    expect(picked).toHaveLength(DAILY_REVIEW_LENGTH)
    expect(new Set(ens(picked)).size).toBe(DAILY_REVIEW_LENGTH)
  })

  it('returns all words when there are fewer than the session length', () => {
    expect(pickDailyReview(ZONES[0].words, createInitialProgress(), DAILY_REVIEW_LENGTH, fixed)).toHaveLength(8)
  })

  it('puts wrong words first, then words never reviewed, then the oldest reviewed', () => {
    const wordLog = Object.fromEntries(words.map((w) => [w.en, '2026-11-08']))
    wordLog.guest = '2026-11-01' // 最久沒複習
    delete wordLog.menu // 從沒複習過
    const p = { ...createInitialProgress(), wrongWords: { bill: 2, lobby: 1 }, wordLog }
    const picked = ens(pickDailyReview(words, p, 4, fixed))
    expect(picked).toEqual(['bill', 'lobby', 'menu', 'guest'])
  })

  it('rotates: words reviewed today go to the back', () => {
    const today = '2026-11-09'
    const first = pickDailyReview(words, createInitialProgress(), 8, fixed)
    const wordLog = Object.fromEntries(first.map((w) => [w.en, today]))
    const second = pickDailyReview(words, { ...createInitialProgress(), wordLog }, 8, fixed)
    expect(ens(second).filter((en) => ens(first).includes(en))).toEqual([])
  })
})
