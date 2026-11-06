// 各區域的句型練習（多益入門：常見職場與生活句型）。
// answer：填空題要挖空的單字，必須是句子中的一個完整單字（不含標點），且同一區內不可重複（小寫比對）。
// 填空題的干擾選項取自同一區其他句子的 answer。
// 排序題以空白切詞，句中避免使用 a.m. 這類帶句點的縮寫。

export const SENTENCES = {
  beach: {
    patterns: [
      { en: 'My flight is delayed.', zh: '我的班機延誤了。' },
      { en: 'May I see your ___?', zh: '可以看一下您的＿＿嗎？' },
    ],
    items: [
      { en: 'May I see your passport?', zh: '可以看一下您的護照嗎？', answer: 'passport' },
      { en: 'My flight is delayed.', zh: '我的班機延誤了。', answer: 'flight' },
      { en: 'Please keep your luggage with you.', zh: '請隨身攜帶您的行李。', answer: 'luggage' },
      { en: 'All passengers must show a ticket.', zh: '所有乘客都必須出示票券。', answer: 'ticket' },
      { en: 'The ship will depart at noon.', zh: '船將在中午出發。', answer: 'depart' },
      { en: 'We will arrive tomorrow morning.', zh: '我們明天早上會抵達。', answer: 'arrive' },
    ],
  },
  spring: {
    patterns: [
      { en: 'I would like to ___ a room.', zh: '我想要＿＿一間房間。' },
      { en: 'Can I have the ___, please?', zh: '可以給我＿＿嗎？' },
    ],
    items: [
      { en: 'I would like to reserve a room.', zh: '我想預訂一間房間。', answer: 'reserve' },
      { en: 'Can I have the bill, please?', zh: '可以給我帳單嗎？', answer: 'bill' },
      { en: 'Could I see the menu, please?', zh: '可以給我看一下菜單嗎？', answer: 'menu' },
      { en: 'Are you ready to order?', zh: '您準備好點餐了嗎？', answer: 'order' },
      { en: 'Please wait in the lobby.', zh: '請在大廳等候。', answer: 'lobby' },
      { en: 'I need to cancel my reservation.', zh: '我需要取消我的預約。', answer: 'cancel' },
    ],
  },
  forest: {
    patterns: [
      { en: 'How much is the ___?', zh: '＿＿多少錢？' },
      { en: 'Can I get a ___?', zh: '我可以拿到＿＿嗎？' },
    ],
    items: [
      { en: 'Can I get a refund?', zh: '我可以退款嗎？', answer: 'refund' },
      { en: 'Please keep your receipt.', zh: '請保留您的收據。', answer: 'receipt' },
      { en: 'The price includes tax.', zh: '這個價格含稅。', answer: 'price' },
      { en: 'Members get a special discount.', zh: '會員可享特別折扣。', answer: 'discount' },
      { en: 'We deliver on weekdays.', zh: '我們平日送貨。', answer: 'deliver' },
      { en: 'This product is very popular.', zh: '這項產品非常受歡迎。', answer: 'product' },
    ],
  },
  camp: {
    patterns: [
      { en: 'The ___ starts at ten.', zh: '＿＿十點開始。' },
      { en: 'Please send me the ___.', zh: '請把＿＿寄給我。' },
    ],
    items: [
      { en: 'The meeting starts at ten.', zh: '會議十點開始。', answer: 'meeting' },
      { en: 'Please send me the report.', zh: '請把報告寄給我。', answer: 'report' },
      { en: 'The deadline is next Friday.', zh: '截止期限是下週五。', answer: 'deadline' },
      { en: 'Let me check my schedule.', zh: '讓我看一下我的行程。', answer: 'schedule' },
      { en: 'I will ask my manager.', zh: '我會去問我的經理。', answer: 'manager' },
      { en: 'My colleague will help you.', zh: '我的同事會協助您。', answer: 'colleague' },
    ],
  },
  hill: {
    patterns: [
      { en: 'I want to apply for this ___.', zh: '我想應徵這個＿＿。' },
      { en: 'Do you have any ___?', zh: '你有任何＿＿嗎？' },
    ],
    items: [
      { en: 'I want to apply for this position.', zh: '我想應徵這個職位。', answer: 'apply' },
      { en: 'The position is still open.', zh: '這個職位仍在招募中。', answer: 'position' },
      { en: 'My interview is on Monday.', zh: '我的面試在星期一。', answer: 'interview' },
      { en: 'Please send your resume by email.', zh: '請用電子郵件寄送您的履歷。', answer: 'resume' },
      { en: 'Do you have any experience?', zh: '你有任何經驗嗎？', answer: 'experience' },
      { en: 'We plan to hire two people.', zh: '我們打算僱用兩個人。', answer: 'hire' },
    ],
  },
  lighthouse: {
    patterns: [
      { en: 'Please ___ your booking.', zh: '請＿＿您的預訂。' },
      { en: 'Are you available this afternoon?', zh: '你今天下午有空嗎？' },
    ],
    items: [
      { en: 'Please confirm your booking.', zh: '請確認您的預訂。', answer: 'confirm' },
      { en: 'Are you available this afternoon?', zh: '你今天下午有空嗎？', answer: 'available' },
      { en: 'Can I leave a message?', zh: '我可以留言嗎？', answer: 'message' },
      { en: 'Thank you for your quick reply.', zh: '謝謝您的快速回覆。', answer: 'reply' },
      { en: 'This message is urgent.', zh: '這則訊息很緊急。', answer: 'urgent' },
      { en: 'Please contact us by phone.', zh: '請用電話與我們聯絡。', answer: 'contact' },
    ],
  },
}
