// 英文 12 時態：3 種時間 × 4 種動作狀態。
// 這裡只放「結構性」內容（顏色、公式、助動詞為什麼這樣用、使用情境、易混淆）；
// 例句、翻譯、語感、時間軸標籤放在各情境檔（grandma.js、homework.js），新增情境不用改元件。
import GRANDMA from './grandma.js'
import HOMEWORK from './homework.js'

// anchor：參考時間在時間軸上的位置（0–100，由左到右 = 過去 → 未來）
export const TIMES = [
  {
    id: 'past', zh: '過去', en: 'Past', color: '#9ca3af', symbol: '◀', anchor: 21,
    gist: '動作的參考時間在過去',
    intro: '已經過去的時間：昨天、上週、我抵達的那一刻。助動詞和動詞都要「往回退一格」：is → was、has → had、cook → cooked。',
  },
  {
    id: 'present', zh: '現在', en: 'Present', color: '#4ade80', symbol: '●', anchor: 50,
    gist: '動作的參考時間是現在',
    intro: '說話的這一刻，以及「平常、一向如此」的事實與習慣。',
  },
  {
    id: 'future', zh: '未來', en: 'Future', color: '#60a5fa', symbol: '▶', anchor: 79,
    gist: '動作的參考時間在未來',
    intro: '還沒到的時間：明天、晚上七點、下週。最常用 will 把動作推到未來，will 後面一律接原形。',
  },
]

export const ASPECTS = [
  {
    id: 'simple', zh: '簡單式', en: 'Simple', color: '#818cf8', symbol: '●', shape: '一個點（習慣就是一再重複的點）',
    gist: '描述事實、習慣，或一次完整的事件',
    intro: '只說「有這件事」，不強調正在做、也不強調做了多久。',
    form: '動詞本身變化（cooks / cooked）或 will + 原形',
  },
  {
    id: 'continuous', zh: '進行式', en: 'Continuous', color: '#f472b6', symbol: '▬', shape: '一段正在進行的色塊',
    gist: '在參考時間那一刻，動作「正在」進行',
    intro: '把鏡頭定格在某一刻：那時候動作做到一半，還沒做完。',
    form: 'be 動詞 + V-ing',
  },
  {
    id: 'perfect', zh: '完成式', en: 'Perfect', color: '#d4915a', symbol: '✔', shape: '參考時間之前的一個勾勾',
    gist: '截至參考時間，動作「已經」發生',
    intro: '站在參考時間往回看：在那之前已經發生了。重點是「到那時已經有了」，不一定代表動作已經結束很久。',
    form: 'have / has / had + 過去分詞（p.p.）',
  },
  {
    id: 'perfect-continuous', zh: '完成進行式', en: 'Perfect Continuous', color: '#c084fc', symbol: '⟶', shape: '一路延伸到參考時間的箭頭',
    gist: '截至參考時間，動作「一直」在做，強調過程與時間長度',
    intro: '強調「做了多久」：從某時開始一路做到參考時間。動作到那時可能還在做，也可能剛停下——要看語境。',
    form: 'have / has / had been + V-ing',
  },
]

export const TIME_IDS = TIMES.map((t) => t.id)
export const ASPECT_IDS = ASPECTS.map((a) => a.id)
export const findTime = (id) => TIMES.find((t) => t.id === id) ?? null
export const findAspect = (id) => ASPECTS.find((a) => a.id === id) ?? null

export const tenseKey = (time, aspect) => `${time}-${aspect}`
export function splitKey(key) {
  const i = key.indexOf('-')
  return { time: key.slice(0, i), aspect: key.slice(i + 1) }
}
// 依「時間 → 狀態」排列的 12 個 key（矩陣與題庫用）
export const TENSE_KEYS = TIMES.flatMap((t) => ASPECTS.map((a) => tenseKey(t.id, a.id)))
// 節奏播放的順序：先現在，再過去、未來（從最熟悉的開始）
export const PLAY_ORDER = ['present', 'past', 'future'].flatMap((t) => ASPECT_IDS.map((a) => tenseKey(t, a)))

export function tenseName(key) {
  const { time, aspect } = splitKey(key)
  return `${findTime(time)?.zh ?? ''}${findAspect(aspect)?.zh ?? ''}`
}
export function tenseNameEn(key) {
  const { time, aspect } = splitKey(key)
  return `${findTime(time)?.en ?? ''} ${findAspect(aspect)?.en ?? ''}`
}

// 每個時態的公式、助動詞說明、常見使用情境、容易混淆的時態
// aux：這個時態「肯定句」裡助動詞的寫法（tests 會拿來比對每個情境的例句）
// verb：主要動詞要用哪一種形式（base / s / past / pp / ing），對應情境的 verb 物件
export const FORMS = {
  'past-simple': {
    formula: '主詞 + 動詞過去式', formulaEn: 'S + V-ed', aux: [], verb: 'past',
    auxWhy: '肯定句不需要助動詞，直接把動詞改成過去式。否定句和問句才借 did（did not + 原形）。',
    uses: ['過去某個時間發生、已經結束的事', '過去依序發生的幾個動作', '常搭配 yesterday、last night、ago、in 2020'],
    confused: ['present-perfect', 'past-perfect', 'past-continuous'],
  },
  'present-simple': {
    formula: '主詞 + 原形動詞（第三人稱單數 +s / es）', formulaEn: 'S + V(s)', aux: [], verb: 's',
    auxWhy: '肯定句不需要助動詞。主詞是第三人稱單數（Grandma、Lily = she）時，動詞加 s / es：cook → cooks、do → does。',
    uses: ['習慣、固定會做的事', '不變的事實與真理', '常搭配 every day、usually、always、often'],
    confused: ['present-continuous', 'present-perfect'],
  },
  'future-simple': {
    formula: '主詞 + will + 原形動詞', formulaEn: 'S + will + V', aux: ['will'], verb: 'base',
    auxWhy: 'will 把動作推到未來；will 後面一律接原形動詞，主詞是誰都不用加 s。',
    uses: ['未來會發生的事、預測', '當下決定要做的事', '常搭配 tomorrow、next week、soon'],
    confused: ['future-continuous', 'future-perfect'],
  },
  'past-continuous': {
    formula: '主詞 + was / were + V-ing', formulaEn: 'S + was/were + V-ing', aux: ['was'], verb: 'ing',
    auxWhy: 'was 是 be 動詞的過去式，把鏡頭定格在「當時」；V-ing 表示那時動作正做到一半。',
    uses: ['過去某個時刻正在做的事', '被另一件事打斷的背景動作（when + 過去簡單式）', '常搭配 at that time、when I arrived、while'],
    confused: ['past-simple', 'past-perfect-continuous'],
  },
  'present-continuous': {
    formula: '主詞 + am / is / are + V-ing', formulaEn: 'S + am/is/are + V-ing', aux: ['is'], verb: 'ing',
    auxWhy: 'is 是 be 動詞的現在式（第三人稱單數用 is），把鏡頭定格在「現在這一刻」；V-ing 表示正在進行。',
    uses: ['說話當下正在做的事', '這陣子暫時的狀態', '常搭配 now、right now、at the moment、Look!'],
    confused: ['present-simple', 'present-perfect-continuous'],
  },
  'future-continuous': {
    formula: '主詞 + will be + V-ing', formulaEn: 'S + will be + V-ing', aux: ['will', 'be'], verb: 'ing',
    auxWhy: 'will 指向未來，be + V-ing 表示「到了那個時刻，動作正在進行」。will 後面接原形 be。',
    uses: ['未來某個時刻正在做的事', '描述「到時候我在忙什麼」', '常搭配 at 6 p.m. tomorrow、this time next week'],
    confused: ['future-simple', 'future-perfect-continuous'],
  },
  'past-perfect': {
    formula: '主詞 + had + 過去分詞', formulaEn: 'S + had + p.p.', aux: ['had'], verb: 'pp',
    auxWhy: 'had 是 have 的過去式，把「截至」的參考點放在過去某一刻；後面接過去分詞（p.p.），表示在那之前已經發生。',
    uses: ['過去兩件事中「比較早」的那一件（過去的過去）', '常搭配 before、by the time、when + 過去式', '另一件事用過去簡單式'],
    confused: ['past-simple', 'present-perfect', 'past-perfect-continuous'],
  },
  'present-perfect': {
    formula: '主詞 + have / has + 過去分詞', formulaEn: 'S + have/has + p.p.', aux: ['has'], verb: 'pp',
    auxWhy: 'has（第三人稱單數）把參考點放在「現在」：到現在為止已經…。後面接過去分詞（p.p.），不是過去式：規則動詞長得一樣（cooked），不規則動詞不同（did → done）。',
    uses: ['到現在已經發生、和現在有關的事', '人生經驗（ever、never）', '常搭配 already、just、yet、since、so far'],
    confused: ['past-simple', 'present-perfect-continuous'],
  },
  'future-perfect': {
    formula: '主詞 + will have + 過去分詞', formulaEn: 'S + will have + p.p.', aux: ['will', 'have'], verb: 'pp',
    auxWhy: 'will have 把參考點放在未來：到那個時間點將已經…。will 後面接原形 have（不是 has）。',
    uses: ['到未來某個時間前會完成的事', '常搭配 by 7 p.m.、by the time、by next year'],
    confused: ['future-simple', 'future-perfect-continuous'],
  },
  'past-perfect-continuous': {
    formula: '主詞 + had been + V-ing', formulaEn: 'S + had been + V-ing', aux: ['had', 'been'], verb: 'ing',
    auxWhy: 'had been 把參考點放在過去某一刻，V-ing 強調在那之前一路持續了多久。',
    uses: ['過去某一刻之前持續了一段時間的動作', '說明當時的狀況是怎麼來的', '常搭配 for an hour、before、when'],
    confused: ['past-perfect', 'past-continuous'],
  },
  'present-perfect-continuous': {
    formula: '主詞 + have / has been + V-ing', formulaEn: 'S + have/has been + V-ing', aux: ['has', 'been'], verb: 'ing',
    auxWhy: 'has been 把參考點放在現在，V-ing 強調「一路做到現在」的過程與時間長度。',
    uses: ['從過去開始、一路做到現在的動作（可能還在做，也可能剛停）', '強調做了多久', '常搭配 for an hour、since 4 o’clock、all day'],
    confused: ['present-perfect', 'present-continuous'],
  },
  'future-perfect-continuous': {
    formula: '主詞 + will have been + V-ing', formulaEn: 'S + will have been + V-ing', aux: ['will', 'have', 'been'], verb: 'ing',
    auxWhy: 'will have been 把參考點放在未來，V-ing 強調到那時已經持續了多久。',
    uses: ['到未來某個時間，動作已經持續多久', '常搭配 for two hours + by 7 p.m.'],
    confused: ['future-perfect', 'future-continuous'],
  },
}

// 時態比較：優先提供的 5 組。note 說明「中文很像，英文為什麼不同」
export const COMPARISONS = [
  {
    id: 'ps-pc', a: 'present-simple', b: 'present-continuous',
    title: '平常會做 vs. 現在正在做',
    note: '中文常常都說「奶奶煮飯」。英文要分清楚：說的是「平常的習慣」（cooks），還是「此刻正在做」（is cooking）。',
    when: ['every day、usually → 習慣 → 簡單式', 'now、Look! → 此刻 → 進行式'],
  },
  {
    id: 'pas-pp', a: 'past-simple', b: 'present-perfect',
    title: '昨天做了 vs. 到現在已經做了',
    note: '中文都可以說「奶奶煮了晚餐」。過去簡單式把事情放在過去某個明確時間（yesterday）；現在完成式不在乎是什麼時候，只在乎「到現在已經有了」——晚餐現在就在桌上。',
    when: ['有明確過去時間（yesterday、last night）→ 過去簡單式', '強調和現在的關聯（already、just、yet）→ 現在完成式'],
  },
  {
    id: 'pp-ppc', a: 'present-perfect', b: 'present-perfect-continuous',
    title: '已經做好 vs. 一直做到現在',
    note: '中文都有「已經」。完成式看結果：晚餐已經煮好了；完成進行式看過程：已經煮了一個小時，重點是那一個小時。',
    when: ['在乎結果、做了幾次 → 現在完成式', '在乎做了多久、過程 → 現在完成進行式'],
  },
  {
    id: 'pas-pap', a: 'past-simple', b: 'past-perfect',
    title: '過去做了 vs. 過去的過去',
    note: '中文都說「奶奶煮了晚餐」。過去完成式用在有兩件過去的事、要強調哪一件比較早：我到之前，晚餐就已經煮好了。',
    when: ['只有一件過去的事 → 過去簡單式', '兩件過去的事，比較早的那件 → 過去完成式'],
  },
  {
    id: 'fs-fp', a: 'future-simple', b: 'future-perfect',
    title: '明天會做 vs. 到時候已經做完',
    note: '中文都有「會」。未來簡單式只說未來會做；未來完成式站在未來的某個時間點往回看：到七點時，晚餐將已經煮好。',
    when: ['單純說未來會做 → 未來簡單式', '有「by + 時間」的截止點 → 未來完成式'],
  },
]
export const findComparison = (id) => COMPARISONS.find((c) => c.id === id) ?? null
export function comparisonFor(a, b) {
  return COMPARISONS.find((c) => (c.a === a && c.b === b) || (c.a === b && c.b === a)) ?? null
}

// 節奏口訣：原創四拍口訣，每種動作狀態一句、每種時間一句
export const CHANTS = {
  time: {
    past: '回頭看，往後退 —— was、had、-ed',
    present: '就是現在，就在這 —— is、has、原形加 s',
    future: '往前看，還沒來 —— will 後面接原形',
  },
  aspect: {
    simple: '一個點，說事實 —— 做一次，或天天做',
    continuous: '定格看，正在做 —— be 加 -ing',
    perfect: '回頭勾，已經有 —— have 加 p.p.',
    'perfect-continuous': '一路做，做多久 —— have been 加 -ing',
  },
}

// 六階段學習路徑（完成條件在 logic/tense.js 的 stageStatus）
export const STAGES = [
  { id: 'time', no: 1, title: '認識過去、現在、未來', desc: '時間軸的三個區域', to: '/tenses/basics/time' },
  { id: 'aspect', no: 2, title: '理解四種動作狀態', desc: '點、色塊、勾勾、箭頭', to: '/tenses/basics/aspect' },
  { id: 'explore', no: 3, title: '探索 12 種時態', desc: '時間 × 狀態自由組合', to: '/tenses/explore' },
  { id: 'rhythm', no: 4, title: '節奏記憶與英文跟讀', desc: '口訣 + 連續朗讀', to: '/tenses/rhythm' },
  { id: 'compare', no: 5, title: '易混淆時態比較', desc: '並排看差在哪', to: '/tenses/compare' },
  { id: 'quiz', no: 6, title: '綜合情境測驗', desc: '六種題型混合', to: '/tenses/quiz/mixed' },
]

export const SCENARIOS = [GRANDMA, HOMEWORK]
export const DEFAULT_SCENARIO = GRANDMA.id
export const findScenario = (id) => SCENARIOS.find((s) => s.id === id) ?? null
