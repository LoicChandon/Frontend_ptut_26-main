import { defineStore } from 'pinia'

const mapApiLocationToSalleId = (location) => {
  const rawLocation = String(location || '').trim()
  if (!rawLocation) return 'INCONNU'

  const normalizedLocation = rawLocation
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  const isAuditorium = normalizedLocation.includes('auditorium') || normalizedLocation.includes('amphi')
  if (isAuditorium && normalizedLocation.includes('grand')) return 'GrandAmphi'
  if (isAuditorium && normalizedLocation.includes('petit')) return 'PetitAmphi'

  const bCode = normalizedLocation.match(/\bb\d{3}a?\b/)
  if (bCode) {
    const upperCode = bCode[0].toUpperCase()
    return upperCode.endsWith('A') ? `${upperCode.slice(0, -1)}a` : upperCode
  }

  if (normalizedLocation.includes('chl')) return 'CHL'

  return rawLocation
}

//  NOTRE MAGASIN DE DONNÉES PINIA ---
export const useIsismapStore = defineStore('isismap', {
  state: () => ({
    salles: [
      { id: 'CHL', libelle: 'CHL' },
      { id: 'B110', libelle: 'B110' }, { id: 'B108', libelle: 'B108' }, { id: 'B107', libelle: 'B107' },
      { id: 'B104', libelle: 'B104' }, { id: 'B103', libelle: 'B103' }, { id: 'B101', libelle: 'B101' },
      { id: 'B109', libelle: 'B109' }, { id: 'B106', libelle: 'B106' }, { id: 'B105', libelle: 'B105' }, 
      { id: 'B102', libelle: 'B102' },
      { id: 'B019', libelle: 'B019' }, { id: 'B019a', libelle: 'B019a' },
      { id: 'B017', libelle: 'B017' }, { id: 'B011', libelle: 'B011' }, { id: 'B009', libelle: 'B009' }, 
      { id: 'B007', libelle: 'B007' }, { id: 'PetitAmphi', libelle: 'Petit Amphi' },
      { id: 'B018', libelle: 'B018' }, { id: 'B012', libelle: 'B012' }, { id: 'B010', libelle: 'B010' },
      { id: 'GrandAmphi', libelle: 'Grand Amphi' }
    ],
    promotions: [
      { id: 'FIE1', libelle: 'FIE1', couleur: '#ac54c7' },
      { id: 'FIE2', libelle: 'FIE2', couleur: '#f26958' },
      { id: 'FIE3', libelle: 'FIE3', couleur: '#f5a028' },
      { id: 'FIE4', libelle: 'FIE4', couleur: '#3a87f1' },
      { id: 'FIE5', libelle: 'FIE5', couleur: '#3cbebe' },
      { id: 'FIA3', libelle: 'FIA3', couleur: '#ff1493' },
      { id: 'FIA4', libelle: 'FIA4', couleur: '#0000ff' },
      { id: 'FIA5', libelle: 'FIA5', couleur: '#32cd32' }
    ],
    creneaux: [],
    isLoadingCreneaux: false,
    creneauxError: null
  }),
  actions: {
    async importIcalCreneaux(replaceExisting = true) {
      const response = await fetch(`/api/creneaux/import-ical?replaceExisting=${replaceExisting}`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error(`Erreur import iCal ${response.status}`)
      }
    },

    async fetchCreneaux() {
      this.isLoadingCreneaux = true
      this.creneauxError = null

      try {
        const response = await fetch('/api/creneaux')
        if (!response.ok) {
          throw new Error(`Erreur API ${response.status}`)
        }

        const data = await response.json()
        this.creneaux = data.map((c) => ({
          id: c.id,
          id_salle: mapApiLocationToSalleId(c.location),
          id_prom: c.classe || 'INCONNU',
          enseignant: c.professor || 'Non renseigné',
          debut: c.startTime,
          fin: c.endTime
        }))
      } catch (error) {
        this.creneauxError = error.message || 'Impossible de charger les créneaux'
        this.creneaux = []
      } finally {
        this.isLoadingCreneaux = false
      }
    }
  }
})