// 純邏輯：荒島求生進度。所有函式都回傳新物件，不修改傳入值。
//
// 核心循環：
//   完成一次英語挑戰 = 一趟探索 → 消耗飽足與水分 → 依表現獲得物資
//   每過一個真實日子 → 飽足、水分下降；設施產出物資
//   飽足或水分歸零 → 生命下降；生命歸零 → 昏倒（物資減半，學習進度保留）
//   集滿零件與木材建造無線電 → 獲救

export const PROGRESS_VERSION = 2
export const MAX_STAT = 100

export const START_STATS = { hunger: 70, thirst: 70, health: 100 }
export const START_INVENTORY = { food: 2, water: 2, wood: 0, herb: 1, parts: 0 }

export const EXPEDITION_COST = { hunger: 8, thirst: 10 }
export const DAILY_DECAY = { hunger: 25, thirst: 30 }
export const SHELTER_FACTOR = 0.6
export const STARVING_DAMAGE = { expedition: 10, daily: 15 } // 每項歸零的數值造成的傷害
export const WELL_FED_HEAL = 5 // 探索時飽足、水分都 >= 50 回復生命
export const CAMPFIRE_HEAL = 10
export const MAX_TICK_DAYS = 30
export const FAINT_RECOVERY = { hunger: 50, thirst: 50, health: 50 }

// 使用物資的效果
export const ITEM_EFFECTS = {
  food: { stat: 'hunger', amount: 25 },
  water: { stat: 'thirst', amount: 30 },
  herb: { stat: 'health', amount: 30 },
}

const clamp = (n) => Math.max(0, Math.min(MAX_STAT, Math.round(n)))

export function createInitialProgress() {
  return {
    version: PROGRESS_VERSION,
    startDate: null, // 'YYYY-MM-DD' 登島日
    lastTick: null, // 上次結算每日消耗的日期
    stats: { ...START_STATS },
    inventory: { ...START_INVENTORY },
    built: [],
    zones: {}, // { [zoneId]: { stars, sentenceStars, learned } }
    wrongWords: {}, // { [en]: 答錯次數 }
    faints: 0,
    rescuedDay: null,
    introSeen: false,
  }
}

// 讀取 localStorage 的資料時使用：舊版本或格式錯誤就重新開始
export function sanitizeProgress(raw) {
  const base = createInitialProgress()
  if (!raw || typeof raw !== 'object' || raw.version !== PROGRESS_VERSION) return base
  const num = (v, d) => (Number.isFinite(v) && v >= 0 ? v : d)
  const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {})
  const date = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null)
  const stats = obj(raw.stats)
  const inv = obj(raw.inventory)
  return {
    version: PROGRESS_VERSION,
    startDate: date(raw.startDate),
    lastTick: date(raw.lastTick),
    stats: Object.fromEntries(Object.keys(START_STATS).map((k) => [k, clamp(num(stats[k], START_STATS[k]))])),
    inventory: Object.fromEntries(Object.keys(START_INVENTORY).map((k) => [k, Math.floor(num(inv[k], 0))])),
    built: Array.isArray(raw.built) ? raw.built.filter((x) => typeof x === 'string') : [],
    zones: obj(raw.zones),
    wrongWords: obj(raw.wrongWords),
    faints: num(raw.faints, 0),
    rescuedDay: Number.isFinite(raw.rescuedDay) ? raw.rescuedDay : null,
    introSeen: raw.introSeen === true,
  }
}

// ---------- 日期 ----------
function toUtc(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export function daysBetween(from, to) {
  return Math.round((toUtc(to) - toUtc(from)) / 86400000)
}

export function localDateString(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// 登島第幾天（登島當天為第 1 天）
export function islandDay(progress, today) {
  if (!progress.startDate) return 1
  return Math.max(1, daysBetween(progress.startDate, today) + 1)
}

// ---------- 區域 ----------
export function zoneStars(progress, zoneId) {
  return progress.zones[zoneId]?.stars ?? 0
}

export function isZoneUnlocked(progress, zones, zoneId) {
  const index = zones.findIndex((z) => z.id === zoneId)
  if (index < 0) return false
  if (index === 0) return true
  return zoneStars(progress, zones[index - 1].id) >= 1
}

// results: [{ en, correct }]
export function recordAnswers(progress, results) {
  const wrongWords = { ...progress.wrongWords }
  for (const { en, correct } of results) {
    if (!correct) {
      wrongWords[en] = (wrongWords[en] ?? 0) + 1
    } else if (wrongWords[en]) {
      wrongWords[en] -= 1
      if (wrongWords[en] <= 0) delete wrongWords[en]
    }
  }
  return { ...progress, wrongWords }
}

// ---------- 生存數值 ----------
function addItems(inventory, items) {
  const next = { ...inventory }
  for (const [k, n] of Object.entries(items)) next[k] = (next[k] ?? 0) + n
  return next
}

// 生命歸零就昏倒：數值回復到 50，所有物資減半（無條件捨去）
export function checkFaint(progress) {
  if (progress.stats.health > 0) return { progress, fainted: false }
  const inventory = Object.fromEntries(Object.entries(progress.inventory).map(([k, n]) => [k, Math.floor(n / 2)]))
  return {
    progress: { ...progress, stats: { ...FAINT_RECOVERY }, inventory, faints: progress.faints + 1 },
    fainted: true,
  }
}

export function useItem(progress, kind) {
  const effect = ITEM_EFFECTS[kind]
  if (!effect) return { ok: false, reason: 'unknown', progress }
  if ((progress.inventory[kind] ?? 0) < 1) return { ok: false, reason: 'empty', progress }
  if (progress.stats[effect.stat] >= MAX_STAT) return { ok: false, reason: 'full', progress }
  return {
    ok: true,
    progress: {
      ...progress,
      inventory: { ...progress.inventory, [kind]: progress.inventory[kind] - 1 },
      stats: { ...progress.stats, [effect.stat]: clamp(progress.stats[effect.stat] + effect.amount) },
    },
  }
}

// 每過一個真實日子結算一次。第一次呼叫只記錄登島日。
export function dailyTick(progress, today) {
  if (!progress.lastTick) {
    return {
      progress: { ...progress, startDate: progress.startDate ?? today, lastTick: today },
      report: { days: 0, gained: {}, fainted: false },
    }
  }
  const days = daysBetween(progress.lastTick, today)
  if (days <= 0) return { progress, report: { days: 0, gained: {}, fainted: false } }

  const has = (id) => progress.built.includes(id)
  const factor = has('shelter') ? SHELTER_FACTOR : 1
  let stats = { ...progress.stats }
  let inventory = { ...progress.inventory }
  const gained = {}
  let fainted = false
  let next = progress

  // 已獲救就不再消耗
  const simulate = progress.rescuedDay ? 0 : Math.min(days, MAX_TICK_DAYS)
  for (let d = 0; d < simulate; d++) {
    const daily = {}
    if (has('rod')) daily.food = 1
    if (has('collector')) daily.water = 1
    inventory = addItems(inventory, daily)
    for (const [k, n] of Object.entries(daily)) gained[k] = (gained[k] ?? 0) + n

    stats.hunger = clamp(stats.hunger - DAILY_DECAY.hunger * factor)
    stats.thirst = clamp(stats.thirst - DAILY_DECAY.thirst * factor)
    if (has('campfire')) stats.health = clamp(stats.health + CAMPFIRE_HEAL)
    if (stats.hunger === 0) stats.health = clamp(stats.health - STARVING_DAMAGE.daily)
    if (stats.thirst === 0) stats.health = clamp(stats.health - STARVING_DAMAGE.daily)

    const out = checkFaint({ ...progress, stats, inventory })
    if (out.fainted) {
      // 一次結算最多昏倒一次，醒來後停止這次的消耗
      next = out.progress
      fainted = true
      break
    }
  }
  if (!fainted) next = { ...progress, stats, inventory }
  return { progress: { ...next, lastTick: today }, report: { days, gained, fainted } }
}

// 依活動表現計算獲得的物資
// kind: 'cards' | 'quiz' | 'spell' | 'sentence' | 'review'
export function activityRewards({ kind, resource, correct = 0, total = 0, stars = 0, newStars = 0, firstTime = false }) {
  const rewards = {}
  const add = (k, n) => {
    if (k && n > 0) rewards[k] = (rewards[k] ?? 0) + n
  }
  if (kind === 'cards') add(resource, firstTime ? 2 : 1)
  else if (kind === 'quiz') add(resource, stars + 1)
  else if (kind === 'spell' || kind === 'sentence') add(resource, total > 0 && correct / total >= 0.6 ? 2 : 1)
  else if (kind === 'review') add('herb', Math.ceil(correct / 2))
  add('parts', newStars) // 每拿到一顆新星星都會找到一個零件
  return rewards
}

// 完成一次挑戰（一趟探索）。回傳更新後的進度與這趟的結果。
// input: { kind, zoneId?, resource?, results?, correct?, total?, stars? }
export function completeActivity(progress, input) {
  const { kind, zoneId = null, resource = null, results = [], stars = 0 } = input
  const correct = input.correct ?? results.filter((r) => r.correct).length
  const total = input.total ?? results.length
  let next = results.length ? recordAnswers(progress, results) : progress

  // 星星與學習紀錄
  let newStars = 0
  let firstTime = false
  if (zoneId) {
    const zone = { stars: 0, ...next.zones[zoneId] }
    if (kind === 'quiz' || kind === 'sentence') {
      const key = kind === 'quiz' ? 'stars' : 'sentenceStars'
      const prev = zone[key] ?? 0
      newStars = Math.max(0, stars - prev)
      zone[key] = Math.max(prev, stars)
    }
    if (kind === 'cards') {
      firstTime = !zone.learned
      zone.learned = true
    }
    next = { ...next, zones: { ...next.zones, [zoneId]: zone } }
  }

  const rewards = activityRewards({ kind, resource, correct, total, stars, newStars, firstTime })

  // 探索消耗與生命變化（已獲救就不再消耗）
  const stats = { ...next.stats }
  if (!next.rescuedDay) {
    stats.hunger = clamp(stats.hunger - EXPEDITION_COST.hunger)
    stats.thirst = clamp(stats.thirst - EXPEDITION_COST.thirst)
    if (stats.hunger === 0) stats.health = clamp(stats.health - STARVING_DAMAGE.expedition)
    if (stats.thirst === 0) stats.health = clamp(stats.health - STARVING_DAMAGE.expedition)
    if (stats.hunger >= 50 && stats.thirst >= 50) stats.health = clamp(stats.health + WELL_FED_HEAL)
  }
  next = { ...next, stats, inventory: addItems(next.inventory, rewards) }

  const out = checkFaint(next)
  return {
    progress: out.progress,
    rewards,
    fainted: out.fainted,
    newBest: newStars > 0,
    cost: next.rescuedDay ? {} : { ...EXPEDITION_COST },
  }
}

// ---------- 建造 ----------
export function canAfford(inventory, cost) {
  return Object.entries(cost).every(([k, n]) => (inventory[k] ?? 0) >= n)
}

export function build(progress, building, today) {
  if (progress.built.includes(building.id)) return { ok: false, reason: 'built', progress }
  if (!canAfford(progress.inventory, building.cost)) return { ok: false, reason: 'not-enough', progress }
  const inventory = { ...progress.inventory }
  for (const [k, n] of Object.entries(building.cost)) inventory[k] -= n
  const next = { ...progress, inventory, built: [...progress.built, building.id] }
  if (building.id === 'radio' && !next.rescuedDay) next.rescuedDay = islandDay(progress, today)
  return { ok: true, progress: next }
}
