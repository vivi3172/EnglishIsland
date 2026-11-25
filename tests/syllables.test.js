import { describe, it, expect } from 'vitest'
import { SYLLABLES } from '../src/data/phonics/syllables.js'
import {
  letterKinds,
  vowelGroups,
  analyze,
  suggestCut,
  cutOf,
  firstVowel,
  sayParts,
  courseWords,
  buildChopRound,
  explainCut,
  CHOP_LENGTH,
} from '../src/logic/syllables.js'

const seeded = (seed) => () => {
  seed = (seed * 9301 + 49297) % 233280
  return seed / 233280
}
const words = courseWords(SYLLABLES)
const byRule = (id) => words.filter((w) => w.ruleId === id)
const word = (en) => words.find((w) => w.en === en)

describe('letter analysis', () => {
  it('marks vowels and consonants', () => {
    expect(letterKinds('paper').join('')).toBe('CVCVC')
  })
  it('groups adjacent vowels into one sound', () => {
    expect(vowelGroups('rainbow')).toEqual([
      [1, 3],
      [5, 6],
    ])
  })
  it('detects VCV and VCCV', () => {
    expect(analyze('paper').pattern).toBe('VCV')
    expect(analyze('napkin').pattern).toBe('VCCV')
    expect(analyze('cat')).toBeNull()
  })
})

describe('content: every word follows its rule', () => {
  it('words are unique, lowercase, two syllables', () => {
    const ens = words.map((w) => w.en)
    expect(new Set(ens).size).toBe(ens.length)
    for (const w of words) {
      expect(w.en).toMatch(/^[a-z]+$/)
      expect(w.parts).toHaveLength(2)
      expect(w.zh).toBeTruthy()
      if (w.say) expect(w.say).toHaveLength(2)
    }
  })
  it('VC|CV words have two consonants and are cut between them', () => {
    for (const w of byRule('vccv')) {
      const a = analyze(w.en)
      expect(a.consonants, w.en).toBe(2)
      expect(cutOf(w), w.en).toBe(a.gapStart + 1)
    }
  })
  it('V|CV words have one consonant and are cut before it', () => {
    for (const w of byRule('vcv-open')) {
      const a = analyze(w.en)
      expect(a.consonants, w.en).toBe(1)
      expect(cutOf(w), w.en).toBe(a.gapStart)
    }
  })
  it('VC|V words have one consonant and are cut after it', () => {
    for (const w of byRule('vcv-closed')) {
      const a = analyze(w.en)
      expect(a.consonants, w.en).toBe(1)
      expect(cutOf(w), w.en).toBe(a.gapEnd)
    }
  })
  it('C+le words end with consonant + le as the last syllable', () => {
    for (const w of byRule('cle')) expect(w.parts[1], w.en).toMatch(/^[^aeiou]le$/)
  })
  it('compound parts each contain a vowel', () => {
    for (const w of byRule('compound')) for (const p of w.parts) expect(vowelGroups(p).length, w.en).toBeGreaterThan(0)
  })
  it('declared long/short vowel matches open/closed first syllable', () => {
    for (const rule of SYLLABLES.rules.filter((r) => r.vowel === 'long' || r.vowel === 'short')) {
      for (const w of rule.words) expect(firstVowel(w, rule), w.parts.join('|')).toBe(rule.vowel)
    }
  })
})

describe('suggestCut', () => {
  it('applies the first-try rules', () => {
    expect(suggestCut('paper')).toEqual({ cut: 2, ruleId: 'vcv-open' })
    expect(suggestCut('napkin')).toEqual({ cut: 3, ruleId: 'vccv' })
    expect(suggestCut('table')).toEqual({ cut: 2, ruleId: 'cle' })
    expect(suggestCut('rocket', SYLLABLES.digraphs)).toEqual({ cut: 4, ruleId: 'digraph' })
    expect(suggestCut('cat')).toBeNull()
  })
})

describe('sayParts', () => {
  it('turns consonant+le into a speakable sound and keeps overrides', () => {
    expect(sayParts(word('table'))).toEqual(['ta', 'bull'])
    expect(sayParts(word('camel'))).toEqual(['cam', 'ell'])
    expect(sayParts(word('paper'))).toEqual(['pa', 'per'])
  })
})

describe('buildChopRound', () => {
  it('mixes every rule without repeating words', () => {
    const round = buildChopRound(SYLLABLES, { rng: seeded(3) })
    expect(round).toHaveLength(CHOP_LENGTH)
    expect(new Set(round.map((w) => w.en)).size).toBe(CHOP_LENGTH)
    expect(new Set(round.map((w) => w.ruleId)).size).toBe(SYLLABLES.rules.length)
  })
  it('can focus on one rule', () => {
    const round = buildChopRound(SYLLABLES, { focus: 'cle', rng: seeded(1) })
    expect(round.length).toBe(CHOP_LENGTH)
    expect(round.every((w) => w.ruleId === 'cle')).toBe(true)
  })
})

describe('explainCut', () => {
  it('explains the VC|V fallback when the learner tries V|CV first', () => {
    expect(explainCut(SYLLABLES, word('camel'), 2)).toContain('退一步')
  })
  it('warns about splitting a digraph', () => {
    expect(explainCut(SYLLABLES, word('finish'), 5)).toContain('sh')
  })
  it('confirms a correct cut', () => {
    expect(explainCut(SYLLABLES, word('paper'), 2)).toContain('✓ pa·per')
  })
})
