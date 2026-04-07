import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MapView from '../views/MapView.vue'
import StatsView from '../views/StatsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/map' // Notre fameuse redirection directe
    },
    {
      path: '/map',
      name: 'map',
      component: MapView
    },
    {
      path: '/stats',
      name: 'stats',
      component: StatsView
    }
  ]
})

// C'EST CETTE LIGNE QUI MANQUAIT PROBABLEMENT ! 👇
export default router