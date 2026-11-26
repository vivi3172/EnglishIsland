# 2026-11-26 英文 12 時態攻略（Tense Explorer）

## 整合方式（分析結果）
- 沿用既有模組模式（對話咖啡廳 / phonics）：資料 `src/data/tenses/` → 純函式 `src/logic/tense.js`（vitest）→ 獨立存檔 `src/store/tenses.js`（key `english-island-tenses`）→ 頁面 `src/views/tenses/` → 樣式 `src/tense.css`。
- 不加套件；動畫用 SVG + CSS transition；朗讀沿用 Web Speech（speech.js 新增 `speakTracked`，原函式不動）；跟讀沿用 `recognition.js`。
- 教學模型：3 時間 × 4 動作狀態；時態 key = `${time}-${aspect}`。結構性內容（公式、助動詞說明、使用情境、易混淆）放 `FORMS`，情境內容（例句、翻譯、語感、時間軸標籤）放各情境檔 → 新增情境不用改元件。
- 例句標記：`[助動詞]`、`<主要動詞>`、`{時間提示詞}`，由 `parseSentence` 解析上色。

## 頁面 / 路由
- `/tenses` 首頁：六階段學習路徑 + 12 時態矩陣 + 進度摘要
- `/tenses/basics/time`、`/tenses/basics/aspect`：階段 1、2
- `/tenses/explore`：探索器（時間 × 狀態切換，10 項內容同步）
- `/tenses/rhythm`：節奏口訣 + 連續朗讀 + 逐字高亮 + 跟讀
- `/tenses/compare`：雙時態比較（5 組預設 + 自選）
- `/tenses/quiz/:mode`：看圖選時態、聽力辨識、動詞填空、句型組合、時態轉換、情境造句、綜合、弱項
- `/tenses/progress`：各時態熟練度、正確率、錯題
- 星球新增「時光島」、導覽列「12 時態」

## 驗收條件
- [x] 12 種時態切換時間軸、插畫、例句、翻譯、語感、動詞變化、公式、發音、使用情境、易混淆同步更新
- [x] 時間軸平滑動畫；減少動畫（系統設定 + 模組內開關）時無動畫
- [x] 例句助動詞 / 主要動詞 / 時間詞分色，且不只靠顏色（底線樣式 + 圖例文字）
- [x] 比較模式、節奏播放、六種練習 + 錯題解析（時間、狀態、助動詞、其他時態為何不適合）
- [x] 進度存 localStorage，舊 / 壞存檔不 crash
- [x] 既有功能與存檔不受影響

## 驗證
- [x] `npm test`：每句助動詞 / 動詞形式符合時態（自動比對）、時間軸 12 種形狀不重複、每句都能被 detectTense 認回自己、出題與判分、存檔 sanitize、`wordIndexAt`
- [x] `npm run build`
- [x] 瀏覽器：走過所有新路由 + 既有路由、做完一輪練習、存檔寫入、390px 無橫向捲動、console 無 error/warn

## Results
- 新增：`src/data/tenses/{index,grandma,homework}.js`、`src/logic/tense.js`、`src/store/tenses.js`、`src/components/tenses/*`（TenseTimeline、TenseScene、TenseSentence、TenseMatrix、TenseTag、useSpeaker）、`src/views/tenses/*`（Home、Basics、Explorer、Player、Comparison、Quiz、Progress）、`src/tense.css`、`tests/tense.test.js`。
- 修改：`main.js`（7 條路由）、`App.vue`（導覽「12 時態」）、`data/planet.js`（時光島，13 座島）、`IslandMap.vue`（島嶼進度）、`speech.js`（新增 `speakTracked`，原函式不動）、`Icon.vue`（clock、pause）、`style.css`（手機底部導覽 7 項不換行）、`tests/planet.test.js`、README。
- 驗證：`npm test` 10 檔 / 167 測試全過；`npm run build` 成功；agent-browser（新開 5180 dev server）：探索器切到過去完成進行式（泛黃相片、時鐘、箭頭到「我抵達時」、存檔 seen）、節奏播放逐字高亮與換句、看圖選時態答錯 / 答對判分正確且寫入存檔、填空答錯顯示四段解析、進度頁錯題清單、減少動畫開關與系統 reduced-motion 都讓 animation = none、17 條路由（新 + 既有）在 390px 無橫向捲動、360px 底部導覽不換行、console 無 error/warn。
- 過程中修正：時態說明寫死 cooked / Grandma（莉莉的題目會講錯，已改為中性並加測試 tripwire）；無語音時朗讀瞬間結束導致高亮不動（改為估算時間 fallback）；日曆蓋到奶奶的頭；句尾句點被當成時間詞底線。
- 未驗證：實際 TTS 聲音與 boundary 事件的逐字同步（headless 無語音，只驗證了估算 fallback）；真機麥克風跟讀；觸控裝置實測。
- 已知限制：句型組合只接受原句語序（例如 already 放句尾雖然也通順，但會判錯）；情境造句只檢查助動詞 + 動詞，不檢查其他文法；5 組比較說明以奶奶情境為例（切到莉莉時會標示「以奶奶煮飯為例」）。

## Risk & Rollback
- 風險：低。新增模組；既有檔案只動路由、導覽、星球資料、speech.js（新增函式）、Icon（新圖示）。
- Rollback：revert commit；新存檔 key 獨立。

---

# 2026-11-25 加多益入門單字 + 情境對話練習

## 目標 / 驗收條件
- [x] 每日新單字題庫 95 → 200（多 105 字、21 組主題），不與區域單字或既有每日字重複；已發過的字不受影響（只加在陣列最後）
- [x] 新功能「對話咖啡廳」：8 個多益情境（機場、飯店、餐廳、退貨、約會議、面試、電話留言、問路）
  - [x] 對方先說，輪到你時從 3 句中選最合適的回應；答錯顯示為什麼不對（多益 Part 2 常見陷阱），可再選
  - [x] 每句可點播發音；完成後可「聽完整對話」
  - [x] 第一次就選對的比例 → 1–3 星，存最佳星數（獨立 localStorage key，不動遊戲存檔）
- [x] 星球加一座「對話咖啡廳」島，清單顯示星星進度；導覽列加「情境對話」

## 驗證
- [x] `npm test`：單字不重複、對話資料檢查（每輪恰好 1 個正解、錯誤選項都有說明、選項不重複）、星數計算、存檔 sanitize
- [x] `npm run build`
- [x] 瀏覽器：完成一個情境（含答錯一次）、星數寫入並顯示在星球清單；手機 390px 無橫向捲動；console 無 error/warn

## Risk & Rollback
- 風險：低。新增資料與新頁面；新存檔 key `english-island-dialogues` 與既有存檔分開。
- Rollback：revert commit。

## Results
- 單字：`src/data/dailyWords.js` 95 → 200 字（新增 21 組主題：會議、電腦、文件、時間、餐廳、付款、銀行、開車、方向、城市地點、健康、職稱、溝通、電話、網路、飯店房間、形容詞等）。
- 情境對話：新增 `src/data/dialogues.js`（8 情境 × 4 輪）、`src/logic/dialogue.js`、`src/store/talk.js`、`src/views/talk/TalkHome.vue`、`TalkScene.vue`、`src/talk.css`、`tests/dialogue.test.js`；路由 `/talk`、`/talk/:id`；導覽列「情境對話」；星球新增「對話咖啡廳」島（12 座島）。
- 驗證：`npm test` 9 檔 / 132 測試全過（含 200 字不重複、對話資料檢查、星數、存檔 sanitize）；`npm run build` 成功；agent-browser：飯店入住先選錯一次 → 顯示說明 → 完成後 3/4 一次選對 = 2 星，寫入 `english-island-dialogues`，星球清單顯示 ★ 2 / 24；手機 390px 無橫向捲動、底部導覽 6 項放得下；console 無 error/warn。
- 未驗證：TTS 實際聲音、「聽完整對話」連續播放的節奏（headless 聽不到）。

---

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
