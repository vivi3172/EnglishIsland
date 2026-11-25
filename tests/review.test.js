import { describe, it, expect } from 'vitest'
import {
  learnedWords,
  pickDailyReview,
  DAILY_REVIEW_LENGTH,
  assignDailyWords,
  todayNewWords,
  buildDailySession,
  DAILY_NEW_COUNT,
  DAILY_OLD_COUNT,
} from '../src/logic/review.js'
import { createInitialProgress, sanitizeProgress } from '../src/logic/progress.js'
import { ZONES, ALL_WORDS } from '../src/data/zones.js'
import { DAILY_WORDS } from '../src/data/dailyWords.js'

describe('daily new words', () => {
  const today = '2026-11-25'
  const tomorrow = '2026-11-26'
  const ens = (words) => words.map((w) => w.en)

  it('bank has no duplicates and does not overlap zone words', () => {
    const bank = ens(DAILY_WORDS)
    expect(new Set(bank).size).toBe(bank.length)
    const zoneSet = new Set(ens(ALL_WORDS))
    expect(bank.filter((en) => zoneSet.has(en))).toEqual([])
    for (const w of DAILY_WORDS) expect(w.zh && w.emoji && w.example && w.exampleZh, w.en).toBeTruthy()
  })

  it('assigns 5 new words once per day, in bank order', () => {
    const day1 = assignDailyWords(createInitialProgress(), DAILY_WORDS, today)
    expect(ens(todayNewWords(day1, DAILY_WORDS, today))).toEqual(ens(DAILY_WORDS.slice(0, DAILY_NEW_COUNT)))
    // 同一天再呼叫不會多發
    expect(assignDailyWords(day1, DAILY_WORDS, today)).toBe(day1)
    // 隔天發下一批，前一天的字留在累積清單
    const day2 = assignDailyWords(day1, DAILY_WORDS, tomorrow)
    expect(ens(todayNewWords(day2, DAILY_WORDS, tomorrow))).toEqual(ens(DAILY_WORDS.slice(5, 10)))
    expect(day2.dailyLearned).toEqual(ens(DAILY_WORDS.slice(0, 10)))
    expect(todayNewWords(day2, DAILY_WORDS, today)).toEqual([])
  })

  it('stops adding when the bank runs out', () => {
    const bank = ZONES[0].words.slice(0, 7)
    const d1 = assignDailyWords(createInitialProgress(), bank, today)
    const d2 = assignDailyWords(d1, bank, tomorrow)
    const d3 = assignDailyWords(d2, bank, '2026-11-27')
    expect(d2.dailyNew.words).toHaveLength(2)
    expect(d3.dailyNew.words).toEqual([])
    expect(d3.dailyLearned).toHaveLength(7)
  })

  it('daily session = all new words of today + old words from zones and earlier days', () => {
    let p = { ...createInitialProgress(), zones: { beach: { learned: true } } }
    p = assignDailyWords(p, DAILY_WORDS, today)
    p = assignDailyWords(p, DAILY_WORDS, tomorrow)
    const s = buildDailySession(p, ZONES, DAILY_WORDS, tomorrow, () => 0.3)
    expect(ens(s.fresh)).toEqual(ens(DAILY_WORDS.slice(5, 10)))
    expect(s.old).toHaveLength(DAILY_OLD_COUNT)
    const freshSet = new Set(ens(s.fresh))
    expect(s.old.some((w) => freshSet.has(w.en))).toBe(false)
    // 學過 = 第一區 8 字 + 兩天共 10 字
    expect(s.learnedTotal).toBe(8 + 10)
  })

  it('old saves without daily fields load with empty defaults', () => {
    const old = createInitialProgress()
    delete old.dailyNew
    delete old.dailyLearned
    const p = sanitizeProgress(JSON.parse(JSON.stringify(old)))
    expect(p.dailyNew).toBeNull()
    expect(p.dailyLearned).toEqual([])
    const bad = sanitizeProgress({ ...createInitialProgress(), dailyNew: { date: 'x', words: 3 }, dailyLearned: ['a', 'a', 5] })
    expect(bad.dailyNew).toBeNull()
    expect(bad.dailyLearned).toEqual(['a'])
  })
})

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
