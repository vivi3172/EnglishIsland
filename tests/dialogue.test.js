import { describe, it, expect } from 'vitest'
import { DIALOGUES, findDialogue } from '../src/data/dialogues.js'
import {
  youTurnCount,
  prepareDialogue,
  correctOption,
  starsFor,
  createTalkProgress,
  sanitizeTalkProgress,
  recordTalk,
  totalStars,
} from '../src/logic/dialogue.js'

describe('DIALOGUES content', () => {
  it('has unique ids and the fields every scene page needs', () => {
    const ids = DIALOGUES.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const d of DIALOGUES) {
      expect(d.title && d.en && d.emoji && d.scene && d.youRole && d.themRole, d.id).toBeTruthy()
      expect(d.color, d.id).toMatch(/^#/)
      expect(findDialogue(d.id)).toBe(d)
    }
  })

  it('gives every scene at least 3 reply turns', () => {
    for (const d of DIALOGUES) expect(youTurnCount(d), d.id).toBeGreaterThanOrEqual(3)
  })

  it('has exactly one right reply per turn, and every wrong reply explains why', () => {
    for (const d of DIALOGUES) {
      for (const line of d.lines) {
        if (line.who === 'them') {
          expect(line.en && line.zh, `${d.id}: ${line.en}`).toBeTruthy()
          continue
        }
        expect(line.who, d.id).toBe('you')
        expect(line.options).toHaveLength(3)
        expect(line.options.filter((o) => o.ok), `${d.id}: ${line.options[0].en}`).toHaveLength(1)
        const texts = line.options.map((o) => o.en.toLowerCase())
        expect(new Set(texts).size, d.id).toBe(texts.length)
        for (const o of line.options) {
          expect(o.en && o.zh, `${d.id}: ${o.en}`).toBeTruthy()
          if (!o.ok) expect(o.why, `${d.id}: ${o.en}`).toBeTruthy()
        }
      }
    }
  })
})

describe('prepareDialogue', () => {
  it('shuffles reply options but keeps the same set and the other lines', () => {
    const d = DIALOGUES[0]
    let seed = 0.9
    const rng = () => (seed = (seed * 7.13) % 1)
    const prepared = prepareDialogue(d, rng)
    expect(prepared).toHaveLength(d.lines.length)
    prepared.forEach((line, i) => {
      if (line.who === 'them') expect(line).toBe(d.lines[i])
      else {
        expect([...line.options].sort((a, b) => a.en.localeCompare(b.en))).toEqual(
          [...d.lines[i].options].sort((a, b) => a.en.localeCompare(b.en)),
        )
        expect(correctOption(line)).toBe(correctOption(d.lines[i]))
      }
    })
  })
})

describe('starsFor', () => {
  it('gives 3 stars only for a perfect run and at least 1 for finishing', () => {
    expect(starsFor(4, 4)).toBe(3)
    expect(starsFor(3, 4)).toBe(2)
    expect(starsFor(2, 4)).toBe(1)
    expect(starsFor(0, 4)).toBe(1)
    expect(starsFor(0, 0)).toBe(0)
  })
})

describe('talk progress', () => {
  it('keeps the best stars and counts plays', () => {
    let s = createTalkProgress()
    s = recordTalk(s, 'hotel', 2, '2026-11-25')
    s = recordTalk(s, 'hotel', 1, '2026-11-26')
    expect(s.scenes.hotel).toEqual({ best: 2, plays: 2, last: '2026-11-26' })
    expect(totalStars(s, ['hotel', 'airport'])).toBe(2)
  })

  it('survives missing or broken saves', () => {
    expect(sanitizeTalkProgress(null)).toEqual(createTalkProgress())
    expect(sanitizeTalkProgress({ scenes: [] })).toEqual(createTalkProgress())
    const s = sanitizeTalkProgress({ scenes: { hotel: { best: 9, plays: -1, last: 'x' }, bad: 'nope' } })
    expect(s.scenes).toEqual({ hotel: { best: 0, plays: 0, last: null } })
  })
})
