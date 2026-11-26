// 12 時態：例句解析、時間軸形狀、時態辨識、出題 / 判分、錯題解析、進度存檔（純函式，有測試）。
import { shuffle } from './quiz.js'
import { FORMS, STAGES, TENSE_KEYS, findTime, findAspect, splitKey, tenseName, comparisonFor } from '../data/tenses/index.js'

// ---------- 例句解析 ----------
// [助動詞] <主要動詞> {時間提示詞}，其餘為一般文字。回傳純文字與每個單字的角色與起始位置。
const MARK = /\[([^\]]+)\]|<([^>]+)>|\{([^}]+)\}|([^[<{]+)/g

export function parseSentence(marked) {
  let text = ''
  const roles = []
  for (const m of marked.matchAll(MARK)) {
    const [seg, role] = m[1] != null ? [m[1], 'aux'] : m[2] != null ? [m[2], 'verb'] : m[3] != null ? [m[3], 'time'] : [m[4], 'plain']
    text += seg
    for (let i = 0; i < seg.length; i++) roles.push(role)
  }
  const words = [...text.matchAll(/\S+/g)].map((w) => ({ text: w[0], start: w.index, role: roles[w.index] }))
  return { text, words }
}

// 目前唸到的字元位置 → 第幾個單字（還沒開始為 -1）
export function wordIndexAt(words, charIndex) {
  if (charIndex == null || charIndex < 0) return -1
  let found = -1
  for (let i = 0; i < words.length; i++) {
    if (words[i].start <= charIndex) found = i
    else break
  }
  return found
}

export const entryOf = (scenario, key) => scenario?.tenses?.[key] ?? null
export const sentenceOf = (scenario, key) => parseSentence(entryOf(scenario, key).en)

// 助動詞 + 主要動詞（依序、小寫）：例如 ['has', 'been', 'cooking']
export function verbPhrase(scenario, key) {
  return sentenceOf(scenario, key)
    .words.filter((w) => w.role === 'aux' || w.role === 'verb')
    .map((w) => w.text.toLowerCase().replace(/[.,!?]+$/, ''))
}

// 動詞變化表：原形 → 這個時態實際用到的形式
export function verbChange(scenario, key) {
  const form = FORMS[key]
  return { base: scenario.verb.base, form: form.verb, word: scenario.verb[form.verb], phrase: verbPhrase(scenario, key).join(' ') }
}

// ---------- 時間軸 ----------
// 回傳要畫的元素（x、w 皆為 0–100 的百分比）。id 固定，切換時態時同一個 id 的元素會平滑移動。
//   ref：參考時間（虛線）  dot：事件  repeat：重複的習慣  span：正在進行的區間
//   check：已發生的事件  link：從事件延伸到參考時間的箭頭  second：另一件事（例如我抵達）
export const PERFECT_GAP = 13
export const SPAN_HALF = 8
export const RUN_LENGTH = 17
const REPEAT_XS = [8, 22, 36, 50, 64, 78, 92]

export function timelineFor(key, tl = {}) {
  const { time, aspect } = splitKey(key)
  const ref = findTime(time).anchor
  const items = [{ id: 'ref', kind: 'ref', x: ref, label: tl.ref ?? '' }]
  switch (aspect) {
    case 'simple':
      if (tl.habit) items.push({ id: 'main', kind: 'repeat', x: REPEAT_XS[0], w: REPEAT_XS.at(-1) - REPEAT_XS[0], xs: REPEAT_XS })
      else items.push({ id: 'main', kind: 'dot', x: ref, w: 0 })
      break
    case 'continuous':
      items.push({ id: 'main', kind: 'span', x: ref - SPAN_HALF, w: SPAN_HALF * 2 })
      break
    case 'perfect':
      items.push({ id: 'main', kind: 'check', x: ref - PERFECT_GAP, w: 0 })
      items.push({ id: 'link', kind: 'link', x: ref - PERFECT_GAP, w: PERFECT_GAP })
      break
    case 'perfect-continuous':
      items.push({ id: 'main', kind: 'run', x: ref - RUN_LENGTH, w: RUN_LENGTH, label: tl.duration ?? '' })
      break
  }
  if (tl.second) items.push({ id: 'second', kind: 'second', x: ref, w: 0, label: tl.second })
  return items
}

// ---------- 文字比對 ----------
export function normalize(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// 從使用者寫的句子判斷用了哪個時態：比對各時態的「助動詞 + 動詞」，
// 中間允許夾一個副詞（has already cooked）。同時符合多個時，取字數最多的（has cooked 勝過 cooked）。
export function detectTense(input, scenario) {
  const text = ` ${normalize(input)} `
  let best = null
  let bestLen = 0
  for (const key of TENSE_KEYS) {
    const words = verbPhrase(scenario, key).map((w) => escapeRe(normalize(w)))
    const re = new RegExp(`(?:^|\\s)${words.join("(?:\\s+[a-z']+)?\\s+")}(?=\\s|$)`)
    if (re.test(text) && words.length > bestLen) {
      best = key
      bestLen = words.length
    }
  }
  return best
}

// 填空：從第一個助動詞 / 動詞挖到最後一個，前後文保留。
// 中間夾的副詞（already、just）寫或不寫都算對。
export function blankParts(scenario, key) {
  const { words } = sentenceOf(scenario, key)
  const idx = words.map((w, i) => (w.role === 'aux' || w.role === 'verb' ? i : -1)).filter((i) => i >= 0)
  const first = idx[0]
  const last = idx.at(-1)
  const span = words.slice(first, last + 1)
  const core = span.filter((w) => w.role === 'aux' || w.role === 'verb')
  const answers = [...new Set([normalize(span.map((w) => w.text).join(' ')), normalize(core.map((w) => w.text).join(' '))])]
  return {
    before: words.slice(0, first).map((w) => w.text).join(' '),
    after: words.slice(last + 1).map((w) => w.text).join(' '),
    answers,
    full: words.map((w) => w.text).join(' '),
  }
}

// 句型組合用的字卡：去掉句尾的句點（p.m. 這類縮寫保留）
export function orderWords(scenario, key) {
  const words = sentenceOf(scenario, key).words.map((w) => w.text)
  const lastWord = words.at(-1)
  if (!/(^|\.)[a-z]\.$/i.test(lastWord)) words[words.length - 1] = lastWord.replace(/[.!?]$/, '')
  return words
}

// 跟讀：語音辨識的文字和原句有幾成單字對得上（取多個候選中最好的）。
// 只是「辨識到的文字」比對，不是發音評分。
export function spokenMatch(target, heard) {
  const want = normalize(target).split(' ').filter(Boolean)
  let best = { ratio: 0, text: '' }
  for (const h of heard ?? []) {
    const got = new Set(normalize(h).split(' '))
    const ratio = want.length ? want.filter((w) => got.has(w)).length / want.length : 0
    if (ratio > best.ratio || !best.text) best = { ratio, text: h }
  }
  return best
}

// ---------- 出題 ----------
export const QUIZ_TYPES = [
  { id: 'picture', zh: '看圖選時態', desc: '看插畫和時間軸，選出正確的時態' },
  { id: 'listen', zh: '聽力辨識', desc: '聽句子，判斷時間與動作狀態' },
  { id: 'fill', zh: '動詞填空', desc: '依提示填入正確的動詞變化' },
  { id: 'order', zh: '句型組合', desc: '把打散的單字排成正確的句子' },
  { id: 'transform', zh: '時態轉換', desc: '把句子改成指定的時態' },
  { id: 'write', zh: '情境造句', desc: '看情境和時間條件，自己寫一句' },
]
export const QUIZ_MODES = [
  { id: 'mixed', zh: '綜合情境測驗', desc: '六種題型混合，正確率 80% 以上完成第 6 階段' },
  { id: 'weak', zh: '弱點加強', desc: '專挑熟練度最低、最常錯的時態' },
  ...QUIZ_TYPES,
]
export const findQuizMode = (id) => QUIZ_MODES.find((m) => m.id === id) ?? null

const pick = (list, rng) => list[Math.floor(rng() * list.length)]

// 選項干擾項：先放容易混淆的，再隨機補滿
export function distractors(key, n, rng = Math.random) {
  const confused = FORMS[key].confused.filter((k) => k !== key)
  const rest = shuffle(TENSE_KEYS.filter((k) => k !== key && !confused.includes(k)), rng)
  return [...shuffle(confused, rng), ...rest].slice(0, n)
}

export function makeQuestion(type, scenario, key, rng = Math.random) {
  const base = { id: `${type}:${scenario.id}:${key}`, type, sid: scenario.id, key }
  switch (type) {
    case 'picture':
    case 'listen':
      return { ...base, options: shuffle([key, ...distractors(key, 3, rng)], rng) }
    case 'fill':
      return { ...base, ...blankParts(scenario, key), baseVerb: scenario.verb.base }
    case 'order': {
      const answer = orderWords(scenario, key)
      let chips = shuffle(answer.map((text, i) => ({ id: i, text })), rng)
      for (let i = 0; i < 5 && chips.every((c, j) => c.text === answer[j]); i++) chips = shuffle(chips, rng)
      return { ...base, answer, chips }
    }
    case 'transform': {
      const fromKey = pick(FORMS[key].confused, rng)
      return { ...base, fromKey, source: sentenceOf(scenario, fromKey).text, ...blankParts(scenario, key) }
    }
    case 'write':
      return base
    default:
      throw new Error(`unknown question type: ${type}`)
  }
}

// 弱點：熟練度低、錯題多的時態排前面
export function weakKeys(state, n = 4) {
  const wrongCount = (key) => Object.values(state.wrong).filter((w) => w.key === key).reduce((s, w) => s + w.count, 0)
  return [...TENSE_KEYS]
    .map((key, i) => ({ key, score: mastery(state, key) - 0.15 * wrongCount(key), i }))
    .sort((a, b) => a.score - b.score || a.i - b.i)
    .slice(0, n)
    .map((x) => x.key)
}

export function buildQuiz({ mode, scenarios, state, count = 10, rng = Math.random }) {
  const types = QUIZ_TYPES.map((t) => t.id)
  const keys = mode === 'weak' ? weakKeys(state, 4) : TENSE_KEYS
  const questions = []
  const used = new Set()
  // 先把 12 個（或弱點）時態洗牌輪流出，避免同一個時態連續出現
  let pool = []
  for (let guard = 0; questions.length < count && guard < count * 10; guard++) {
    if (pool.length === 0) pool = shuffle(keys, rng)
    const key = pool.pop()
    const type = types.includes(mode) ? mode : pick(types, rng)
    const scenario = pick(scenarios, rng)
    const q = makeQuestion(type, scenario, key, rng)
    if (used.has(q.id) && guard < count * 5) continue
    used.add(q.id)
    questions.push(q)
  }
  return questions
}

// 回傳 { ok, picked }：picked 是「使用者實際用了哪個時態」（用來說明為什麼不對），判斷不出來為 null
export function checkAnswer(q, scenario, answer) {
  switch (q.type) {
    case 'picture':
    case 'listen':
      return { ok: answer === q.key, picked: answer ?? null }
    case 'fill':
    case 'transform': {
      const ok = q.answers.includes(normalize(answer))
      return { ok, picked: ok ? q.key : detectTense(answer, scenario) }
    }
    case 'order': {
      const ok = Array.isArray(answer) && answer.length === q.answer.length && answer.every((w, i) => w === q.answer[i])
      return { ok, picked: null }
    }
    case 'write': {
      const picked = detectTense(answer, scenario)
      return { ok: picked === q.key, picked }
    }
    default:
      return { ok: false, picked: null }
  }
}

// ---------- 錯題解析 ----------
export function whyNot(key, other) {
  const a = splitKey(key)
  const b = splitKey(other)
  const parts = [`${tenseName(other)}：`]
  if (a.time !== b.time) parts.push(`參考時間在${findTime(b.time).zh}，但這句的時間是${findTime(a.time).zh}。`)
  if (a.aspect !== b.aspect) parts.push(`${findAspect(b.aspect).zh}表示${findAspect(b.aspect).gist}；這句要表達的是${findAspect(a.aspect).gist}。`)
  return parts.join('')
}

export function explain(scenario, key, picked = null) {
  const { time, aspect } = splitKey(key)
  const entry = entryOf(scenario, key)
  const others = FORMS[key].confused.filter((k) => k !== picked).slice(0, 2)
  return {
    time: `${findTime(time).zh}：${entry.clue}。`,
    aspect: `${findAspect(aspect).zh}：${findAspect(aspect).gist}。`,
    aux: FORMS[key].auxWhy,
    picked: picked && picked !== key ? { key: picked, text: whyNot(key, picked), note: comparisonFor(key, picked)?.note ?? null } : null,
    others: others.map((k) => ({ key: k, text: whyNot(key, k) })),
  }
}

// ---------- 進度存檔 ----------
export const TENSE_PROGRESS_VERSION = 1
const STAGE_FLAGS = ['time', 'aspect', 'rhythm', 'quiz']
export const COMPARE_GOAL = 3

export const createTenseProgress = () => ({
  version: TENSE_PROGRESS_VERSION, seen: {}, stages: {}, compared: {}, tenses: {}, wrong: {}, calm: false,
})

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v)
const isDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)
const intMin = (v, min) => (Number.isInteger(v) && v >= min ? v : min)

// 讀 localStorage 時使用：壞掉或缺少的欄位丟掉 / 補預設值，不影響其他資料
export function sanitizeTenseProgress(raw) {
  const base = createTenseProgress()
  if (!isObj(raw)) return base
  const seen = isObj(raw.seen) ? raw.seen : {}
  for (const key of TENSE_KEYS) if (seen[key] === true) base.seen[key] = true
  const stages = isObj(raw.stages) ? raw.stages : {}
  for (const f of STAGE_FLAGS) if (stages[f] === true) base.stages[f] = true
  const compared = isObj(raw.compared) ? raw.compared : {}
  for (const [id, v] of Object.entries(compared)) if (v === true && id.length <= 80) base.compared[id] = true
  const tenses = isObj(raw.tenses) ? raw.tenses : {}
  for (const key of TENSE_KEYS) {
    const t = tenses[key]
    if (!isObj(t)) continue
    const attempts = intMin(t.attempts, 0)
    base.tenses[key] = {
      attempts,
      correct: Math.min(intMin(t.correct, 0), attempts),
      streak: Math.min(intMin(t.streak, 0), attempts),
      last: isDate(t.last) ? t.last : null,
    }
  }
  const wrong = isObj(raw.wrong) ? raw.wrong : {}
  for (const [qid, w] of Object.entries(wrong)) {
    if (!isObj(w) || !TENSE_KEYS.includes(w.key)) continue
    base.wrong[qid] = { key: w.key, count: intMin(w.count, 1), last: isDate(w.last) ? w.last : null }
  }
  base.calm = raw.calm === true
  return base
}

export const markSeen = (state, key) => (state.seen[key] ? state : { ...state, seen: { ...state.seen, [key]: true } })
export const markStage = (state, flag) => (state.stages[flag] ? state : { ...state, stages: { ...state.stages, [flag]: true } })
export const markCompared = (state, id) => (state.compared[id] ? state : { ...state, compared: { ...state.compared, [id]: true } })
export const pairId = (a, b) => comparisonFor(a, b)?.id ?? [a, b].sort().join('|')

export function recordAnswer(state, q, ok, today) {
  const prev = state.tenses[q.key] ?? { attempts: 0, correct: 0, streak: 0, last: null }
  const wrong = { ...state.wrong }
  if (ok) delete wrong[q.id]
  else wrong[q.id] = { key: q.key, count: (wrong[q.id]?.count ?? 0) + 1, last: today }
  return {
    ...state,
    tenses: {
      ...state.tenses,
      [q.key]: {
        attempts: prev.attempts + 1,
        correct: prev.correct + (ok ? 1 : 0),
        streak: ok ? prev.streak + 1 : 0,
        last: today,
      },
    },
    wrong,
  }
}

// 熟練度 0–1：正確率 × 信心（作答 5 次以上才算滿）
export function mastery(state, key) {
  const t = state.tenses[key]
  if (!t || t.attempts === 0) return 0
  return Math.round((t.correct / t.attempts) * Math.min(1, t.attempts / 5) * 100) / 100
}

export function accuracy(state, key) {
  const t = state.tenses[key]
  return t && t.attempts ? t.correct / t.attempts : null
}

export function overall(state) {
  const totals = TENSE_KEYS.reduce(
    (s, k) => {
      const t = state.tenses[k]
      return { attempts: s.attempts + (t?.attempts ?? 0), correct: s.correct + (t?.correct ?? 0) }
    },
    { attempts: 0, correct: 0 },
  )
  return {
    mastery: Math.round((TENSE_KEYS.reduce((s, k) => s + mastery(state, k), 0) / TENSE_KEYS.length) * 100) / 100,
    accuracy: totals.attempts ? totals.correct / totals.attempts : null,
    attempts: totals.attempts,
    seen: TENSE_KEYS.filter((k) => state.seen[k]).length,
    wrong: Object.keys(state.wrong).length,
  }
}

// 六階段學習路徑：每階段是否完成
export function stageStatus(state) {
  const seen = TENSE_KEYS.filter((k) => state.seen[k]).length
  const compared = Object.keys(state.compared).length
  const done = {
    time: !!state.stages.time,
    aspect: !!state.stages.aspect,
    explore: seen === TENSE_KEYS.length,
    rhythm: !!state.stages.rhythm,
    compare: compared >= COMPARE_GOAL,
    quiz: !!state.stages.quiz,
  }
  const meta = { explore: `${seen} / ${TENSE_KEYS.length}`, compare: `${Math.min(compared, COMPARE_GOAL)} / ${COMPARE_GOAL}` }
  return STAGES.map((s) => ({ ...s, done: done[s.id], meta: meta[s.id] ?? null }))
}

export const QUIZ_PASS = 0.8
