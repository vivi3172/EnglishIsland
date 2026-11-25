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
