import { describe, it, expect } from 'vitest'
import {
  createInitialProgress,
  sanitizeProgress,
  isZoneUnlocked,
  completeActivity,
  activityRewards,
  dailyTick,
  useItem,
  checkFaint,
  build,
  islandDay,
  daysBetween,
  START_STATS,
  START_INVENTORY,
  EXPEDITION_COST,
} from '../src/logic/progress.js'
import { ZONES } from '../src/data/zones.js'
import { BUILDINGS } from '../src/data/survival.js'

const r = (en, correct) => ({ en, correct })
const withStats = (stats, extra = {}) => ({ ...createInitialProgress(), stats: { ...START_STATS, ...stats }, ...extra })
const building = (id) => BUILDINGS.find((b) => b.id === id)

describe('dates', () => {
  it('counts days across month and leap-year boundaries', () => {
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1)
    expect(daysBetween('2028-02-28', '2028-03-01')).toBe(2)
  })
  it('island day starts at 1', () => {
    const p = { ...createInitialProgress(), startDate: '2026-11-05' }
    expect(islandDay(p, '2026-11-05')).toBe(1)
    expect(islandDay(p, '2026-11-08')).toBe(4)
  })
})

describe('zone unlocking', () => {
  it('only the first zone is unlocked at start, next unlocks after 1 quiz star', () => {
    const p = createInitialProgress()
    expect(isZoneUnlocked(p, ZONES, 'beach')).toBe(true)
    expect(isZoneUnlocked(p, ZONES, 'spring')).toBe(false)
    const { progress } = completeActivity(p, { kind: 'quiz', zoneId: 'beach', resource: 'food', results: [r('help', true)], stars: 1 })
    expect(isZoneUnlocked(progress, ZONES, 'spring')).toBe(true)
    expect(isZoneUnlocked(progress, ZONES, 'forest')).toBe(false)
  })

  it('sentence stars do not unlock zones', () => {
    const { progress } = completeActivity(createInitialProgress(), { kind: 'sentence', zoneId: 'beach', resource: 'food', correct: 6, total: 6, stars: 3 })
    expect(progress.zones.beach.sentenceStars).toBe(3)
    expect(isZoneUnlocked(progress, ZONES, 'spring')).toBe(false)
  })
})

describe('activityRewards', () => {
  it('quiz gives stars+1 of the zone resource, plus a part per new star', () => {
    expect(activityRewards({ kind: 'quiz', resource: 'water', stars: 2, newStars: 2 })).toEqual({ water: 3, parts: 2 })
    expect(activityRewards({ kind: 'quiz', resource: 'water', stars: 0 })).toEqual({ water: 1 })
  })
  it('cards give more the first time', () => {
    expect(activityRewards({ kind: 'cards', resource: 'wood', firstTime: true })).toEqual({ wood: 2 })
    expect(activityRewards({ kind: 'cards', resource: 'wood' })).toEqual({ wood: 1 })
  })
  it('spelling and sentences reward 60%+ performance', () => {
    expect(activityRewards({ kind: 'spell', resource: 'food', correct: 3, total: 5 })).toEqual({ food: 2 })
    expect(activityRewards({ kind: 'spell', resource: 'food', correct: 2, total: 5 })).toEqual({ food: 1 })
  })
  it('review gives herbs', () => {
    expect(activityRewards({ kind: 'review', correct: 3 })).toEqual({ herb: 2 })
    expect(activityRewards({ kind: 'review', correct: 0 })).toEqual({})
  })
})

describe('completeActivity', () => {
  it('costs hunger and thirst, adds rewards, records wrong words, keeps best stars', () => {
    const p0 = createInitialProgress()
    const a = completeActivity(p0, {
      kind: 'quiz', zoneId: 'beach', resource: 'food', stars: 2,
      results: [r('help', true), r('sea', false)],
    })
    expect(a.progress.stats.hunger).toBe(START_STATS.hunger - EXPEDITION_COST.hunger)
    expect(a.progress.stats.thirst).toBe(START_STATS.thirst - EXPEDITION_COST.thirst)
    expect(a.rewards).toEqual({ food: 3, parts: 2 })
    expect(a.progress.inventory.food).toBe(START_INVENTORY.food + 3)
    expect(a.progress.wrongWords).toEqual({ sea: 1 })
    expect(a.newBest).toBe(true)
    expect(p0.stats.hunger).toBe(START_STATS.hunger) // 不修改原物件

    const b = completeActivity(a.progress, { kind: 'quiz', zoneId: 'beach', resource: 'food', stars: 1, results: [r('sea', true)] })
    expect(b.progress.zones.beach.stars).toBe(2)
    expect(b.newBest).toBe(false)
    expect(b.rewards).toEqual({ food: 2 })
    expect(b.progress.wrongWords).toEqual({})
  })

  it('heals when well fed, hurts when starving', () => {
    const fed = completeActivity(withStats({ hunger: 90, thirst: 90, health: 50 }), { kind: 'cards', zoneId: 'beach', resource: 'food' })
    expect(fed.progress.stats.health).toBe(55)
    const starving = completeActivity(withStats({ hunger: 5, thirst: 5, health: 50 }), { kind: 'cards', zoneId: 'beach', resource: 'food' })
    expect(starving.progress.stats.health).toBe(30)
  })

  it('faints at 0 health: stats recover, inventory halved, learning kept', () => {
    const p = withStats({ hunger: 0, thirst: 0, health: 15 }, { inventory: { food: 5, water: 3, wood: 1, herb: 0, parts: 4 } })
    const out = completeActivity(p, { kind: 'quiz', zoneId: 'beach', resource: 'food', stars: 1, results: [r('help', true)] })
    expect(out.fainted).toBe(true)
    expect(out.progress.stats).toEqual({ hunger: 50, thirst: 50, health: 50 })
    // (5 + 2 food reward) / 2 = 3；(4 + 1 part) / 2 = 2
    expect(out.progress.inventory).toEqual({ food: 3, water: 1, wood: 0, herb: 0, parts: 2 })
    expect(out.progress.zones.beach.stars).toBe(1)
    expect(out.progress.faints).toBe(1)
  })

  it('no cost after being rescued', () => {
    const p = withStats({ hunger: 40 }, { rescuedDay: 5 })
    const out = completeActivity(p, { kind: 'cards', zoneId: 'beach', resource: 'food' })
    expect(out.progress.stats.hunger).toBe(40)
    expect(out.cost).toEqual({})
  })
})

describe('useItem', () => {
  it('consumes an item and restores the stat (capped at 100)', () => {
    const out = useItem(withStats({ hunger: 90 }), 'food')
    expect(out.ok).toBe(true)
    expect(out.progress.stats.hunger).toBe(100)
    expect(out.progress.inventory.food).toBe(START_INVENTORY.food - 1)
  })
  it('refuses when empty or full', () => {
    expect(useItem(withStats({}, { inventory: { ...START_INVENTORY, water: 0 } }), 'water')).toMatchObject({ ok: false, reason: 'empty' })
    expect(useItem(withStats({ health: 100 }), 'herb')).toMatchObject({ ok: false, reason: 'full' })
  })
})

describe('dailyTick', () => {
  it('first tick records the landing day without decay', () => {
    const out = dailyTick(createInitialProgress(), '2026-11-05')
    expect(out.progress.startDate).toBe('2026-11-05')
    expect(out.progress.stats).toEqual(START_STATS)
    expect(out.report.days).toBe(0)
  })

  it('same day does nothing; next day decays', () => {
    const p = { ...createInitialProgress(), startDate: '2026-11-05', lastTick: '2026-11-05' }
    expect(dailyTick(p, '2026-11-05').progress).toBe(p)
    const out = dailyTick(p, '2026-11-06')
    expect(out.progress.stats).toEqual({ hunger: 45, thirst: 40, health: 100 })
    expect(out.progress.lastTick).toBe('2026-11-06')
    expect(out.report.days).toBe(1)
  })

  it('buildings produce resources, shelter slows decay, campfire heals', () => {
    const p = {
      ...withStats({ hunger: 100, thirst: 100, health: 50 }),
      lastTick: '2026-11-05',
      built: ['rod', 'collector', 'shelter', 'campfire'],
    }
    const out = dailyTick(p, '2026-11-07')
    expect(out.report.gained).toEqual({ food: 2, water: 2 })
    expect(out.progress.stats).toEqual({ hunger: 70, thirst: 64, health: 70 })
  })

  it('a long absence faints at most once and stops there', () => {
    const p = { ...createInitialProgress(), lastTick: '2026-11-01', inventory: { food: 8, water: 8, wood: 0, herb: 0, parts: 0 } }
    const out = dailyTick(p, '2026-12-31')
    expect(out.report.fainted).toBe(true)
    expect(out.progress.faints).toBe(1)
    expect(out.progress.stats).toEqual({ hunger: 50, thirst: 50, health: 50 })
    expect(out.progress.inventory.food).toBe(4)
    expect(out.progress.lastTick).toBe('2026-12-31')
  })
})

describe('checkFaint', () => {
  it('does nothing while alive', () => {
    const p = withStats({ health: 1 })
    expect(checkFaint(p)).toEqual({ progress: p, fainted: false })
  })
})

describe('build', () => {
  it('needs materials, deducts them, and can only be built once', () => {
    const p = withStats({}, { inventory: { ...START_INVENTORY, wood: 2 } })
    const a = build(p, building('campfire'), '2026-11-05')
    expect(a.ok).toBe(true)
    expect(a.progress.inventory.wood).toBe(0)
    expect(a.progress.built).toEqual(['campfire'])
    expect(build({ ...a.progress, inventory: { ...START_INVENTORY, wood: 9 } }, building('campfire'), '2026-11-05')).toMatchObject({ ok: false, reason: 'built' })
    expect(build(createInitialProgress(), building('shelter'), '2026-11-05')).toMatchObject({ ok: false, reason: 'not-enough' })
  })

  it('building the radio means rescue on the current island day', () => {
    const p = withStats({}, { startDate: '2026-11-05', inventory: { ...START_INVENTORY, parts: 8, wood: 3 } })
    const out = build(p, building('radio'), '2026-11-09')
    expect(out.progress.rescuedDay).toBe(5)
  })
})

describe('daily review', () => {
  it('records when each answered word was last seen', () => {
    const out = completeActivity(createInitialProgress(), {
      kind: 'quiz', zoneId: 'beach', resource: 'food', stars: 0, today: '2026-11-09',
      results: [r('ticket', true), r('delay', false)],
    })
    expect(out.progress.wordLog).toEqual({ ticket: '2026-11-09', delay: '2026-11-09' })
  })

  it('gives a food + water bonus only on the first daily review of the day', () => {
    const results = [r('ticket', true), r('delay', true), r('flight', false)]
    const first = completeActivity(createInitialProgress(), { kind: 'daily', today: '2026-11-09', results })
    expect(first.rewards).toEqual({ food: 2, water: 2, herb: 1 })
    expect(first.dailyBonus).toBe(true)
    expect(first.progress.dailyReviewDate).toBe('2026-11-09')

    const again = completeActivity(first.progress, { kind: 'daily', today: '2026-11-09', results })
    expect(again.rewards).toEqual({ herb: 1 })
    expect(again.dailyBonus).toBe(false)

    const nextDay = completeActivity(again.progress, { kind: 'daily', today: '2026-11-10', results })
    expect(nextDay.dailyBonus).toBe(true)
  })
})

describe('sanitizeProgress', () => {
  it('keeps saves made before daily review existed, adding empty review fields', () => {
    const p = sanitizeProgress({ version: 2, zones: { beach: { stars: 2 } } })
    expect(p.zones.beach.stars).toBe(2)
    expect(p.wordLog).toEqual({})
    expect(p.dailyReviewDate).toBeNull()
  })
  it('drops invalid word log entries', () => {
    const p = sanitizeProgress({ version: 2, wordLog: { ticket: '2026-11-09', delay: 'x', flight: 3 }, dailyReviewDate: 'bad' })
    expect(p.wordLog).toEqual({ ticket: '2026-11-09' })
    expect(p.dailyReviewDate).toBeNull()
  })

  it('starts fresh for corrupted or old-version saves', () => {
    expect(sanitizeProgress('garbage')).toEqual(createInitialProgress())
    expect(sanitizeProgress({ version: 1, shells: 99 })).toEqual(createInitialProgress())
  })
  it('repairs bad fields', () => {
    const p = sanitizeProgress({ version: 2, stats: { hunger: 500, thirst: -3 }, inventory: { food: 2.7 }, built: ['rod', 1], startDate: 'x' })
    expect(p.stats).toEqual({ hunger: 100, thirst: START_STATS.thirst, health: START_STATS.health })
    expect(p.inventory).toEqual({ food: 2, water: 0, wood: 0, herb: 0, parts: 0 })
    expect(p.built).toEqual(['rod'])
    expect(p.startDate).toBeNull()
  })
})
