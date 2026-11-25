// 每日新單字題庫（多益入門）：每天依序發 5 個，學過的字會一直累積進每日測驗。
// 與 zones.js 的區域單字不重複（tests/review.test.js 會檢查）。
// 新增單字：直接加在陣列最後即可，已經發過的字不受影響（依 en 記錄，不依位置）。
// 每 5 個一組大致同主題，方便當天一起記。

const w = (en, zh, emoji, example, exampleZh) => ({ en, zh, emoji, example, exampleZh })

export const DAILY_WORDS = [
  // 時間與行程
  w('morning', '早上', '🌅', 'The meeting is tomorrow morning.', '會議在明天早上。'),
  w('week', '星期；一週', '📆', 'I work five days a week.', '我一週工作五天。'),
  w('today', '今天', '📍', 'The office is closed today.', '辦公室今天休息。'),
  w('late', '遲到的；晚的', '🐢', 'Sorry, I am late.', '抱歉，我遲到了。'),
  w('early', '早的；提早', '🐇', 'Please arrive early.', '請提早抵達。'),
  // 辦公用品
  w('desk', '書桌；辦公桌', '🗄️', 'The file is on my desk.', '檔案在我的桌上。'),
  w('copy', '影本；複印', '📠', 'Please make ten copies.', '請印十份。'),
  w('file', '檔案；文件夾', '📁', 'Save the file before you leave.', '離開前請先存檔。'),
  w('printer', '印表機', '🖨️', 'The printer is out of paper.', '印表機沒紙了。'),
  w('paper', '紙；文件', '📄', 'I need more paper.', '我需要更多紙。'),
  // 工作與職場
  w('work', '工作', '💼', 'I start work at nine.', '我九點開始工作。'),
  w('job', '工作；職業', '🧰', 'She found a new job.', '她找到了新工作。'),
  w('team', '團隊', '👥', 'Our team is very busy.', '我們的團隊非常忙。'),
  w('boss', '老闆；上司', '🧑‍💼', 'My boss is in a meeting.', '我的老闆在開會。'),
  w('busy', '忙碌的', '🏃', 'I am busy this week.', '我這週很忙。'),
  // 交通
  w('bus', '公車', '🚌', 'I take the bus to work.', '我搭公車上班。'),
  w('train', '火車', '🚆', 'The train leaves at noon.', '火車中午開。'),
  w('station', '車站', '🚉', 'Meet me at the station.', '在車站跟我碰面。'),
  w('traffic', '交通；車流', '🚦', 'Traffic is heavy today.', '今天交通很塞。'),
  w('taxi', '計程車', '🚕', 'Let us take a taxi.', '我們搭計程車吧。'),
  // 旅遊
  w('trip', '旅行；出差', '🧭', 'How was your business trip?', '你的出差還順利嗎？'),
  w('travel', '旅行；旅遊', '🌍', 'I like to travel for work.', '我喜歡因工作出差旅行。'),
  w('map', '地圖', '🗺️', 'Can you show me on the map?', '可以在地圖上指給我看嗎？'),
  w('hotel', '飯店', '🏨', 'Our hotel is near the airport.', '我們的飯店在機場附近。'),
  w('airport', '機場', '🛫', 'I will pick you up at the airport.', '我會去機場接你。'),
  // 餐飲
  w('lunch', '午餐', '🥪', 'Let us have lunch together.', '我們一起吃午餐吧。'),
  w('dinner', '晚餐', '🍝', 'Dinner is at seven.', '晚餐七點開始。'),
  w('coffee', '咖啡', '☕', 'Would you like some coffee?', '你想喝點咖啡嗎？'),
  w('table', '桌子；餐桌', '🍽️', 'A table for two, please.', '請給我們兩人桌。'),
  w('drink', '飲料；喝', '🥤', 'What would you like to drink?', '您想喝什麼？'),
  // 購物與金錢
  w('money', '錢', '💵', 'I do not have enough money.', '我的錢不夠。'),
  w('cash', '現金', '💴', 'Do you pay in cash?', '您付現金嗎？'),
  w('card', '卡片；信用卡', '💳', 'Can I pay by card?', '我可以刷卡嗎？'),
  w('cost', '花費；成本', '🪙', 'How much does it cost?', '這要多少錢？'),
  w('sale', '特價；銷售', '🔖', 'These shoes are on sale.', '這雙鞋在特價。'),
  // 商店
  w('store', '商店', '🏪', 'The store opens at ten.', '這家店十點開門。'),
  w('item', '品項；物品', '📦', 'This item is sold out.', '這個品項已售完。'),
  w('size', '尺寸', '📏', 'Do you have a larger size?', '有大一點的尺寸嗎？'),
  w('return', '退貨；歸還', '↩️', 'I want to return this shirt.', '我想退這件襯衫。'),
  w('free', '免費的；有空的', '🆓', 'Delivery is free.', '運送免費。'),
  // 溝通
  w('call', '打電話；通話', '📞', 'Please call me later.', '請晚點打給我。'),
  w('phone', '電話', '📱', 'My phone number is on the card.', '我的電話號碼在名片上。'),
  w('letter', '信', '✉️', 'I sent a letter to the client.', '我寄了一封信給客戶。'),
  w('answer', '回答；接（電話）', '🙋', 'Nobody answered the phone.', '沒有人接電話。'),
  w('ask', '詢問；請求', '❓', 'May I ask a question?', '我可以問個問題嗎？'),
  // 會議與工作事項
  w('plan', '計畫；規劃', '🧩', 'We need a new plan.', '我們需要新的計畫。'),
  w('idea', '想法；點子', '💡', 'That is a great idea.', '那是個好主意。'),
  w('problem', '問題', '⚠️', 'There is a problem with my computer.', '我的電腦有問題。'),
  w('agree', '同意', '👍', 'I agree with you.', '我同意你的看法。'),
  w('decide', '決定', '⚖️', 'We will decide tomorrow.', '我們明天再決定。'),
  // 文件與資料
  w('list', '清單', '📝', 'Here is the list of guests.', '這是賓客名單。'),
  w('form', '表格', '🧾', 'Please fill out this form.', '請填寫這張表格。'),
  w('sign', '簽名；標誌', '✍️', 'Please sign here.', '請在這裡簽名。'),
  w('date', '日期', '📅', 'What is the date of the event?', '活動的日期是哪一天？'),
  w('number', '號碼；數字', '🔢', 'What is your room number?', '你的房號是幾號？'),
  // 公司
  w('company', '公司', '🏢', 'I work for a small company.', '我在一家小公司工作。'),
  w('business', '生意；商業', '📈', 'Business is good this year.', '今年生意很好。'),
  w('sales', '銷售；業務部', '🤝', 'She works in sales.', '她在業務部工作。'),
  w('market', '市場', '🏬', 'The market is growing fast.', '市場成長得很快。'),
  w('service', '服務', '🛎️', 'The service here is excellent.', '這裡的服務非常好。'),
  // 建築與地點
  w('floor', '樓層；地板', '🛗', 'The office is on the third floor.', '辦公室在三樓。'),
  w('room', '房間', '🚪', 'The meeting room is free now.', '會議室現在空著。'),
  w('door', '門', '🚪', 'Please close the door.', '請關門。'),
  w('parking', '停車；停車場', '🅿️', 'Parking is behind the building.', '停車場在大樓後面。'),
  w('building', '大樓；建築物', '🏙️', 'Our building has ten floors.', '我們的大樓有十層樓。'),
  // 人事
  w('worker', '工作者；員工', '👷', 'The factory has 50 workers.', '這間工廠有五十名工人。'),
  w('training', '訓練；培訓', '🎯', 'New staff need training.', '新員工需要受訓。'),
  w('skill', '技能', '🛠️', 'Computer skills are important.', '電腦技能很重要。'),
  w('career', '職涯；事業', '🪜', 'She has a long career in sales.', '她在業務領域有很長的資歷。'),
  w('retire', '退休', '🏖️', 'He will retire next year.', '他明年退休。'),
  // 動作（常用動詞）
  w('send', '寄送', '📤', 'Please send me the file.', '請把檔案寄給我。'),
  w('check', '檢查；確認', '🔍', 'Let me check the schedule.', '讓我看一下行程。'),
  w('need', '需要', '🙏', 'I need your help.', '我需要你的幫忙。'),
  w('open', '打開；營業中', '🔓', 'Is the bank open today?', '銀行今天有開嗎？'),
  w('close', '關閉；結束營業', '🔒', 'The shop closes at eight.', '店八點打烊。'),
  // 時間管理
  w('start', '開始', '▶️', 'The class will start soon.', '課程馬上就要開始。'),
  w('finish', '完成；結束', '🏁', 'I will finish the report today.', '我今天會完成報告。'),
  w('wait', '等待', '⏳', 'Please wait a moment.', '請稍等。'),
  w('change', '改變；更改', '🔄', 'Can I change my seat?', '我可以換座位嗎？'),
  w('visit', '拜訪；參觀', '🚶', 'The client will visit us on Monday.', '客戶星期一會來拜訪。'),
  // 健康與休假
  w('sick', '生病的', '🤒', 'He is sick today.', '他今天生病了。'),
  w('doctor', '醫生', '🩺', 'You should see a doctor.', '你應該去看醫生。'),
  w('holiday', '假日；假期', '🎉', 'Monday is a holiday.', '星期一是國定假日。'),
  w('leave', '離開；休假', '🧳', 'I will leave the office at six.', '我六點會離開辦公室。'),
  w('rest', '休息', '🛌', 'Take a rest after lunch.', '午餐後休息一下。'),
  // 天氣與活動
  w('weather', '天氣', '🌦️', 'The weather is nice today.', '今天天氣很好。'),
  w('event', '活動', '🎪', 'The event starts at six.', '活動六點開始。'),
  w('party', '派對；聚會', '🥳', 'We have a party on Friday.', '我們星期五有聚會。'),
  w('guide', '導遊；指南', '🧑‍🏫', 'Our guide speaks English.', '我們的導遊會說英文。'),
  w('program', '節目；計畫；課程', '📋', 'The program starts at nine.', '節目九點開始。'),
  // 形容詞
  w('new', '新的', '✨', 'We have a new manager.', '我們有一位新經理。'),
  w('cheap', '便宜的', '🪙', 'This hotel is cheap.', '這家飯店很便宜。'),
  w('expensive', '昂貴的', '💎', 'The dinner was expensive.', '那頓晚餐很貴。'),
  w('ready', '準備好的', '✅', 'Is the room ready?', '房間準備好了嗎？'),
  w('important', '重要的', '❗', 'This is an important email.', '這是一封重要的郵件。'),

  // ===== 2026-11-25 第二批（96–200）=====
  // 會議
  w('agenda', '議程', '🗒️', 'Please read the agenda before the meeting.', '開會前請先看議程。'),
  w('attend', '出席；參加', '🙋', 'Ten people will attend the meeting.', '會有十個人出席會議。'),
  w('discuss', '討論', '💬', 'We need to discuss the budget.', '我們需要討論預算。'),
  w('presentation', '簡報', '📊', 'She gave a great presentation.', '她做了一場很棒的簡報。'),
  w('topic', '主題；話題', '🏷️', 'What is the topic of the meeting?', '這場會議的主題是什麼？'),
  // 電腦與網站
  w('computer', '電腦', '💻', 'My computer is very slow today.', '我的電腦今天很慢。'),
  w('screen', '螢幕', '🖥️', 'Please look at the screen.', '請看螢幕。'),
  w('keyboard', '鍵盤', '⌨️', 'I need a new keyboard.', '我需要一個新鍵盤。'),
  w('password', '密碼', '🔑', 'Please change your password every month.', '請每個月更換密碼。'),
  w('website', '網站', '🌐', 'You can find the price on our website.', '你可以在我們的網站上找到價格。'),
  // 文件
  w('document', '文件', '📃', 'Please sign this document.', '請在這份文件上簽名。'),
  w('contract', '合約', '📜', 'We signed the contract yesterday.', '我們昨天簽了合約。'),
  w('invoice', '發票；請款單', '🧾', 'I will send you the invoice today.', '我今天會把請款單寄給你。'),
  w('record', '紀錄；記錄', '🗃️', 'Keep a record of all payments.', '把所有付款都記錄下來。'),
  w('page', '頁', '📖', 'Please turn to page five.', '請翻到第五頁。'),
  // 時間
  w('noon', '中午', '🕛', 'Lunch starts at noon.', '午餐中午開始。'),
  w('evening', '傍晚；晚上', '🌆', 'The store is open in the evening.', '這家店晚上有營業。'),
  w('weekend', '週末', '🏖️', 'Do you work on the weekend?', '你週末要上班嗎？'),
  w('month', '月', '🗓️', 'I get paid once a month.', '我一個月領一次薪水。'),
  w('hour', '小時', '⏳', 'The meeting will take one hour.', '會議會開一個小時。'),
  // 約時間
  w('appointment', '預約；約會', '📌', 'I have a doctor appointment at three.', '我三點有看診預約。'),
  w('calendar', '行事曆', '📅', 'Let me check my calendar.', '讓我看一下我的行事曆。'),
  w('tomorrow', '明天', '➡️', 'Can we meet tomorrow?', '我們明天可以見面嗎？'),
  w('yesterday', '昨天', '⬅️', 'I sent the email yesterday.', '我昨天寄了那封郵件。'),
  w('minute', '分鐘', '⏱️', 'Please wait a minute.', '請稍等一下。'),
  // 餐廳
  w('restaurant', '餐廳', '🍴', 'The restaurant is on the first floor.', '餐廳在一樓。'),
  w('waiter', '服務生', '🤵', 'The waiter brought our food.', '服務生把我們的餐點送來了。'),
  w('breakfast', '早餐', '🍳', 'Breakfast is served from seven to ten.', '早餐供應時間是七點到十點。'),
  w('dessert', '甜點', '🍰', 'Would you like some dessert?', '您想來點甜點嗎？'),
  w('snack', '點心；零食', '🍪', 'We have snacks in the break room.', '休息室裡有點心。'),
  // 料理
  w('kitchen', '廚房', '🧑‍🍳', 'The kitchen closes at nine.', '廚房九點休息。'),
  w('cook', '烹煮；廚師', '🍲', 'He can cook very well.', '他很會做菜。'),
  w('meal', '一餐', '🍱', 'The price includes three meals a day.', '價格包含一天三餐。'),
  w('fresh', '新鮮的', '🥗', 'The fish is very fresh.', '這魚非常新鮮。'),
  w('taste', '味道；品嚐', '😋', 'This soup tastes good.', '這湯很好喝。'),
  // 付錢
  w('buy', '買', '🛒', 'I want to buy a new phone.', '我想買一支新手機。'),
  w('pay', '付錢', '💳', 'Can I pay by card?', '我可以刷卡嗎？'),
  w('wallet', '錢包', '👛', 'I left my wallet at home.', '我把錢包忘在家裡了。'),
  w('coin', '硬幣', '🪙', 'The machine only takes coins.', '這台機器只收硬幣。'),
  w('total', '總數；總共的', '➕', 'The total is fifty dollars.', '總共是五十元。'),
  // 銀行與費用
  w('bank', '銀行', '🏦', 'The bank closes at three thirty.', '銀行三點半關門。'),
  w('account', '帳戶', '🔢', 'I want to open a bank account.', '我想開一個銀行帳戶。'),
  w('tax', '稅', '💲', 'Does the price include tax?', '價格含稅嗎？'),
  w('fee', '費用', '🧮', 'There is no fee for this service.', '這項服務不收費。'),
  w('budget', '預算', '📉', 'We need to stay within the budget.', '我們必須控制在預算內。'),
  // 開車
  w('car', '汽車', '🚗', 'I drive my car to work.', '我開車上班。'),
  w('drive', '開車', '🛣️', 'It is a ten-minute drive.', '開車十分鐘。'),
  w('road', '道路', '🛤️', 'The road is closed today.', '這條路今天封閉。'),
  w('street', '街道', '🏙️', 'The bank is on Main Street.', '銀行在主街上。'),
  w('corner', '轉角', '↪️', 'The cafe is on the corner.', '咖啡店在轉角。'),
  // 方向
  w('left', '左邊', '⬅️', 'Turn left at the light.', '在紅綠燈左轉。'),
  w('right', '右邊；正確的', '➡️', 'The office is on your right.', '辦公室在你的右手邊。'),
  w('straight', '直直地', '⬆️', 'Go straight for two blocks.', '直走兩個街區。'),
  w('near', '在附近', '📍', 'Is there a bank near here?', '這附近有銀行嗎？'),
  w('far', '遠的', '🔭', 'The airport is not far from here.', '機場離這裡不遠。'),
  // 城市地點
  w('library', '圖書館', '📚', 'The library is open until eight.', '圖書館開到八點。'),
  w('museum', '博物館', '🏛️', 'We visited a museum in Paris.', '我們在巴黎參觀了一間博物館。'),
  w('park', '公園；停車', '🌳', 'You can park behind the building.', '你可以把車停在大樓後面。'),
  w('hospital', '醫院', '🏥', 'The hospital is next to the station.', '醫院在車站旁邊。'),
  w('gym', '健身房', '🏋️', 'The hotel has a gym.', '這家飯店有健身房。'),
  // 健康
  w('health', '健康', '💚', 'Exercise is good for your health.', '運動對健康有益。'),
  w('medicine', '藥', '💊', 'Take this medicine after meals.', '飯後吃這個藥。'),
  w('fever', '發燒', '🤒', 'I have a fever today.', '我今天發燒了。'),
  w('headache', '頭痛', '🤕', 'I have a bad headache.', '我頭痛得很厲害。'),
  w('clinic', '診所', '🩺', 'The clinic opens at nine.', '診所九點開門。'),
  // 職稱
  w('department', '部門', '🏢', 'She works in the sales department.', '她在業務部工作。'),
  w('assistant', '助理', '🧑‍💻', 'My assistant will call you.', '我的助理會打電話給你。'),
  w('director', '主任；總監', '🎬', 'The director will join the meeting.', '總監會參加會議。'),
  w('supervisor', '主管；督導', '🧑‍✈️', 'Ask your supervisor for help.', '請向你的主管求助。'),
  w('intern', '實習生', '🎓', 'We have two new interns this summer.', '我們今年夏天有兩位新實習生。'),
  // 工作動作
  w('help', '幫忙', '🤝', 'Can you help me with this box?', '你可以幫我搬這個箱子嗎？'),
  w('explain', '解釋', '🗣️', 'Could you explain the plan again?', '你可以再解釋一次計畫嗎？'),
  w('prepare', '準備', '🧰', 'I need to prepare for the meeting.', '我需要為會議做準備。'),
  w('organize', '整理；籌辦', '🗂️', 'She will organize the company party.', '她會籌辦公司聚會。'),
  w('update', '更新；最新消息', '🔄', 'Please update the schedule.', '請更新行程表。'),
  // 溝通
  w('talk', '說話；談話', '🗨️', 'Can we talk after lunch?', '我們午餐後可以談一下嗎？'),
  w('speak', '說（語言）；講話', '🎙️', 'Do you speak English?', '你會說英文嗎？'),
  w('repeat', '重複；再說一次', '🔁', 'Could you repeat that, please?', '可以請你再說一次嗎？'),
  w('mean', '意思是', '❓', 'What does this word mean?', '這個字是什麼意思？'),
  w('understand', '了解；聽懂', '💡', 'I understand the problem now.', '我現在了解問題了。'),
  // 電話
  w('mobile', '手機的', '📱', 'Please call my mobile phone.', '請打我的手機。'),
  w('voicemail', '語音信箱', '📼', 'I left a voicemail for you.', '我在你的語音信箱留了言。'),
  w('extension', '分機', '☎️', 'My extension is two-one-five.', '我的分機是二一五。'),
  w('hold', '（電話）稍候；握住', '⏸️', 'Please hold for a moment.', '請稍候一下。'),
  w('connect', '連接；轉接', '🔌', 'I will connect you to the manager.', '我幫您轉接經理。'),
  // 網路
  w('online', '線上的', '🛜', 'You can pay online.', '你可以線上付款。'),
  w('internet', '網路', '📶', 'The internet is down.', '網路斷線了。'),
  w('download', '下載', '⬇️', 'Please download the form.', '請下載表格。'),
  w('upload', '上傳', '⬆️', 'Upload your photo here.', '在這裡上傳你的照片。'),
  w('link', '連結', '🔗', 'I will send you the link.', '我會把連結寄給你。'),
  // 飯店房間
  w('key', '鑰匙', '🗝️', 'Here is your room key.', '這是您的房間鑰匙。'),
  w('towel', '毛巾', '🧺', 'Can I have two more towels?', '可以再給我兩條毛巾嗎？'),
  w('view', '景色；視野', '🌄', 'The room has an ocean view.', '這間房間有海景。'),
  w('elevator', '電梯', '🛗', 'The elevator is on your left.', '電梯在您的左手邊。'),
  w('stairs', '樓梯', '🪜', 'Please use the stairs in a fire.', '發生火災時請走樓梯。'),
  // 形容詞：難易快慢
  w('easy', '簡單的', '👌', 'The test was easy.', '這個測驗很簡單。'),
  w('difficult', '困難的', '🧗', 'This job is difficult.', '這份工作很難。'),
  w('quick', '快的', '⚡', 'Can I ask a quick question?', '我可以問一個簡短的問題嗎？'),
  w('slow', '慢的', '🐌', 'The service was slow.', '服務很慢。'),
  w('full', '滿的；客滿的', '🈵', 'The hotel is full tonight.', '飯店今晚客滿。'),
  // 形容詞：環境
  w('clean', '乾淨的；打掃', '🧼', 'The room is very clean.', '房間非常乾淨。'),
  w('quiet', '安靜的', '🤫', 'Please be quiet in the library.', '在圖書館請保持安靜。'),
  w('noisy', '吵鬧的', '📢', 'The street is noisy at night.', '這條街晚上很吵。'),
  w('safe', '安全的', '🦺', 'Keep your passport in a safe place.', '把護照放在安全的地方。'),
  w('comfortable', '舒適的', '🛋️', 'The seats are very comfortable.', '座位非常舒適。'),
]
