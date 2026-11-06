// 純邏輯：句型練習（填空、排序）。
import { shuffle } from './quiz.js'

const END_PUNCT = /[.!?]$/
const TOKEN_PUNCT = /[,.!?]$/

// 'Hello, I am Amy.' => { tokens: ['Hello,', 'I', 'am', 'Amy'], punct: '.' }
export function splitSentence(en) {
  const text = en.trim()
  const punct = END_PUNCT.test(text) ? text.slice(-1) : ''
  const body = punct ? text.slice(0, -1) : text
  return { tokens: body.split(/\s+/), punct }
}

const bare = (token) => token.replace(TOKEN_PUNCT, '').toLowerCase()

// 把句子在 answer 的位置切開：before ___suffix after
export function splitAroundAnswer(sentence) {
  const { tokens, punct } = splitSentence(sentence.en)
  const i = tokens.findIndex((t) => bare(t) === sentence.answer.toLowerCase())
  if (i < 0) return null
  const suffix = tokens[i].match(TOKEN_PUNCT)?.[0] ?? ''
  return {
    before: tokens.slice(0, i).join(' '),
    suffix,
    after: tokens.slice(i + 1).join(' ') + punct,
  }
}

export function buildFillQuestion(sentence, sameZone, rng = Math.random) {
  const answer = sentence.answer.toLowerCase()
  const distractors = shuffle(
    [...new Set(sameZone.map((s) => s.answer.toLowerCase()).filter((a) => a !== answer))],
    rng,
  ).slice(0, 3)
  return {
    type: 'fill',
    sentence,
    parts: splitAroundAnswer(sentence),
    options: shuffle([answer, ...distractors], rng),
    answer,
  }
}

export function buildOrderQuestion(sentence, rng = Math.random) {
  const { tokens, punct } = splitSentence(sentence.en)
  let order = tokens.map((_, i) => i)
  // 盡量避免打散後剛好就是正確順序
  for (let tries = 0; tries < 10; tries++) {
    order = shuffle(order, rng)
    if (tokens.length < 2 || order.some((v, i) => v !== i)) break
  }
  return {
    type: 'order',
    sentence,
    tokens,
    punct,
    tiles: order.map((i) => ({ id: i, text: tokens[i] })),
  }
}

// 填空與排序交錯出題
export function buildSentenceRound(sentences, count, rng = Math.random) {
  const picked = shuffle(sentences, rng).slice(0, Math.min(count, sentences.length))
  return picked.map((s, i) => (i % 2 === 0 ? buildFillQuestion(s, sentences, rng) : buildOrderQuestion(s, rng)))
}

export function checkOrder(pickedTexts, tokens) {
  return pickedTexts.length === tokens.length && pickedTexts.every((t, i) => t === tokens[i])
}
