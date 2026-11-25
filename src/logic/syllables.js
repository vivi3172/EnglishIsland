// 純邏輯：音節切分（一元一輔切）。標元音／輔音、判斷型態、建議切法、出題、答錯解說。
import { shuffle } from './quiz.js'

export const VOWELS = 'aeiou'
export const CHOP_LENGTH = 10

export const isVowel = (ch) => VOWELS.includes(ch.toLowerCase())

// 每個字母標 V 或 C（本課把 y 當輔音；收錄的字不靠 y 當元音）
export function letterKinds(en) {
  return [...en].map((ch) => (isVowel(ch) ? 'V' : 'C'))
}

// 連續的元音算一組（ai、ou、ee 合起來只有一個元音的聲音）：[[start, end)]
export function vowelGroups(en) {
  const groups = []
  for (let i = 0; i < en.length; i++) {
    if (!isVowel(en[i])) continue
    const start = i
    while (i + 1 < en.length && isVowel(en[i + 1])) i++
    groups.push([start, i + 1])
  }
  return groups
}

// 前兩組元音之間夾幾個輔音 → 'VCV' | 'VCCV' | 'VCCCV'…；元音不到兩組回傳 null
export function analyze(en) {
  const groups = vowelGroups(en)
  if (groups.length < 2) return null
  const gapStart = groups[0][1]
  const gapEnd = groups[1][0]
  const consonants = gapEnd - gapStart
  return { gapStart, gapEnd, consonants, pattern: `V${'C'.repeat(consonants)}V` }
}

const CLE = /[^aeiou]le$/

// 「試試任何單字」用：依規則給出第一刀建議（不知道是不是複合字，所以不判斷複合字）
// 回傳 { cut, ruleId } 或 null（只有一個音節）
export function suggestCut(en, digraphs = []) {
  const word = en.toLowerCase()
  if (CLE.test(word) && word.length > 4) return { cut: word.length - 3, ruleId: 'cle' }
  const a = analyze(word)
  if (!a) return null
  if (a.consonants === 1) return { cut: a.gapStart, ruleId: 'vcv-open' }
  if (a.consonants === 2) {
    // ck、sh 這類二合字母當作一個輔音，不能切開 → 當成一元一輔
    if (digraphs.includes(word.slice(a.gapStart, a.gapEnd))) return { cut: a.gapEnd, ruleId: 'digraph' }
    return { cut: a.gapStart + 1, ruleId: 'vccv' }
  }
  if (a.consonants === 0) return { cut: a.gapStart, ruleId: 'vv' }
  // 三個以上輔音：通常切在第一個輔音後（hun·dred），剩下的是常見組合
  return { cut: a.gapStart + 1, ruleId: 'vcccv' }
}

export const cutOf = (word) => word.parts[0].length

// 前一段以元音結尾 = 開音節 → 長音；以輔音結尾 = 閉音節 → 短音
export function firstVowel(word, rule) {
  if (!rule.vowel) return null
  return isVowel(word.parts[0].slice(-1)) ? 'long' : 'short'
}

// TTS 用的音節發音：資料有 say 用 say；「輔音 + le」轉成 bull、tull…近似音
export function sayParts(word) {
  if (word.say) return word.say
  return word.parts.map((p) => (/^[^aeiou]le$/.test(p) ? `${p[0]}ull` : p))
}

export function courseWords(course) {
  return course.rules.flatMap((rule) => rule.words.map((w) => ({ ...w, ruleId: rule.id })))
}

export const findRule = (course, id) => course.rules.find((r) => r.id === id) ?? null

// 每條規則輪流出題，題目不重複。focus 指定規則時只出那條規則的字。
export function buildChopRound(course, { count = CHOP_LENGTH, focus = null, rng = Math.random } = {}) {
  const rules = focus ? course.rules.filter((r) => r.id === focus) : course.rules
  const queues = shuffle(rules, rng).map((rule) => shuffle(rule.words, rng).map((w) => ({ ...w, ruleId: rule.id })))
  const out = []
  while (out.length < count && queues.some((q) => q.length)) {
    for (const q of queues) if (q.length && out.length < count) out.push(q.shift())
  }
  return shuffle(out, rng)
}

const dot = (word, cut) => `${word.en.slice(0, cut)}·${word.en.slice(cut)}`

// 切完之後的說明：答對講規則、答錯講為什麼不是這裡
export function explainCut(course, word, chosen) {
  const rule = findRule(course, word.ruleId)
  const answer = cutOf(word)
  const right = dot(word, answer)
  if (chosen === answer) return `✓ ${right}　${rule.short}。`

  const pair = word.en.slice(chosen - 1, chosen + 1)
  if (course.digraphs.includes(pair)) {
    return `${pair} 是一起發音的好朋友，不能切開。正確切法：${right}（${rule.short}）。`
  }
  const a = analyze(word.en)
  if (word.ruleId === 'vcv-closed' && a && chosen === a.gapStart) {
    return `好的嘗試！一元一輔確實先試切在輔音前（${dot(word, chosen)}），但這樣前一段要唸長音，聽起來不像真的字，所以退一步切在輔音後：${right}，母音改唸短音。`
  }
  if (word.ruleId === 'vcv-open' && a && chosen === a.gapEnd) {
    return `一元一輔要「先」切在輔音前：${right}。前一段以元音結尾，唸長音（唸字母名字）。`
  }
  if (word.ruleId === 'compound') return `這是複合字，先找兩個認識的小字：${word.parts.join(' + ')} → ${right}。`
  if (word.ruleId === 'cle') return `字尾是「輔音 + le」（${word.parts[1]}），從字尾往前數三個字母切：${right}。`
  if (word.ruleId === 'vccv') {
    return `元音中間夾了兩個輔音（${word.en.slice(a.gapStart, a.gapEnd)}），從兩個輔音中間切：${right}。`
  }
  return `正確切法：${right}。${rule.short}。`
}

export function explainVowel(word, rule, expected) {
  const first = word.parts[0]
  return expected === 'long'
    ? `${first} 以元音結尾（開音節），母音沒被關住 → 唸長音，也就是字母本身的名字。`
    : `${first} 以輔音結尾（閉音節），母音被輔音關住 → 唸短音。`
}
