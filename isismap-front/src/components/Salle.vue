<template>
  <div class="room" :class="{ 'is-clickable': currentView !== 'jour' }" :style="{ backgroundColor: roomColor }" :title="roomTooltip" @click="onClick">
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
const getPeriodBounds = () => {
  if (!props.dateDebut || !props.dateFin) return null
  return {
    start: new Date(`${props.dateDebut}T00:00:00`),
    end: new Date(`${props.dateFin}T23:59:59`)
  }
}

const getTempsOccupeSurPeriode = (idSalle, startPeriod, endPeriod) => {
  return store.creneaux.reduce((total, c) => {
    if (c.id_salle !== idSalle || !c.debut || !c.fin) return total

    const start = new Date(c.debut)
    const end = new Date(c.fin)

    if (end <= startPeriod || start >= endPeriod) return total

    const overlapStart = start > startPeriod ? start : startPeriod
    const overlapEnd = end < endPeriod ? end : endPeriod

    return total + Math.max(0, overlapEnd - overlapStart)
  }, 0)
}

// Taux absolu (réel sur la période) pour l'affichage du tooltip
const absoluteTaux = computed(() => {
  const bounds = getPeriodBounds()
  if (!bounds) return 0

  const tempsOccupeSalle = getTempsOccupeSurPeriode(props.salle.id, bounds.start, bounds.end)
  const joursTotal = Math.max(1, (bounds.end - bounds.start) / (1000 * 60 * 60 * 24))
  const tempsTotalPossible = joursTotal * 8 * 60 * 60 * 1000

  if (tempsTotalPossible <= 0) return 0
  return Math.min((tempsOccupeSalle / tempsTotalPossible) * 100, 100)
})

// Taux relatif uniquement pour la couleur de la heatmap
const heatmapTaux = computed(() => {
  const bounds = getPeriodBounds()
  if (!bounds) return 0

  const tempsOccupeSalle = getTempsOccupeSurPeriode(props.salle.id, bounds.start, bounds.end)
  const maxTempsOccupe = store.salles.reduce((max, salle) => {
    const temps = getTempsOccupeSurPeriode(salle.id, bounds.start, bounds.end)
    return Math.max(max, temps)
  }, 0)

  if (maxTempsOccupe <= 0) return 0
  return Math.min((tempsOccupeSalle / maxTempsOccupe) * 100, 100)
})

const roomTooltip = computed(() => {
  if (props.currentView === 'jour' || !props.dateDebut || !props.dateFin) return ''

  const percentage = absoluteTaux.value.toFixed(1)
  return `${percentage}% d'utilisation`
})

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
    const taux = heatmapTaux.value
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