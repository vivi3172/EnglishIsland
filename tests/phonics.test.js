import { describe, it, expect } from 'vitest'
import { LONG_VOWELS } from '../src/data/phonics/longVowels.js'
import { PHONEMES } from '../src/data/phonics/phonemes.js'
import { PHONICS_COURSES, findCourse } from '../src/data/phonics/index.js'
import {
  courseIndex,
  highlightIndices,
  wordSegments,
  blendSteps,
  maskedWord,
  respell,
  buildQuestion,
  explainAnswer,
  chosenSoundOf,
  matchesSpoken,
  spellingsOfSound,
  isSplitPattern,
} from '../src/logic/phonics.js'

// 固定亂數，讓出題結果可重現
function seeded(seed = 1) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const idx = courseIndex(LONG_VOWELS)
const all = [...idx.words, ...idx.extras]

describe('長母音教材內容', () => {
  it('五根手指、六個長母音音', () => {
    expect(idx.groups.map((g) => g.key)).toEqual(['A', 'E', 'I', 'O', 'U'])
    expect(idx.sounds.map((s) => s.ipa)).toEqual(['eɪ', 'iː', 'aɪ', 'oʊ', 'juː', 'uː'])
    expect(new Set(idx.groups.map((g) => g.color)).size).toBe(5)
  })

  it('包含需求表列出的拼字組合', () => {
    const spell = (soundId) => spellingsOfSound(idx, soundId).sort()
    expect(spell('a-long')).toEqual(['a_e', 'ai', 'ay'])
    expect(spell('e-long')).toEqual(['e_e', 'ea', 'ee', 'ey'])
    expect(spell('i-long')).toEqual(['i_e', 'ie', 'igh'])
    expect(spell('o-long')).toEqual(['o_e', 'oa', 'oe', 'ow'])
    expect(spell('u-yoo')).toEqual(['ew', 'u_e', 'ue'])
    expect(spell('u-oo')).toEqual(['ew', 'oo', 'u_e', 'ue', 'ui'])
  })

  it('單字不重複，且字母拆解拼回原字', () => {
    expect(new Set(all.map((w) => w.en)).size).toBe(all.length)
    for (const w of all) {
      expect(w.g.join(''), w.en).toBe(w.en)
      expect(w.p.length, w.en).toBe(w.g.length)
    }
  })

  it('每個音素都在音素表裡（才能做拼讀示範）', () => {
    for (const w of all) for (const p of w.p) if (p) expect(PHONEMES[p], `${w.en}: ${p}`).toBeTruthy()
  })

  it('每個字都能標出母音拼字組合的位置', () => {
    for (const w of all) {
      const pattern = idx.pattern[w.patternId]
      const hl = highlightIndices(w, pattern, idx.sound[w.soundId])
      const letters = hl.map((i) => w.g[i].toLowerCase()).join('_')
      expect(letters, w.en).toBe(isSplitPattern(pattern.spelling) ? pattern.spelling : pattern.spelling)
    }
  })

  it('每個字都有中文、IPA、例句與翻譯；每個拼法至少兩個課程字', () => {
    for (const w of all) {
      expect(w.zh && w.ipa && w.example && w.exampleZh, w.en).toBeTruthy()
      expect(w.example.toLowerCase(), w.en).toContain(w.en.toLowerCase().slice(0, 3))
    }
    for (const p of idx.patterns) expect(p.words.length, p.id).toBeGreaterThanOrEqual(2)
  })

  it('每個母音都有口型說明與例外說明', () => {
    for (const s of idx.sounds) expect(s.mouth.length).toBeGreaterThan(10)
    for (const g of idx.groups) expect(g.exceptions.length).toBeGreaterThan(0)
  })

  it('長短母音比較組都指向存在的拼法與短母音', () => {
    expect(idx.pairs.length).toBeGreaterThanOrEqual(5)
    for (const pair of idx.pairs) {
      expect(idx.pattern[pair.patternId], pair.id).toBeTruthy()
      expect(idx.shortSounds[pair.shortSound], pair.id).toBeTruthy()
      expect(pair.long.en.toLowerCase()).toBe(pair.short.en + 'e')
    }
  })

  it('課程註冊表只回傳已完成的課程', () => {
    expect(findCourse('long-vowels')).toBe(LONG_VOWELS)
    expect(findCourse('short-vowels')).toBeNull()
    expect(PHONICS_COURSES.length).toBeGreaterThan(5)
  })
})

describe('拼字上色、拆解與挖空', () => {
  it('分離拼法標出母音與字尾 e，e 不發音', () => {
    const segs = wordSegments(idx, idx.word.name)
    expect(segs.map((s) => s.hl)).toEqual([false, true, false, true])
    expect(segs[3].silent).toBe(true)
  })

  it('拼讀步驟跳過不發音字母：rain → r + eɪ + n、bike → b + aɪ + k、snow → s + n + oʊ', () => {
    expect(blendSteps(idx, idx.word.rain).map((s) => s.phoneme)).toEqual(['r', 'eɪ', 'n'])
    expect(blendSteps(idx, idx.word.bike).map((s) => s.phoneme)).toEqual(['b', 'aɪ', 'k'])
    expect(blendSteps(idx, idx.word.snow).map((s) => s.phoneme)).toEqual(['s', 'n', 'oʊ'])
  })

  it('輕讀的 ey 仍標出拼字組合（money）', () => {
    expect(wordSegments(idx, idx.word.money).filter((s) => s.hl).map((s) => s.text)).toEqual(['ey'])
  })

  it('挖空與換拼法', () => {
    expect(maskedWord(idx, idx.word.rain).map((m) => m.text).join('')).toBe('r__n')
    expect(maskedWord(idx, idx.word.name).map((m) => m.text).join('')).toBe('n_m_')
    expect(respell(idx, idx.word.rain, 'a_e')).toBe('rane')
    expect(respell(idx, idx.word.name, 'ai')).toBe('naim')
    expect(respell(idx, idx.word.meet, 'ea')).toBe('meat')
  })
})

describe('出題', () => {
  const rng = seeded(7)

  it('各題型的正確答案都在選項裡，選項不重複', () => {
    for (const type of ['listen-word', 'listen-vowel', 'pick-pattern', 'fill-blank', 'decode']) {
      for (const w of idx.words) {
        const q = buildQuestion(idx, type, w, { optionCount: 4, rng })
        if (!q) continue
        const values = q.options.map((o) => o.value)
        expect(values, `${type} ${w.en}`).toContain(q.answer)
        expect(new Set(values).size).toBe(values.length)
      }
    }
  })

  it('聽音選字的干擾選項都是不同的母音', () => {
    const q = buildQuestion(idx, 'listen-word', idx.word.rain, { rng })
    const sounds = q.options.map((o) => idx.word[o.value].soundId)
    expect(new Set(sounds).size).toBe(sounds.length)
  })

  it('選字母組合的干擾選項不會是同一個音的拼法', () => {
    const q = buildQuestion(idx, 'pick-pattern', idx.word.cube, { rng })
    const own = spellingsOfSound(idx, 'u-yoo')
    expect(q.options.filter((o) => o.value !== q.answer).every((o) => !own.includes(o.value))).toBe(true)
  })

  it('填空排除會拼成同音字的選項（meet 不出 ea）', () => {
    for (let i = 0; i < 20; i++) {
      const q = buildQuestion(idx, 'fill-blank', idx.word.meet, { rng })
      expect(q.options.map((o) => o.value)).not.toContain('ea')
    }
  })

  it('輕讀字不出聽母音題', () => {
    expect(buildQuestion(idx, 'listen-vowel', idx.word.money, { rng })).toBeNull()
  })

  it('長短母音比較題', () => {
    const pair = idx.pairs[0]
    const q = buildQuestion(idx, 'pair', pair, { rng })
    expect(q.options.map((o) => o.value).sort()).toEqual([pair.long.en, pair.short.en].sort())
    expect(q.say).toBe(q.answer)
    expect(chosenSoundOf(idx, q, pair.short.en)).toBe('short-a')
  })
})

describe('答題解說', () => {
  const rng = seeded(3)

  it('答錯時說明規則與錯誤原因', () => {
    const q = buildQuestion(idx, 'listen-vowel', idx.word.rain, { rng })
    const wrong = q.options.find((o) => o.value !== q.answer).value
    const out = explainAnswer(idx, q, wrong)
    expect(out.correct).toBe(false)
    expect(out.lines.length).toBeGreaterThanOrEqual(3)
    expect(out.lines.join('')).toContain('/eɪ/')
  })

  it('每種題型答錯都有至少兩行解說', () => {
    const cases = [
      ['listen-word', idx.word.boat],
      ['pick-pattern', idx.word.night],
      ['fill-blank', idx.word.play],
      ['decode', idx.word.sail],
      ['pair', idx.pairs[3]],
    ]
    for (const [type, target] of cases) {
      const q = buildQuestion(idx, type, target, { rng })
      const wrong = q.options.find((o) => o.value !== q.answer).value
      const out = explainAnswer(idx, q, wrong)
      expect(out.correct, type).toBe(false)
      expect(out.lines.length, type).toBeGreaterThanOrEqual(2)
    }
  })

  it('答對也會簡短說明規則', () => {
    const q = buildQuestion(idx, 'fill-blank', idx.word.play, { rng })
    const out = explainAnswer(idx, q, q.answer)
    expect(out.correct).toBe(true)
    expect(out.lines.join('')).toContain('ay')
  })
})

describe('麥克風跟讀比對', () => {
  it('接受目標字與同音字，不分大小寫', () => {
    expect(matchesSpoken(idx.word.right, ['Write'])).toBe(true)
    expect(matchesSpoken(idx.word.high, ['hi there'])).toBe(true)
    expect(matchesSpoken(idx.word.rain, ['ran', 'run'])).toBe(false)
  })
})
