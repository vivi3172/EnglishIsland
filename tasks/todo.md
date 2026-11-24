# 2026-11-24 Phonics 自然發音：五大長母音模組

## 目標 / 驗收條件
- [x] 分析現有架構（Vue 3 + router hash、純函式 logic + vitest、localStorage store、Web Speech TTS）
- [x] 教材資料化：`src/data/phonics/`（課程註冊表 + 長母音課程），UI 不寫死單字與規則
- [x] 五指手掌互動地圖：點手指展開該母音規則、拼字組合、範例字
- [x] 單字詳情：IPA、中文、正常/慢速發音、拼字組合上色、音素拆解拼讀動畫、例句、口型說明、麥克風跟讀（支援時）
- [x] STEP 1–4：認識聲音、拼字規則、拆解拼讀、長短母音比較
- [x] STEP 5 練習：聽音選字、聽音選母音、選字母組合、填空、拖曳分類、陌生字拼讀；答錯必附規則說明
- [x] AI 導師（規則式、純前端）：易混淆母音、弱項拼字組合、延伸單字、難度調整、錯題重練
- [x] 進度：各拼字組合熟練度、正確率、錯題、每日複習、弱項加強、綜合測驗
- [x] 現有遊戲功能與存檔不受影響（獨立 storage key）

## 驗證
- [x] `npm test`（新增內容檢查 + 出題 + 進度/導師邏輯測試）
- [x] `npm run build`
- [x] 瀏覽器走過所有 phonics 路由 + 既有路由，console 無 error/warn（見 lessons.md）

## Working Notes
- `PROGRESS_VERSION` 不一致會整份重置 → phonics 用 `english-island-phonics` 獨立存檔。
- 「AI 導師」= 規則式自適應引擎（無後端、無 API key），依答題紀錄產生建議。
- 單音素發音用 TTS 近似音（子音如 "buh"），瀏覽器間會有差異。

## Risk & Rollback
- 風險：低（新增模組，既有程式只改 router、導覽列、speech.js 新增函式）。
- Rollback：revert 該 commit 即可；phonics 存檔獨立，不影響遊戲存檔。

## Results
- 新增：`src/data/phonics/*`、`src/logic/phonics.js`、`src/logic/phonicsProgress.js`、`src/store/phonics.js`、`src/utils/recognition.js`、`src/components/phonics/*`、`src/views/phonics/*`、`src/phonics.css`、兩個測試檔。
- 修改：`src/main.js`（路由）、`src/App.vue`（導覽列「自然發音」）、`src/utils/speech.js`（新增 speakAsync / stopSpeaking，原 speak 不變）、`Icon.vue`（新圖示）、README。
- 驗證：`npm test` 6 檔全過；`npm run build` 成功；agent-browser 走過 phonics 全部路由 + 既有遊戲路由，完成一回練習（10 題，存檔正確、遊戲存檔仍在）、拖曳分類、長短音辨識、拼讀動畫、手機寬度無橫向捲動；console 無 error/warn。
- 未驗證：實際聲音品質（headless 無法聽）、真機麥克風跟讀、觸控裝置實測。
