// 使用瀏覽器內建語音合成朗讀英文；不支援時安靜失敗。
export const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

function pickVoice() {
  const voices = window.speechSynthesis.getVoices()
  return voices.find((v) => v.lang === 'en-US') ?? voices.find((v) => v.lang?.startsWith('en')) ?? null
}

export function speak(text, { rate = 0.8 } = {}) {
  if (!speechSupported || !text) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'en-US'
  utter.rate = rate
  const voice = pickVoice()
  if (voice) utter.voice = voice
  window.speechSynthesis.speak(utter)
}

// 唸完才 resolve，用來依序播放音素（拼讀示範）。
// 不支援語音、或瀏覽器沒有回報結束時，以逾時保底，動畫照樣能往下走。
export function speakAsync(text, { rate = 0.8, timeout = 4000 } = {}) {
  return new Promise((resolve) => {
    if (!speechSupported || !text) {
      setTimeout(resolve, 600)
      return
    }
    let done = false
    let timer = null
    const finish = () => {
      if (done) return
      done = true
      clearTimeout(timer)
      resolve()
    }
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'en-US'
    utter.rate = rate
    const voice = pickVoice()
    if (voice) utter.voice = voice
    utter.onend = finish
    utter.onerror = finish
    timer = setTimeout(finish, timeout)
    window.speechSynthesis.speak(utter)
  })
}

// 唸一句並回報唸到第幾個字元（onWord(charIndex)，唸完回報 -1），用來逐字高亮。
// 有些瀏覽器 / 語音不送 boundary 事件（或沒有語音），就依字數估算時間照樣往下走。
export function speakTracked(text, { rate = 0.85, onWord } = {}) {
  return new Promise((resolve) => {
    const words = [...String(text ?? '').matchAll(/\S+/g)].map((m) => ({ start: m.index, len: m[0].length }))
    const timers = []
    let done = false
    let gotBoundary = false
    const finish = () => {
      if (done) return
      done = true
      timers.forEach(clearTimeout)
      onWord?.(-1)
      resolve()
    }
    // 估算：每個字依長度分配時間，語速越慢越久
    const wordMs = (w) => (180 + w.len * 55) / rate
    const totalMs = words.reduce((s, w) => s + wordMs(w), 0)
    let estimating = false
    const estimate = () => {
      if (estimating || done) return
      estimating = true
      let t = 0
      for (const w of words) {
        timers.push(setTimeout(() => !gotBoundary && !done && onWord?.(w.start), t))
        t += wordMs(w)
      }
    }
    // 沒有真的唸出來（沒有語音、合成失敗）：照估算時間跑完高亮再結束，播放節奏不會亂掉
    const fallback = () => {
      estimate()
      timers.push(setTimeout(finish, Math.max(0, totalMs - (Date.now() - startedAt)) + 300))
    }
    const startedAt = Date.now()
    if (!speechSupported || !text) {
      fallback()
      return
    }
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'en-US'
    utter.rate = rate
    const voice = pickVoice()
    if (voice) utter.voice = voice
    utter.onboundary = (e) => {
      if (e.name && e.name !== 'word') return
      gotBoundary = true
      onWord?.(e.charIndex)
    }
    // 被下一句或 stopSpeaking() 打斷 → 立刻結束；其他錯誤 → 改用估算
    utter.onerror = (e) => (e.error === 'interrupted' || e.error === 'canceled' ? finish() : fallback())
    // 沒有任何 boundary、又比估算短很多就結束，視為沒有真的唸出來
    utter.onend = () => (!gotBoundary && Date.now() - startedAt < totalMs * 0.3 ? fallback() : finish())
    // 400ms 內沒收到 boundary 就改用估算；整句以估算時間的兩倍做逾時保底
    timers.push(setTimeout(() => !gotBoundary && estimate(), 400))
    timers.push(setTimeout(finish, totalMs * 2 + 2400))
    window.speechSynthesis.speak(utter)
  })
}

export function stopSpeaking() {
  if (speechSupported) window.speechSynthesis.cancel()
}
