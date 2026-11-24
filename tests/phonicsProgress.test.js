import { describe, it, expect } from 'vitest'
import { LONG_VOWELS } from '../src/data/phonics/longVowels.js'
import { courseIndex } from '../src/logic/phonics.js'
import {
  createPhonicsProgress,
  sanitizePhonicsProgress,
  courseProgress,
  recordResults,
  markLessonSeen,
  difficultyLevel,
  planSession,
  tutorReport,
  weakestPatterns,
  topConfusions,
  groupMastery,
  MAX_BOX,
} from '../src/logic/phonicsProgress.js'

function seeded(seed = 1) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const C = 'long-vowels'
const idx = courseIndex(LONG_VOWELS)
const r = (en, correct, chosenSound = null) => {
  const w = idx.word[en]
  return { en, patternId: w.patternId, soundId: w.soundId, chosenSound, correct }
}

describe('記錄答題', () => {
  it('答對 +1、答錯 -2，熟練度在 0–5 之間', () => {
    let s = createPhonicsProgress()
    for (let i = 0; i < 7; i++) s = recordResults(s, C, [r('rain', true)])
    expect(courseProgress(s, C).patterns['a-ai'].box).toBe(MAX_BOX)
    s = recordResults(s, C, [r('rain', false)])
    expect(courseProgress(s, C).patterns['a-ai'].box).toBe(MAX_BOX - 2)
    for (let i = 0; i < 5; i++) s = recordResults(s, C, [r('rain', false)])
    expect(courseProgress(s, C).patterns['a-ai'].box).toBe(0)
  })

  it('記錄錯題與易混淆的母音，答對時錯題次數遞減', () => {
    let s = recordResults(createPhonicsProgress(), C, [r('rain', false, 'e-long'), r('rain', false, 'e-long')])
    let cp = courseProgress(s, C)
    expect(cp.wrong.rain).toBe(2)
    expect(cp.confusions['a-long>e-long']).toBe(2)
    s = recordResults(s, C, [r('rain', true), r('rain', true)])
    expect(courseProgress(s, C).wrong.rain).toBeUndefined()
  })

  it('完整練習才記錄場次；每日複習記錄日期', () => {
    let s = recordResults(createPhonicsProgress(), C, [r('rain', true)])
    expect(courseProgress(s, C).sessions).toHaveLength(0)
    s = recordResults(s, C, [r('rain', true), r('bee', false)], { mode: 'daily', today: '2026-11-24' })
    const cp = courseProgress(s, C)
    expect(cp.sessions).toEqual([{ date: '2026-11-24', mode: 'daily', correct: 1, total: 2 }])
    expect(cp.dailyDate).toBe('2026-11-24')
    expect(cp.log.bee).toBe('2026-11-24')
  })

  it('不修改傳入的進度', () => {
    const s = createPhonicsProgress()
    recordResults(s, C, [r('rain', true)])
    markLessonSeen(s, C, 'a')
    expect(s.courses).toEqual({})
  })
})

describe('讀取存檔', () => {
  it('格式錯誤或版本不符就重新開始', () => {
    expect(sanitizePhonicsProgress(null)).toEqual(createPhonicsProgress())
    expect(sanitizePhonicsProgress({ version: 99, courses: {} })).toEqual(createPhonicsProgress())
  })

  it('保留合法資料、丟掉壞欄位', () => {
    const out = sanitizePhonicsProgress({
      version: 1,
      courses: {
        [C]: {
          patterns: { 'a-ai': { box: 99, correct: 3, total: 4, last: 'bad' }, x: 'nope' },
          wrong: { rain: 2, bee: -1 },
          log: { rain: '2026-11-01', bee: 'x' },
          sessions: [{ date: '2026-11-01', mode: 'test', correct: 5, total: 6 }, { nope: 1 }],
          lessons: ['a', 3],
          dailyDate: 'x',
        },
      },
    })
    const cp = out.courses[C]
    expect(cp.patterns['a-ai']).toEqual({ box: MAX_BOX, correct: 3, total: 4, last: null })
    expect(cp.patterns.x).toBeUndefined()
    expect(cp.wrong).toEqual({ rain: 2 })
    expect(cp.log).toEqual({ rain: '2026-11-01' })
    expect(cp.sessions).toHaveLength(1)
    expect(cp.lessons).toEqual(['a'])
    expect(cp.dailyDate).toBeNull()
    expect(cp.confusions).toEqual({})
  })
})

describe('難度與出題計畫', () => {
  it('新手從難度 1 開始，熟練後升級', () => {
    let s = createPhonicsProgress()
    expect(difficultyLevel(idx, courseProgress(s, C))).toBe(1)
    for (const en of ['rain', 'play', 'name', 'bee']) for (let i = 0; i < 4; i++) s = recordResults(s, C, [r(en, true)])
    expect(difficultyLevel(idx, courseProgress(s, C))).toBe(3)
  })

  it('每題都有答案在選項裡；難度 1 只出入門題型、三個選項', () => {
    const { level, questions } = planSession(LONG_VOWELS, courseProgress(createPhonicsProgress(), C), { mode: 'practice' }, seeded(5))
    expect(level).toBe(1)
    expect(questions.length).toBe(10)
    for (const q of questions) {
      expect(['listen-vowel', 'pick-pattern', 'pair']).toContain(q.type)
      expect(q.options.map((o) => o.value)).toContain(q.answer)
      expect(q.options.length).toBeLessThanOrEqual(3)
    }
  })

  it('指定母音練習只出該母音的字', () => {
    const { questions } = planSession(LONG_VOWELS, courseProgress(createPhonicsProgress(), C), { mode: 'practice', groupId: 'o' }, seeded(9))
    expect(questions.every((q) => idx.pattern[q.patternId].groupId === 'o')).toBe(true)
  })

  it('綜合測驗涵蓋六個長母音並使用所有題型', () => {
    const { level, questions } = planSession(LONG_VOWELS, courseProgress(createPhonicsProgress(), C), { mode: 'test' }, seeded(11))
    expect(level).toBe(3)
    expect(new Set(questions.map((q) => q.soundId)).size).toBe(6)
    expect(new Set(questions.map((q) => q.type)).size).toBeGreaterThanOrEqual(5)
  })

  it('弱項加強優先出錯題與易混淆母音', () => {
    let s = createPhonicsProgress()
    for (let i = 0; i < 3; i++) s = recordResults(s, C, [r('night', false, 'e-long'), r('bike', false, 'e-long'), r('high', false)])
    for (let i = 0; i < 5; i++) s = recordResults(s, C, [r('boat', true), r('snow', true)])
    const { questions } = planSession(LONG_VOWELS, courseProgress(s, C), { mode: 'weak' }, seeded(2))
    const groups = questions.map((q) => idx.pattern[q.patternId].groupId)
    expect(groups.filter((g) => g === 'i').length).toBeGreaterThan(questions.length / 2)
  })
})

describe('AI 導師', () => {
  it('第一次使用：建議從 A 的 STEP 1 開始', () => {
    const rep = tutorReport(LONG_VOWELS, courseProgress(createPhonicsProgress(), C), '2026-11-24')
    expect(rep.next.to).toEqual({ name: 'phonics-lesson', params: { course: C, group: 'a' } })
    expect(rep.messages[0]).toContain('先聽聲音')
  })

  it('找出易混淆的母音、弱項拼法與延伸單字', () => {
    let s = createPhonicsProgress()
    for (let i = 0; i < 3; i++) s = recordResults(s, C, [r('rain', false, 'e-long'), r('play', true)])
    const cp = courseProgress(s, C)
    expect(topConfusions(idx, cp)[0]).toMatchObject({ soundId: 'a-long', chosen: 'e-long', times: 3 })
    expect(weakestPatterns(idx, cp)[0].id).toBe('a-ai')
    const rep = tutorReport(LONG_VOWELS, cp, '2026-11-24')
    expect(rep.messages.join('')).toContain('/eɪ/')
    expect(rep.extension.map((w) => w.en)).toContain('sail')
    expect(rep.next.to.params.mode).toBe('weak')
  })

  it('穩定之後建議每日複習或綜合測驗', () => {
    let s = createPhonicsProgress()
    for (const w of idx.words) for (let i = 0; i < MAX_BOX; i++) s = recordResults(s, C, [r(w.en, true)])
    let rep = tutorReport(LONG_VOWELS, courseProgress(s, C), '2026-11-24')
    expect(rep.next.to.params.mode).toBe('daily')
    s = recordResults(s, C, [r('rain', true)], { mode: 'daily', today: '2026-11-24' })
    rep = tutorReport(LONG_VOWELS, courseProgress(s, C), '2026-11-24')
    expect(rep.next.to.params.mode).toBe('test')
    expect(groupMastery(idx, courseProgress(s, C), 'a')).toBe(1)
  })
})
