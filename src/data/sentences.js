// 各區域的句型練習（A1 簡單句，求生主題）。
// answer：填空題要挖空的單字，必須是句子中的一個完整單字（不含標點），且同一區內不可重複（小寫比對）。
// 填空題的干擾選項取自同一區其他句子的 answer。

export const SENTENCES = {
  beach: {
    patterns: [
      { en: 'Help me, please!', zh: '請幫幫我！' },
      { en: 'I have a ___.', zh: '我有一個＿＿。' },
    ],
    items: [
      { en: 'Help me, please!', zh: '請幫幫我！', answer: 'Help' },
      { en: 'The boat is broken.', zh: '船壞了。', answer: 'boat' },
      { en: 'The sea is big.', zh: '大海很大。', answer: 'sea' },
      { en: 'I have a hat.', zh: '我有一頂帽子。', answer: 'hat' },
      { en: 'It is hot today.', zh: '今天很熱。', answer: 'hot' },
      { en: 'This is my bag.', zh: '這是我的包包。', answer: 'bag' },
    ],
  },
  spring: {
    patterns: [
      { en: 'I need ___.', zh: '我需要＿＿。' },
      { en: 'The water is ___.', zh: '這水是＿＿的。' },
    ],
    items: [
      { en: 'I need water.', zh: '我需要水。', answer: 'water' },
      { en: 'I drink from the river.', zh: '我從河裡喝水。', answer: 'river' },
      { en: 'The water is clean.', zh: '這水很乾淨。', answer: 'clean' },
      { en: 'I like the rain.', zh: '我喜歡下雨。', answer: 'rain' },
      { en: 'I wash my cup.', zh: '我洗我的杯子。', answer: 'cup' },
      { en: 'The river is cold.', zh: '河水很冰。', answer: 'cold' },
    ],
  },
  forest: {
    patterns: [
      { en: 'I am hungry.', zh: '我好餓。' },
      { en: 'I eat ___.', zh: '我吃＿＿。' },
    ],
    items: [
      { en: 'I am hungry.', zh: '我好餓。', answer: 'hungry' },
      { en: 'I eat a banana.', zh: '我吃一根香蕉。', answer: 'banana' },
      { en: 'The coconut is big.', zh: '這顆椰子很大。', answer: 'coconut' },
      { en: 'I can catch a fish.', zh: '我可以抓一條魚。', answer: 'fish' },
      { en: 'We need food.', zh: '我們需要食物。', answer: 'food' },
      { en: 'This apple is red.', zh: '這顆蘋果是紅色的。', answer: 'apple' },
    ],
  },
  camp: {
    patterns: [
      { en: 'I need ___.', zh: '我需要＿＿。' },
      { en: 'This is my ___.', zh: '這是我的＿＿。' },
    ],
    items: [
      { en: 'I make a fire.', zh: '我生了一堆火。', answer: 'fire' },
      { en: 'I need wood.', zh: '我需要木頭。', answer: 'wood' },
      { en: 'This is my tent.', zh: '這是我的帳篷。', answer: 'tent' },
      { en: 'The tree is tall.', zh: '這棵樹很高。', answer: 'tree' },
      { en: 'I sleep at night.', zh: '我晚上睡覺。', answer: 'night' },
      { en: 'I have a rope.', zh: '我有一條繩子。', answer: 'rope' },
    ],
  },
  hill: {
    patterns: [
      { en: 'Look! A ___!', zh: '你看！有＿＿！' },
      { en: 'The ___ is big.', zh: '＿＿很大。' },
    ],
    items: [
      { en: 'Look! A snake!', zh: '你看！有蛇！', answer: 'snake' },
      { en: 'The crab is small.', zh: '螃蟹很小。', answer: 'crab' },
      { en: 'The shark is big.', zh: '鯊魚很大。', answer: 'shark' },
      { en: 'The bird can fly.', zh: '鳥會飛。', answer: 'bird' },
      { en: 'I run fast.', zh: '我跑得很快。', answer: 'run' },
      { en: 'The monkey is funny.', zh: '猴子很好笑。', answer: 'monkey' },
    ],
  },
  lighthouse: {
    patterns: [
      { en: 'I see a ___!', zh: '我看到＿＿！' },
      { en: 'I want to go home.', zh: '我想回家。' },
    ],
    items: [
      { en: 'I see a ship!', zh: '我看到一艘船！', answer: 'ship' },
      { en: 'I want to go home.', zh: '我想回家。', answer: 'home' },
      { en: 'The radio is old.', zh: '這台無線電很舊。', answer: 'radio' },
      { en: 'I have a map.', zh: '我有一張地圖。', answer: 'map' },
      { en: 'I see a light.', zh: '我看到一道光。', answer: 'light' },
      { en: 'I miss my family.', zh: '我想念我的家人。', answer: 'family' },
    ],
  },
}
