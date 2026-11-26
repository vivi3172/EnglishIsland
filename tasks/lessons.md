# Lessons

## 2026-11-05 區域頁全白：開發伺服器提供過期的編譯結果

- **類型**：missing verification（驗證遺漏）
- **現象**：所有 `#/zone/...` 頁面空白，console 出現 `Property "RESOURCES" was accessed during render but is not defined on instance` 與 `Cannot read properties of undefined (reading 'food')`。
- **根因**：`ZoneView.vue` 的 template 與 `<script setup>` import 分兩次快速存檔，Vite dev server 的 HMR 快取只套用了 template，伺服器持續提供「有新 template、沒有新 import」的模組。原始碼與 `npm run build` 都正確。
- **為什麼沒抓到**：
  1. 改版後的瀏覽器測試沒有走進區域頁（直接開 quiz 網址、地圖、建造頁）。
  2. 沒有在測試時收集 console 錯誤。
  3. 在 Windows 上 TaskStop 只停掉 `npx` 外殼，底層 `node vite.js` 仍佔用 port，新伺服器啟動失敗卻誤以為已重啟。
- **預防規則**：
  - 大改版後，**重啟 dev server** 再驗證；同一檔案的 template 與 import 盡量一次寫完。
  - 瀏覽器驗證要**走過所有路由**，並在最後執行 `agent-browser console | grep -iE "error|warn"`，結果必須為空。
  - 重啟前先確認 port 已釋放：`netstat -ano | grep ":5179 " | grep LISTEN`，殘留的 `node ... vite.js` 程序要一併停止。
- **Tripwire**：`curl -s http://localhost:5179/src/views/<View>.vue | grep "__returned__"`，確認模板用到的 import 都有出現在 setup 回傳物件中。

## 2026-11-25 讀舊存檔的 sanitize 對缺欄位會 crash

- **類型**：incorrect assumption（假設錯誤）
- **現象**：新增 `dailyNew` 欄位後，舊存檔（沒有這個欄位）載入時 `sanitizeProgress` 丟出 `Cannot read properties of undefined (reading 'date')`，玩家會整份進度讀取失敗。
- **根因**：`obj(raw.dailyNew)` 對 undefined 回傳 `{}`（truthy），但後面又直接讀 `raw.dailyNew.date`，而不是讀 `obj()` 的回傳值。
- **預防規則**：sanitize 新欄位一律先 `const d = obj(raw.x)` 再只讀 `d`；每個新欄位都要有「舊存檔沒有這個欄位」的測試。
- **Tripwire**：`grep -n "obj(raw\.\w*) &&" src/logic/progress.js` 應為空。

## 2026-11-25 Bash 工具裡的 heredoc 會解析失敗

- **類型**：environment-dependent
- **現象**：`python - <<'EOF' ... EOF` 或 `cat > file <<'EOF'` 內容含引號時，Git Bash 工具回報 `unexpected EOF while looking for matching`，整段指令沒執行。
- **預防規則**：多行程式或檔案內容改用 Write 工具寫到 scratchpad 再執行，不用 heredoc。

## 2026-11-25 拖曳後的「吞 click」旗標吃掉下一次點擊

- **類型**：incorrect assumption（假設錯誤）
- **現象**：星球拖曳後，點正面的島名沒有反應，要點第二次才進得去。
- **根因**：pointerup 時設 `suppressClick = true`，預期拖曳結束一定會跟著一個 click 把旗標清掉；但滑鼠移動過後 down／up 不在同一元素時瀏覽器不送 click，旗標殘留。
- **預防規則**：這類「只影響下一個事件」的旗標一定要有自動到期（`setTimeout(() => flag = false, 0)`）或在下一次 pointerdown 重設；瀏覽器驗證要測「拖曳 → 再點一下」這個順序。
- **Tripwire**：`grep -n "suppressClick = true" -A2 src/views/*.vue` 每一處都要看到同時排程清除。

## 2026-11-26 多情境共用的說明文字寫死了某一個情境的例子

- **類型**：incorrect assumption（假設錯誤）
- **現象**：12 時態的 `FORMS[key].auxWhy` 寫著「後面的 cooked 是過去分詞」「Grandma 用 is」，但這些說明會出現在每個情境；莉莉寫功課（do / did / done）的題目解析會講錯動詞。
- **根因**：先只做奶奶情境時寫說明，之後才加第二個情境，沒回頭檢查共用文字。
- **預防規則**：資料驅動的共用內容不可提到單一情境的名詞或動詞；要舉例就每個情境都舉（cook → cooks、do → does）。
- **Tripwire**：`tests/tense.test.js` 的 `keeps shared auxiliary explanations neutral across scenarios`（已確認舊文字會讓它失敗）。

## 2026-11-26 沒有語音時 speechSynthesis 會「瞬間唸完」

- **類型**：environment-dependent
- **現象**：headless 瀏覽器（以及沒有英文語音的裝置）有 speechSynthesis 但沒有 voice，utterance 立刻 end / error，逐字高亮不動、節奏播放一下就跳到下一句。
- **預防規則**：依賴 onend 計時的功能，要分辨「被我們 cancel（interrupted / canceled）」和「根本沒唸」；後者改用估算時間跑完。
- **Tripwire**：瀏覽器驗證時用 `speechSynthesis.getVoices().length` 確認是否有語音，並抽樣 `.ts-w.now` 是否逐字前進。
- **工具提醒**：寫入含反引號的 Markdown 時用 Write / Edit，不要經過 bash 字串（反引號會被當成指令替換）。
