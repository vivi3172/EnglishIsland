// 情境：奶奶煮飯。同一個角色、同一個場景、同一個動詞 cook，看 12 種時態怎麼變。
// 例句標記：[助動詞]  <主要動詞>  {時間提示詞}（logic/tense.js 的 parseSentence 會解析並上色）
// clue：句中哪個線索決定了時間與狀態（答錯解析會用到）
// tl：時間軸標籤；ref = 參考時間、second = 另一件事、duration = 持續多久、habit = 重複的習慣
export default {
  id: 'grandma',
  title: '奶奶煮飯',
  en: 'Grandma cooks dinner',
  emoji: '👵',
  character: 'grandma',
  activity: 'cook',
  verb: { base: 'cook', s: 'cooks', past: 'cooked', pp: 'cooked', ing: 'cooking' },
  tenses: {
    'present-simple': {
      en: 'Grandma <cooks> dinner {every day}.',
      zh: '奶奶每天都煮晚餐。',
      feel: '平常都會做',
      clue: 'every day 表示每天重複的習慣',
      tl: { ref: '每天', habit: true },
    },
    'present-continuous': {
      en: 'Grandma [is] <cooking> {now}.',
      zh: '奶奶現在正在煮飯。',
      feel: '現在正在做',
      clue: 'now 把鏡頭定格在說話的這一刻',
      tl: { ref: '現在' },
    },
    'present-perfect': {
      en: 'Grandma [has] {already} <cooked> dinner.',
      zh: '奶奶已經把晚餐煮好了。',
      feel: '到現在已經做了',
      clue: 'already 表示「到現在已經」，晚餐現在就在桌上',
      tl: { ref: '現在' },
    },
    'present-perfect-continuous': {
      en: 'Grandma [has been] <cooking> {for an hour}.',
      zh: '奶奶已經煮了一個小時。',
      feel: '到現在已經持續做了一段時間',
      clue: 'for an hour 強調一路做到現在的時間長度（可能還在煮，也可能剛停下）',
      tl: { ref: '現在', duration: '一小時' },
    },
    'past-simple': {
      en: 'Grandma <cooked> dinner {yesterday}.',
      zh: '奶奶昨天煮了晚餐。',
      feel: '過去做了',
      clue: 'yesterday 是明確的過去時間',
      tl: { ref: '昨天' },
    },
    'past-continuous': {
      en: 'Grandma [was] <cooking> {when I arrived}.',
      zh: '我到的時候，奶奶正在煮飯。',
      feel: '當時正在做',
      clue: 'when I arrived 把鏡頭定格在過去「我抵達」那一刻，那時她正煮到一半',
      tl: { ref: '我抵達時', second: '我抵達' },
    },
    'past-perfect': {
      en: 'Grandma [had] <cooked> dinner {before I arrived}.',
      zh: '我到之前，奶奶就已經把晚餐煮好了。',
      feel: '在過去某件事之前已經做了',
      clue: 'before I arrived 有兩件過去的事，煮飯比我抵達更早',
      tl: { ref: '我抵達時', second: '我抵達' },
    },
    'past-perfect-continuous': {
      en: 'Grandma [had been] <cooking> {for an hour} {before I arrived}.',
      zh: '我到之前，奶奶已經煮了一個小時。',
      feel: '到過去某個時間已經持續做了一段時間',
      clue: 'for an hour + before I arrived：截至過去「我抵達」那一刻，已經持續煮了一小時',
      tl: { ref: '我抵達時', second: '我抵達', duration: '一小時' },
    },
    'future-simple': {
      en: 'Grandma [will] <cook> dinner {tomorrow}.',
      zh: '奶奶明天會煮晚餐。',
      feel: '未來將會做',
      clue: 'tomorrow 是未來的時間',
      tl: { ref: '明天' },
    },
    'future-continuous': {
      en: 'Grandma [will be] <cooking> {at 6 p.m. tomorrow}.',
      zh: '明天晚上六點，奶奶會正在煮飯。',
      feel: '未來某個時間正在做',
      clue: 'at 6 p.m. tomorrow 是未來的某一刻，那時她正煮到一半',
      tl: { ref: '明天 6 p.m.' },
    },
    'future-perfect': {
      en: 'Grandma [will have] <cooked> dinner {by 7 p.m.}',
      zh: '到晚上七點，奶奶就會把晚餐煮好了。',
      feel: '到未來某個時間將已經做完',
      clue: 'by 7 p.m. 是未來的截止點，在那之前會完成',
      tl: { ref: '7 p.m.' },
    },
    'future-perfect-continuous': {
      en: 'Grandma [will have been] <cooking> {for two hours} {by 7 p.m.}',
      zh: '到晚上七點，奶奶就已經煮了兩個小時。',
      feel: '到未來某個時間將已經持續做了一段時間',
      clue: 'for two hours + by 7 p.m.：截至未來七點，已經持續煮了兩小時',
      tl: { ref: '7 p.m.', duration: '兩小時' },
    },
  },
}
