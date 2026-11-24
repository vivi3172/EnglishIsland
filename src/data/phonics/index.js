// 自然發音課程註冊表。新增課程：在 data/phonics/ 新增資料檔（格式見 longVowels.js），
// 把 status 改成 'ready' 並填入 data，地圖、課程、練習、進度就會自動支援。
import { LONG_VOWELS } from './longVowels.js'

export const PHONICS_COURSES = [
  { id: 'long-vowels', title: '五大長母音', en: 'Long Vowels', status: 'ready', data: LONG_VOWELS },
  { id: 'short-vowels', title: '短母音', en: 'Short Vowels', status: 'planned' },
  { id: 'silent-e', title: '不發音的 e', en: 'Silent E', status: 'planned' },
  { id: 'vowel-teams', title: '母音組合', en: 'Vowel Teams', status: 'planned' },
  { id: 'r-controlled', title: 'R 控制母音', en: 'R-controlled Vowels', status: 'planned' },
  { id: 'diphthongs', title: '雙母音', en: 'Diphthongs', status: 'planned' },
  { id: 'blends', title: '子音混合', en: 'Consonant Blends', status: 'planned' },
  { id: 'digraphs', title: '子音二合字母', en: 'Digraphs', status: 'planned' },
]

export const DEFAULT_COURSE_ID = 'long-vowels'

export function findCourse(id) {
  const entry = PHONICS_COURSES.find((c) => c.id === id && c.status === 'ready')
  return entry?.data ?? null
}
