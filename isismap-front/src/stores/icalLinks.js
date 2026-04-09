import { defineStore } from 'pinia'

const LIEN_ICALS_API = '/api/lienicals'

const PROMOTION_CONFIG = [
  { id: 'FIE1', libelle: 'FIE1', couleur: '#ac54c7' },
  { id: 'FIE2', libelle: 'FIE2', couleur: '#f26958' },
  { id: 'FIE3', libelle: 'FIE3', couleur: '#f5a028' },
  { id: 'FIE4', libelle: 'FIE4', couleur: '#3a87f1' },
  { id: 'FIE5', libelle: 'FIE5', couleur: '#3cbebe' },
  { id: 'FIA3', libelle: 'FIA3', couleur: '#ff1493' },
  { id: 'FIA4', libelle: 'FIA4', couleur: '#0000ff' },
  { id: 'FIA5', libelle: 'FIA5', couleur: '#32cd32' }
]

const normalizeIcalLinks = (links) => {
  const linkMap = new Map((Array.isArray(links) ? links : []).map((item) => [item.promoId, item]))

  return PROMOTION_CONFIG.map((promo) => {
    const existingLink = linkMap.get(promo.id)

    return {
      promoId: promo.id,
      label: promo.libelle,
      color: promo.couleur,
      url: existingLink && typeof existingLink.url === 'string' ? existingLink.url : ''
    }
  })
}

export const useIcalLinksStore = defineStore('icalLinks', {
  state: () => ({
    links: normalizeIcalLinks([]),
    isLoading: false,
    error: null
  }),
  actions: {
    fetchLinks() {
      this.isLoading = true
      this.error = null

      return fetch(LIEN_ICALS_API)
        .then((response) => {
        if (!response.ok) {
          throw new Error(`Erreur API ${response.status}`)
        }

          return response.json()
        })
        .then((data) => {
        const normalizedFromApi = (Array.isArray(data) ? data : []).map((item) => ({
          promoId: item.promoId || item.promo || item.promotion || item.id_prom || '',
          url: item.url || item.lien || item.lienIcal || ''
        }))

        this.links = normalizeIcalLinks(normalizedFromApi)
        })
        .catch((error) => {
        this.error = error.message || 'Impossible de charger les liens iCal'
        this.links = normalizeIcalLinks([])
        })
        .finally(() => {
        this.isLoading = false
        })
    },

    getIcalLinkForPromo(promoId) {
      return this.links.find((link) => link.promoId === promoId)?.url || ''
    },

    setIcalLinkForPromo(promoId, url) {
      const trimmedUrl = String(url || '').trim()

      return fetch(LIEN_ICALS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          promoId,
          url: trimmedUrl
        })
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Erreur sauvegarde lien ${response.status}`)
          }

          this.links = normalizeIcalLinks([
            ...this.links.filter((link) => link.promoId !== promoId),
            { promoId, url: trimmedUrl }
          ])
        })
    },

    removeIcalLinkForPromo(promoId) {
      return fetch(`${LIEN_ICALS_API}/${encodeURIComponent(promoId)}`, {
        method: 'DELETE'
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Erreur suppression lien ${response.status}`)
          }

          this.links = normalizeIcalLinks(this.links.filter((link) => link.promoId !== promoId))
        })
    }
  }
})
