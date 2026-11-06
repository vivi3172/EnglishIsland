// 純邏輯：出題、計分、拼字檢查。rng 可注入，方便測試。

export function shuffle(list, rng = Math.random) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// en-to-zh：看英文選中文；zh-to-en：看圖與中文選英文；listen：聽發音選英文
export const QUESTION_TYPES = ['en-to-zh', 'zh-to-en', 'listen']

export function buildQuestion(word, pool, type, rng = Math.random, optionCount = 4) {
  const distractors = shuffle(
    pool.filter((w) => w.en !== word.en),
    rng,
  ).slice(0, optionCount - 1)
  const options = shuffle([word, ...distractors], rng)
  return { type, word, options, answer: word.en }
}

export function buildQuiz(words, pool, count, rng = Math.random) {
  const picked = shuffle(words, rng).slice(0, Math.min(count, words.length))
  return picked.map((word, i) => buildQuestion(word, pool, QUESTION_TYPES[i % QUESTION_TYPES.length], rng))
}

export function starsForScore(correct, total) {
  if (total <= 0) return 0
  const ratio = correct / total
  if (ratio === 1) return 3
  if (ratio >= 0.8) return 2
  if (ratio >= 0.6) return 1
  return 0
}

export function normalizeAnswer(text) {
  return String(text ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

export function checkSpelling(input, target) {
  return normalizeAnswer(input) === normalizeAnswer(target)
}

// 拼字遊戲只用單一單字（不含空白）
export function isSpellable(word) {
  return /^[a-z]+$/i.test(word.en)
}

// 打散字母；長度 > 1 時盡量避免剛好等於原字
export function scrambleLetters(text, rng = Math.random) {
  const letters = text.split('')
  if (new Set(letters).size <= 1) return letters
  let result = letters
  for (let tries = 0; tries < 10; tries++) {
    result = shuffle(letters, rng)
    if (result.join('') !== text) break
  }
  return result
}
