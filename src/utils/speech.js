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

export function stopSpeaking() {
  if (speechSupported) window.speechSynthesis.cancel()
}
