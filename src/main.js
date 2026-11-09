import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

import IslandMap from './views/IslandMap.vue'
import ZoneView from './views/ZoneView.vue'
import FlashcardView from './views/FlashcardView.vue'
import QuizView from './views/QuizView.vue'
import SpellingView from './views/SpellingView.vue'
import BuildView from './views/BuildView.vue'
import SentenceView from './views/SentenceView.vue'

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
    { path: '/daily', name: 'daily', component: QuizView, props: { mode: 'daily' } },
    { path: '/build', name: 'build', component: BuildView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

createApp(App).use(router).mount('#app')
