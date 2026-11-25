import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './style.css'
import './phonics.css'
import './planet.css'

import IslandMap from './views/IslandMap.vue'
import ZoneView from './views/ZoneView.vue'
import FlashcardView from './views/FlashcardView.vue'
import QuizView from './views/QuizView.vue'
import SpellingView from './views/SpellingView.vue'
import BuildView from './views/BuildView.vue'
import DailyView from './views/DailyView.vue'
import SentenceView from './views/SentenceView.vue'
import PhonicsHome from './views/phonics/PhonicsHome.vue'
import PhonicsLesson from './views/phonics/PhonicsLesson.vue'
import PhonicsPairs from './views/phonics/PhonicsPairs.vue'
import PhonicsPractice from './views/phonics/PhonicsPractice.vue'
import PhonicsSort from './views/phonics/PhonicsSort.vue'
import PhonicsProgress from './views/phonics/PhonicsProgress.vue'
import SyllablesLesson from './views/phonics/SyllablesLesson.vue'
import SyllableChop from './views/phonics/SyllableChop.vue'
import { DEFAULT_COURSE_ID } from './data/phonics/index.js'

const router = createRouter({
  // hash 模式：純靜態部署不需要伺服器 rewrite 設定
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'map', component: IslandMap },
    { path: '/zone/:id', name: 'zone', component: ZoneView, props: true },
    { path: '/zone/:id/cards', name: 'cards', component: FlashcardView, props: true },
    { path: '/zone/:id/quiz', name: 'quiz', component: QuizView, props: true },
    { path: '/zone/:id/spell', name: 'spell', component: SpellingView, props: true },
    { path: '/zone/:id/sentence', name: 'sentence', component: SentenceView, props: true },
    { path: '/review', name: 'review', component: QuizView, props: { mode: 'review' } },
    { path: '/daily', name: 'daily', component: DailyView },
    { path: '/daily/quiz', name: 'daily-quiz', component: QuizView, props: { mode: 'daily' } },
    { path: '/build', name: 'build', component: BuildView },
    // 自然發音：:course 對應 data/phonics/index.js 的課程 id，之後新增課程不用改路由
    { path: '/phonics', redirect: `/phonics/${DEFAULT_COURSE_ID}` },
    // 音節切分（一元一輔切）：資料形狀和母音課程不同，用自己的頁面；靜態路徑優先於 :course
    { path: '/phonics/syllables', name: 'syllables', component: SyllablesLesson },
    {
      path: '/phonics/syllables/chop',
      name: 'syllable-chop',
      component: SyllableChop,
      props: (route) => ({ focus: typeof route.query.focus === 'string' ? route.query.focus : null }),
    },
    { path: '/phonics/:course', name: 'phonics', component: PhonicsHome, props: true },
    { path: '/phonics/:course/group/:group', name: 'phonics-lesson', component: PhonicsLesson, props: true },
    { path: '/phonics/:course/pairs', name: 'phonics-pairs', component: PhonicsPairs, props: true },
    { path: '/phonics/:course/practice/:mode', name: 'phonics-practice', component: PhonicsPractice, props: true },
    { path: '/phonics/:course/sort', name: 'phonics-sort', component: PhonicsSort, props: true },
    { path: '/phonics/:course/progress', name: 'phonics-progress', component: PhonicsProgress, props: true },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

createApp(App).use(router).mount('#app')
