<template>
  <v-container fluid class="bg-black pa-0">

    <!-- ── HERO / HEADER ─────────────────────────────────────── -->
    <div class="hero">
      <div class="hero-bg" />
      <div class="hero-content px-6 py-8">
        <div class="logo">
          <v-icon icon="mdi-play-circle" color="red-darken-3" size="40" class="mr-2" />
          <span class="logo-text">MovieTime<span class="logo-excl">!</span></span>
        </div>
        <p class="hero-sub">Tu catálogo colaborativo en tiempo real</p>

        <v-tabs
          v-model="categoriaActiva"
          color="red-darken-3"
          class="mt-6 tabs-hero"
          density="compact"
        >
          <v-tab
            v-for="cat in categorias"
            :key="cat.value"
            :value="cat.value"
            class="tab-item"
          >
            <v-icon :icon="cat.icon" size="16" class="mr-1" />
            {{ cat.label }}
          </v-tab>
        </v-tabs>
      </div>
    </div>

    <!-- ── BARRA DE ACCIONES ──────────────────────────────────── -->
    <div class="barra-acciones px-6 py-3 d-flex align-center ga-3">
      <span class="text-caption text-grey">
        {{ itemsFiltrados.length }} {{ categoriaActual.label.toLowerCase() }}
      </span>
      <v-spacer />
      <v-btn
        :color="mostrarForm ? 'grey-darken-2' : 'red-darken-4'"
        size="small"
        variant="elevated"
        :prepend-icon="mostrarForm ? 'mdi-close' : 'mdi-plus'"
        @click="mostrarForm = !mostrarForm"
      >
        {{ mostrarForm ? 'Cerrar' : 'Añadir ' + categoriaActual.singular }}
      </v-btn>
    </div>

    <!-- ── FORMULARIO ─────────────────────────────────────────── -->
    <v-expand-transition>
      <div v-if="mostrarForm" class="px-6 pb-6">
        <v-row justify="center">
          <v-col cols="12" md="8" lg="6">
            <FormularioCreacion
              :categoria="categoriaActiva"
              @nueva-pelicula="agregarItem"
            />
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>

    <!-- ── CATÁLOGO ───────────────────────────────────────────── -->
    <div class="px-4 pb-10">
      <v-row v-if="itemsFiltrados.length > 0" class="ma-0">
        <v-col
          v-for="item in itemsFiltrados"
          :key="item.id"
          cols="6"
          sm="4"
          md="3"
          lg="2"
          xl="1"
          class="pa-1"
        >
          <PeliculaCard
            :pelicula="item"
            @eliminar="pedirConfirmacion"
            @ver="abrirDetalle"
          />
        </v-col>
      </v-row>

      <div v-else class="empty-state">
        <v-icon :icon="categoriaActual.icon" size="56" color="grey-darken-1" class="mb-4" />
        <div class="text-h6 text-grey-darken-1">Sin {{ categoriaActual.label.toLowerCase() }} todavía</div>
        <div class="text-caption text-grey-darken-2 mt-1">
          Pulsa "Añadir {{ categoriaActual.singular }}" para empezar
        </div>
      </div>
    </div>

    <!-- ── DETALLE ────────────────────────────────────────────── -->
    <DetallePelicula
      v-model="detalle.visible"
      :pelicula="detalle.item"
      @votar="registrarVoto"
    />

    <!-- ── DIÁLOGO CONFIRMACIÓN BORRADO ──────────────────────── -->
    <v-dialog v-model="dialogo.visible" max-width="380">
      <v-card class="bg-grey-darken-4 rounded-xl pa-2">
        <v-card-title class="d-flex align-center ga-2">
          <v-icon icon="mdi-alert-circle-outline" color="red-darken-3" />
          Eliminar
        </v-card-title>
        <v-card-text class="text-grey-lighten-2">
          ¿Seguro que quieres eliminar
          <span class="text-white font-weight-bold">{{ dialogo.nombre }}</span>?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" color="grey" @click="dialogo.visible = false">Cancelar</v-btn>
          <v-btn variant="elevated" color="red-darken-4" @click="confirmarEliminar">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const categorias = [
  { value: 'pelicula',   label: 'Películas',    singular: 'Película',   icon: 'mdi-movie' },
  { value: 'serie',      label: 'Series',        singular: 'Serie',      icon: 'mdi-television-play' },
  { value: 'documental', label: 'Documentales',  singular: 'Documental', icon: 'mdi-earth' },
  { value: 'anime',      label: 'Anime',         singular: 'Anime',      icon: 'mdi-star-four-points' },
]

const categoriaActiva = ref('pelicula')
const categoriaActual = computed(
  () => categorias.find(c => c.value === categoriaActiva.value) || categorias[0]
)

// ── Persistencia ────────────────────────────────────────────────
const STORAGE_KEY = 'movietime-catalogo'

const cargarCatalogo = () => {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY)
    return guardado ? JSON.parse(guardado) : []
  } catch { return [] }
}

const catalogo = ref(cargarCatalogo())

watch(catalogo, (v) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) } catch {}
}, { deep: true })

const itemsFiltrados = computed(() =>
  catalogo.value.filter(item => item.categoria === categoriaActiva.value)
)

// ── Formulario ──────────────────────────────────────────────────
const mostrarForm = ref(false)

const agregarItem = (item) => {
  catalogo.value.unshift({
    ...item,
    id: item.id || Date.now().toString(),
    categoria: categoriaActiva.value
  })
  mostrarForm.value = false
}

// ── Ver detalle ─────────────────────────────────────────────────
const detalle = reactive({ visible: false, item: null })

const abrirDetalle = (id) => {
  const found = catalogo.value.find(p => p.id === id)
  if (!found) return
  detalle.item = found
  detalle.visible = true
}

// ── Registrar voto y recalcular media ───────────────────────────
const registrarVoto = ({ id, puntuacion }) => {
  const idx = catalogo.value.findIndex(p => p.id === id)
  if (idx === -1) return

  const p = catalogo.value[idx]
  const totalVotos = (p.numVotos || 0) + 1
  const nuevaMedia = ((p.puntuacionMedia || 0) * (totalVotos - 1) + puntuacion) / totalVotos

  // Actualizamos con la nueva media y número de votos
  catalogo.value[idx] = {
    ...p,
    numVotos: totalVotos,
    puntuacionMedia: Math.round(nuevaMedia * 10) / 10
  }

  // Sincronizamos el objeto que tiene el detalle abierto
  detalle.item = catalogo.value[idx]
}

// ── Eliminar ────────────────────────────────────────────────────
const dialogo = reactive({ visible: false, id: null, nombre: '' })

const pedirConfirmacion = (id) => {
  const item = catalogo.value.find(p => p.id === id)
  if (!item) return
  dialogo.id = id
  dialogo.nombre = item.nombre
  dialogo.visible = true
}

const confirmarEliminar = () => {
  catalogo.value = catalogo.value.filter(p => p.id !== dialogo.id)
  dialogo.visible = false
  dialogo.id = null
  dialogo.nombre = ''
}
</script>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  background: #0a0a0a;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 10% 50%, rgba(183,28,28,0.18) 0%, transparent 70%),
    radial-gradient(ellipse 50% 80% at 90% 20%, rgba(183,28,28,0.08) 0%, transparent 60%);
  pointer-events: none;
}

.hero-content { position: relative; z-index: 1; }

.logo { display: flex; align-items: center; }

.logo-text {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 2.4rem;
  font-weight: 700;
  color: #fff;
}

.logo-excl { color: #e53935; }

.hero-sub {
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  margin: 4px 0 0 52px;
}

.tab-item {
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: none;
  min-width: 90px;
}

.barra-acciones {
  background: rgba(255,255,255,0.02);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  text-align: center;
}
</style>
