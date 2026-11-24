// 純邏輯：自然發音的學習進度、熟練度、自適應出題與「AI 導師」分析。
// 導師是規則式的：完全依答題紀錄判斷（不需網路或 API 金鑰），所以結果可預測、可測試。
// 所有函式都回傳新物件，不修改傳入值。
import { courseIndex, buildQuestion, QUESTION_TYPES, soundLabel } from './phonics.js'
import { shuffle } from './quiz.js'

export const PHONICS_VERSION = 1
export const MAX_BOX = 5 // 熟練度 0–5：答對 +1，答錯 -2
export const WRONG_PENALTY = 2
export const SESSION_LENGTH = { practice: 10, daily: 10, weak: 10, test: 12 }
export const SESSION_HISTORY = 60

export function createPhonicsProgress() {
  return { version: PHONICS_VERSION, courses: {} }
}

export function emptyCourseProgress() {
  return {
    patterns: {}, // { [patternId]: { box, correct, total, last } }
    confusions: {}, // { 'soundId>chosenSoundId': 次數 }
    wrong: {}, // { [en]: 答錯次數 }，答對一次減一
    log: {}, // { [en]: 'YYYY-MM-DD' 最後作答日 }
    sessions: [], // [{ date, mode, correct, total }]
    lessons: [], // 看過課程的 groupId
    dailyDate: null,
  }
}

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v)
const isDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)
const count = (v) => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0)

// 讀 localStorage 時使用：格式錯誤的欄位丟掉，不影響其他資料
export function sanitizePhonicsProgress(raw) {
  const base = createPhonicsProgress()
  if (!isObj(raw) || raw.version !== PHONICS_VERSION || !isObj(raw.courses)) return base
  for (const [id, c] of Object.entries(raw.courses)) {
    if (!isObj(c)) continue
    const patterns = {}
    for (const [pid, p] of Object.entries(isObj(c.patterns) ? c.patterns : {})) {
      if (!isObj(p)) continue
      patterns[pid] = { box: Math.min(MAX_BOX, count(p.box)), correct: count(p.correct), total: count(p.total), last: isDate(p.last) ? p.last : null }
    }
    const counts = (o) => Object.fromEntries(Object.entries(isObj(o) ? o : {}).filter(([, n]) => count(n) > 0).map(([k, n]) => [k, count(n)]))
    base.courses[id] = {
      patterns,
      confusions: counts(c.confusions),
      wrong: counts(c.wrong),
      log: Object.fromEntries(Object.entries(isObj(c.log) ? c.log : {}).filter(([, d]) => isDate(d))),
      sessions: (Array.isArray(c.sessions) ? c.sessions : [])
        .filter((s) => isObj(s) && isDate(s.date) && typeof s.mode === 'string')
        .map((s) => ({ date: s.date, mode: s.mode, correct: count(s.correct), total: count(s.total) }))
        .slice(-SESSION_HISTORY),
      lessons: (Array.isArray(c.lessons) ? c.lessons : []).filter((x) => typeof x === 'string'),
      dailyDate: isDate(c.dailyDate) ? c.dailyDate : null,
    }
  }
  return base
}

export function courseProgress(state, courseId) {
  return state.courses[courseId] ?? emptyCourseProgress()
}

function withCourse(state, courseId, cp) {
  return { ...state, courses: { ...state.courses, [courseId]: cp } }
}

export function markLessonSeen(state, courseId, groupId) {
  const cp = courseProgress(state, courseId)
  if (cp.lessons.includes(groupId)) return state
  return withCourse(state, courseId, { ...cp, lessons: [...cp.lessons, groupId] })
}

// results: [{ en, patternId, soundId, chosenSound?, correct }]
// mode 為 null 時只記錄熟練度，不算一次完整練習（例如單題跟讀）
export function recordResults(state, courseId, results, { mode = null, today = null } = {}) {
  const cp = courseProgress(state, courseId)
  const patterns = { ...cp.patterns }
  const confusions = { ...cp.confusions }
  const wrong = { ...cp.wrong }
  const log = { ...cp.log }
  for (const r of results) {
    const p = { box: 0, correct: 0, total: 0, last: null, ...patterns[r.patternId] }
    p.total += 1
    if (today) p.last = today
    if (r.correct) {
      p.correct += 1
      p.box = Math.min(MAX_BOX, p.box + 1)
      if (wrong[r.en]) {
        wrong[r.en] -= 1
        if (wrong[r.en] <= 0) delete wrong[r.en]
      }
    } else {
      p.box = Math.max(0, p.box - WRONG_PENALTY)
      wrong[r.en] = (wrong[r.en] ?? 0) + 1
      if (r.chosenSound && r.chosenSound !== r.soundId) {
        const key = `${r.soundId}>${r.chosenSound}`
        confusions[key] = (confusions[key] ?? 0) + 1
      }
    }
    patterns[r.patternId] = p
    if (today && r.en) log[r.en] = today
  }
  let sessions = cp.sessions
  let dailyDate = cp.dailyDate
  if (mode && today) {
    const correct = results.filter((r) => r.correct).length
    sessions = [...cp.sessions, { date: today, mode, correct, total: results.length }].slice(-SESSION_HISTORY)
    if (mode === 'daily') dailyDate = today
  }
  return withCourse(state, courseId, { ...cp, patterns, confusions, wrong, log, sessions, dailyDate })
}

// ---------- 熟練度 ----------
export const patternMastery = (cp, patternId) => (cp.patterns[patternId]?.box ?? 0) / MAX_BOX

export function patternAccuracy(cp, patternId) {
  const p = cp.patterns[patternId]
  return p && p.total ? p.correct / p.total : null
}

export function groupMastery(idx, cp, groupId) {
  const list = idx.patterns.filter((p) => p.groupId === groupId)
  return list.length ? list.reduce((sum, p) => sum + patternMastery(cp, p.id), 0) / list.length : 0
}

export function overallStats(idx, cp) {
  const ps = idx.patterns.map((p) => cp.patterns[p.id]).filter(Boolean)
  const total = ps.reduce((s, p) => s + p.total, 0)
  const correct = ps.reduce((s, p) => s + p.correct, 0)
  const mastery = idx.patterns.reduce((s, p) => s + patternMastery(cp, p.id), 0) / idx.patterns.length
  return { total, correct, accuracy: total ? correct / total : null, mastery, practiced: ps.length }
}

// 難度 1–3：練過的拼字組合太少就從 1 開始；平均熟練度越高，題型越多、選項越多
export function difficultyLevel(idx, cp) {
  const practiced = idx.patterns.filter((p) => cp.patterns[p.id]?.total)
  if (practiced.length < 3) return 1
  const avg = practiced.reduce((s, p) => s + cp.patterns[p.id].box, 0) / practiced.length
  if (avg < 2) return 1
  if (avg < 3.5) return 2
  return 3
}

export const LEVEL_INFO = {
  1: { label: '入門', types: ['listen-vowel', 'pick-pattern', 'pair'], options: 3, desc: '先聽、再辨識：聽母音、認拼法、分長短音。' },
  2: { label: '進階', types: ['listen-vowel', 'pick-pattern', 'pair', 'listen-word', 'fill-blank'], options: 4, desc: '加入聽音選字與填空，練習拼字位置規則。' },
  3: { label: '挑戰', types: QUESTION_TYPES, options: 4, desc: '加入陌生單字拼讀，試著自己唸出沒學過的字。' },
}

// ---------- 出題計畫 ----------
const boxOf = (cp, pid) => cp.patterns[pid]?.box ?? 0

// 依模式挑出這次要練的字（尚未決定題型）
function pickTargets(idx, cp, { mode, groupId }, n, rng) {
  const wrong = cp.wrong
  const log = cp.log
  let pool = idx.words
  if (mode === 'practice' && groupId) pool = pool.filter((w) => w.groupId === groupId)

  if (mode === 'test') {
    // 綜合測驗：每個音平均出題
    const perSound = Math.max(1, Math.floor(n / idx.sounds.length))
    return idx.sounds.flatMap((s) => shuffle(pool.filter((w) => w.soundId === s.id), rng).slice(0, perSound))
  }

  if (mode === 'daily') {
    const practiced = pool.filter((w) => cp.patterns[w.patternId]?.total || cp.lessons.includes(w.groupId))
    if (practiced.length >= 4) pool = practiced
    // 答錯多的優先，其次最久沒練（沒練過的排最前）
    return shuffle(pool, rng)
      .sort((a, b) => (wrong[b.en] ?? 0) - (wrong[a.en] ?? 0) || (log[a.en] ?? '').localeCompare(log[b.en] ?? ''))
      .slice(0, n)
  }

  if (mode === 'weak') {
    const weakPatterns = weakestPatterns(idx, cp, 3).map((p) => p.id)
    const confused = new Set(topConfusions(idx, cp, 2).map((c) => c.soundId))
    const focus = pool.filter((w) => wrong[w.en] || weakPatterns.includes(w.patternId) || confused.has(w.soundId))
    if (focus.length >= 4) pool = focus
  }

  // 一般練習與弱項：錯題、熟練度低的拼字組合權重高，加一點隨機
  const score = (w) => (wrong[w.en] ?? 0) * 3 + (MAX_BOX - boxOf(cp, w.patternId)) + rng() * 2
  return pool
    .map((w) => ({ w, s: score(w) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.w)
    .slice(0, n)
}

// 依題型需要換目標：陌生拼讀用同拼法的延伸字；長短比較用同母音的比較組
function targetFor(idx, type, word, rng) {
  if (type === 'decode') {
    const extras = idx.extras.filter((x) => x.patternId === word.patternId)
    return extras.length ? shuffle(extras, rng)[0] : null
  }
  if (type === 'pair') {
    const pairs = idx.pairs.filter((p) => p.patternId === word.patternId)
    const fallback = idx.pairs.filter((p) => p.groupId === word.groupId)
    const list = pairs.length ? pairs : fallback
    return list.length ? shuffle(list, rng)[0] : null
  }
  return word
}

// 產生一整回的題目。mode: practice | daily | weak | test；groupId 只在 practice 有效
export function planSession(course, cp, { mode = 'practice', groupId = null } = {}, rng = Math.random) {
  const idx = courseIndex(course)
  const level = mode === 'test' ? 3 : difficultyLevel(idx, cp)
  const { types, options } = LEVEL_INFO[level]
  const n = SESSION_LENGTH[mode] ?? SESSION_LENGTH.practice
  const targets = pickTargets(idx, cp, { mode, groupId }, n, rng)
  const questions = []
  const startType = Math.floor(rng() * types.length)
  targets.forEach((word, i) => {
    // 依序輪替題型；不適合的題型就換下一種
    for (let k = 0; k < types.length; k++) {
      const type = types[(startType + i + k) % types.length]
      const target = targetFor(idx, type, word, rng)
      const q = target && buildQuestion(idx, type, target, { optionCount: options, rng })
      if (q) {
        questions.push({ ...q, id: `${i}-${type}` })
        return
      }
    }
  })
  return { level, questions }
}

// ---------- AI 導師分析 ----------
export function weakestPatterns(idx, cp, n = 3) {
  return idx.patterns
    .filter((p) => cp.patterns[p.id]?.total)
    .filter((p) => boxOf(cp, p.id) < MAX_BOX - 1)
    .sort((a, b) => boxOf(cp, a.id) - boxOf(cp, b.id) || (patternAccuracy(cp, a.id) ?? 1) - (patternAccuracy(cp, b.id) ?? 1))
    .slice(0, n)
}

export function topConfusions(idx, cp, n = 3) {
  return Object.entries(cp.confusions)
    .map(([key, times]) => {
      const [soundId, chosen] = key.split('>')
      return { soundId, chosen, times, from: soundLabel(idx, soundId), to: soundLabel(idx, chosen) }
    })
    .filter((c) => idx.sound[c.soundId])
    .sort((a, b) => b.times - a.times)
    .slice(0, n)
}

// 每個建議都附「下一步」動作，畫面可以直接做成按鈕
export function tutorReport(course, cp, today = null) {
  const idx = courseIndex(course)
  const stats = overallStats(idx, cp)
  const level = difficultyLevel(idx, cp)
  const weak = weakestPatterns(idx, cp, 3)
  const confusions = topConfusions(idx, cp, 3)
  const wrongCount = Object.keys(cp.wrong).length
  const dailyDone = !!today && cp.dailyDate === today
  const untouched = idx.patterns.filter((p) => !cp.patterns[p.id]?.total)

  // 延伸單字：弱項拼法的延伸字，帶學習者用同一條規則讀新字
  const extension = weak
    .flatMap((p) => idx.extras.filter((x) => x.patternId === p.id))
    .slice(0, 6)

  const messages = []
  let next
  if (stats.total === 0) {
    messages.push('建議順序：先聽聲音 → 再認拼法 → 最後自己拼讀。不要急著背單字，先讓耳朵熟悉五個長母音。')
    next = { text: '從大拇指 A 開始，進入 STEP 1 認識聲音', to: { name: 'phonics-lesson', params: { course: course.id, group: idx.groups[0].id } } }
  } else {
    for (const c of confusions) {
      const a = idx.sound[c.soundId]
      const b = idx.sound[c.chosen] ?? idx.shortSounds[c.chosen]
      messages.push(`你有 ${c.times} 次把 ${c.from} 聽成 ${c.to}。/${a.ipa}/：${a.mouth.split('。')[0]}；/${b.ipa}/：${(b.mouth ?? '').split('。')[0]}。`)
    }
    for (const p of weak) {
      const acc = patternAccuracy(cp, p.id)
      messages.push(`「${p.spelling}」還不熟（正確率 ${Math.round((acc ?? 0) * 100)}%）。記住：${p.rule}`)
    }
    if (!confusions.length && !weak.length) messages.push('目前練過的拼字組合都很穩定，可以挑戰綜合測驗，或試試陌生單字拼讀。')
    if (untouched.length) messages.push(`還有 ${untouched.length} 個拼字組合沒練過：${untouched.slice(0, 5).map((p) => p.spelling).join('、')}${untouched.length > 5 ? '…' : ''}。`)

    if (wrongCount >= 3 || confusions.length) next = { text: `弱項加強：重練 ${wrongCount} 個錯題與易混淆的母音`, to: { name: 'phonics-practice', params: { course: course.id, mode: 'weak' } } }
    else if (!dailyDone) next = { text: '完成今天的每日複習', to: { name: 'phonics-practice', params: { course: course.id, mode: 'daily' } } }
    else if (untouched.length) {
      const g = idx.pattern[untouched[0].id].groupId
      next = { text: `學習新的拼字組合：${untouched[0].spelling}`, to: { name: 'phonics-lesson', params: { course: course.id, group: g } } }
    } else next = { text: '挑戰五大長母音綜合測驗', to: { name: 'phonics-practice', params: { course: course.id, mode: 'test' } } }
  }

  return { stats, level, levelInfo: LEVEL_INFO[level], weak, confusions, extension, wrongCount, dailyDone, messages, next }
}
