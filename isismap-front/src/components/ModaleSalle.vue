<template>
  <div class="modal-overlay" @click.self="$emit('fermer')">
    
    <div class="modal-content">
      <div class="modal-header">
        <h2>Planning : Salle {{ salle.libelle }}</h2>
        <button class="btn-close" @click="$emit('fermer')">✖</button>
      </div>

      <div class="modal-body">
        <table class="planning-table" v-if="creneauxDeLaSalle.length > 0">
          <thead>
            <tr>
              <th>Date</th>
              <th>Horaires</th>
              <th>Promotion</th>
              <th>Enseignant</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="creneau in creneauxDeLaSalle" :key="creneau.id">
              <td>{{ formatDate(creneau.debut) }}</td>
              <td>{{ formatHeure(creneau.debut) }} - {{ formatHeure(creneau.fin) }}</td>
              <td>
                <span class="badge" :style="{ backgroundColor: getCouleurPromo(creneau.id_prom) }">
                  {{ creneau.id_prom }}
                </span>
              </td>
              <td>{{ creneau.enseignant }}</td>
            </tr>
          </tbody>
        </table>
        
        <div v-else class="empty-state">
          Aucun cours n'est prévu dans cette salle pour le moment.
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useIsismapStore } from '../stores/isismap'

const props = defineProps({
  salle: Object,
  dateDebut: String, // <-- Nouvelle prop !
  dateFin: String    // <-- Nouvelle prop !
})

defineEmits(['fermer'])

const store = useIsismapStore()

// On filtre par salle ET par dates !
const creneauxDeLaSalle = computed(() => {
  // On définit les bornes de temps (de minuit le premier jour à 23h59 le dernier)
  const start = new Date(`${props.dateDebut}T00:00:00`)
  const end = new Date(`${props.dateFin}T23:59:59`)

  return store.creneaux
    .filter(c => {
      const dateCours = new Date(c.debut)
      // On vérifie que c'est la bonne salle ET que c'est dans la bonne période
      return c.id_salle === props.salle.id && dateCours >= start && dateCours <= end
    })
    .sort((a, b) => new Date(a.debut) - new Date(b.debut)) // On trie par ordre chronologique
})

const getCouleurPromo = (idProm) => {
  const promo = store.promotions.find(p => p.id === idProm)
  return promo ? promo.couleur : '#ccc'
}

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fr-FR')
const formatHeure = (dateString) => new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* Fond semi-transparent */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Toujours par dessus le reste */
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background-color: var(--card-bg);
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: var(--color-primary-dark);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
}
.btn-close:hover { color: red; }

.modal-body {
  padding: 1.5rem;
  overflow-y: auto; /* Permet de scroller si la liste est longue */
}

.planning-table {
  width: 100%;
  border-collapse: collapse;
}

.planning-table th {
  text-align: left;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
  color: #666;
}

.planning-table td {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.badge {
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: bold;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #888;
  font-style: italic;
}
</style>