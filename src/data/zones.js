// 荒島區域與單字內容（基礎程度 / CEFR A1，求生主題）
// 每個區域依序解鎖：前一區小測驗拿到至少 1 顆星就能前往下一區。
// resource：在這個區域探索（完成挑戰）會獲得的主要物資。
// pos 為地圖上的百分比座標。

export const ZONES = [
  {
    id: 'beach',
    name: 'Shipwreck Beach',
    zh: '沉船海灘',
    emoji: '🚣',
    color: '#f4c95d',
    pos: { x: 22, y: 72 },
    resource: 'food',
    intro: '你在這裡醒來。翻找船骸，也許還有能吃的罐頭。',
    words: [
      { en: 'help', zh: '救命；幫忙', emoji: '🆘', example: 'Help me, please!', exampleZh: '請幫幫我！' },
      { en: 'boat', zh: '小船', emoji: '🚣', example: 'The boat is broken.', exampleZh: '船壞了。' },
      { en: 'sea', zh: '海', emoji: '🌊', example: 'The sea is big.', exampleZh: '大海很大。' },
      { en: 'sand', zh: '沙子', emoji: '🏖️', example: 'The sand is hot.', exampleZh: '沙子很燙。' },
      { en: 'sun', zh: '太陽', emoji: '☀️', example: 'I see the sun.', exampleZh: '我看到太陽。' },
      { en: 'hot', zh: '熱的', emoji: '🥵', example: 'It is hot today.', exampleZh: '今天很熱。' },
      { en: 'bag', zh: '包包', emoji: '🎒', example: 'This is my bag.', exampleZh: '這是我的包包。' },
      { en: 'hat', zh: '帽子', emoji: '👒', example: 'I have a hat.', exampleZh: '我有一頂帽子。' },
    ],
  },
  {
    id: 'spring',
    name: 'Fresh Spring',
    zh: '清泉溪谷',
    emoji: '🏞️',
    color: '#38bdf8',
    pos: { x: 44, y: 58 },
    resource: 'water',
    intro: '沒有水活不過三天。學會這些字，找到乾淨的水源！',
    words: [
      { en: 'water', zh: '水', emoji: '💧', example: 'I need water.', exampleZh: '我需要水。' },
      { en: 'drink', zh: '喝', emoji: '🥤', example: 'I drink water.', exampleZh: '我喝水。' },
      { en: 'cup', zh: '杯子', emoji: '☕', example: 'This is a cup.', exampleZh: '這是一個杯子。' },
      { en: 'river', zh: '河', emoji: '🏞️', example: 'The river is long.', exampleZh: '這條河很長。' },
      { en: 'rain', zh: '雨', emoji: '🌧️', example: 'I like the rain.', exampleZh: '我喜歡下雨。' },
      { en: 'clean', zh: '乾淨的', emoji: '✨', example: 'The water is clean.', exampleZh: '這水很乾淨。' },
      { en: 'cold', zh: '冷的', emoji: '🧊', example: 'The water is cold.', exampleZh: '這水很冰。' },
      { en: 'wash', zh: '洗', emoji: '🧼', example: 'I wash my hands.', exampleZh: '我洗手。' },
    ],
  },
  {
    id: 'forest',
    name: 'Fruit Forest',
    zh: '野果森林',
    emoji: '🥥',
    color: '#ef7b6c',
    pos: { x: 70, y: 66 },
    resource: 'food',
    intro: '肚子好餓！森林裡有水果，海邊還能抓魚。',
    words: [
      { en: 'apple', zh: '蘋果', emoji: '🍎', example: 'I eat an apple.', exampleZh: '我吃一顆蘋果。' },
      { en: 'banana', zh: '香蕉', emoji: '🍌', example: 'The banana is yellow.', exampleZh: '香蕉是黃色的。' },
      { en: 'coconut', zh: '椰子', emoji: '🥥', example: 'The coconut is big.', exampleZh: '這顆椰子很大。' },
      { en: 'fish', zh: '魚', emoji: '🐟', example: 'I can eat fish.', exampleZh: '我可以吃魚。' },
      { en: 'egg', zh: '蛋', emoji: '🥚', example: 'I have an egg.', exampleZh: '我有一顆蛋。' },
      { en: 'eat', zh: '吃', emoji: '🍽️', example: "Let's eat!", exampleZh: '我們來吃吧！' },
      { en: 'hungry', zh: '餓的', emoji: '😋', example: 'I am hungry.', exampleZh: '我好餓。' },
      { en: 'food', zh: '食物', emoji: '🍱', example: 'We need food.', exampleZh: '我們需要食物。' },
    ],
  },
  {
    id: 'camp',
    name: 'Jungle Camp',
    zh: '叢林營地',
    emoji: '⛺',
    color: '#5bb36b',
    pos: { x: 62, y: 36 },
    resource: 'wood',
    intro: '天快黑了。收集木頭、生火、搭帳篷，才能平安過夜。',
    words: [
      { en: 'fire', zh: '火', emoji: '🔥', example: 'The fire is hot.', exampleZh: '火很燙。' },
      { en: 'wood', zh: '木頭', emoji: '🪵', example: 'I need wood.', exampleZh: '我需要木頭。' },
      { en: 'tree', zh: '樹', emoji: '🌳', example: 'The tree is tall.', exampleZh: '這棵樹很高。' },
      { en: 'rock', zh: '石頭', emoji: '🪨', example: 'The rock is big.', exampleZh: '這塊石頭很大。' },
      { en: 'rope', zh: '繩子', emoji: '🪢', example: 'I have a rope.', exampleZh: '我有一條繩子。' },
      { en: 'tent', zh: '帳篷', emoji: '⛺', example: 'This is my tent.', exampleZh: '這是我的帳篷。' },
      { en: 'sleep', zh: '睡覺', emoji: '😴', example: 'I sleep in the tent.', exampleZh: '我睡在帳篷裡。' },
      { en: 'night', zh: '晚上', emoji: '🌙', example: 'It is night.', exampleZh: '現在是晚上。' },
    ],
  },
  {
    id: 'hill',
    name: 'Wild Hill',
    zh: '野獸山丘',
    emoji: '🐍',
    color: '#9b7fd1',
    pos: { x: 34, y: 32 },
    resource: 'herb',
    intro: '山丘上長著草藥，但也有危險的動物。看懂警告才能保命！',
    words: [
      { en: 'snake', zh: '蛇', emoji: '🐍', example: 'Look! A snake!', exampleZh: '你看！有蛇！' },
      { en: 'crab', zh: '螃蟹', emoji: '🦀', example: 'The crab is red.', exampleZh: '螃蟹是紅色的。' },
      { en: 'bird', zh: '鳥', emoji: '🐦', example: 'The bird can fly.', exampleZh: '鳥會飛。' },
      { en: 'monkey', zh: '猴子', emoji: '🐒', example: 'The monkey likes bananas.', exampleZh: '猴子喜歡香蕉。' },
      { en: 'shark', zh: '鯊魚', emoji: '🦈', example: 'The shark can swim.', exampleZh: '鯊魚會游泳。' },
      { en: 'run', zh: '跑', emoji: '🏃', example: 'Run fast!', exampleZh: '快跑！' },
      { en: 'big', zh: '大的', emoji: '🐘', example: 'The shark is big.', exampleZh: '鯊魚很大。' },
      { en: 'small', zh: '小的', emoji: '🐜', example: 'The crab is small.', exampleZh: '螃蟹很小。' },
    ],
  },
  {
    id: 'lighthouse',
    name: 'Old Lighthouse',
    zh: '廢棄燈塔',
    emoji: '🗼',
    color: '#fb923c',
    pos: { x: 50, y: 16 },
    resource: 'parts',
    intro: '燈塔裡有舊無線電的零件。修好它，就能呼叫救援！',
    words: [
      { en: 'light', zh: '光；燈', emoji: '💡', example: 'I see a light.', exampleZh: '我看到一道光。' },
      { en: 'radio', zh: '無線電', emoji: '📻', example: 'The radio is old.', exampleZh: '這台無線電很舊。' },
      { en: 'map', zh: '地圖', emoji: '🗺️', example: 'I have a map.', exampleZh: '我有一張地圖。' },
      { en: 'ship', zh: '大船', emoji: '🚢', example: 'I see a ship!', exampleZh: '我看到一艘船！' },
      { en: 'plane', zh: '飛機', emoji: '✈️', example: 'The plane is in the sky.', exampleZh: '飛機在天上。' },
      { en: 'home', zh: '家', emoji: '🏠', example: 'I want to go home.', exampleZh: '我想回家。' },
      { en: 'family', zh: '家人', emoji: '👨‍👩‍👧', example: 'I miss my family.', exampleZh: '我想念我的家人。' },
      { en: 'phone', zh: '電話；手機', emoji: '📱', example: 'Where is my phone?', exampleZh: '我的手機在哪裡？' },
    ],
  },
]

export const ALL_WORDS = ZONES.flatMap((zone) => zone.words.map((w) => ({ ...w, zoneId: zone.id })))

export function findZone(id) {
  return ZONES.find((z) => z.id === id) ?? null
}

export function findWord(en) {
  return ALL_WORDS.find((w) => w.en === en) ?? null
}
