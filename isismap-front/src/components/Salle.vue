<template>
  <div class="room" :class="{ 'is-clickable': currentView !== 'jour' }" :style="{ backgroundColor: roomColor }" @click="onClick">
    <span class="room-name">{{ salle.libelle }}</span>
    <span class="room-info" v-if="roomInfo && currentView === 'jour'">{{ roomInfo }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useIsismapStore } from '../stores/isismap'

const props = defineProps({
  salle: Object,
  currentView: String, // 'jour', 'semaine', 'mois'
  selectedDate: String,
  selectedTime: String,
  dateDebut: String,
  dateFin: String
})
const emit = defineEmits(['clickSalle'])
const store = useIsismapStore()

const onClick = () => {
  emit('clickSalle', props.salle)
}

// LOGIQUE MODE JOUR (Temps réel) 
const activeCreneau = computed(() => {
  if (props.currentView !== 'jour' || !props.selectedDate || !props.selectedTime) return null
  const currentTarget = new Date(`${props.selectedDate}T${props.selectedTime}`)
  
  return store.creneaux.find(c => {
    if(!c.debut || !c.fin) return false
    const start = new Date(c.debut)
    const end = new Date(c.fin)
    return c.id_salle === props.salle.id && currentTarget >= start && currentTarget < end
  })
})

const roomInfo = computed(() => activeCreneau.value ? activeCreneau.value.enseignant : null)

//LOGIQUE MODE SEMAINE/MOIS (Heatmap)
const getTauxOccupation = () => {
  if (!props.dateDebut || !props.dateFin) return 0
  
  const startPeriod = new Date(`${props.dateDebut}T00:00:00`)
  const endPeriod = new Date(`${props.dateFin}T23:59:59`)
  
  // On récupère tous les créneaux de cette salle dans la période
  const creneauxPeriode = store.creneaux.filter(c => {
    return c.id_salle === props.salle.id && new Date(c.debut) >= startPeriod && new Date(c.fin) <= endPeriod
  })

  // Calcul basique du temps d'occupation (en millisecondes)
  let tempsOccupe = 0
  creneauxPeriode.forEach(c => {
    tempsOccupe += (new Date(c.fin) - new Date(c.debut))
  })

  // Calcul du temps total théorique sur la période (ex: 8h par jour)
  const joursTotal = Math.max(1, (endPeriod - startPeriod) / (1000 * 60 * 60 * 24))
  const tempsTotalPossible = joursTotal * 8 * 60 * 60 * 1000 // 8 heures par jour ouvré

  const pourcentage = (tempsOccupe / tempsTotalPossible) * 100
  return Math.min(pourcentage, 100) // On plafonne à 100%
}

// ---- COULEUR FINALE ----
const roomColor = computed(() => {
  if (props.currentView === 'jour') {
    // Mode Jour : Couleur de la promotion
    if (activeCreneau.value) {
      const promo = store.promotions.find(p => p.id === activeCreneau.value.id_prom)
      return promo ? promo.couleur : '#e2e2e2'
    }
    return '#e2e2e2'
  } else {
    // Mode Semaine/Mois : Heatmap (Nuances de violet)
    const taux = getTauxOccupation()
    if (taux === 0) return '#e2e2e2' // Libre (Gris)
    if (taux < 25) return '#d8c8f5' // Peu occupé (Violet très clair)
    if (taux < 50) return '#b392eb' // Modéré (Violet clair)
    if (taux < 75) return '#8b5ce3' // Occupé (Violet moyen)
    return '#5e29cc' // Très occupé (Violet foncé)
  }
})
</script>

<style scoped>
.room {
  flex: 1; min-height: 80px; min-width: 60px;
  border-radius: 4px; display: flex; flex-direction: column;
  justify-content: center; align-items: center; 
  color: white; text-align: center; padding: 5px;
  transition: transform 0.1s, background-color 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  /* J'ai enlevé le cursor: pointer ici */
}

/* Et je l'ai mis ici ! */
.room.is-clickable {
  cursor: pointer;
}
.room[style*="rgb(226, 226, 226)"], .room[style*="#e2e2e2"] { color: #555; }
.room:hover { transform: scale(1.05); filter: brightness(1.1); }
.room-name { font-weight: bold; font-size: 1rem; }
.room-info { font-size: 0.75rem; margin-top: 4px; }
</style>