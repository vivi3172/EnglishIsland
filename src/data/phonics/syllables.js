// 自然發音課程：音節切分（Syllable Division）——「一元一輔切」
//
// 長單字先切成小塊（音節），每塊只有一個元音的聲音，一塊一塊唸再合起來就會唸了。
// 步驟：① 標出元音 V（a e i o u），其他字母是輔音 C
//       ② 看前兩個元音中間夾了幾個輔音
//       ③ 依規則切開 → ④ 每段分開唸 → ⑤ 合起來
//
// 單字格式 s('pa|per', zh, say?)
//   用 | 標出切的位置（本課只收兩個音節的字，只切一刀）
//   say：TTS 唸單獨音節會怪時的近似發音（與音節一一對應，不需要就省略）
//   「輔音 + le」的第二段（ble、tle…）由 logic/syllables.js 自動轉成近似音，不必寫 say

const s = (marked, zh, say = null) => {
  const parts = marked.split('|')
  return { en: parts.join(''), parts, zh, say }
}

export const SYLLABLES = {
  id: 'syllables',
  title: '音節切分',
  en: 'Syllable Division',
  intro:
    '看到長單字不要怕：先找出元音（a e i o u），再看元音中間夾了幾個輔音，就知道要從哪裡切開。切成小塊後一塊一塊唸，再合起來，就能自己讀出沒看過的字。',
  digraphs: ['ck', 'sh', 'ch', 'th', 'ph', 'wh', 'ng'],
  rules: [
    {
      id: 'compound',
      name: '複合字',
      tag: '小字 | 小字',
      color: '#5eead4',
      short: '先找出兩個認識的小字，從中間切開',
      rule: '有些長字其實是兩個小字黏在一起：sun + set、air + port。先找出你認識的小字，從它們中間切開，這條規則最優先。',
      vowel: null,
      words: [
        s('sun|set', '日落'),
        s('cup|cake', '杯子蛋糕'),
        s('rain|bow', '彩虹'),
        s('air|port', '機場'),
        s('week|end', '週末'),
        s('home|work', '回家作業'),
        s('dead|line', '截止期限'),
        s('in|side', '在裡面'),
        s('mail|box', '信箱'),
        s('pass|port', '護照'),
      ],
    },
    {
      id: 'vccv',
      name: '兩輔切中間',
      tag: 'VC | CV',
      color: '#fb7185',
      short: '兩個元音中間夾兩個輔音 → 從兩個輔音中間切',
      rule: '元音中間夾著兩個輔音（雙寫的 bb、tt 也算兩個），就從兩個輔音中間切開。前一段以輔音結尾，母音被「關住」，唸短音。',
      vowel: 'short',
      words: [
        s('nap|kin', '餐巾'),
        s('rab|bit', '兔子'),
        s('bas|ket', '籃子'),
        s('win|ter', '冬天'),
        s('pic|nic', '野餐'),
        s('den|tist', '牙醫'),
        s('hap|pen', '發生'),
        s('let|ter', '信'),
        s('prob|lem', '問題'),
        s('mag|net', '磁鐵'),
        s('can|cel', '取消', ['can', 'sell']),
        s('con|tact', '聯絡'),
        s('of|fice', '辦公室', ['off', 'fiss']),
        s('dis|count', '折扣'),
      ],
    },
    {
      id: 'vcv-open',
      name: '一元一輔切前面',
      tag: 'V | CV',
      color: '#f5a524',
      short: '元音後面只有一個輔音 → 先切在輔音前，前一段唸長音',
      rule: '一個元音後面只跟一個輔音、再接下一個元音（V C V），先把刀切在輔音前面。前一段以元音結尾，母音沒有被關住（開音節），唸字母本身的名字，也就是長音：pa·per 的 a 唸 /eɪ/。',
      vowel: 'long',
      words: [
        s('pa|per', '紙'),
        s('ti|ger', '老虎'),
        s('mu|sic', '音樂'),
        s('o|pen', '打開'),
        s('ro|bot', '機器人'),
        s('stu|dent', '學生'),
        s('ho|tel', '飯店'),
        s('pi|lot', '飛行員'),
        s('si|lent', '安靜的'),
        s('la|bel', '標籤', ['lay', 'bull']),
        s('to|tal', '總計', ['toe', 'tull']),
        s('fo|cus', '焦點；專注', ['foe', 'cus']),
      ],
    },
    {
      id: 'vcv-closed',
      name: '唸不通就切後面',
      tag: 'VC | V',
      color: '#a78bfa',
      short: '一元一輔切前面唸不通 → 改切在輔音後，前一段唸短音',
      rule: '一元一輔先試 V|CV；如果唸起來不像你聽過的字（ca·mel 會唸成「凱·摸」），就把刀往後移一格，切在輔音後面（cam·el）。輔音把母音關住了，改唸短音 /æ/。',
      vowel: 'short',
      words: [
        s('cam|el', '駱駝', ['cam', 'ell']),
        s('lem|on', '檸檬'),
        s('vis|it', '拜訪'),
        s('wag|on', '四輪車'),
        s('sal|ad', '沙拉'),
        s('plan|et', '行星', ['plan', 'it']),
        s('sev|en', '七', ['sev', 'in']),
        s('cab|in', '小屋；機艙'),
        s('hab|it', '習慣'),
        s('mod|el', '模型；模特兒', ['mod', 'ell']),
        s('trav|el', '旅行', ['trav', 'ell']),
        s('prof|it', '利潤', ['prof', 'it']),
        s('fin|ish', '完成'),
      ],
    },
    {
      id: 'cle',
      name: '輔音 + le',
      tag: 'C + le',
      color: '#38bdf8',
      short: '字尾是「輔音 + le」→ 從字尾往前數三個字母切',
      rule: '字尾是 ble、tle、ple、dle、zle 這種「輔音 + le」，就連同前面那個輔音一起切下來（從字尾往前數 3 個字母）。le 唸輕輕的 /əl/。前一段如果以元音結尾唸長音（ta·ble），以輔音結尾唸短音（lit·tle）。',
      vowel: 'auto',
      words: [
        s('ta|ble', '桌子'),
        s('ti|tle', '標題'),
        s('lit|tle', '小的'),
        s('ap|ple', '蘋果'),
        s('can|dle', '蠟燭'),
        s('bot|tle', '瓶子'),
        s('puz|zle', '拼圖'),
        s('sim|ple', '簡單的'),
        s('mid|dle', '中間'),
        s('han|dle', '把手；處理'),
      ],
    },
  ],
}
