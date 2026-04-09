<template>
  <div class="app-container">
    <header class="header">
      
      <div class="brand-container">
        <img alt="Logo ISIS" src="./assets/logo-ISIS-vertical-RVB-HD.png" class="logo-image" />
        <h1 class="gradient-text">ISIS MAP</h1>
      </div>
      
      <nav class="nav-menu">
        <router-link to="/map" class="nav-link">Carte</router-link>
        <router-link to="/stats" class="nav-link">Statistiques</router-link>
        <router-link to="/admin" class="nav-link">Admin iCal</router-link>
      </nav>
    </header>

    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useIsismapStore } from './stores/isismap'

const store = useIsismapStore()

onMounted(() => {
  store.fetchCreneaux()
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--card-bg);
  box-shadow: 0 2px 10px rgba(0,0,0,0.05); 
}

/* =========================================
   NOUVEAUX STYLES DU LOGO ET DU DÉGRADÉ 
   ========================================= */
.brand-container {
  display: flex;
  align-items: center;
  gap: 15px; /* L'espace entre l'image et le texte */
}

.logo-image {
  height: 45px; /* Tu peux ajuster cette taille si besoin */
  width: auto;
}

.gradient-text {
  margin: 0;
  font-size: 2rem; 
  font-weight: 900; /* Police très épaisse */
  font-family: 'Arial Black', Impact, sans-serif; 
  letter-spacing: -1px; 
  
  /* Le dégradé exact de ta maquette (Violet vers Corail) */
  background: linear-gradient(90deg, #AC53C6 0%, #F5695F 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
/* ========================================= */

.nav-menu {
  display: flex;
  gap: 1rem;
}

.nav-link {
  text-decoration: none;
  color: var(--text-color);
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

/* Style quand on survole un lien ou quand on est sur la page active */
.nav-link:hover, .router-link-active {
  background-color: var(--color-primary);
  color: white;
}

.main-content {
  flex: 1;
  padding: 2rem;
}
</style>