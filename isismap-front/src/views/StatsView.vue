<template>
  <div class="stats-page">
    <div class="header">
      <h1>Tableau de bord des Statistiques</h1>
    </div>

    <div class="toolbar">
      
      <div class="filters-group">
        <div class="filter-item">
          <label>Période :</label>
          <input type="date" v-model="dateDebut" />
          <span>au</span>
          <input type="date" v-model="dateFin" />
        </div>

        <div class="filter-item">
          <label>Salle :</label>
          <select v-model="selectedSalle">
            <option value="">Toutes les salles</option>
            <option v-for="salle in store.salles" :key="salle.id" :value="salle.id">
              {{ salle.libelle }}
            </option>
          </select>
        </div>

        <div class="filter-item">
          <label>Enseignant :</label>
          <select v-model="selectedProf">
            <option value="">Tous les enseignants</option>
            <option v-for="prof in listeProfs" :key="prof" :value="prof">
              {{ prof }}
            </option>
          </select>
        </div>
      </div>

      <div class="stats-summary">
        <span><strong>{{ totalHeuresPeriode }}h</strong> filtrées</span>
      </div>
    </div>

    <div class="dashboard">
      <div class="chart-card">
        <h2>Volume d'heures par Salle</h2>
        <div class="chart-container">
          <Bar v-if="totalHeuresPeriode > 0" :data="barChartData" :options="barOptions" />
          <div v-else class="empty-state">Aucune donnée pour ces critères.</div>
        </div>
      </div>

      <div class="chart-card">
        <h2>Répartition par Promotion</h2>
        <div class="chart-container">
          <Doughnut v-if="totalHeuresPeriode > 0" :data="doughnutChartData" :options="doughnutOptions" />
          <div v-else class="empty-state">Aucune donnée pour ces critères.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useIsismapStore } from '../stores/isismap'
import { Bar, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

const store = useIsismapStore()

// var des filtres
const dateDebut = ref('2026-04-01')
const dateFin = ref('2026-04-30')
const selectedSalle = ref('') // Vide = Toutes les salles
const selectedProf = ref('')  // Vide = Tous les profs

//LISTE DYNAMIQUE DES PROFS
// On parcourt tous les créneaux pour extraire les noms des profs sans doublons
const listeProfs = computed(() => {
  const profs = store.creneaux.map(c => c.enseignant)
  return [...new Set(profs)].sort() // Le Set enlève les doublons, sort() trie par ordre alphabétique
})

//LE FILTRE MULTI-CRITÈRES
const creneauxFiltres = computed(() => {
  const start = new Date(`${dateDebut.value}T00:00:00`)
  const end = new Date(`${dateFin.value}T23:59:59`)
  
  return store.creneaux.filter(c => {
    //Est-ce que la date correspond ?
    const dateCours = new Date(c.debut)
    const matchDate = dateCours >= start && dateCours <= end
    
    //Est-ce que la salle correspond ? (Si selectedSalle est vide, c'est bon pour toutes)
    const matchSalle = selectedSalle.value === '' || c.id_salle === selectedSalle.value
    
    //Est-ce que le prof correspond ?
    const matchProf = selectedProf.value === '' || c.enseignant === selectedProf.value

  
    return matchDate && matchSalle && matchProf
  })
})

const getDureeHeures = (debut, fin) => {
  return (new Date(fin) - new Date(debut)) / (1000 * 60 * 60)
}

const totalHeuresPeriode = computed(() => {
  return creneauxFiltres.value.reduce((total, c) => total + getDureeHeures(c.debut, c.fin), 0)
})


//GRAPHIQUE(Barres)
const barChartData = computed(() => {
  const heuresParSalle = {}
  store.salles.forEach(s => { heuresParSalle[s.libelle] = 0 })

  creneauxFiltres.value.forEach(c => {
    const salle = store.salles.find(s => s.id === c.id_salle)
    if (salle) {
      heuresParSalle[salle.libelle] += getDureeHeures(c.debut, c.fin)
    }
  })

  // Pour que le graphique soit plus lisible si on filtre beaucoup, 
  // on peut choisir de ne montrer que les salles qui ont des cours
  const labels = []
  const data = []
  Object.keys(heuresParSalle).forEach(salleLibelle => {
    if (heuresParSalle[salleLibelle] > 0 || selectedSalle.value === '') {
      labels.push(salleLibelle)
      data.push(heuresParSalle[salleLibelle])
    }
  })

  return {
    labels: labels,
    datasets: [{
      label: 'Heures de cours',
      backgroundColor: '#7c50dc',
      data: data
    }]
  }
})

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } }
}


//GRAPHIQUE(Anneau) ---
const doughnutChartData = computed(() => {
  const heuresParPromo = {}
  const couleursPromo = {}

  store.promotions.forEach(p => {
    heuresParPromo[p.id] = 0
    couleursPromo[p.id] = p.couleur
  })

  creneauxFiltres.value.forEach(c => {
    if (heuresParPromo[c.id_prom] !== undefined) {
      heuresParPromo[c.id_prom] += getDureeHeures(c.debut, c.fin)
    }
  })

  const labels = []
  const data = []
  const bgColors = []

  Object.keys(heuresParPromo).forEach(promo => {
    if (heuresParPromo[promo] > 0) {
      labels.push(promo)
      data.push(heuresParPromo[promo])
      bgColors.push(couleursPromo[promo])
    }
  })

  return {
    labels: labels,
    datasets: [{
      data: data,
      backgroundColor: bgColors,
      hoverOffset: 4
    }]
  }
})

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false
}
</script>

<style scoped>
.stats-page { display: flex; flex-direction: column; gap: 2rem; }
.header h1 { color: var(--color-primary-dark); margin-bottom: 0.5rem; }
.header p { color: #666; font-size: 1.1rem; }

/* Styles de la nouvelle barre d'outils */
.toolbar {
  display: flex; justify-content: space-between; align-items: flex-start;
  background-color: white; padding: 1.5rem; border-radius: 8px; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  flex-wrap: wrap; gap: 1rem;
}

.filters-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.filter-item label {
  font-weight: bold;
  color: #444;
}

.filter-item input, .filter-item select { 
  padding: 0.4rem; 
  border: 1px solid #ccc; 
  border-radius: 4px; 
  outline: none;
}

.filter-item input:focus, .filter-item select:focus {
  border-color: var(--color-primary);
}

.stats-summary { 
  background-color: var(--color-primary-light); 
  color: var(--color-primary-dark); 
  padding: 0.5rem 1rem; 
  border-radius: 20px; 
  font-size: 0.9rem; 
  white-space: nowrap;
}

/* Grilles et Graphiques */
.dashboard { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
.chart-card { background-color: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); display: flex; flex-direction: column; }
.chart-card h2 { margin-top: 0; margin-bottom: 1.5rem; color: #333; font-size: 1.2rem; text-align: center; }
.chart-container { position: relative; height: 350px; width: 100%; display: flex; justify-content: center; align-items: center; }

.empty-state { color: #999; font-style: italic; }

@media (max-width: 1000px) {
  .dashboard { grid-template-columns: 1fr; }
}
</style>