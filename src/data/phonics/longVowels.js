// 自然發音課程：五大長母音（Long Vowels）
//
// 資料結構（其他自然發音課程沿用同一格式即可接上同一套 UI 與練習邏輯）：
//   course.groups[]            一個字母群組（這門課 = 五根手指 A E I O U）
//     .sounds[]                這個群組的發音（U 有 /juː/ 與 /uː/ 兩種）
//       .patterns[]            會發出這個音的拼字組合（ai、ay、a_e…；含 _ 代表中間夾子音）
//         .words[]             課程單字（教學、練習用）
//         .extra[]             延伸單字（陌生單字拼讀挑戰、導師延伸練習用）
//     .exceptions[]            例外：拼法相同但不這樣唸的字
//   course.pairs[]             長短母音比較組
//   course.shortSounds{}       比較組用到的短母音說明
//
// 單字格式 w(en, ipa, zh, graphemes, phonemes, example, exampleZh, homophones?)
//   graphemes / phonemes 以空白分隔、一一對應；不發音的字母 phoneme 寫 '-'
//   例：name → 'n a m e' / 'n eɪ m -'
//   homophones：同音字，麥克風跟讀時一起接受，填空題也用來排除「另一種拼法剛好是別的字」的選項

const w = (en, ipa, zh, g, p, example, exampleZh, homophones = []) => ({
  en,
  ipa,
  zh,
  g: g.split(' '),
  p: p.split(' ').map((x) => (x === '-' ? '' : x)),
  example,
  exampleZh,
  homophones,
})

export const LONG_VOWELS = {
  id: 'long-vowels',
  title: '五大長母音',
  en: 'Long Vowels',
  intro:
    '長母音就是「唸字母名稱」的那個音：A 唸 /eɪ/、E 唸 /iː/、I 唸 /aɪ/、O 唸 /oʊ/、U 唸 /juː/ 或 /uː/。同一個音可以有好幾種拼法，學會這些拼字組合，遇到沒看過的字也能自己拼讀。',
  groups: [
    {
      id: 'a',
      key: 'A',
      finger: '拇指',
      color: '#fb7185',
      sounds: [
        {
          id: 'a-long',
          ipa: 'eɪ',
          label: '長母音 A',
          say: 'A',
          anchor: 'rain',
          mouth: '嘴巴半開，先發「欸」再滑向「一」；舌頭從中間往上抬，嘴角稍微往兩側拉。是一個會「滑動」的音，不要只唸成短短的「欸」。',
          why: '在 a 後面加上另一個母音字母（i、y）或在字尾加不發音的 e，都是在告訴你：「這個 a 要唸字母本身的名字 /eɪ/」。',
          patterns: [
            {
              id: 'a-ai',
              spelling: 'ai',
              position: '字中間，後面通常接子音',
              rule: 'ai 兩個字母一起唸 /eɪ/，i 不另外發音。ai 幾乎不會出現在字尾。',
              words: [
                w('rain', 'reɪn', '雨', 'r ai n', 'r eɪ n', 'It will rain today.', '今天會下雨。', ['reign', 'rein']),
                w('train', 'treɪn', '火車', 't r ai n', 't r eɪ n', 'The train is late.', '火車誤點了。'),
                w('mail', 'meɪl', '郵件', 'm ai l', 'm eɪ l', 'Did you check the mail?', '你看過郵件了嗎？', ['male']),
                w('wait', 'weɪt', '等待', 'w ai t', 'w eɪ t', 'Please wait here.', '請在這裡等。', ['weight']),
              ],
              extra: [
                w('sail', 'seɪl', '航行；帆', 's ai l', 's eɪ l', 'We sail to the island.', '我們航行到島上。', ['sale']),
                w('paint', 'peɪnt', '油漆；畫', 'p ai n t', 'p eɪ n t', 'The paint is still wet.', '油漆還沒乾。'),
              ],
            },
            {
              id: 'a-ay',
              spelling: 'ay',
              position: '字尾',
              rule: 'ay 是 ai 的「字尾版本」：英文字很少用 i 結尾，所以 /eɪ/ 在字尾時改寫成 ay。',
              words: [
                w('play', 'pleɪ', '玩；播放', 'p l ay', 'p l eɪ', "Let's play a game.", '我們來玩遊戲吧。'),
                w('day', 'deɪ', '天；日子', 'd ay', 'd eɪ', 'Have a nice day.', '祝你有美好的一天。'),
                w('say', 'seɪ', '說', 's ay', 's eɪ', 'What did you say?', '你說了什麼？'),
                w('stay', 'steɪ', '停留；住', 's t ay', 's t eɪ', 'We stay at a hotel.', '我們住在飯店。'),
              ],
              extra: [
                w('gray', 'greɪ', '灰色的', 'g r ay', 'g r eɪ', 'The sky is gray.', '天空灰灰的。'),
                w('tray', 'treɪ', '托盤', 't r ay', 't r eɪ', 'Put the cups on the tray.', '把杯子放在托盤上。'),
              ],
            },
            {
              id: 'a-a_e',
              spelling: 'a_e',
              position: 'a + 一個子音 + 字尾不發音的 e',
              rule: '字尾的 e 不發音（silent e），它的任務是讓前面的 a 唸長音 /eɪ/。拿掉 e 就變短音：cape → cap。',
              words: [
                w('name', 'neɪm', '名字', 'n a m e', 'n eɪ m -', 'What is your name?', '你叫什麼名字？'),
                w('cake', 'keɪk', '蛋糕', 'c a k e', 'k eɪ k -', 'This cake is sweet.', '這個蛋糕很甜。'),
                w('late', 'leɪt', '遲的；晚的', 'l a t e', 'l eɪ t -', "Don't be late.", '不要遲到。'),
                w('gate', 'geɪt', '大門；登機門', 'g a t e', 'g eɪ t -', 'Go to gate five.', '請到五號登機門。'),
              ],
              extra: [
                w('shade', 'ʃeɪd', '陰涼處', 'sh a d e', 'ʃ eɪ d -', 'Rest in the shade.', '在陰涼處休息。'),
                w('plane', 'pleɪn', '飛機', 'p l a n e', 'p l eɪ n -', 'The plane is ready.', '飛機準備好了。', ['plain']),
              ],
            },
          ],
        },
      ],
      exceptions: [
        { word: 'said', ipa: 'sɛd', zh: '說（過去式）', note: 'ai 在 said 裡唸短音 /ɛ/，是很常見的例外。' },
        { word: 'have', ipa: 'hæv', zh: '有', note: '看起來是 a_e，但 a 唸短音 /æ/。英文字幾乎不以 v 結尾，所以後面補 e，不代表長音。' },
        { word: 'are', ipa: 'ɑr', zh: '是', note: 'are 的 a 被後面的 r 影響（R 控制母音），不唸 /eɪ/。' },
      ],
    },
    {
      id: 'e',
      key: 'E',
      finger: '食指',
      color: '#fbbf24',
      sounds: [
        {
          id: 'e-long',
          ipa: 'iː',
          label: '長母音 E',
          say: 'E',
          anchor: 'bee',
          mouth: '嘴角往兩側拉，像在微笑；舌頭前半部抬高靠近上顎，發出拉長的「一～」。嘴角要用力，跟放鬆的短音 /ɪ/ 不同。',
          why: 'ee、ea、ey 都是「兩個母音字母走在一起」，第一個字母 e 唸自己的名字 /iː/；e_e 則是 silent e 讓前面的 e 唸長音。',
          patterns: [
            {
              id: 'e-ee',
              spelling: 'ee',
              position: '字中間或字尾',
              rule: 'ee 是最穩定的 /iː/ 拼法，看到 ee 幾乎都可以放心唸 /iː/。',
              words: [
                w('bee', 'biː', '蜜蜂', 'b ee', 'b iː', 'A bee is on the flower.', '一隻蜜蜂停在花上。', ['be', 'b']),
                w('tree', 'triː', '樹', 't r ee', 't r iː', 'The tree is tall.', '這棵樹很高。'),
                w('meet', 'miːt', '見面；認識', 'm ee t', 'm iː t', 'Nice to meet you.', '很高興認識你。', ['meat']),
                w('need', 'niːd', '需要', 'n ee d', 'n iː d', 'I need water.', '我需要水。', ['knead']),
              ],
              extra: [
                w('sweet', 'swiːt', '甜的', 's w ee t', 's w iː t', 'The fruit is sweet.', '這水果很甜。', ['suite']),
                w('green', 'griːn', '綠色的', 'g r ee n', 'g r iː n', 'The leaves are green.', '葉子是綠色的。'),
              ],
            },
            {
              id: 'e-ea',
              spelling: 'ea',
              position: '字中間或字尾',
              rule: 'ea 大多唸 /iː/，a 不發音。但 ea 也常唸短音 /ɛ/（bread），是長母音裡最需要小心的拼法。',
              words: [
                w('tea', 'tiː', '茶', 't ea', 't iː', 'I drink tea every day.', '我每天喝茶。', ['tee', 't']),
                w('eat', 'iːt', '吃', 'ea t', 'iː t', "Let's eat lunch.", '我們吃午餐吧。'),
                w('read', 'riːd', '閱讀', 'r ea d', 'r iː d', 'I read the news.', '我讀新聞。', ['reed']),
                w('team', 'tiːm', '團隊', 't ea m', 't iː m', 'Our team works hard.', '我們的團隊很努力。'),
              ],
              extra: [
                w('beach', 'biːtʃ', '海灘', 'b ea ch', 'b iː tʃ', 'We walk on the beach.', '我們在海灘上散步。', ['beech']),
                w('clean', 'kliːn', '乾淨的', 'c l ea n', 'k l iː n', 'The water is clean.', '水很乾淨。'),
              ],
            },
            {
              id: 'e-ey',
              spelling: 'ey',
              position: '字尾',
              rule: 'ey 在 key 裡唸 /iː/；在多音節字的字尾（money）沒有重音，唸成輕而短的 /i/。',
              words: [
                w('key', 'kiː', '鑰匙', 'k ey', 'k iː', 'Where is my key?', '我的鑰匙在哪裡？', ['quay']),
                w('money', 'ˈmʌni', '錢', 'm o n ey', 'm ʌ n i', 'I need some money.', '我需要一些錢。'),
              ],
              extra: [
                w('honey', 'ˈhʌni', '蜂蜜', 'h o n ey', 'h ʌ n i', 'Bees make honey.', '蜜蜂會釀蜂蜜。'),
              ],
            },
            {
              id: 'e-e_e',
              spelling: 'e_e',
              position: 'e + 一個子音 + 字尾不發音的 e',
              rule: '跟 a_e 一樣是 silent e 規則：字尾 e 不發音，讓前面的 e 唸長音 /iː/。這個拼法的字不多。',
              words: [
                w('these', 'ðiːz', '這些', 'th e s e', 'ð iː z -', 'These are my bags.', '這些是我的包包。'),
                w('Pete', 'piːt', '彼特（人名）', 'P e t e', 'p iː t -', 'Pete is my friend.', '彼特是我的朋友。', ['peat']),
                w('theme', 'θiːm', '主題', 'th e m e', 'θ iː m -', 'The theme is travel.', '主題是旅行。'),
                w('scene', 'siːn', '場景；景色', 'sc e n e', 's iː n -', 'It is a beautiful scene.', '這是很美的景色。', ['seen']),
              ],
              extra: [
                w('delete', 'dɪˈliːt', '刪除', 'd e l e t e', 'd ɪ l iː t -', 'Please delete the file.', '請刪除這個檔案。'),
              ],
            },
          ],
        },
      ],
      exceptions: [
        { word: 'bread', ipa: 'brɛd', zh: '麵包', note: 'ea 也常唸短音 /ɛ/（bread、head、ready）。' },
        { word: 'great', ipa: 'greɪt', zh: '很棒的', note: 'ea 在 great、break 裡唸 /eɪ/。' },
        { word: 'they', ipa: 'ðeɪ', zh: '他們', note: 'ey 在 they、grey 裡唸 /eɪ/。' },
        { word: 'there', ipa: 'ðɛr', zh: '那裡', note: 'there、where 雖然是 e_e，但 e 被 r 影響，不唸 /iː/。' },
      ],
    },
    {
      id: 'i',
      key: 'I',
      finger: '中指',
      color: '#4ade80',
      sounds: [
        {
          id: 'i-long',
          ipa: 'aɪ',
          label: '長母音 I',
          say: 'I',
          anchor: 'bike',
          mouth: '嘴巴先張大唸「啊」，下巴再往上收、滑向「一」，聽起來像中文的「愛」。滑動要完整，不要停在「啊」。',
          why: 'i_e 用 silent e 讓 i 唸長音；ie 是兩個母音字母一起出現；igh 的 gh 不發音，只是讓 i 唸長音的拼字習慣。',
          patterns: [
            {
              id: 'i-i_e',
              spelling: 'i_e',
              position: 'i + 一個子音 + 字尾不發音的 e',
              rule: 'silent e 讓前面的 i 唸 /aɪ/。拿掉 e 就變短音：bite → bit。',
              words: [
                w('bike', 'baɪk', '腳踏車', 'b i k e', 'b aɪ k -', 'I ride my bike to work.', '我騎腳踏車上班。'),
                w('time', 'taɪm', '時間', 't i m e', 't aɪ m -', 'What time is it?', '現在幾點？', ['thyme']),
                w('nine', 'naɪn', '九', 'n i n e', 'n aɪ n -', "It's nine o'clock.", '現在九點。'),
                w('ride', 'raɪd', '騎；搭乘', 'r i d e', 'r aɪ d -', 'Can I ride with you?', '我可以搭你的車嗎？'),
              ],
              extra: [
                w('smile', 'smaɪl', '微笑', 's m i l e', 's m aɪ l -', 'She has a nice smile.', '她的笑容很好看。'),
                w('price', 'praɪs', '價格', 'p r i c e', 'p r aɪ s -', 'The price is too high.', '價格太高了。'),
              ],
            },
            {
              id: 'i-ie',
              spelling: 'ie',
              position: '短字的字尾',
              rule: '在只有一個音節的短字字尾，ie 唸 /aɪ/（lie、pie）。但在字中間（field）常唸 /iː/。',
              words: [
                w('lie', 'laɪ', '說謊；躺', 'l ie', 'l aɪ', "Don't lie to me.", '不要對我說謊。', ['lye']),
                w('pie', 'paɪ', '派（點心）', 'p ie', 'p aɪ', 'Apple pie is my favorite.', '蘋果派是我的最愛。', ['pi']),
                w('tie', 'taɪ', '領帶', 't ie', 't aɪ', 'He wears a tie.', '他打領帶。', ['thai']),
              ],
              extra: [
                w('fries', 'fraɪz', '薯條', 'f r ie s', 'f r aɪ z', 'I want fries with my burger.', '我的漢堡要配薯條。'),
                w('cries', 'kraɪz', '哭（第三人稱）', 'c r ie s', 'k r aɪ z', 'The baby cries at night.', '寶寶晚上會哭。'),
              ],
            },
            {
              id: 'i-igh',
              spelling: 'igh',
              position: '字中間或字尾，後面常接 t',
              rule: 'igh 三個字母一起唸 /aɪ/，gh 完全不發音。看到 -ight 就唸 /aɪt/。',
              words: [
                w('high', 'haɪ', '高的', 'h igh', 'h aɪ', 'The wall is high.', '這面牆很高。', ['hi']),
                w('light', 'laɪt', '燈；光', 'l igh t', 'l aɪ t', 'Turn on the light.', '把燈打開。', ['lite']),
                w('night', 'naɪt', '夜晚', 'n igh t', 'n aɪ t', 'Good night.', '晚安。', ['knight']),
                w('right', 'raɪt', '對的；右邊', 'r igh t', 'r aɪ t', 'You are right.', '你說得對。', ['write', 'rite']),
              ],
              extra: [
                w('bright', 'braɪt', '明亮的', 'b r igh t', 'b r aɪ t', 'The sun is bright.', '陽光很亮。'),
                w('flight', 'flaɪt', '班機', 'f l igh t', 'f l aɪ t', 'My flight is at nine.', '我的班機九點起飛。'),
              ],
            },
          ],
        },
      ],
      exceptions: [
        { word: 'give', ipa: 'gɪv', zh: '給', note: '看起來是 i_e，但唸短音 /ɪ/（give、live 當動詞「住」時）。英文字很少以 v 結尾，e 是補上去的。' },
        { word: 'field', ipa: 'fiːld', zh: '田野；領域', note: 'ie 在字中間常唸 /iː/（field、piece）。' },
        { word: 'friend', ipa: 'frɛnd', zh: '朋友', note: 'friend 的 ie 唸短音 /ɛ/，要特別記。' },
      ],
    },
    {
      id: 'o',
      key: 'O',
      finger: '無名指',
      color: '#38bdf8',
      sounds: [
        {
          id: 'o-long',
          ipa: 'oʊ',
          label: '長母音 O',
          say: 'O',
          anchor: 'boat',
          mouth: '嘴唇先圓起來唸「歐」，再收得更小滑向「烏」；舌頭後半部抬起。結尾嘴唇要收圓，不要唸成扁扁的「ㄡ」。',
          why: 'o_e 用 silent e；oa、oe 是兩個母音字母一起出現；ow 在字尾取代 oa（英文字很少用 a 結尾）。',
          patterns: [
            {
              id: 'o-o_e',
              spelling: 'o_e',
              position: 'o + 一個子音 + 字尾不發音的 e',
              rule: 'silent e 讓前面的 o 唸 /oʊ/。拿掉 e 就變短音：hope → hop。',
              words: [
                w('home', 'hoʊm', '家', 'h o m e', 'h oʊ m -', 'I go home at six.', '我六點回家。'),
                w('note', 'noʊt', '筆記；便條', 'n o t e', 'n oʊ t -', 'Please take a note.', '請記下來。'),
                w('phone', 'foʊn', '電話；手機', 'ph o n e', 'f oʊ n -', 'My phone is dead.', '我的手機沒電了。'),
                w('nose', 'noʊz', '鼻子', 'n o s e', 'n oʊ z -', 'Touch your nose.', '摸摸你的鼻子。', ['knows']),
              ],
              extra: [
                w('stone', 'stoʊn', '石頭', 's t o n e', 's t oʊ n -', 'Sit on the stone.', '坐在石頭上。'),
                w('hope', 'hoʊp', '希望', 'h o p e', 'h oʊ p -', 'I hope you are well.', '希望你一切都好。'),
              ],
            },
            {
              id: 'o-oe',
              spelling: 'oe',
              position: '短字的字尾',
              rule: 'oe 在字尾唸 /oʊ/，e 不發音。這個拼法的字不多，但都很短。',
              words: [
                w('toe', 'toʊ', '腳趾', 't oe', 't oʊ', 'I hurt my toe.', '我弄傷了腳趾。', ['tow']),
                w('hoe', 'hoʊ', '鋤頭', 'h oe', 'h oʊ', 'He uses a hoe in the garden.', '他在花園裡用鋤頭。', ['ho']),
                w('foe', 'foʊ', '敵人', 'f oe', 'f oʊ', 'He is a friend, not a foe.', '他是朋友，不是敵人。'),
              ],
              extra: [
                w('Joe', 'dʒoʊ', '喬（人名）', 'J oe', 'dʒ oʊ', 'Joe is on the boat.', '喬在船上。'),
                w('woe', 'woʊ', '悲哀', 'w oe', 'w oʊ', 'A tale of woe.', '一個悲傷的故事。'),
              ],
            },
            {
              id: 'o-oa',
              spelling: 'oa',
              position: '字中間，後面接子音',
              rule: 'oa 兩個字母一起唸 /oʊ/，a 不發音。跟 ai 一樣，oa 幾乎不出現在字尾。',
              words: [
                w('boat', 'boʊt', '船', 'b oa t', 'b oʊ t', 'The boat is near the island.', '船在島的附近。'),
                w('road', 'roʊd', '道路', 'r oa d', 'r oʊ d', 'This road goes to the beach.', '這條路通往海灘。', ['rode']),
                w('coat', 'koʊt', '外套', 'c oa t', 'k oʊ t', "Wear a coat, it's cold.", '穿件外套，天氣很冷。'),
                w('soap', 'soʊp', '肥皂', 's oa p', 's oʊ p', 'Wash your hands with soap.', '用肥皂洗手。'),
              ],
              extra: [
                w('goat', 'goʊt', '山羊', 'g oa t', 'g oʊ t', 'The goat eats grass.', '山羊吃草。'),
                w('float', 'floʊt', '漂浮', 'f l oa t', 'f l oʊ t', 'Wood can float on water.', '木頭可以浮在水上。'),
              ],
            },
            {
              id: 'o-ow',
              spelling: 'ow',
              position: '字尾',
              rule: 'ow 在字尾常唸 /oʊ/（snow），是 oa 的「字尾版本」。注意 ow 也常唸 /aʊ/（cow）。',
              words: [
                w('snow', 'snoʊ', '雪', 's n ow', 's n oʊ', 'Snow is white.', '雪是白色的。'),
                w('show', 'ʃoʊ', '出示；表演', 'sh ow', 'ʃ oʊ', 'Please show me your ticket.', '請出示您的票。'),
                w('slow', 'sloʊ', '慢的', 's l ow', 's l oʊ', 'The bus is slow.', '公車很慢。', ['sloe']),
                w('grow', 'groʊ', '生長', 'g r ow', 'g r oʊ', 'Plants grow fast here.', '這裡的植物長得很快。'),
              ],
              extra: [
                w('glow', 'gloʊ', '發光', 'g l ow', 'g l oʊ', 'The fire has a warm glow.', '火堆發出溫暖的光。'),
                w('window', 'ˈwɪndoʊ', '窗戶', 'w i n d ow', 'w ɪ n d oʊ', 'Open the window.', '打開窗戶。'),
              ],
            },
          ],
        },
      ],
      exceptions: [
        { word: 'come', ipa: 'kʌm', zh: '來', note: '看起來是 o_e，但唸 /ʌ/（come、some、love、done）。這些都是很常見的字，要直接記。' },
        { word: 'shoe', ipa: 'ʃuː', zh: '鞋子', note: 'oe 在 shoe 裡唸 /uː/。' },
        { word: 'cow', ipa: 'kaʊ', zh: '乳牛', note: 'ow 也常唸 /aʊ/（cow、now、how），只能靠多聽多記分辨。' },
      ],
    },
    {
      id: 'u',
      key: 'U',
      finger: '小指',
      color: '#a78bfa',
      sounds: [
        {
          id: 'u-yoo',
          ipa: 'juː',
          label: '長母音 U（有 y 音）',
          say: 'U',
          anchor: 'cube',
          mouth: '先發短促的「一」（/j/），立刻接嘴唇噘圓的長「烏～」，聽起來就是字母 U 的名字，也跟英文 you 一樣。',
          why: 'u_e、ue、ew 都可以唸 /juː/。在 c、f、h、m、p 等子音後面，通常會多一個 y 的音。',
          patterns: [
            {
              id: 'u-yoo-u_e',
              spelling: 'u_e',
              position: 'u + 一個子音 + 字尾不發音的 e',
              rule: 'silent e 讓 u 唸長音。在 c、m、f、h 後面或字首時唸 /juː/（cube、use）；在 r、l、j 後面唸 /uː/（rule）。',
              words: [
                w('cube', 'kjuːb', '立方體；方塊', 'c u b e', 'k juː b -', 'Put an ice cube in the glass.', '在杯子裡放一塊冰塊。'),
                w('cute', 'kjuːt', '可愛的', 'c u t e', 'k juː t -', 'The puppy is cute.', '小狗很可愛。'),
                w('use', 'juːz', '使用', 'u s e', 'juː z -', 'Can I use your pen?', '我可以用你的筆嗎？'),
                w('huge', 'hjuːdʒ', '巨大的', 'h u g e', 'h juː dʒ -', 'The island is huge.', '這座島很大。'),
              ],
              extra: [
                w('mute', 'mjuːt', '靜音；啞的', 'm u t e', 'm juː t -', 'Please mute your phone.', '請把手機靜音。'),
                w('fuse', 'fjuːz', '保險絲', 'f u s e', 'f juː z -', 'The fuse is broken.', '保險絲斷了。'),
              ],
            },
            {
              id: 'u-yoo-ue',
              spelling: 'ue',
              position: '字尾',
              rule: 'ue 在字尾唸長音 U；在 c、g 後面常帶 y 音，唸 /juː/（cue、rescue）。',
              words: [
                w('cue', 'kjuː', '提示；暗號', 'c ue', 'k juː', 'Wait for your cue.', '等你的提示。', ['queue', 'q']),
                w('rescue', 'ˈrɛskjuː', '救援', 'r e s c ue', 'r ɛ s k juː', 'The rescue team is here.', '救援隊來了。'),
              ],
              extra: [w('argue', 'ˈɑrgjuː', '爭論', 'ar g ue', 'ɑr g juː', "Let's not argue.", '我們別吵了。')],
            },
            {
              id: 'u-yoo-ew',
              spelling: 'ew',
              position: '字尾',
              rule: 'ew 在 f、ph、v 等子音後面常唸 /juː/（few、nephew）。',
              words: [
                w('few', 'fjuː', '少數的；幾個', 'f ew', 'f juː', 'I have a few questions.', '我有幾個問題。'),
                w('nephew', 'ˈnɛfjuː', '姪子；外甥', 'n e ph ew', 'n ɛ f juː', 'My nephew is five.', '我的外甥五歲。'),
              ],
              extra: [w('curfew', 'ˈkɜrfjuː', '宵禁', 'c ur f ew', 'k ɜr f juː', 'The curfew is at ten.', '宵禁是十點。')],
            },
          ],
        },
        {
          id: 'u-oo',
          ipa: 'uː',
          label: '長母音 U（沒有 y 音）',
          say: 'ooh',
          anchor: 'food',
          mouth: '嘴唇噘圓往前推，舌頭後半部抬高，發出拉長的「烏～」。開頭不要加「一」，跟 /juː/ 的差別就在這裡。',
          why: 'u_e、ue、ew 在 r、l、j、t、d、s 後面通常不帶 y 音，唸 /uː/；oo、ui 也唸 /uː/。',
          patterns: [
            {
              id: 'u-oo-u_e',
              spelling: 'u_e',
              position: 'u + 一個子音 + 字尾不發音的 e',
              rule: '在 r、l、j 後面，u_e 唸 /uː/（rule、June），不帶 y 音。',
              words: [
                w('rule', 'ruːl', '規則', 'r u l e', 'r uː l -', 'Follow the rules.', '遵守規則。'),
                w('June', 'dʒuːn', '六月', 'J u n e', 'dʒ uː n -', 'My birthday is in June.', '我的生日在六月。'),
                w('flute', 'fluːt', '長笛', 'f l u t e', 'f l uː t -', 'She plays the flute.', '她吹長笛。'),
                w('tube', 'tuːb', '管子；軟管', 't u b e', 't uː b -', 'Squeeze the tube.', '擠一下軟管。'),
              ],
              extra: [
                w('dune', 'duːn', '沙丘', 'd u n e', 'd uː n -', 'We climb the sand dune.', '我們爬上沙丘。'),
                w('rude', 'ruːd', '無禮的', 'r u d e', 'r uː d -', "Don't be rude.", '不要沒禮貌。', ['rood']),
              ],
            },
            {
              id: 'u-oo-ue',
              spelling: 'ue',
              position: '字尾',
              rule: 'ue 在 l、r、t、d 後面唸 /uː/（blue、true）。',
              words: [
                w('blue', 'bluː', '藍色的', 'b l ue', 'b l uː', 'The sea is blue.', '海是藍色的。', ['blew']),
                w('true', 'truː', '真的', 't r ue', 't r uː', 'Is it true?', '是真的嗎？'),
                w('glue', 'gluː', '膠水', 'g l ue', 'g l uː', 'Use glue to fix it.', '用膠水把它黏好。'),
                w('clue', 'kluː', '線索', 'c l ue', 'k l uː', 'Here is a clue.', '這是一個線索。'),
              ],
              extra: [
                w('due', 'duː', '到期的', 'd ue', 'd uː', 'The report is due today.', '報告今天到期。', ['do', 'dew']),
                w('Sue', 'suː', '蘇（人名）', 'S ue', 's uː', 'Sue lives by the sea.', '蘇住在海邊。'),
              ],
            },
            {
              id: 'u-oo-ew',
              spelling: 'ew',
              position: '字尾',
              rule: 'ew 在 r、l、n、d、ch 後面唸 /uː/（grew、new）。許多過去式動詞以 ew 結尾。',
              words: [
                w('grew', 'gruː', '生長（過去式）', 'g r ew', 'g r uː', 'The tree grew tall.', '那棵樹長高了。'),
                w('new', 'nuː', '新的', 'n ew', 'n uː', 'I have a new phone.', '我有一支新手機。', ['knew']),
                w('flew', 'fluː', '飛（過去式）', 'f l ew', 'f l uː', 'The bird flew away.', '鳥飛走了。', ['flu', 'flue']),
                w('drew', 'druː', '畫（過去式）', 'd r ew', 'd r uː', 'She drew a map.', '她畫了一張地圖。'),
              ],
              extra: [
                w('crew', 'kruː', '船員；全體人員', 'c r ew', 'k r uː', 'The crew is safe.', '船員都平安。'),
                w('chew', 'tʃuː', '咀嚼', 'ch ew', 'tʃ uː', 'Chew your food well.', '食物要好好咀嚼。'),
              ],
            },
            {
              id: 'u-oo-oo',
              spelling: 'oo',
              position: '字中間或字尾',
              rule: 'oo 最常唸長音 /uː/（food）。但也常唸短音 /ʊ/（book），兩種都要聽熟。',
              words: [
                w('food', 'fuːd', '食物', 'f oo d', 'f uː d', 'We need food.', '我們需要食物。'),
                w('moon', 'muːn', '月亮', 'm oo n', 'm uː n', 'The moon is bright.', '月亮很亮。'),
                w('room', 'ruːm', '房間', 'r oo m', 'r uː m', 'This room is clean.', '這個房間很乾淨。'),
                w('school', 'skuːl', '學校', 's ch oo l', 's k uː l', 'I walk to school.', '我走路上學。'),
              ],
              extra: [
                w('spoon', 'spuːn', '湯匙', 's p oo n', 's p uː n', 'I need a spoon.', '我需要一支湯匙。'),
                w('pool', 'puːl', '游泳池；水池', 'p oo l', 'p uː l', 'The hotel has a pool.', '飯店有游泳池。'),
              ],
            },
            {
              id: 'u-oo-ui',
              spelling: 'ui',
              position: '字中間',
              rule: 'ui 唸 /uː/，i 不發音（fruit、juice）。但 build 的 ui 唸 /ɪ/，是例外。',
              words: [
                w('fruit', 'fruːt', '水果', 'f r ui t', 'f r uː t', 'I eat fruit every day.', '我每天吃水果。'),
                w('juice', 'dʒuːs', '果汁', 'j ui c e', 'dʒ uː s -', 'Orange juice, please.', '請給我柳橙汁。'),
                w('suit', 'suːt', '西裝', 's ui t', 's uː t', 'He wears a suit to work.', '他穿西裝上班。'),
              ],
              extra: [
                w('cruise', 'kruːz', '郵輪旅行', 'c r ui s e', 'k r uː z -', 'We went on a cruise.', '我們搭了郵輪旅行。', ['crews']),
                w('bruise', 'bruːz', '瘀青', 'b r ui s e', 'b r uː z -', 'I have a bruise on my arm.', '我手臂上有瘀青。', ['brews']),
              ],
            },
          ],
        },
      ],
      exceptions: [
        { word: 'book', ipa: 'bʊk', zh: '書', note: 'oo 也常唸短音 /ʊ/（book、good、foot），嘴唇較放鬆、聲音較短。' },
        { word: 'build', ipa: 'bɪld', zh: '建造', note: 'build 的 ui 唸短音 /ɪ/。' },
        { word: 'put', ipa: 'pʊt', zh: '放', note: '沒有 silent e 的 u 是短音，put 唸 /ʊ/、cut 唸 /ʌ/。' },
        { word: 'ue / ew', ipa: 'juː · uː', zh: '同一拼法兩種音', note: 'ue、ew、u_e 都可能唸 /juː/ 或 /uː/：在 r、l、j 後面多半是 /uː/，在 c、f、m、h 後面多半是 /juː/。' },
      ],
    },
  ],
  shortSounds: {
    'short-a': { ipa: 'æ', label: '短母音 a', mouth: '嘴巴張大、嘴角往兩側拉，介於「欸」和「啊」之間，短而有力。' },
    'short-e': { ipa: 'ɛ', label: '短母音 e', mouth: '嘴巴微開，短促的「欸」，不滑動。' },
    'short-i': { ipa: 'ɪ', label: '短母音 i', mouth: '放鬆的短「一」，嘴角不用力，比 /iː/ 短很多。' },
    'short-o': { ipa: 'ɑ', label: '短母音 o', mouth: '嘴巴張大、下巴放低，短的「啊」。' },
    'short-u': { ipa: 'ʌ', label: '短母音 u', mouth: '嘴巴半開放鬆，短促的「ㄜ」。' },
  },
  // 長短母音比較：short 沒有 silent e，long 有
  pairs: [
    { id: 'cap-cape', groupId: 'a', shortSound: 'short-a', patternId: 'a-a_e', short: { en: 'cap', ipa: 'kæp', zh: '帽子' }, long: { en: 'cape', ipa: 'keɪp', zh: '披風' } },
    { id: 'mad-made', groupId: 'a', shortSound: 'short-a', patternId: 'a-a_e', short: { en: 'mad', ipa: 'mæd', zh: '生氣的' }, long: { en: 'made', ipa: 'meɪd', zh: '做（過去式）' } },
    { id: 'pet-pete', groupId: 'e', shortSound: 'short-e', patternId: 'e-e_e', short: { en: 'pet', ipa: 'pɛt', zh: '寵物' }, long: { en: 'Pete', ipa: 'piːt', zh: '彼特（人名）' } },
    { id: 'bit-bite', groupId: 'i', shortSound: 'short-i', patternId: 'i-i_e', short: { en: 'bit', ipa: 'bɪt', zh: '一點點' }, long: { en: 'bite', ipa: 'baɪt', zh: '咬' } },
    { id: 'kit-kite', groupId: 'i', shortSound: 'short-i', patternId: 'i-i_e', short: { en: 'kit', ipa: 'kɪt', zh: '工具組' }, long: { en: 'kite', ipa: 'kaɪt', zh: '風箏' } },
    { id: 'hop-hope', groupId: 'o', shortSound: 'short-o', patternId: 'o-o_e', short: { en: 'hop', ipa: 'hɑp', zh: '單腳跳' }, long: { en: 'hope', ipa: 'hoʊp', zh: '希望' } },
    { id: 'not-note', groupId: 'o', shortSound: 'short-o', patternId: 'o-o_e', short: { en: 'not', ipa: 'nɑt', zh: '不' }, long: { en: 'note', ipa: 'noʊt', zh: '筆記' } },
    { id: 'cub-cube', groupId: 'u', shortSound: 'short-u', patternId: 'u-yoo-u_e', short: { en: 'cub', ipa: 'kʌb', zh: '幼獸' }, long: { en: 'cube', ipa: 'kjuːb', zh: '立方體' } },
    { id: 'tub-tube', groupId: 'u', shortSound: 'short-u', patternId: 'u-oo-u_e', short: { en: 'tub', ipa: 'tʌb', zh: '浴缸' }, long: { en: 'tube', ipa: 'tuːb', zh: '管子' } },
  ],
}
