// 純邏輯：自然發音課程的內容索引、拼字上色、音素拆解、出題與答題解說。
// 不碰學習進度（見 phonicsProgress.js）；rng 可注入，方便測試。
import { PHONEMES } from '../data/phonics/phonemes.js'
import { shuffle } from './quiz.js'

// ---------- 內容索引 ----------
const indexCache = new WeakMap()

// 把巢狀的課程資料攤平成方便查詢的清單與對照表
export function courseIndex(course) {
  if (indexCache.has(course)) return indexCache.get(course)
  const groups = []
  const sounds = []
  const patterns = []
  const words = []
  const extras = []
  for (const group of course.groups) {
    groups.push(group)
    for (const sound of group.sounds) {
      sounds.push({ ...sound, groupId: group.id, key: group.key, color: group.color })
      for (const pattern of sound.patterns) {
        const meta = { patternId: pattern.id, soundId: sound.id, groupId: group.id, color: group.color }
        patterns.push({ ...pattern, soundId: sound.id, groupId: group.id, color: group.color })
        for (const word of pattern.words) words.push({ ...word, ...meta, extra: false })
        for (const word of pattern.extra ?? []) extras.push({ ...word, ...meta, extra: true })
      }
    }
  }
  const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]))
  const idx = {
    course,
    groups,
    sounds,
    patterns,
    words,
    extras,
    group: byId(groups),
    sound: byId(sounds),
    pattern: byId(patterns),
    word: Object.fromEntries([...words, ...extras].map((x) => [x.en, x])),
    shortSounds: course.shortSounds ?? {},
    pairs: course.pairs ?? [],
  }
  indexCache.set(course, idx)
  return idx
}

export const isSplitPattern = (spelling) => spelling.includes('_')

// 某個音的所有拼法（去除重複，例如 /uː/ 與 /juː/ 都有 u_e）
export function spellingsOfSound(idx, soundId) {
  return [...new Set(idx.patterns.filter((p) => p.soundId === soundId).map((p) => p.spelling))]
}

// 任何音的標籤：長母音用 sound.label，比較組的短母音用 shortSounds
export function soundLabel(idx, soundId) {
  const s = idx.sound[soundId] ?? idx.shortSounds[soundId]
  return s ? `${s.label} /${s.ipa}/` : soundId
}

// ---------- 拼字上色與音素拆解 ----------
// 回傳屬於這個母音拼字組合的 grapheme 位置。
// 一般拼法（ai）：grapheme 等於拼法、且發的正是這個音的位置。
// 分離拼法（a_e）：母音字母 + 字尾不發音的 e。
export function highlightIndices(word, pattern, sound) {
  const head = isSplitPattern(pattern.spelling) ? pattern.spelling.split('_')[0] : pattern.spelling
  const same = (g) => g.toLowerCase() === head
  let at = word.g.findIndex((g, i) => same(g) && word.p[i] === sound.ipa)
  if (at < 0) at = word.g.findIndex((g, i) => same(g) && word.p[i] !== '')
  if (at < 0) return []
  const out = [at]
  const last = word.g.length - 1
  if (isSplitPattern(pattern.spelling) && last > at && word.g[last] === 'e' && word.p[last] === '') out.push(last)
  return out
}

// 給畫面使用：每個 grapheme 是否要上色、是否不發音、對應音素
export function wordSegments(idx, word) {
  const hl = new Set(highlightIndices(word, idx.pattern[word.patternId], idx.sound[word.soundId]))
  return word.g.map((text, i) => ({ text, phoneme: word.p[i], hl: hl.has(i), silent: word.p[i] === '' }))
}

// 拼讀示範的步驟：依序唸出每個有發音的部分
export function blendSteps(idx, word) {
  return wordSegments(idx, word)
    .map((seg, index) => ({ ...seg, index }))
    .filter((seg) => !seg.silent)
    .map((seg) => ({ ...seg, say: PHONEMES[seg.phoneme]?.say ?? seg.text, hint: PHONEMES[seg.phoneme]?.zh ?? '' }))
}

// 把母音拼字組合挖空：name → n _ m _、rain → r _ _ n
export function maskedWord(idx, word) {
  return wordSegments(idx, word).map((seg) => (seg.hl ? { text: '_'.repeat(seg.text.length), blank: true } : { text: seg.text, blank: false }))
}

// 用另一種拼法填進挖空處，得到的拼字（用來排除「剛好拼成同音字」的選項）
export function respell(idx, word, spelling) {
  const hl = highlightIndices(word, idx.pattern[word.patternId], idx.sound[word.soundId])
  const head = hl[0]
  const parts = word.g.map((g, i) => (hl.includes(i) ? '' : g))
  if (isSplitPattern(spelling)) {
    parts[head] = spelling[0]
    parts.push('e')
  } else {
    parts[head] = spelling
  }
  return parts.join('').toLowerCase()
}

// ---------- 出題 ----------
// 題型：
//   listen-word   聽聲音選單字
//   listen-vowel  聽聲音選母音
//   pick-pattern  選出這個字用的字母組合
//   fill-blank    單字填空（同一個音的不同拼法，考位置規則）
//   decode        陌生單字拼讀：看沒學過的字，判斷標色字母組合的發音
//   pair          長短母音比較：聽音選 cap / cape
export const QUESTION_TYPES = ['listen-word', 'listen-vowel', 'pick-pattern', 'fill-blank', 'decode', 'pair']

export const TYPE_LABELS = {
  'listen-word': { code: 'LISTEN · WORD', zh: '聽聲音，選出聽到的單字' },
  'listen-vowel': { code: 'LISTEN · VOWEL', zh: '聽聲音，這個字的長母音是哪一個？' },
  'pick-pattern': { code: 'SPELLING', zh: '這個字的母音是用哪一個字母組合拼的？' },
  'fill-blank': { code: 'FILL', zh: '填入正確的字母組合' },
  decode: { code: 'DECODE', zh: '陌生單字挑戰：標色的字母組合怎麼唸？' },
  pair: { code: 'SHORT / LONG', zh: '長音還是短音？選出聽到的字' },
}

const soundOption = (s) => ({ value: s.id, label: `/${s.ipa}/`, sub: s.label, color: s.color })
const wordOption = (w) => ({ value: w.en, label: w.en, sub: w.zh })

function pickDistinct(list, n, rng, keyOf = (x) => x) {
  const seen = new Set()
  const out = []
  for (const x of shuffle(list, rng)) {
    const k = keyOf(x)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(x)
    if (out.length >= n) break
  }
  return out
}

// 回傳題目；這個字不適合這種題型時回傳 null（例如輕讀的 money 不適合聽母音）
export function buildQuestion(idx, type, target, { optionCount = 4, rng = Math.random } = {}) {
  if (type === 'pair') return buildPairQuestion(idx, target, rng)
  const word = target
  const sound = idx.sound[word.soundId]
  const pattern = idx.pattern[word.patternId]
  const base = { type, word, patternId: word.patternId, soundId: word.soundId, say: word.en }

  if (type === 'listen-word') {
    // 干擾選項來自其他母音，學習者要靠聽母音分辨
    const others = idx.words.filter((w) => w.soundId !== word.soundId && w.en !== word.en)
    const distractors = pickDistinct(others, optionCount - 1, rng, (w) => w.soundId)
    return { ...base, options: shuffle([word, ...distractors], rng).map(wordOption), answer: word.en }
  }

  if (type === 'listen-vowel' || type === 'decode') {
    if (type === 'listen-vowel' && word.p.every((p) => p !== sound.ipa)) return null
    const distractors = pickDistinct(idx.sounds.filter((s) => s.id !== sound.id), optionCount - 1, rng)
    return { ...base, options: shuffle([sound, ...distractors], rng).map(soundOption), answer: sound.id }
  }

  if (type === 'pick-pattern') {
    const own = new Set(spellingsOfSound(idx, sound.id))
    const others = idx.patterns.filter((p) => !own.has(p.spelling))
    const distractors = pickDistinct(others, optionCount - 1, rng, (p) => p.spelling)
    const options = shuffle([pattern, ...distractors], rng).map((p) => ({ value: p.spelling, label: p.spelling, color: p.color }))
    return { ...base, options, answer: pattern.spelling }
  }

  if (type === 'fill-blank') {
    // 同一個音的其他拼法；剛好拼成同音字（meet → meat）的選項會被排除，避免兩個答案都對
    const homophones = new Set(word.homophones.map((h) => h.toLowerCase()))
    const alternatives = spellingsOfSound(idx, sound.id).filter((s) => s !== pattern.spelling && !homophones.has(respell(idx, word, s)))
    if (!alternatives.length) return null
    const picked = shuffle(alternatives, rng).slice(0, optionCount - 1)
    const options = shuffle([pattern.spelling, ...picked], rng).map((s) => ({ value: s, label: s, color: sound.color }))
    return { ...base, options, answer: pattern.spelling, masked: maskedWord(idx, word) }
  }

  return null
}

function buildPairQuestion(idx, pair, rng) {
  const target = rng() < 0.5 ? 'short' : 'long'
  const options = shuffle([pair.short, pair.long], rng).map(wordOption)
  const sound = idx.sound[idx.pattern[pair.patternId].soundId]
  return { type: 'pair', pair, target, patternId: pair.patternId, soundId: sound.id, say: pair[target].en, options, answer: pair[target].en }
}

// 這次作答「選到的音」，給導師分析易混淆的母音用
export function chosenSoundOf(idx, q, value) {
  if (q.type === 'listen-vowel' || q.type === 'decode') return value
  if (q.type === 'listen-word') return idx.word[value]?.soundId ?? null
  if (q.type === 'pair') return value === q.pair.short.en ? q.pair.shortSound : q.soundId
  if (q.type === 'pick-pattern') return idx.patterns.find((p) => p.spelling === value)?.soundId ?? null
  return null
}

// ---------- 答題解說 ----------
const firstSentence = (text) => (text.split('。')[0] ?? text) + '。'

// 不論對錯都說明規則；答錯時另外說明「你選的為什麼不對」
export function explainAnswer(idx, q, value) {
  const correct = value === q.answer
  const lines = []
  if (q.type === 'pair') {
    const { pair } = q
    const key = idx.group[pair.groupId].key
    const short = idx.shortSounds[pair.shortSound]
    const heard = pair[q.target]
    if (!correct) lines.push(`聽到的是 ${heard.en} /${heard.ipa}/，不是 ${value}。`)
    lines.push(`${pair.long.en} 字尾有不發音的 e，${key} 唸長音 /${pair.long.ipa}/；${pair.short.en} 沒有 e，${key} 唸短音 /${pair.short.ipa}/。`)
    lines.push(`短音口型：${short.mouth}`)
    return { correct, lines }
  }

  const { word } = q
  const sound = idx.sound[word.soundId]
  const pattern = idx.pattern[word.patternId]
  const core = `${word.en} /${word.ipa}/ 的 ${pattern.spelling} 唸 ${sound.label} /${sound.ipa}/。`

  if (correct) {
    lines.push(core)
    if (q.type === 'fill-blank') lines.push(`位置：${pattern.position}。`)
    if (q.type === 'decode') lines.push(`看到 ${pattern.spelling}，就先試著唸 /${sound.ipa}/，再把前後的子音接起來。`)
    return { correct, lines }
  }

  if (q.type === 'listen-word') {
    const chosen = idx.word[value]
    const cs = idx.sound[chosen.soundId]
    const cp = idx.pattern[chosen.patternId]
    lines.push(`你選的 ${chosen.en} 裡 ${cp.spelling} 唸 /${cs.ipa}/（${cs.label}），但聽到的字是 ${word.en}。`)
    lines.push(core)
    lines.push(`分辨訣竅：/${sound.ipa}/ ${firstSentence(sound.mouth)}`)
  } else if (q.type === 'listen-vowel' || q.type === 'decode') {
    const cs = idx.sound[value]
    lines.push(core)
    lines.push(`你選的 /${cs.ipa}/ 常見拼法是 ${spellingsOfSound(idx, cs.id).join('、')}，例如 ${cs.anchor}。`)
    lines.push(q.type === 'decode' ? `規則：${pattern.rule}` : `分辨訣竅：/${sound.ipa}/ ${firstSentence(sound.mouth)}`)
  } else if (q.type === 'pick-pattern') {
    const cp = idx.patterns.find((p) => p.spelling === value)
    const cs = idx.sound[cp.soundId]
    lines.push(`${value} 是 /${cs.ipa}/ 的拼法（例如 ${cp.words[0].en}），發不出 /${sound.ipa}/。`)
    lines.push(core)
    lines.push(`規則：${pattern.rule}`)
  } else if (q.type === 'fill-blank') {
    const cp = idx.patterns.find((p) => p.soundId === sound.id && p.spelling === value)
    lines.push(`${value} 雖然也唸 /${sound.ipa}/，但這個字要寫成 ${word.en}。`)
    lines.push(`${pattern.spelling} 的位置：${pattern.position}。${pattern.rule}`)
    if (cp) lines.push(`${value} 通常出現在：${cp.position}。`)
  }
  return { correct, lines }
}

// ---------- 麥克風跟讀 ----------
const normalizeSpoken = (s) => String(s ?? '').toLowerCase().replace(/[^a-z\s']/g, ' ').split(/\s+/).filter(Boolean)

// 語音辨識結果（可能有多個候選）裡，只要有一個詞是目標字或其同音字就算通過
export function matchesSpoken(word, transcripts) {
  const accepted = new Set([word.en, ...(word.homophones ?? [])].map((x) => x.toLowerCase()))
  return transcripts.some((t) => normalizeSpoken(t).some((token) => accepted.has(token)))
}
