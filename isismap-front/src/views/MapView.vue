<template>
  <div class="map-page">
    
    <div class="toolbar">
      <div class="date-controls" v-if="currentView === 'jour'">
        <label class="toggle-realtime">
          <input type="checkbox" v-model="isNowActive" />
          Temps réel
        </label>
        <span>Le <input type="date" v-model="selectedDate" :disabled="isNowActive" /></span>
        <span>à <input type="time" v-model="selectedTime" :disabled="isNowActive" /></span>
      </div>

      <div class="date-controls" v-else>
        <span>Du <input type="date" v-model="dateDebut" /></span>
        <span>au <input type="date" v-model="dateFin" /></span>
      </div>

      <div class="view-controls">
        <select v-model="currentView" @change="onViewChange">
          <option value="jour">Journalier</option>
          <option value="semaine">Hebdomadaire</option>
          <option value="mois">Mensuel</option>
        </select>
      </div>
    </div>

    <div class="map-content">
      
      <div class="building-map">
        
        <div class="floor">
          <div class="floor-label">1ER ETAGE</div>
          <div class="architecture-grid">
            <div class="left-wing">
              <Salle :salle="getSalle('CHL')" v-bind="salleProps" class="room-large" />
            </div>
            <div class="main-corridor">
              <div class="row top-row">
                <Salle :salle="getSalle('B110')" v-bind="salleProps" />
                <Salle :salle="getSalle('B108')" v-bind="salleProps" />
                <Salle :salle="getSalle('B107')" v-bind="salleProps" />
                <Salle :salle="getSalle('B104')" v-bind="salleProps" />
                <Salle :salle="getSalle('B103')" v-bind="salleProps" />
                <Salle :salle="getSalle('B101')" v-bind="salleProps" />
              </div>
              <div class="hallway-space"></div>
              <div class="row bottom-row">
                <div class="stairs">Escaliers</div>
                <Salle :salle="getSalle('B109')" v-bind="salleProps" />
                <Salle :salle="getSalle('B106')" v-bind="salleProps" />
                <Salle :salle="getSalle('B105')" v-bind="salleProps" />
                <div class="wc">WC</div>
                <Salle :salle="getSalle('B102')" v-bind="salleProps" />
              </div>
            </div>
          </div>
        </div>

        <hr class="floor-divider" />

        <div class="floor">
          <div class="floor-label">RDC</div>
          <div class="architecture-grid">
            <div class="left-wing wing-split">
              <Salle :salle="getSalle('B019')" v-bind="salleProps" />
              <Salle :salle="getSalle('B019a')" v-bind="salleProps" />
            </div>
            <div class="main-corridor">
              <div class="row top-row">
                <Salle :salle="getSalle('B017')" v-bind="salleProps" />
                <Salle :salle="getSalle('B011')" v-bind="salleProps" />
                <Salle :salle="getSalle('B009')" v-bind="salleProps" />
                <Salle :salle="getSalle('B007')" v-bind="salleProps" />
                <Salle :salle="getSalle('PetitAmphi')" v-bind="salleProps" class="room-amphi" />
              </div>
              <div class="hallway-space"></div>
              <div class="row bottom-row">
                <Salle :salle="getSalle('B018')" v-bind="salleProps" class="room-small" />
                <div class="stairs">Escaliers</div>
                <Salle :salle="getSalle('B012')" v-bind="salleProps" />
                <Salle :salle="getSalle('B010')" v-bind="salleProps" />
                <div class="wc">WC</div>
              </div>
            </div>
            <div class="right-wing">
              <Salle :salle="getSalle('GrandAmphi')" v-bind="salleProps" class="room-xl" />
            </div>
          </div>
        </div>

      </div>

      <div class="legend">
        <h3>Légende</h3>
        <div v-if="currentView === 'jour'">
          <div v-for="promo in store.promotions" :key="promo.id" class="legend-item">
            <div class="color-box" :style="{ backgroundColor: promo.couleur }"></div>
            <span>{{ promo.id }}</span>
          </div>
        </div>
        <div v-else class="heatmap-legend">
          <div class="legend-item"><div class="color-box" style="background-color: #5e29cc"></div><span>Très occupé</span></div>
          <div class="legend-item"><div class="color-box" style="background-color: #8b5ce3"></div><span>Occupé</span></div>
          <div class="legend-item"><div class="color-box" style="background-color: #b392eb"></div><span>Modéré</span></div>
          <div class="legend-item"><div class="color-box" style="background-color: #d8c8f5"></div><span>Peu occupé</span></div>
          <div class="legend-item"><div class="color-box" style="background-color: #e2e2e2"></div><span>Libre</span></div>
        </div>
      </div>

    </div>

    <ModaleSalle 
      v-if="salleSelectionnee" 
      :salle="salleSelectionnee" 
      :dateDebut="dateDebut"  :dateFin="dateFin"     
      @fermer="fermerModale" 
    />

  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue' 
import { useIsismapStore } from '../stores/isismap'
import Salle from '../components/Salle.vue'
import ModaleSalle from '../components/ModaleSalle.vue' 

const store = useIsismapStore()

const salleSelectionnee = ref(null) 

const ouvrirModale = (salle) => {
  if (currentView.value === 'jour') return; 
  salleSelectionnee.value = salle 
}
const fermerModale = () => {
  salleSelectionnee.value = null 
}

const currentView = ref('jour')
const selectedDate = ref('')
const selectedTime = ref('')

const isNowActive = ref(true) 
let intervalTimer = null 

const updateToNow = () => {
  const current = new Date()
  selectedDate.value = current.toISOString().split('T')[0]
  selectedTime.value = current.toTimeString().slice(0, 5)
}

watch(isNowActive, (isActive) => {
  if (isActive) {
    updateToNow() 
    intervalTimer = setInterval(updateToNow, 60000) 
  } else {
    clearInterval(intervalTimer) 
  }
}, { immediate: true }) 

onUnmounted(() => {
  clearInterval(intervalTimer)
})

const dateDebut = ref(new Date().toISOString().split('T')[0])
const uneSemainePlusTard = new Date()
uneSemainePlusTard.setDate(uneSemainePlusTard.getDate() + 7)
const dateFin = ref(uneSemainePlusTard.toISOString().split('T')[0])

const salleProps = computed(() => ({
  currentView: currentView.value,
  selectedDate: selectedDate.value,
  selectedTime: selectedTime.value,
  dateDebut: dateDebut.value,
  dateFin: dateFin.value,
  onClickSalle: ouvrirModale 
}))

const onViewChange = () => {
  const start = new Date(dateDebut.value)
  if (currentView.value === 'semaine') {
    start.setDate(start.getDate() + 7)
  } else if (currentView.value === 'mois') {
    start.setMonth(start.getMonth() + 1)
  }
  dateFin.value = start.toISOString().split('T')[0]
}

const getSalle = (id) => store.salles.find(s => s.id === id) || { id, libelle: id }
</script>

<style scoped>
/*On force la page à faire EXACTEMENT la hauteur de l'écran (moins la barre de navigation) */
.map-page { 
  display: flex; 
  flex-direction: column; 
  gap: 1rem; 
  height: calc(100vh - 100px); /* S'adapte à l'écran ! */
  overflow: hidden; /* Empêche tout scroll de la page entière */
}

.toolbar { display: flex; justify-content: space-between; background-color: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); flex-shrink: 0; }
.toggle-realtime { display: flex; align-items: center; gap: 8px; font-weight: bold; color: var(--color-primary); cursor: pointer; margin-right: 15px; background: rgba(124, 80, 220, 0.1); padding: 5px 10px; border-radius: 6px; }
.toggle-realtime input { cursor: pointer; width: 16px; height: 16px; }
.date-controls input, .view-controls select { padding: 0.3rem; margin-left: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
.date-controls input:disabled { background-color: #f5f5f5; color: #999; border-color: #e0e0e0; cursor: not-allowed; }

/* 2. Le conteneur principal prend tout l'espace restant */
.map-content { 
  flex: 1; 
  display: flex; 
  gap: 1.5rem; 
  align-items: stretch; /* Étire les enfants */
  min-height: 0; /* Indispensable pour que Flexbox accepte de rétrécir */
}

/*La carte se distribue sur la hauteur */
.building-map { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between; /* Espace équitablement le 1er et le RDC */
  min-height: 0; 
}

.floor-divider { width: 100%; border: 0; border-top: 2px dashed #ccc; margin: 0.5rem 0; flex-shrink: 0; }

.floor { 
  flex: 1; /* Chaque étage prend 50% de l'espace disponible */
  display: flex; 
  gap: 1rem; 
  align-items: stretch; 
  min-height: 0;
}

.floor-label { writing-mode: vertical-rl; text-orientation: mixed; transform: rotate(180deg); font-weight: bold; color: #f26958; font-size: 1.2rem; letter-spacing: 2px; text-align: center; }

.architecture-grid { flex: 1; display: flex; gap: 10px; min-height: 0; }
.main-corridor { flex: 1; display: flex; flex-direction: column; gap: 8px; min-height: 0; }

/* Les rangées s'adaptent */
.row { flex: 1; display: flex; gap: 8px; align-items: stretch; min-height: 0; }
.hallway-space { flex: 0.3; min-height: 10px; } /* Le couloir s'écrase aussi si besoin */

.left-wing, .right-wing { display: flex; flex-direction: column; min-height: 0; }
.wing-split { justify-content: space-between; gap: 10px; }


:deep(.room) { 
  flex: 1; 
  min-height: 0; /*  permet aux salles de rétrécir autant que nécessaire */
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden; /* Cache le texte s'il n'y a plus de place */
}

/* Le texte s'adapte à la hauteur de l'écran (vh) pour rester lisible */
:deep(.room-name) { font-size: clamp(0.7rem, 1.5vh, 1rem); }
:deep(.room-info) { font-size: clamp(0.6rem, 1vh, 0.75rem); white-space: nowrap; text-overflow: ellipsis; overflow: hidden; max-width: 90%; }

:deep(.room-large) { width: 8vw; min-width: 60px; }
:deep(.room-xl) { width: 10vw; min-width: 80px; border-radius: 20px; }
:deep(.room-amphi) { flex: 1.5; border-radius: 10px; }
:deep(.room-small) { flex: 0.7; }

.stairs, .wc { flex: 0.5; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; color: #888; background: repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 5px, #fff 5px, #fff 10px); }

.legend { min-width: 150px; display: flex; flex-direction: column; gap: 8px; background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); overflow-y: auto; }
.legend h3 { margin-top: 0; margin-bottom: 10px; color: var(--color-primary-dark); font-size: 1rem;}
.legend-item { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; font-size: 0.85rem; font-weight: bold; }
.color-box { width: 18px; height: 18px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1); flex-shrink: 0; }
</style>