// 麥克風跟讀：瀏覽器內建語音辨識（Chrome / Edge / Safari 支援；Firefox 不支援）。
const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

export const recognitionSupported = !!Recognition

// 聽一次，回傳辨識候選字串陣列。失敗時 reject，error 為瀏覽器的錯誤代碼
// （not-allowed：未授權麥克風、no-speech：沒聽到聲音、network：需要網路的辨識服務連不上）
export function listenOnce({ lang = 'en-US', timeout = 7000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!Recognition) {
      reject(new Error('unsupported'))
      return
    }
    const rec = new Recognition()
    rec.lang = lang
    rec.interimResults = false
    rec.maxAlternatives = 5
    let settled = false
    const timer = setTimeout(() => rec.abort(), timeout)
    rec.onresult = (event) => {
      settled = true
      clearTimeout(timer)
      const result = event.results[0]
      resolve(Array.from(result, (alt) => alt.transcript))
    }
    rec.onerror = (event) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      reject(new Error(event.error || 'error'))
    }
    rec.onend = () => {
      clearTimeout(timer)
      if (!settled) {
        settled = true
        reject(new Error('no-speech'))
      }
    }
    rec.start()
  })
}
