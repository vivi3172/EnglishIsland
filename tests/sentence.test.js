import { describe, it, expect } from 'vitest'
import {
  splitSentence,
  splitAroundAnswer,
  buildFillQuestion,
  buildOrderQuestion,
  buildSentenceRound,
  checkOrder,
} from '../src/logic/sentence.js'
import { SENTENCES } from '../src/data/sentences.js'
import { ZONES } from '../src/data/zones.js'

function seeded(seed = 1) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

describe('splitSentence', () => {
  it('separates end punctuation and keeps inner commas', () => {
    expect(splitSentence('Hello, I am Amy.')).toEqual({ tokens: ['Hello,', 'I', 'am', 'Amy'], punct: '.' })
    expect(splitSentence('Goodbye, see you!')).toEqual({ tokens: ['Goodbye,', 'see', 'you'], punct: '!' })
  })
})

describe('splitAroundAnswer', () => {
  it('splits at the answer and keeps its comma', () => {
    expect(splitAroundAnswer({ en: 'Hello, I am Amy.', answer: 'Hello' })).toEqual({
      before: '',
      suffix: ',',
      after: 'I am Amy.',
    })
    expect(splitAroundAnswer({ en: 'I like apples.', answer: 'apples' })).toEqual({
      before: 'I like',
      suffix: '',
      after: '.',
    })
  })
})

describe('content', () => {
  it('every zone has sentence data', () => {
    for (const zone of ZONES) expect(SENTENCES[zone.id]?.items.length).toBeGreaterThanOrEqual(4)
  })

  it('every answer appears in its sentence and is unique within the zone', () => {
    for (const [zoneId, { items }] of Object.entries(SENTENCES)) {
      for (const s of items) expect(splitAroundAnswer(s), `${zoneId}: ${s.en}`).not.toBeNull()
      const answers = items.map((s) => s.answer.toLowerCase())
      expect(new Set(answers).size, zoneId).toBe(answers.length)
    }
  })
})

describe('buildFillQuestion', () => {
  it('has 4 unique lowercase options including the answer', () => {
    const items = SENTENCES.beach.items
    const q = buildFillQuestion(items[0], items, seeded(4))
    expect(q.options).toHaveLength(4)
    expect(new Set(q.options).size).toBe(4)
    const answer = items[0].answer.toLowerCase()
    expect(q.options).toContain(answer)
    expect(q.answer).toBe(answer)
  })
})

describe('buildOrderQuestion', () => {
  it('shuffles tiles into a non-solved order', () => {
    const q = buildOrderQuestion({ en: 'The monkey likes bananas.', zh: '' }, seeded(3))
    expect(q.tiles.map((t) => t.id).sort()).toEqual([0, 1, 2, 3])
    expect(q.tiles.map((t) => t.id)).not.toEqual([0, 1, 2, 3])
    expect(q.punct).toBe('.')
  })
})

describe('buildSentenceRound', () => {
  it('alternates fill and order questions', () => {
    const round = buildSentenceRound(SENTENCES.forest.items, 6, seeded(8))
    expect(round.map((q) => q.type)).toEqual(['fill', 'order', 'fill', 'order', 'fill', 'order'])
  })
})

describe('checkOrder', () => {
  it('requires exact order and length', () => {
    expect(checkOrder(['I', 'like', 'apples'], ['I', 'like', 'apples'])).toBe(true)
    expect(checkOrder(['like', 'I', 'apples'], ['I', 'like', 'apples'])).toBe(false)
    expect(checkOrder(['I', 'like'], ['I', 'like', 'apples'])).toBe(false)
  })
})
