import { createRouter, createWebHistory } from "vue-router";
import MapView from "../views/MapView.vue";
import AdminView from "../views/AdminView.vue";
import StatsView from "../views/StatsView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/map", // Notre fameuse redirection directe
    },
    {
      path: "/map",
      name: "map",
      component: MapView,
    },
    {
      path: "/stats",
      name: "stats",
      component: StatsView,
    },
    {
      path: "/admin",
      name: "admin",
      component: AdminView,
    },
  ],
});

export default router;
