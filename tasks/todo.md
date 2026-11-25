# 2026-11-25 首頁改成「英語群島星球」

## 目標 / 驗收條件
- [x] 參考 jh-battle.web.app 的星球首頁：可拖曳旋轉的星球、上一座／下一座、點島名進入、右側島嶼清單與進度
- [x] 只做英文：島嶼 = 6 個多益區域 + 每日漂流瓶 + 五大長母音 + 音節切分 + 錯題怪獸窩 + 求救無線電塔
- [x] 鎖住的區域維持「未知島嶼」，不能進入
- [x] 既有頁面、存檔、求生規則不變（只換首頁 `/`）
- [x] 鍵盤可操作（左右鍵旋轉、Enter 登島）；prefers-reduced-motion 時不做旋轉動畫

## 驗證
- [x] `npm test`（新增 tests/planet.test.js：投影、最短旋轉、正前方島、島嶼清單完整）
- [x] `npm run build`
- [x] 瀏覽器：拖曳、下一座、拖曳後點島名進入、鍵盤、手機 390px 無橫向捲動、console 無 error/warn

## Working Notes
- 「只做全英文」解讀為：星球上只放英文的學習內容（原站還有國文、數學等其他科），介面文字維持中文。
- 星球是 CSS 球體 + 經緯度投影，沒有新增套件；表面花紋用 background-position 跟著角度捲動，看起來在自轉。
- 星球上的島名按鈕 tabindex=-1，鍵盤／報讀器走右側清單（避免背面看不到的島也能被 Tab 到）。

## Risk & Rollback
- 風險：低。只換首頁元件與 CSS，路由與存檔不動。
- Rollback：revert 這個 commit。

## Results
- 新增：`src/logic/planet.js`、`src/data/planet.js`、`src/planet.css`、`tests/planet.test.js`。
- 修改：`src/views/IslandMap.vue`（改寫成星球）、`style.css`（刪掉平面地圖／簡報抽屜的 CSS）、`main.js`（載入 planet.css）、導覽列「地圖」→「星球」、各頁「回到地圖」→「回到星球」、README。
- 驗證：`npm test` 8 檔 / 125 測試全過；`npm run build` 成功；agent-browser 1400×820 與 390×844 截圖確認；拖曳 140px 轉到下一座並吸附；拖曳後點正面島名 → `#/daily`；左右鍵切換；鎖住的島按 Enter 不會進入；console 無 error/warn。
- 發現並修正：拖曳結束後瀏覽器不一定送 click，「吞掉拖曳後 click」的旗標殘留，吃掉下一次真正的點擊（見 lessons.md）。
- 未驗證：真機觸控拖曳的手感（touch-action: pan-y，垂直仍可捲動頁面）。

---

# 2026-11-25 音節切分（一元一輔切）+ 每日 5 個新單字

## 目標 / 驗收條件
- [x] 每日新單字：每天（有打開「每日單字」的那天）從新題庫依序發 5 個新字；跳過的日子不累積欠帳
- [x] 每日測驗 = 今天 5 個新字（全出）+ 最多 10 個舊字（所有學過的區域單字 + 之前每日發過的字，沿用錯題優先／最久沒複習）
- [x] 新題庫與區域單字不重複；題庫用完時仍可只複習舊字
- [x] 舊存檔載入不重置（新欄位預設空值，PROGRESS_VERSION 不變）
- [x] 音節切分課程：元音／輔音標示、5 條規則（複合字、VC|CV、一元一輔 V|CV、退一步 VC|V、輔音+le），點例字看切分動畫並逐段發音
- [x] 「劈椰子切字」遊戲：點字母間的縫切開單字 → 再判斷第一音節母音長／短；答錯說明規則；熟練度記在 phonics 存檔 `syllables` 課程
- [x] 既有遊戲與長母音課程不受影響

## 驗證
- [x] `npm test`（新增：每日發字邏輯、題庫不重複、音節資料一致性檢查）
- [x] `npm run build`
- [x] 瀏覽器走過新路由 + 既有路由，console 無 error/warn

## Working Notes
- 「一元一輔切」解讀為：兩個元音中間只夾一個輔音 → 先切在輔音前（V|CV，前面開音節唸長音），唸不通再切在輔音後（VC|V，閉音節唸短音）。
- 音節課程資料形狀和長母音課程不同（不是依母音分組），所以用獨立的 data/logic/views，不塞進 findCourse 的長母音 UI。
- TTS 唸單獨音節（ble、el）會怪，資料裡可用 `say` 覆寫發音。

## Risk & Rollback
- 風險：低。新增欄位為可選；每日複習路由由 `/daily` 改為入口頁 + `/daily/quiz`。
- Rollback：revert commit；存檔多出的欄位舊版會直接忽略。

## Results
- 新增：`src/data/dailyWords.js`（100 字）、`src/views/DailyView.vue`（漂流瓶）、`src/data/phonics/syllables.js`、`src/logic/syllables.js`、`src/components/phonics/SyllableWord.vue`、`src/views/phonics/SyllablesLesson.vue`、`SyllableChop.vue`、`tests/syllables.test.js`。
- 修改：`review.js`（assignDailyWords / todayNewWords / buildDailySession）、`progress.js`（dailyNew、dailyLearned）、`game.js`、`zones.js`（WORD_BANK，findWord 也查得到每日字 → 錯題複習可用）、`QuizView.vue`、路由、導覽列「每日單字」、phonics 註冊表與首頁連結、CSS、README。
- 驗證：`npm test` 7 檔 / 115 測試全過（測試先抓到 sanitizeProgress 讀舊存檔會 crash 的 bug，已修）；`npm run build` 成功；agent-browser：第 1 天發 5 字 → 改存檔日期模擬隔天 → 第 2 天再發 5 字、累積 10、測驗 = 5 新 + 5 舊，完成後存檔與錯題複習正確；音節頁示範 cam·el、試切 rocket → rock·et；劈椰子完成一輪、熟練度寫入 syllables 課程；12 條路由 + 手機寬度無橫向捲動，console 無 error/warn。
- 未驗證：TTS 唸單獨音節的實際聲音（headless 聽不到）；真機觸控點縫的手感。

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
