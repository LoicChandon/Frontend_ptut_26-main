<template>
  <div class="admin-page">
    <h1 class="page-title">Admin iCal</h1>

    <section class="table-card">
      <table class="links-table">
        <thead>
          <tr>
            <th>Promo</th>
            <th>Lien iCal</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in linkRows" :key="row.promoId">
            <td>
              <button
                type="button"
                class="promo-color-btn"
                :style="{ backgroundColor: row.color }"
                :title="row.promoId"
              >
                {{ row.promoId }}
              </button>
            </td>
            <td>
              <input
                :id="`ical-${row.promoId}`"
                v-model="row.url"
                class="link-input"
                type="url"
                placeholder="https://.../calendar.ics"
              />
            </td>
            <td>
              <div class="row-actions">
                <button class="btn-delete" @click="clearRow(row.promoId)">
                  Supprimer
                </button>
                <button class="btn-save" @click="saveRow(row.promoId, row.url)">
                  Enregistrer
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive } from "vue";
import { useIcalLinksStore } from "../stores/icalLinks";

const store = useIcalLinksStore();

const linkRows = reactive(
  store.links.map((promo) => ({
    promoId: promo.promoId,
    label: promo.label,
    color: promo.color,
    url: promo.url,
  })),
);

const syncFromStore = () => {
  store.links.forEach((promo) => {
    const row = linkRows.find((item) => item.promoId === promo.promoId);
    if (row) {
      row.url = store.getIcalLinkForPromo(promo.promoId);
    }
  });
};

const saveRow = (promoId, url) => {
  store
    .setIcalLinkForPromo(promoId, url)
    .then(() => {
      syncFromStore();
    })
    .catch((error) => {
      console.error(error);
    });
};

const clearRow = (promoId) => {
  store
    .removeIcalLinkForPromo(promoId)
    .then(() => {
      syncFromStore();
    })
    .catch((error) => {
      console.error(error);
    });
};

onMounted(() => {
  store
    .fetchLinks()
    .then(() => {
      syncFromStore();
    })
    .catch((error) => {
      console.error(error);
    });
});
</script>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-title {
  margin: 0;
  color: var(--color-primary-dark);
  font-size: 1.5rem;
}

.table-card {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(255, 255, 255, 0.92) 100%
  );
  border: 1px solid rgba(124, 80, 220, 0.08);
  border-radius: 18px;
  box-shadow: 0 12px 30px rgba(47, 13, 115, 0.08);
  padding: 0.5rem;
  overflow-x: auto;
}

.links-table {
  width: 100%;
  border-collapse: collapse;
}

.links-table th,
.links-table td {
  padding: 0.9rem;
  text-align: left;
  border-bottom: 1px solid rgba(124, 80, 220, 0.08);
  vertical-align: middle;
}

.links-table th {
  color: var(--color-primary-dark);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.promo-color-btn {
  min-width: 74px;
  border: none;
  border-radius: 999px;
  padding: 0.55rem 0.85rem;
  color: white;
  font-weight: 800;
  cursor: default;
  box-shadow: 0 8px 18px rgba(124, 80, 220, 0.15);
}

.link-input {
  width: 100%;
  border: 1px solid rgba(47, 13, 115, 0.15);
  border-radius: 12px;
  padding: 0.85rem 0.95rem;
  font-size: 0.95rem;
  box-sizing: border-box;
}

.link-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(124, 80, 220, 0.12);
}

.row-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-save,
.btn-delete {
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 0.6rem 0.85rem;
  color: white;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-save {
  background: var(--color-primary);
}

.btn-delete {
  background: #9b9b9b;
}

.btn-save:hover,
.btn-delete:hover {
  filter: brightness(0.95);
}

@media (max-width: 1000px) {
  .links-table th,
  .links-table td {
    white-space: nowrap;
  }
}
</style>
