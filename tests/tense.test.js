import { describe, it, expect } from 'vitest'
import {
  TIMES, ASPECTS, FORMS, TENSE_KEYS, PLAY_ORDER, COMPARISONS, SCENARIOS, STAGES, CHANTS,
  splitKey, tenseKey, findScenario, comparisonFor,
} from '../src/data/tenses/index.js'
import {
  parseSentence, wordIndexAt, verbPhrase, timelineFor, normalize, detectTense, blankParts, orderWords,
  makeQuestion, buildQuiz, checkAnswer, explain, distractors, QUIZ_TYPES,
  createTenseProgress, sanitizeTenseProgress, recordAnswer, mastery, markSeen, markStage, markCompared,
  stageStatus, overall, weakKeys, pairId, spokenMatch,
} from '../src/logic/tense.js'

// 固定亂數，測試可重現
function seeded(seed = 1) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

describe('tense data model', () => {
  it('has 3 times × 4 aspects = 12 tenses, each with a full form entry', () => {
    expect(TIMES).toHaveLength(3)
    expect(ASPECTS).toHaveLength(4)
    expect(TENSE_KEYS).toHaveLength(12)
    expect([...PLAY_ORDER].sort()).toEqual([...TENSE_KEYS].sort())
    for (const key of TENSE_KEYS) {
      const f = FORMS[key]
      expect(f, key).toBeTruthy()
      expect(f.formula && f.formulaEn && f.auxWhy, key).toBeTruthy()
      expect(f.uses.length, key).toBeGreaterThan(0)
      for (const c of f.confused) expect(TENSE_KEYS, `${key} confused ${c}`).toContain(c)
      expect(splitKey(key)).toEqual({ time: key.split('-')[0], aspect: key.slice(key.indexOf('-') + 1) })
      expect(tenseKey(splitKey(key).time, splitKey(key).aspect)).toBe(key)
    }
  })

  // 共用說明會出現在每個情境：若提到某個情境的動詞，就必須每個情境都提到（避免莉莉的題目說 cooked）
  it('keeps shared auxiliary explanations neutral across scenarios', () => {
    // do / does / did / done 同時也是助動詞，單獨出現不算「提到某個情境」；
    // 只有寫成變化範例（do → does）才算
    const GRAMMAR = new Set(['do', 'does', 'did', 'done', 'have', 'has', 'had', 'be', 'been', 'is', 'was', 'will'])
    const mentions = (text, s) =>
      Object.values(s.verb).some(
        (v) => (!GRAMMAR.has(v) && new RegExp(`\\b${v}\\b`).test(text)) || new RegExp(`\\b${v}\\s*→`).test(text),
      )
    for (const key of TENSE_KEYS) {
      const text = FORMS[key].auxWhy
      const hit = SCENARIOS.map((s) => mentions(text, s))
      if (hit.some(Boolean)) expect(hit.every(Boolean), `${key}: ${text}`).toBe(true)
    }
  })

  it('keeps time colours apart from aspect colours', () => {
    const colours = [...TIMES, ...ASPECTS].map((x) => x.color.toLowerCase())
    expect(new Set(colours).size).toBe(colours.length)
  })

  it('has a chant line for every time and aspect, and six learning stages', () => {
    for (const t of TIMES) expect(CHANTS.time[t.id], t.id).toBeTruthy()
    for (const a of ASPECTS) expect(CHANTS.aspect[a.id], a.id).toBeTruthy()
    expect(STAGES.map((s) => s.no)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('offers the five preset comparisons over real tenses', () => {
    expect(COMPARISONS).toHaveLength(5)
    for (const c of COMPARISONS) {
      expect(TENSE_KEYS).toContain(c.a)
      expect(TENSE_KEYS).toContain(c.b)
      expect(c.note && c.title, c.id).toBeTruthy()
      expect(comparisonFor(c.b, c.a)).toBe(c)
    }
  })
})

describe('scenarios', () => {
  it('have unique ids and a sentence for all 12 tenses', () => {
    const ids = SCENARIOS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const s of SCENARIOS) {
      expect(findScenario(s.id)).toBe(s)
      expect(Object.keys(s.tenses).sort()).toEqual([...TENSE_KEYS].sort())
      for (const v of ['base', 's', 'past', 'pp', 'ing']) expect(s.verb[v], `${s.id} ${v}`).toBeTruthy()
      for (const [key, e] of Object.entries(s.tenses)) {
        expect(e.en && e.zh && e.feel && e.clue && e.tl?.ref, `${s.id} ${key}`).toBeTruthy()
      }
    }
  })

  // 最重要的內容檢查：每句的「助動詞 + 主要動詞」必須符合該時態的公式
  it('uses exactly the auxiliaries and verb form each tense requires', () => {
    for (const s of SCENARIOS) {
      for (const key of TENSE_KEYS) {
        const f = FORMS[key]
        expect(verbPhrase(s, key), `${s.id} ${key}`).toEqual([...f.aux, s.verb[f.verb]])
      }
    }
  })

  it('marks at least one time cue in every sentence', () => {
    for (const s of SCENARIOS) {
      for (const key of TENSE_KEYS) {
        const { words } = parseSentence(s.tenses[key].en)
        expect(words.some((w) => w.role === 'time'), `${s.id} ${key}`).toBe(true)
      }
    }
  })

  it('gives every tense a different sentence within a scenario', () => {
    for (const s of SCENARIOS) {
      const texts = TENSE_KEYS.map((k) => parseSentence(s.tenses[k].en).text)
      expect(new Set(texts).size).toBe(12)
    }
  })
})

describe('parseSentence / wordIndexAt', () => {
  it('splits marked text into words with roles and char offsets', () => {
    const { text, words } = parseSentence('Grandma [has] {already} <cooked> dinner.')
    expect(text).toBe('Grandma has already cooked dinner.')
    expect(words.map((w) => [w.text, w.role])).toEqual([
      ['Grandma', 'plain'], ['has', 'aux'], ['already', 'time'], ['cooked', 'verb'], ['dinner.', 'plain'],
    ])
    for (const w of words) expect(text.slice(w.start, w.start + w.text.length)).toBe(w.text)
  })

  it('keeps multi-word aux and time phrases as separate words with the same role', () => {
    const { words } = parseSentence('Grandma [will have been] <cooking> {for two hours} {by 7 p.m.}')
    expect(words.filter((w) => w.role === 'aux').map((w) => w.text)).toEqual(['will', 'have', 'been'])
    expect(words.filter((w) => w.role === 'time').map((w) => w.text)).toEqual(['for', 'two', 'hours', 'by', '7', 'p.m.'])
  })

  it('maps speech boundary positions to word indexes', () => {
    const { words } = parseSentence('Grandma [is] <cooking> {now}.')
    expect(wordIndexAt(words, -1)).toBe(-1)
    expect(wordIndexAt(words, 0)).toBe(0)
    expect(wordIndexAt(words, 8)).toBe(1)
    expect(wordIndexAt(words, 10)).toBe(1) // 落在空白上，仍算前一個字
    expect(wordIndexAt(words, 999)).toBe(3)
  })
})

describe('timelineFor', () => {
  const shape = (items) => JSON.stringify(items.map(({ id, kind, x, w, xs }) => ({ id, kind, x, w, xs })))

  it('keeps every element on the track', () => {
    for (const s of SCENARIOS) {
      for (const key of TENSE_KEYS) {
        for (const it of timelineFor(key, s.tenses[key].tl)) {
          expect(it.x, `${s.id} ${key} ${it.id}`).toBeGreaterThanOrEqual(0)
          expect(it.x + (it.w ?? 0), `${s.id} ${key} ${it.id}`).toBeLessThanOrEqual(100)
        }
      }
    }
  })

  it('draws a different picture for each of the 12 grandma tenses', () => {
    const g = findScenario('grandma')
    const shapes = TENSE_KEYS.map((k) => shape(timelineFor(k, g.tenses[k].tl)))
    expect(new Set(shapes).size).toBe(12)
  })

  it('puts perfect events before the reference time and continuous spans around it', () => {
    const perfect = timelineFor('past-perfect', { ref: 'x', second: 'y' })
    const ref = perfect.find((i) => i.kind === 'ref').x
    expect(perfect.find((i) => i.id === 'main').x).toBeLessThan(ref)
    expect(perfect.find((i) => i.id === 'second').x).toBe(ref)
    const cont = timelineFor('future-continuous', { ref: 'x' })
    const span = cont.find((i) => i.id === 'main')
    expect(span.x).toBeLessThan(cont[0].x)
    expect(span.x + span.w).toBeGreaterThan(cont[0].x)
    const run = timelineFor('present-perfect-continuous', { ref: 'now' }).find((i) => i.id === 'main')
    expect(run.x + run.w).toBe(50) // 一路延伸到「現在」
  })
})

describe('detectTense', () => {
  it('recognises every example sentence as its own tense', () => {
    for (const s of SCENARIOS) {
      for (const key of TENSE_KEYS) {
        expect(detectTense(parseSentence(s.tenses[key].en).text, s), `${s.id} ${key}`).toBe(key)
      }
    }
  })

  it('handles learner sentences, adverbs in the middle and nonsense', () => {
    const g = findScenario('grandma')
    expect(detectTense('grandma has cooked dinner for us', g)).toBe('present-perfect')
    expect(detectTense('Grandma had already cooked dinner', g)).toBe('past-perfect')
    expect(detectTense('She cooked dinner', g)).toBe('past-simple')
    expect(detectTense('She is cooking!', g)).toBe('present-continuous')
    expect(detectTense('I like pizza', g)).toBe(null)
    expect(detectTense('', g)).toBe(null)
  })
})

describe('blankParts / orderWords', () => {
  const g = findScenario('grandma')
  it('blanks the verb phrase and accepts it with or without the adverb inside', () => {
    const p = blankParts(g, 'present-perfect')
    expect(p.before).toBe('Grandma')
    expect(p.after).toBe('dinner.')
    expect(p.answers).toEqual(['has already cooked', 'has cooked'])
    const q = blankParts(g, 'past-perfect')
    expect(q.answers).toEqual(['had cooked'])
    expect(q.after).toBe('dinner before I arrived.')
  })
  it('drops the sentence-final period but keeps p.m.', () => {
    expect(orderWords(g, 'present-continuous')).toEqual(['Grandma', 'is', 'cooking', 'now'])
    expect(orderWords(g, 'future-perfect').at(-1)).toBe('p.m.')
  })
})

describe('questions', () => {
  const g = findScenario('grandma')
  const h = findScenario('homework')
  const correctAnswer = (q, s) => {
    switch (q.type) {
      case 'picture':
      case 'listen':
        return q.key
      case 'fill':
      case 'transform':
        return q.answers[0]
      case 'order':
        return [...q.answer]
      case 'write':
        return parseSentence(s.tenses[q.key].en).text
    }
  }

  it('accepts the right answer for every type, tense and scenario', () => {
    const rng = seeded(7)
    for (const s of [g, h]) {
      for (const t of QUIZ_TYPES) {
        for (const key of TENSE_KEYS) {
          const q = makeQuestion(t.id, s, key, rng)
          expect(checkAnswer(q, s, correctAnswer(q, s)).ok, `${t.id} ${s.id} ${key}`).toBe(true)
        }
      }
    }
  })

  it('rejects wrong answers and reports which tense the learner used', () => {
    const rng = seeded(3)
    const fill = makeQuestion('fill', g, 'past-perfect', rng)
    expect(checkAnswer(fill, g, 'cooked')).toEqual({ ok: false, picked: 'past-simple' })
    expect(checkAnswer(fill, g, '  HAD   cooked ')).toEqual({ ok: true, picked: 'past-perfect' })
    const write = makeQuestion('write', h, 'present-perfect', rng)
    expect(checkAnswer(write, h, 'Lily did her homework.')).toEqual({ ok: false, picked: 'past-simple' })
    const pic = makeQuestion('picture', g, 'present-simple', rng)
    expect(checkAnswer(pic, g, 'present-continuous').ok).toBe(false)
    const order = makeQuestion('order', g, 'present-continuous', rng)
    expect(checkAnswer(order, g, ['is', 'Grandma', 'cooking', 'now']).ok).toBe(false)
  })

  it('builds picture options with the answer plus 3 distinct distractors, confusing ones first', () => {
    const d = distractors('present-perfect', 3, seeded(5))
    expect(d).toHaveLength(3)
    expect(d).not.toContain('present-perfect')
    expect(d.slice(0, 2).sort()).toEqual([...FORMS['present-perfect'].confused].sort())
    const q = makeQuestion('picture', g, 'present-perfect', seeded(5))
    expect(new Set(q.options).size).toBe(4)
    expect(q.options).toContain('present-perfect')
  })

  it('never hands out an order puzzle that is already solved', () => {
    for (let seed = 1; seed < 40; seed++) {
      const q = makeQuestion('order', g, 'present-continuous', seeded(seed))
      expect(q.chips.map((c) => c.text)).not.toEqual(q.answer)
    }
  })

  it('transforms from a different, easily confused tense', () => {
    const q = makeQuestion('transform', g, 'past-perfect', seeded(9))
    expect(FORMS['past-perfect'].confused).toContain(q.fromKey)
    expect(q.source).not.toContain('<')
  })

  it('builds a quiz of the requested size and mode', () => {
    const state = createTenseProgress()
    const mixed = buildQuiz({ mode: 'mixed', scenarios: SCENARIOS, state, count: 10, rng: seeded(11) })
    expect(mixed).toHaveLength(10)
    expect(new Set(mixed.map((q) => q.id)).size).toBe(10)
    const fill = buildQuiz({ mode: 'fill', scenarios: SCENARIOS, state, count: 8, rng: seeded(11) })
    expect(fill.every((q) => q.type === 'fill')).toBe(true)
  })

  it('focuses weak mode on the lowest-mastery tenses', () => {
    let state = createTenseProgress()
    const today = '2026-11-26'
    for (const key of TENSE_KEYS) {
      if (key === 'past-perfect') continue
      for (let i = 0; i < 5; i++) state = recordAnswer(state, { id: `x:${key}:${i}`, key }, true, today)
    }
    state = recordAnswer(state, { id: 'fill:grandma:past-perfect', key: 'past-perfect' }, false, today)
    expect(weakKeys(state, 1)).toEqual(['past-perfect'])
    const quiz = buildQuiz({ mode: 'weak', scenarios: SCENARIOS, state, count: 6, rng: seeded(2) })
    const keys = new Set(quiz.map((q) => q.key))
    expect(keys.has('past-perfect')).toBe(true)
    expect(keys.size).toBeLessThanOrEqual(4)
  })
})

describe('explain', () => {
  const g = findScenario('grandma')
  it('answers when, what state, why this auxiliary and why not the other tense', () => {
    const e = explain(g, 'past-perfect', 'past-simple')
    expect(e.time).toContain('before I arrived')
    expect(e.aspect).toContain('完成式')
    expect(e.aux).toContain('had')
    expect(e.picked.key).toBe('past-simple')
    expect(e.picked.text).toContain('過去簡單式')
    expect(e.picked.note).toBe(comparisonFor('past-simple', 'past-perfect').note)
    expect(e.others.every((o) => o.key !== 'past-simple' && o.text)).toBe(true)
  })
  it('explains time differences when the aspect matches', () => {
    expect(explain(g, 'future-perfect', 'present-perfect').picked.text).toContain('未來')
  })
  it('has no picked block when the answer was right or unknown', () => {
    expect(explain(g, 'past-simple', 'past-simple').picked).toBe(null)
    expect(explain(g, 'past-simple', null).picked).toBe(null)
  })
})

describe('tense progress', () => {
  const today = '2026-11-26'
  it('sanitizes garbage, old saves and missing fields without throwing', () => {
    expect(sanitizeTenseProgress(null)).toEqual(createTenseProgress())
    expect(sanitizeTenseProgress('x')).toEqual(createTenseProgress())
    expect(sanitizeTenseProgress({ version: 1 })).toEqual(createTenseProgress())
    const s = sanitizeTenseProgress({
      seen: { 'past-simple': true, nope: true },
      stages: { time: true, hack: true },
      tenses: { 'past-simple': { attempts: 2, correct: 9, streak: -1, last: 'bad' }, nope: { attempts: 1 } },
      wrong: { a: { key: 'past-simple', count: 0 }, b: { key: 'nope', count: 2 }, c: 'x' },
      compared: { 'ps-pc': true },
      calm: 'yes',
    })
    expect(s.seen).toEqual({ 'past-simple': true })
    expect(s.stages).toEqual({ time: true })
    expect(s.tenses['past-simple']).toEqual({ attempts: 2, correct: 2, streak: 0, last: null })
    expect(s.tenses.nope).toBeUndefined()
    expect(s.wrong).toEqual({ a: { key: 'past-simple', count: 1, last: null } })
    expect(s.compared).toEqual({ 'ps-pc': true })
    expect(s.calm).toBe(false)
  })

  it('records answers, keeps wrong questions until answered right, and grows mastery', () => {
    let s = createTenseProgress()
    const q = { id: 'fill:grandma:past-perfect', key: 'past-perfect' }
    s = recordAnswer(s, q, false, today)
    expect(s.wrong[q.id]).toEqual({ key: 'past-perfect', count: 1, last: today })
    expect(mastery(s, 'past-perfect')).toBe(0)
    s = recordAnswer(s, q, true, today)
    expect(s.wrong[q.id]).toBeUndefined()
    expect(s.tenses['past-perfect']).toEqual({ attempts: 2, correct: 1, streak: 1, last: today })
    for (let i = 0; i < 8; i++) s = recordAnswer(s, q, true, today)
    expect(mastery(s, 'past-perfect')).toBe(0.9)
    expect(overall(s).attempts).toBe(10)
  })

  it('completes the six stages from what the learner did', () => {
    let s = createTenseProgress()
    expect(stageStatus(s).every((x) => !x.done)).toBe(true)
    s = markStage(markStage(s, 'time'), 'aspect')
    for (const k of TENSE_KEYS) s = markSeen(s, k)
    s = markStage(s, 'rhythm')
    for (const c of COMPARISONS.slice(0, 3)) s = markCompared(s, c.id)
    s = markStage(s, 'quiz')
    expect(stageStatus(s).map((x) => x.done)).toEqual([true, true, true, true, true, true])
    expect(markSeen(s, 'past-simple')).toBe(s) // 沒變就回傳同一個物件，不觸發存檔
  })

  it('names preset pairs by id and custom pairs order-independently', () => {
    expect(pairId('present-continuous', 'present-simple')).toBe('ps-pc')
    expect(pairId('future-continuous', 'past-simple')).toBe(pairId('past-simple', 'future-continuous'))
  })

  it('scores shadowing by word overlap with the best recognition candidate', () => {
    expect(spokenMatch('Grandma is cooking now.', ['grandma is looking now', 'Grandma is cooking now'])).toEqual({
      ratio: 1,
      text: 'Grandma is cooking now',
    })
    expect(spokenMatch('Grandma is cooking now.', ['grandma is']).ratio).toBe(0.5)
    expect(spokenMatch('Grandma is cooking now.', [])).toEqual({ ratio: 0, text: '' })
  })

  it('normalizes punctuation, case and curly quotes', () => {
    expect(normalize("  Lily HAS been doing it since four o’clock! ")).toBe("lily has been doing it since four o'clock")
  })
})
