import { describe, it, expect } from 'vitest'
import {
  shuffle,
  buildQuestion,
  buildQuiz,
  starsForScore,
  checkSpelling,
  isSpellable,
  scrambleLetters,
} from '../src/logic/quiz.js'
import { ZONES, ALL_WORDS } from '../src/data/zones.js'

// 可重現的亂數
function seeded(seed = 1) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

describe('shuffle', () => {
  it('keeps the same elements and does not mutate input', () => {
    const input = [1, 2, 3, 4, 5]
    const out = shuffle(input, seeded(3))
    expect(out.sort()).toEqual([1, 2, 3, 4, 5])
    expect(input).toEqual([1, 2, 3, 4, 5])
  })
})

describe('buildQuestion', () => {
  const words = ZONES[1].words
  it('has 4 unique options including the answer', () => {
    const q = buildQuestion(words[0], words, 'en-to-zh', seeded(7))
    const ens = q.options.map((o) => o.en)
    expect(ens).toHaveLength(4)
    expect(new Set(ens).size).toBe(4)
    expect(ens).toContain(words[0].en)
    expect(q.answer).toBe(words[0].en)
  })
})

describe('buildQuiz', () => {
  it('limits to available words and rotates question types', () => {
    const words = ZONES[0].words
    const quiz = buildQuiz(words, words, 20, seeded(2))
    expect(quiz).toHaveLength(words.length)
    expect(quiz.slice(0, 3).map((q) => q.type)).toEqual(['en-to-zh', 'zh-to-en', 'listen'])
    expect(new Set(quiz.map((q) => q.answer)).size).toBe(words.length)
  })

  it('works with a single review word using the full pool for distractors', () => {
    const quiz = buildQuiz([ALL_WORDS[0]], ALL_WORDS, 8, seeded(5))
    expect(quiz).toHaveLength(1)
    expect(quiz[0].options).toHaveLength(4)
  })

  it('returns empty quiz for no words', () => {
    expect(buildQuiz([], ALL_WORDS, 8)).toEqual([])
  })
})

describe('starsForScore', () => {
  it.each([
    [8, 8, 3],
    [7, 8, 2],
    [5, 8, 1],
    [4, 8, 0],
    [0, 0, 0],
  ])('%i/%i => %i stars', (c, t, s) => expect(starsForScore(c, t)).toBe(s))
})

describe('spelling', () => {
  it('ignores case and surrounding spaces', () => {
    expect(checkSpelling('  Apple ', 'apple')).toBe(true)
    expect(checkSpelling('aple', 'apple')).toBe(false)
  })

  it('excludes multi-word phrases', () => {
    expect(isSpellable({ en: 'thank you' })).toBe(false)
    expect(isSpellable({ en: 'cat' })).toBe(true)
  })

  it('scrambles to the same letters, different order when possible', () => {
    const out = scrambleLetters('banana', seeded(9))
    expect([...out].sort()).toEqual([...'banana'].sort())
    expect(out.join('')).not.toBe('banana')
  })

  it('every zone has at least 5 spellable words', () => {
    for (const zone of ZONES) expect(zone.words.filter(isSpellable).length).toBeGreaterThanOrEqual(5)
  })
})

describe('content', () => {
  it('word list has no duplicates across zones', () => {
    const ens = ALL_WORDS.map((w) => w.en)
    expect(new Set(ens).size).toBe(ens.length)
  })
})
