// 英語星球：把島嶼的經緯度投影到畫面上，以及旋轉星球時的角度計算（純函式，有測試）。
// 約定：rot 是星球目前轉了幾度；島嶼經度 lon + rot = 0 時正對畫面中央。

const RAD = Math.PI / 180

// 把角度收斂到 (-180, 180]
export function wrapAngle(deg) {
  const a = ((deg % 360) + 360) % 360
  return a > 180 ? a - 360 : a
}

// 回傳畫面座標（以星球半徑為 1，中心為 0）：x 向右、y 向下；z > 0 代表在正面看得到
export function project(lon, lat, rot) {
  const a = (lon + rot) * RAD
  const p = lat * RAD
  return {
    x: Math.cos(p) * Math.sin(a),
    y: -Math.sin(p),
    z: Math.cos(p) * Math.cos(a),
  }
}

// 讓經度 lon 轉到正前方需要的 rot，選離目前角度最近的那一個（不會繞遠路轉一大圈）
export function rotationFor(lon, current) {
  return current + wrapAngle(-lon - current)
}

// 目前最靠近正前方的島
export function frontIndex(islands, rot) {
  let best = 0
  let bestZ = -Infinity
  islands.forEach((isl, i) => {
    const { z } = project(isl.lon, isl.lat, rot)
    if (z > bestZ) {
      bestZ = z
      best = i
    }
  })
  return best
}

// 上一座／下一座（循環）
export const stepIndex = (i, step, n) => (((i + step) % n) + n) % n

// 平均分配經度，緯度交錯上下，讓島不會排成一直線
export function layoutIslands(list, lats = [18, -22, 30, -8, -32, 8]) {
  const gap = 360 / list.length
  return list.map((isl, i) => ({ ...isl, lon: wrapAngle(i * gap), lat: lats[i % lats.length] }))
}
