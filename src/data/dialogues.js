// 情境對話（多益入門）：對方先說，輪到你（you）時從 3 句中選最合適的回應。
// 錯誤選項仿照多益 Part 2 的常見陷阱：聽到相同單字就選、答非所問（問 where 答時間）、語氣或身分不對。
// 每個錯誤選項都要有 why（中文說明為什麼不對）；正解 ok: true，每輪剛好一個（tests/dialogue.test.js 會檢查）。

const them = (en, zh) => ({ who: 'them', en, zh })
const you = (...options) => ({ who: 'you', options })
const ok = (en, zh) => ({ en, zh, ok: true })
const no = (en, zh, why) => ({ en, zh, why })

export const DIALOGUES = [
  {
    id: 'airport',
    title: '機場報到',
    en: 'Airport Check-in',
    emoji: '🛫',
    color: '#f4c95d',
    scene: '你在機場航空公司櫃台辦理報到，要搭飛往東京的班機。',
    youRole: '旅客',
    themRole: '櫃台人員',
    lines: [
      them('Good morning. Where are you flying today?', '早安，您今天要飛往哪裡？'),
      you(
        ok("I'm flying to Tokyo.", '我要飛東京。'),
        no('At nine in the morning.', '早上九點。', '對方問 Where（哪裡），不是 When（什麼時候）。'),
        no("Yes, it's a nice flight.", '是的，這是個很好的航班。', '問的是目的地，用 Yes 回答答非所問。'),
      ),
      them('May I see your passport, please?', '可以看一下您的護照嗎？'),
      you(
        no('I passed the test.', '我通過考試了。', 'passport 和 passed 聽起來像，這是多益常見的「相似音」陷阱。'),
        ok('Sure, here you are.', '好的，在這裡。'),
        no("No, I don't have a ticket.", '不，我沒有票。', '對方要的是護照，而且這時應該把護照交出去。'),
      ),
      them('Do you have any bags to check?', '您有行李要托運嗎？'),
      you(
        ok('Just one suitcase.', '只有一個行李箱。'),
        no('Please check my email.', '請檢查我的電子郵件。', 'check 在這裡是「托運」，不是「檢查」，重複聽到的字不一定是答案。'),
        no('The bag is very cheap.', '這個包包很便宜。', '對方問有沒有行李要托運，不是問價格。'),
      ),
      them('Here is your boarding pass. Your flight leaves from Gate 12.', '這是您的登機證，您的班機從 12 號登機門出發。'),
      you(
        no('Gate 12 is very expensive.', '12 號門很貴。', '登機門沒有價格，這句話不合情境。'),
        no("You're welcome.", '不客氣。', '對方幫了你，你應該說謝謝，「不客氣」是回應別人道謝用的。'),
        ok('Thank you. What time does boarding start?', '謝謝。幾點開始登機？'),
      ),
      them('Boarding starts at 8:30. Have a nice flight!', '八點半開始登機。祝您旅途愉快！'),
    ],
  },
  {
    id: 'hotel',
    title: '飯店入住',
    en: 'Hotel Check-in',
    emoji: '🏨',
    color: '#38bdf8',
    scene: '你出差抵達飯店，在櫃台辦理入住。',
    youRole: '房客',
    themRole: '櫃台人員',
    lines: [
      them('Good evening. Welcome to the Ocean Hotel. How can I help you?', '晚安，歡迎光臨海洋飯店。有什麼需要幫忙的嗎？'),
      you(
        ok('Hi. I have a reservation under Chen.', '你好，我用陳的名字訂了房。'),
        no('I am a hotel worker.', '我是飯店員工。', '你是來入住的客人，不是員工。'),
        no('The ocean is very blue.', '海很藍。', '聽到 Ocean 就回答海，是重複字陷阱；對方問你需要什麼幫忙。'),
      ),
      them('Yes, Mr. Chen. A single room for three nights, right?', '是的，陳先生。單人房住三晚，對嗎？'),
      you(
        no('Three o\'clock is fine.', '三點可以。', '對方說的是「三晚」，不是「三點」。'),
        ok("That's right.", '沒錯。'),
        no('No, I am single.', '不，我單身。', 'single room 是單人房，跟你是不是單身無關。'),
      ),
      them('Here is your key. Your room is on the fifth floor.', '這是您的鑰匙，您的房間在五樓。'),
      you(
        ok('Thanks. Where is the elevator?', '謝謝，電梯在哪裡？'),
        no('I lost my key yesterday.', '我昨天弄丟鑰匙了。', '你剛拿到鑰匙，時間和情境都不對。'),
        no('The floor is very clean.', '地板很乾淨。', 'floor 在這裡是「樓層」，不是「地板」。'),
      ),
      them("It's on your left. Breakfast is from seven to ten.", '在您的左手邊。早餐時間是七點到十點。'),
      you(
        no('I had dinner at seven.', '我七點吃了晚餐。', '對方在告知早餐時間，這句話跟資訊無關。'),
        no('Turn left at the corner.', '在轉角左轉。', '這是你在報路，而不是回應對方。'),
        ok('Great. Where is the restaurant?', '太好了。餐廳在哪裡？'),
      ),
      them("It's on the first floor, next to the lobby. Enjoy your stay!", '在一樓，大廳旁邊。祝您住宿愉快！'),
    ],
  },
  {
    id: 'restaurant',
    title: '餐廳點餐',
    en: 'Ordering Lunch',
    emoji: '🍽️',
    color: '#ef7b6c',
    scene: '午休時間，你和同事到公司附近的餐廳吃飯。',
    youRole: '客人',
    themRole: '服務生',
    lines: [
      them('Hi there. Table for how many?', '您好，請問幾位？'),
      you(
        ok('Two, please.', '兩位，謝謝。'),
        no('The table is too small.', '桌子太小了。', '對方問人數，還沒帶位，也還不知道桌子大小。'),
        no('At twelve thirty.', '十二點半。', '問的是 how many（幾位），不是時間。'),
      ),
      them('Here are your menus. Are you ready to order?', '這是菜單。您準備好點餐了嗎？'),
      you(
        no('Yes, I ordered a new laptop.', '是的，我訂了一台新筆電。', 'order 在這裡是「點餐」，這句講的是另一件事。'),
        ok('Yes. I would like the chicken salad.', '好了，我想要雞肉沙拉。'),
        no('The menu is on the wall.', '菜單在牆上。', '服務生剛把菜單給你，應該回答要點什麼。'),
      ),
      them('Would you like something to drink?', '您想喝點什麼嗎？'),
      you(
        no('I drink every day at the gym.', '我每天在健身房喝。', '對方在幫你點飲料，這句跟點餐無關。'),
        no('No, I am not hungry.', '不，我不餓。', '問的是喝什麼，「不餓」是回答要不要吃東西。'),
        ok('Just water, please.', '水就好，謝謝。'),
      ),
      them('Here is your bill. How would you like to pay?', '這是您的帳單。您要怎麼付款？'),
      you(
        ok('By card, please.', '刷卡，謝謝。'),
        no('Bill is my coworker.', 'Bill 是我同事。', 'bill 是「帳單」，不是人名 Bill。'),
        no('It was twenty dollars.', '是二十元。', '問的是付款方式（how），不是金額。'),
      ),
      them('Thank you. Have a nice day!', '謝謝您，祝您有美好的一天！'),
    ],
  },
  {
    id: 'return',
    title: '退換貨',
    en: 'Returning an Item',
    emoji: '🛍️',
    color: '#fb923c',
    scene: '你上週買的耳機壞了，帶著收據回到商店。',
    youRole: '顧客',
    themRole: '店員',
    lines: [
      them('Hello. How can I help you today?', '您好，今天有什麼需要幫忙的嗎？'),
      you(
        no('I can help you.', '我可以幫你。', '你是顧客，是你需要幫忙。'),
        ok('I want to return these headphones. They do not work.', '我想退這副耳機，它們不能用。'),
        no('Today is Monday.', '今天星期一。', '聽到 today 就答日期，是重複字陷阱。'),
      ),
      them('I am sorry about that. Do you have the receipt?', '很抱歉。您有收據嗎？'),
      you(
        ok('Yes, here it is.', '有，在這裡。'),
        no('I received your email.', '我收到你的郵件了。', 'receipt（收據）和 received（收到）字很像，但意思不同。'),
        no('No, I am not sorry.', '不，我不抱歉。', '對方是在問收據，不是在跟你爭論。'),
      ),
      them('Would you like a refund or a new pair?', '您想要退款還是換一副新的？'),
      you(
        no('Yes, please.', '好的，麻煩了。', '這是二選一的問題（A or B），不能只回答 Yes。'),
        no('I bought them last week.', '我上週買的。', '對方問你要退款還是換貨，不是問什麼時候買的。'),
        ok('A refund, please.', '請幫我退款。'),
      ),
      them('No problem. The money will go back to your card in three days.', '沒問題，錢會在三天內退回您的卡。'),
      you(
        ok('Great, thank you for your help.', '太好了，謝謝你的幫忙。'),
        no('My card is in my wallet.', '我的卡在錢包裡。', '對方已經處理完退款，此時應該道謝。'),
        no('Three days ago.', '三天前。', '對方說的是「三天內」會退款，不是問你什麼時候。'),
      ),
    ],
  },
  {
    id: 'meeting',
    title: '約開會時間',
    en: 'Scheduling a Meeting',
    emoji: '🗂️',
    color: '#a3e635',
    scene: '同事想約你討論新專案，你們在找彼此都有空的時間。',
    youRole: '專案負責人',
    themRole: '同事 Amy',
    lines: [
      them('Do you have time to meet this week? We need to discuss the new project.', '你這週有空開會嗎？我們需要討論新專案。'),
      you(
        ok('Sure. When are you free?', '當然，你什麼時候有空？'),
        no('The project was very easy.', '那個專案很簡單。', '專案才剛要開始討論，用過去式描述不合理。'),
        no('I have a new watch.', '我有一支新手錶。', 'time 是「時間空檔」，不是在問你的手錶。'),
      ),
      them('How about Wednesday at two?', '星期三兩點如何？'),
      you(
        no('I have two meetings.', '我有兩個會議。', '聽到 two 就答數量，是常見陷阱；對方在提議時間。'),
        ok("Sorry, I have a client meeting then. Is Thursday OK?", '抱歉，那時我要見客戶。星期四可以嗎？'),
        no('About two hours.', '大約兩小時。', '這是回答 How long（多久），不是在回應時間提議。'),
      ),
      them('Thursday morning works for me. Is ten o\'clock good?', '星期四早上我可以。十點好嗎？'),
      you(
        ok('Ten is perfect. Where should we meet?', '十點很好。我們在哪裡開會？'),
        no('Good morning!', '早安！', '對方說 morning 是在講時段，不是在打招呼。'),
        no('It works very well.', '它運作得很好。', 'works for me 是「我可以」，不是在說機器運作。'),
      ),
      them("Let's use Meeting Room B. I'll send you the agenda.", '我們用 B 會議室吧，我會把議程寄給你。'),
      you(
        no("I'll send you the agenda.", '我會把議程寄給你。', '這是對方剛說要做的事，重複一次不是回應。'),
        ok('Thanks. See you on Thursday.', '謝謝，星期四見。'),
        no('Room B is very big.', 'B 會議室很大。', '對方已經安排好，此時應該確認並道謝。'),
      ),
    ],
  },
  {
    id: 'interview',
    title: '工作面試',
    en: 'Job Interview',
    emoji: '🪪',
    color: '#c084fc',
    scene: '你來應徵業務助理的工作，人資經理正在面試你。',
    youRole: '應徵者',
    themRole: '面試官',
    lines: [
      them('Thank you for coming. Please have a seat.', '謝謝你來，請坐。'),
      you(
        ok('Thank you for having me.', '謝謝您給我這個機會。'),
        no('The seat is very comfortable.', '這椅子很舒服。', 'have a seat 只是「請坐」，此時應該禮貌道謝。'),
        no('You are welcome to come.', '歡迎你來。', '這是主人才會說的話，你是來面試的人。'),
      ),
      them('Can you tell me about your work experience?', '可以說說你的工作經驗嗎？'),
      you(
        no('I took the bus here.', '我搭公車來的。', '問的是工作經驗，不是交通方式。'),
        no('Yes, I can tell you.', '是的，我可以告訴你。', '只答 Yes 沒有內容，面試時應該直接說明。'),
        ok('I worked in sales for two years.', '我做了兩年業務。'),
      ),
      them('Why do you want to work here?', '你為什麼想在這裡工作？'),
      you(
        ok('I like your products, and I want to learn more.', '我喜歡貴公司的產品，也想多學習。'),
        no('I work from nine to six.', '我九點工作到六點。', '問的是 Why（為什麼），不是工作時間。'),
        no('Here is my resume.', '這是我的履歷。', '面試已經開始，對方問的是動機。'),
      ),
      them('Do you have any questions for us?', '你有什麼問題想問我們嗎？'),
      you(
        no('No, I answered all the questions.', '不，我回答完所有問題了。', '對方是邀請你提問，不是問你答完沒有。'),
        ok('Yes. When can I expect to hear from you?', '有的，請問我大約什麼時候會收到消息？'),
        no('Yes, the questions were easy.', '有，問題很簡單。', '答非所問，而且在面試時說問題很簡單不太禮貌。'),
      ),
      them("We'll call you next week. Thank you.", '我們下週會打電話給你，謝謝。'),
    ],
  },
  {
    id: 'phone',
    title: '電話留言',
    en: 'Taking a Message',
    emoji: '📞',
    color: '#5eead4',
    scene: '你打電話找客戶公司的 Mr. Brown，但他不在座位上。',
    youRole: '打電話的人',
    themRole: '總機',
    lines: [
      them('Good afternoon, Star Company. How may I help you?', '午安，星星公司，請問有什麼可以幫您？'),
      you(
        ok('Hello. May I speak to Mr. Brown, please?', '您好，請問 Brown 先生在嗎？'),
        no('Good night.', '晚安。', 'Good night 是道別用語；現在是下午，打招呼要用 Good afternoon 或 Hello。'),
        no('I like stars.', '我喜歡星星。', 'Star Company 是公司名稱，這是重複字陷阱。'),
      ),
      them("I'm sorry, he's in a meeting right now. Would you like to leave a message?", '抱歉，他現在在開會。您要留言嗎？'),
      you(
        no('I will leave at five.', '我五點會離開。', 'leave a message 是「留言」，不是「離開」。'),
        no('The meeting room is on the left.', '會議室在左邊。', '聽到 meeting 就回答會議室，對方是問你要不要留言。'),
        ok('Yes, please. This is Kevin Lin from ABC Trading.', '好的，我是 ABC 貿易的林凱文。'),
      ),
      them('Sure, Mr. Lin. What is your phone number?', '好的，林先生。請問您的電話號碼？'),
      you(
        ok('It is 0912-345-678.', '是 0912-345-678。'),
        no('I have a new phone.', '我有一支新手機。', '問的是號碼，不是你有什麼手機。'),
        no('Number five, please.', '請給我五號。', '這不是電話號碼，像是在點套餐。'),
      ),
      them("Thank you. I'll ask him to call you back this afternoon.", '謝謝，我會請他今天下午回電給您。'),
      you(
        no('I will call you back.', '我會回電給你。', '要回電的是 Mr. Brown，不是你。'),
        no('Good afternoon.', '午安。', '對話要結束了，應該道謝而不是再打招呼。'),
        ok('Thank you very much. Goodbye.', '非常感謝，再見。'),
      ),
    ],
  },
  {
    id: 'directions',
    title: '問路',
    en: 'Asking for Directions',
    emoji: '🗺️',
    color: '#f472b6',
    scene: '你在陌生的城市出差，要去車站，向路人問路。',
    youRole: '出差的旅客',
    themRole: '路人',
    lines: [
      you(
        ok('Excuse me. How do I get to the train station?', '不好意思，請問車站怎麼走？'),
        no('Excuse me. Where is my train ticket?', '不好意思，我的火車票在哪裡？', '路人不會知道你的車票在哪裡，你要問的是路。'),
        no('Hello. I am a train driver.', '你好，我是火車駕駛。', '你是要去車站的旅客，這句沒有問路。'),
      ),
      them('Go straight for two blocks, then turn right.', '直走兩個街區，然後右轉。'),
      you(
        no("That's right.", '沒錯。', '對方說的 right 是「右轉」，不是「正確」。'),
        ok('Two blocks, then right. Is it far?', '兩個街區後右轉。遠嗎？'),
        no('I have two blocks.', '我有兩塊積木。', 'block 在這裡是「街區」。'),
      ),
      them("No, it's about a five-minute walk.", '不遠，大約走路五分鐘。'),
      you(
        no('I walk five days a week.', '我一週走五天。', '聽到 five 和 walk 就重組成另一句話，是陷阱。'),
        no('No, it is not my bag.', '不，那不是我的包包。', '完全答非所問。'),
        ok('Great. Is there a coffee shop near the station?', '太好了。車站附近有咖啡店嗎？'),
      ),
      them("Yes, there's one on the corner, across from the bank.", '有，轉角有一家，在銀行對面。'),
      you(
        ok('Thank you so much for your help!', '非常感謝你的幫忙！'),
        no('I need to go to the bank.', '我需要去銀行。', '銀行只是地標，你剛得到答案應該道謝。'),
        no('You are welcome.', '不客氣。', '是對方幫了你，你要說謝謝。'),
      ),
      them("You're welcome. Have a good trip!", '不客氣，旅途愉快！'),
    ],
  },
]

export const findDialogue = (id) => DIALOGUES.find((d) => d.id === id) ?? null
