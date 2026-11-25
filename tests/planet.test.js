import { describe, it, expect } from 'vitest'
import { wrapAngle, project, rotationFor, frontIndex, stepIndex, layoutIslands } from '../src/logic/planet.js'
import { PLANET_ISLANDS } from '../src/data/planet.js'
import { ZONES } from '../src/data/zones.js'

const close = (a, b) => expect(a).toBeCloseTo(b, 6)

describe('wrapAngle', () => {
  it('keeps angles in (-180, 180]', () => {
    close(wrapAngle(190), -170)
    close(wrapAngle(-190), 170)
    close(wrapAngle(720), 0)
    close(wrapAngle(180), 180)
  })
})

describe('project', () => {
  it('puts an island at the front center when lon + rot = 0', () => {
    const p = project(40, 0, -40)
    close(p.x, 0)
    close(p.y, 0)
    close(p.z, 1)
  })
  it('hides islands on the far side', () => {
    expect(project(180, 0, 0).z).toBeLessThan(0)
  })
  it('places northern islands above the center', () => {
    expect(project(0, 30, 0).y).toBeLessThan(0)
  })
})

describe('rotationFor', () => {
  it('takes the short way round', () => {
    // 現在 rot = 350（等於 -10），要讓 lon 0 到前面，只需要再轉 +10
    close(rotationFor(0, 350), 360)
    close(rotationFor(90, 0), -90)
  })
  it('always brings the target island to the front', () => {
    for (const current of [-500, -30, 0, 77, 1000]) {
      const rot = rotationFor(123, current)
      close(project(123, 0, rot).z, 1)
      expect(Math.abs(rot - current)).toBeLessThanOrEqual(180)
    }
  })
})

describe('frontIndex / stepIndex', () => {
  const islands = layoutIslands([{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }])
  it('finds the island facing the viewer', () => {
    expect(frontIndex(islands, rotationFor(islands[2].lon, 0))).toBe(2)
  })
  it('cycles both ways', () => {
    expect(stepIndex(0, -1, 4)).toBe(3)
    expect(stepIndex(3, 1, 4)).toBe(0)
  })
})

describe('PLANET_ISLANDS', () => {
  it('has every TOEIC zone plus the other English activities, with unique ids', () => {
    const ids = PLANET_ISLANDS.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const z of ZONES) expect(ids).toContain(z.id)
    expect(ids).toEqual(expect.arrayContaining(['daily', 'review', 'phonics', 'syllables', 'build']))
  })
  it('spreads islands around the whole planet', () => {
    const lons = PLANET_ISLANDS.map((i) => i.lon).sort((a, b) => a - b)
    const gaps = lons.slice(1).map((l, i) => l - lons[i])
    expect(Math.min(...gaps)).toBeGreaterThan(20)
    for (const i of PLANET_ISLANDS) {
      expect(i.to).toMatch(/^\//)
      expect(i.color).toMatch(/^#/)
    }
  })
})
