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
