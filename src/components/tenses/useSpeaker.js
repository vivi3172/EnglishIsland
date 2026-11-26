// 朗讀上色例句並逐字高亮。每次 say() 會取消上一句；離開頁面自動停止。
import { ref, onBeforeUnmount } from 'vue'
import { parseSentence, wordIndexAt } from '../../logic/tense.js'
import { speakTracked, stopSpeaking } from '../../utils/speech.js'

export const RATES = { normal: 0.85, slow: 0.55 }

export function useSpeaker() {
  const active = ref(-1) // 正在唸第幾個字
  const speakingId = ref(null) // 哪一句正在唸（同頁多句時區分）
  let run = 0

  async function say(marked, { rate = RATES.normal, id = null } = {}) {
    const token = ++run
    const { text, words } = parseSentence(marked)
    speakingId.value = id
    active.value = -1
    await speakTracked(text, {
      rate,
      onWord: (ci) => {
        if (token === run) active.value = wordIndexAt(words, ci)
      },
    })
    if (token === run) {
      active.value = -1
      speakingId.value = null
    }
    return token === run // false = 被下一句或 stop() 打斷
  }

  function stop() {
    run++
    active.value = -1
    speakingId.value = null
    stopSpeaking()
  }

  onBeforeUnmount(stop)
  return { active, speakingId, say, stop }
}
