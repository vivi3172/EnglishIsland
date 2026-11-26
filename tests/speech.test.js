import { describe, it, expect } from 'vitest'
import { chooseVoice } from '../src/utils/speech.js'

const v = (name, lang = 'en-US') => ({ name, lang })

describe('chooseVoice', () => {
  it('prefers a female English voice over a male one listed first (Windows Chrome)', () => {
    const voices = [v('Microsoft David - English (United States)'), v('Microsoft Mark - English (United States)'), v('Microsoft Zira - English (United States)')]
    expect(chooseVoice(voices).name).toContain('Zira')
  })

  it('prefers natural female voices on Edge', () => {
    const voices = [
      v('Microsoft Guy Online (Natural) - English (United States)'),
      v('Microsoft Zira - English (United States)'),
      v('Microsoft Aria Online (Natural) - English (United States)'),
    ]
    expect(chooseVoice(voices).name).toContain('Aria')
  })

  it('works with macOS names and underscore locales', () => {
    expect(chooseVoice([v('Alex'), v('Fred'), v('Samantha', 'en_US')]).name).toBe('Samantha')
  })

  it('does not take "UK English Male" just because it contains a voice name', () => {
    const voices = [v('Google UK English Male', 'en-GB'), v('Google UK English Female', 'en-GB')]
    expect(chooseVoice(voices).name).toBe('Google UK English Female')
  })

  it('ignores non-English female voices and falls back to any English voice', () => {
    const voices = [v('Microsoft Hanhan - Chinese (Taiwan)', 'zh-TW'), v('Microsoft David - English (United States)')]
    expect(chooseVoice(voices).name).toContain('David')
    expect(chooseVoice([])).toBe(null)
  })
})
