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
]
