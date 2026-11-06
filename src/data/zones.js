// 荒島區域與單字內容（多益入門：第一次考 TOEIC 的常見職場與生活單字）
// 背景：你搭郵輪前往國際商務會議途中遇難，漂到一座曾是企業度假村的荒島，島上所有標示與文件都是英文。
// 每個區域依序解鎖：前一區小測驗拿到至少 1 顆星就能前往下一區。
// resource：在這個區域探索（完成挑戰）會獲得的主要物資。
// pos 為地圖上的百分比座標。

export const ZONES = [
  {
    id: 'beach',
    name: 'Shipwreck Beach',
    zh: '沉船海灘',
    topic: '旅行出差',
    emoji: '🧳',
    color: '#f4c95d',
    pos: { x: 22, y: 72 },
    resource: 'food',
    intro: '郵輪的殘骸散落在沙灘上：行李箱、船票、護照。看懂這些字，才能從殘骸裡找回補給。',
    words: [
      { en: 'passenger', zh: '乘客', emoji: '🧍', example: 'All passengers must show a ticket.', exampleZh: '所有乘客都必須出示票券。' },
      { en: 'luggage', zh: '行李', emoji: '🧳', example: 'Please keep your luggage with you.', exampleZh: '請隨身攜帶您的行李。' },
      { en: 'ticket', zh: '票；票券', emoji: '🎫', example: 'I bought a round-trip ticket.', exampleZh: '我買了一張來回票。' },
      { en: 'flight', zh: '班機', emoji: '✈️', example: 'My flight leaves at 9 a.m.', exampleZh: '我的班機早上九點出發。' },
      { en: 'delay', zh: '延誤', emoji: '⏰', example: 'The flight has a two-hour delay.', exampleZh: '班機延誤兩小時。' },
      { en: 'depart', zh: '出發；離開', emoji: '🛫', example: 'The ship will depart at noon.', exampleZh: '船將在中午出發。' },
      { en: 'arrive', zh: '抵達', emoji: '🛬', example: 'We will arrive in Tokyo tomorrow.', exampleZh: '我們明天會抵達東京。' },
      { en: 'passport', zh: '護照', emoji: '🛂', example: 'May I see your passport?', exampleZh: '可以看一下您的護照嗎？' },
    ],
  },
  {
    id: 'spring',
    name: 'Abandoned Resort',
    zh: '廢棄度假飯店',
    topic: '飯店與餐廳',
    emoji: '🏨',
    color: '#38bdf8',
    pos: { x: 44, y: 58 },
    resource: 'water',
    intro: '溪谷旁有一間荒廢的度假飯店，櫃台和餐廳還留著英文告示。廚房的水塔裡也許還有乾淨的水。',
    words: [
      { en: 'guest', zh: '房客；客人', emoji: '🧑‍💼', example: 'The guest checked in at 3 p.m.', exampleZh: '那位房客下午三點入住。' },
      { en: 'reserve', zh: '預訂', emoji: '📅', example: 'I would like to reserve a room.', exampleZh: '我想預訂一間房間。' },
      { en: 'lobby', zh: '大廳', emoji: '🛋️', example: 'Please wait in the lobby.', exampleZh: '請在大廳等候。' },
      { en: 'staff', zh: '員工（總稱）', emoji: '👥', example: 'The hotel staff is very friendly.', exampleZh: '飯店員工非常友善。' },
      { en: 'menu', zh: '菜單', emoji: '📋', example: 'Could I see the menu, please?', exampleZh: '可以給我看一下菜單嗎？' },
      { en: 'order', zh: '點餐；訂購', emoji: '🍽️', example: 'Are you ready to order?', exampleZh: '您準備好點餐了嗎？' },
      { en: 'bill', zh: '帳單', emoji: '🧾', example: 'Can I have the bill, please?', exampleZh: '可以給我帳單嗎？' },
      { en: 'cancel', zh: '取消', emoji: '❌', example: 'I need to cancel my reservation.', exampleZh: '我需要取消我的預約。' },
    ],
  },
  {
    id: 'forest',
    name: 'Jungle Outlet',
    zh: '叢林商店',
    topic: '購物與消費',
    emoji: '🛒',
    color: '#ef7b6c',
    pos: { x: 70, y: 66 },
    resource: 'food',
    intro: '森林裡藏著度假村的員工商店，貨架上還有罐頭。看懂價格標籤和收據，才知道什麼能拿。',
    words: [
      { en: 'price', zh: '價格', emoji: '🏷️', example: 'The price includes tax.', exampleZh: '這個價格含稅。' },
      { en: 'discount', zh: '折扣', emoji: '💸', example: 'Members get a 10% discount.', exampleZh: '會員可享九折優惠。' },
      { en: 'customer', zh: '顧客', emoji: '🙋', example: 'The customer asked for help.', exampleZh: '那位顧客請求協助。' },
      { en: 'product', zh: '產品', emoji: '📦', example: 'This product is very popular.', exampleZh: '這項產品非常受歡迎。' },
      { en: 'purchase', zh: '購買', emoji: '🛍️', example: 'You can purchase tickets online.', exampleZh: '你可以在網路上購票。' },
      { en: 'receipt', zh: '收據', emoji: '🧾', example: 'Please keep your receipt.', exampleZh: '請保留您的收據。' },
      { en: 'deliver', zh: '遞送；送貨', emoji: '🚚', example: 'We deliver on weekdays.', exampleZh: '我們平日送貨。' },
      { en: 'refund', zh: '退款', emoji: '💰', example: 'Can I get a refund?', exampleZh: '我可以退款嗎？' },
    ],
  },
  {
    id: 'camp',
    name: 'Research Office',
    zh: '研究站辦公室',
    topic: '辦公室日常',
    emoji: '🗂️',
    color: '#5bb36b',
    pos: { x: 62, y: 36 },
    resource: 'wood',
    intro: '叢林深處有一棟公司研究站，桌上還有行事曆和報告。拆下木頭家具，就能拿來生火、蓋庇護所。',
    words: [
      { en: 'office', zh: '辦公室', emoji: '🏢', example: 'Our office is on the fifth floor.', exampleZh: '我們的辦公室在五樓。' },
      { en: 'meeting', zh: '會議', emoji: '🤝', example: 'The meeting starts at 10 a.m.', exampleZh: '會議早上十點開始。' },
      { en: 'schedule', zh: '行程表；排定', emoji: '🗓️', example: 'Let me check my schedule.', exampleZh: '讓我看一下我的行程。' },
      { en: 'report', zh: '報告', emoji: '📊', example: 'Please send me the report.', exampleZh: '請把報告寄給我。' },
      { en: 'deadline', zh: '截止期限', emoji: '⏳', example: 'The deadline is next Friday.', exampleZh: '截止期限是下週五。' },
      { en: 'colleague', zh: '同事', emoji: '🧑‍🤝‍🧑', example: 'My colleague will help you.', exampleZh: '我的同事會協助您。' },
      { en: 'manager', zh: '經理', emoji: '👔', example: 'I will ask my manager.', exampleZh: '我會去問我的經理。' },
      { en: 'client', zh: '客戶', emoji: '💼', example: 'We have a meeting with a client.', exampleZh: '我們和一位客戶有個會議。' },
    ],
  },
  {
    id: 'hill',
    name: 'Staff Quarters',
    zh: '山丘員工宿舍',
    topic: '求職與人事',
    emoji: '🪪',
    color: '#9b7fd1',
    pos: { x: 34, y: 32 },
    resource: 'herb',
    intro: '山丘上是員工宿舍，抽屜裡有履歷和面試紀錄。醫務室的櫃子裡還留著草藥和繃帶。',
    words: [
      { en: 'apply', zh: '申請；應徵', emoji: '📝', example: 'I want to apply for this job.', exampleZh: '我想應徵這份工作。' },
      { en: 'position', zh: '職位', emoji: '🪑', example: 'The position is still open.', exampleZh: '這個職位仍在招募中。' },
      { en: 'interview', zh: '面試', emoji: '🎙️', example: 'My interview is on Monday.', exampleZh: '我的面試在星期一。' },
      { en: 'resume', zh: '履歷', emoji: '📄', example: 'Please send your resume by email.', exampleZh: '請用電子郵件寄送您的履歷。' },
      { en: 'salary', zh: '薪水', emoji: '💵', example: 'The salary is paid monthly.', exampleZh: '薪水按月支付。' },
      { en: 'employee', zh: '員工', emoji: '🧑‍🔧', example: 'The company has 200 employees.', exampleZh: '這家公司有兩百名員工。' },
      { en: 'hire', zh: '僱用', emoji: '🤝', example: 'We plan to hire two new workers.', exampleZh: '我們打算僱用兩名新員工。' },
      { en: 'experience', zh: '經驗', emoji: '🎓', example: 'Do you have sales experience?', exampleZh: '你有銷售經驗嗎？' },
    ],
  },
  {
    id: 'lighthouse',
    name: 'Old Lighthouse',
    zh: '廢棄燈塔通訊室',
    topic: '聯絡與通訊',
    emoji: '📡',
    color: '#fb923c',
    pos: { x: 50, y: 16 },
    resource: 'parts',
    intro: '燈塔頂樓是度假村的通訊室。拆下零件、讀懂英文訊息，就能修好無線電求救。',
    words: [
      { en: 'email', zh: '電子郵件', emoji: '📧', example: 'I will email you the details.', exampleZh: '我會用電子郵件寄細節給你。' },
      { en: 'contact', zh: '聯絡', emoji: '☎️', example: 'Please contact us for more information.', exampleZh: '欲知詳情請與我們聯絡。' },
      { en: 'message', zh: '訊息；留言', emoji: '💬', example: 'Can I leave a message?', exampleZh: '我可以留言嗎？' },
      { en: 'confirm', zh: '確認', emoji: '✅', example: 'Please confirm your booking.', exampleZh: '請確認您的預訂。' },
      { en: 'attach', zh: '附加（檔案）', emoji: '📎', example: 'I attached the file to this email.', exampleZh: '我已將檔案附加在這封郵件中。' },
      { en: 'reply', zh: '回覆', emoji: '↩️', example: 'Thank you for your quick reply.', exampleZh: '謝謝您的快速回覆。' },
      { en: 'urgent', zh: '緊急的', emoji: '🚨', example: 'This message is urgent.', exampleZh: '這則訊息很緊急。' },
      { en: 'available', zh: '有空的；可取得的', emoji: '🟢', example: 'Are you available this afternoon?', exampleZh: '你今天下午有空嗎？' },
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
