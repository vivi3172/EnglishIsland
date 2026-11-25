// 英語星球上的島嶼：六個多益區域 + 每日單字、情境對話、錯題、自然發音、音節切分、無線電塔。
// 只放靜態資料；進度（星星、熟練度）在 PlanetView 依存檔計算。
import { ZONES } from './zones.js'
import { layoutIslands } from '../logic/planet.js'

const zoneIslands = ZONES.map((z, i) => ({
  id: z.id,
  kind: 'zone',
  tag: `TOEIC ${String(i + 1).padStart(2, '0')}`,
  title: z.zh,
  en: z.name,
  emoji: z.emoji,
  color: z.color,
  to: `/zone/${z.id}`,
}))

const extraIslands = [
  { id: 'daily', kind: 'daily', tag: 'DAILY', title: '每日漂流瓶', en: 'Daily Words', emoji: '🍾', color: '#5eead4', to: '/daily' },
  { id: 'phonics', kind: 'phonics', tag: 'PHONICS', title: '五大長母音', en: 'Long Vowels', emoji: '🖐️', color: '#c084fc', to: '/phonics/long-vowels' },
  { id: 'syllables', kind: 'syllables', tag: 'PHONICS', title: '音節切分', en: 'Syllable Chop', emoji: '🥥', color: '#a3e635', to: '/phonics/syllables' },
  { id: 'review', kind: 'review', tag: 'LOST & FOUND', title: '錯題怪獸窩', en: 'Review', emoji: '👾', color: '#f472b6', to: '/review' },
  { id: 'talk', kind: 'talk', tag: 'CONVERSATION', title: '對話咖啡廳', en: 'Conversation Café', emoji: '💬', color: '#fbbf24', to: '/talk' },
  { id: 'build', kind: 'build', tag: 'RESCUE', title: '求救無線電塔', en: 'Radio Tower', emoji: '📡', color: '#fb923c', to: '/build' },
]

// 依學習順序交錯排列：區域之間穿插每日單字與發音，轉一圈就是一趟完整的練習路線
const order = [
  zoneIslands[0], extraIslands[0], zoneIslands[1], extraIslands[1], zoneIslands[2], extraIslands[2],
  zoneIslands[3], extraIslands[3], zoneIslands[4], extraIslands[4], zoneIslands[5], extraIslands[5],
]

export const PLANET_ISLANDS = layoutIslands(order)
