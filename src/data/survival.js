// 求生物資與可建造設施的顯示資料。數值規則在 src/logic/progress.js。
// icon 對應 src/components/Icon.vue 的圖示名稱。

export const RESOURCES = {
  food: { icon: 'food', zh: '食物', en: 'FOOD' },
  water: { icon: 'water', zh: '淡水', en: 'WATER' },
  wood: { icon: 'wood', zh: '木材', en: 'WOOD' },
  herb: { icon: 'herb', zh: '草藥', en: 'HERB' },
  parts: { icon: 'parts', zh: '零件', en: 'PARTS' },
}

export const STATS = {
  hunger: { icon: 'food', zh: '飽足', en: 'HUNGER' },
  thirst: { icon: 'water', zh: '水分', en: 'THIRST' },
  health: { icon: 'health', zh: '生命', en: 'HEALTH' },
}

// effect 只是說明文字；實際效果寫在 logic/progress.js 的 dailyTick / completeActivity
export const BUILDINGS = [
  { id: 'campfire', name: '營火', en: 'CAMPFIRE', icon: 'flame', cost: { wood: 2 }, effect: '每過一天，生命 +10', pos: { x: 58, y: 48 } },
  { id: 'rod', name: '釣竿', en: 'FISHING ROD', icon: 'fish', cost: { wood: 2, herb: 1 }, effect: '每過一天，食物 +1', pos: { x: 82, y: 78 } },
  { id: 'collector', name: '集雨桶', en: 'RAIN COLLECTOR', icon: 'bucket', cost: { wood: 3 }, effect: '每過一天，淡水 +1', pos: { x: 16, y: 50 } },
  { id: 'shelter', name: '庇護所', en: 'SHELTER', icon: 'tent', cost: { wood: 5, herb: 1 }, effect: '每天的飢餓與口渴減少 40%', pos: { x: 78, y: 44 } },
  { id: 'radio', name: '求救無線電', en: 'DISTRESS RADIO', icon: 'radio', cost: { parts: 8, wood: 3 }, effect: '發出求救訊號，等待救援', pos: { x: 30, y: 14 } },
]

// 挑戰（任務）定義：路由名稱、圖示、說明
export const MISSIONS = [
  { route: 'cards', icon: 'book', title: '單字卡', en: 'RECON', desc: '認識這一區的單字與發音' },
  { route: 'quiz', icon: 'target', title: '測驗', en: 'TRIAL', desc: '8 題選擇題，1 星以上解鎖下一區' },
  { route: 'spell', icon: 'type', title: '拼字', en: 'DECODE', desc: '把打散的字母排回單字' },
  { route: 'sentence', icon: 'chat', title: '句型', en: 'SIGNAL', desc: '填空與排序，用單字組成句子' },
]
