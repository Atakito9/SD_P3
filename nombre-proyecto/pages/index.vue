<template>
  <v-container fluid class="bg-black pa-0">

    <div class="hero">
      <div class="hero-bg" />
      <div class="hero-content px-6 py-8">
        <div class="logo">
          <v-icon icon="mdi-play-circle" color="red-darken-3" size="40" class="mr-2" />
          <span class="logo-text">MovieTime<span class="logo-excl">!</span></span>
        </div>
        <p class="hero-sub">Catalogo de peliculas</p>

        <v-tabs
          v-model="categoriaActiva"
          color="red-darken-3"
          class="mt-6 tabs-hero"
          density="compact"
          @update:model-value="resetFiltros"
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

    <div class="barra-acciones px-4 pt-3 pb-2">
      <div class="d-flex align-center ga-3 mb-2 flex-wrap">
        <v-text-field
          v-model="busqueda"
          placeholder="Buscar por título, género, año..."
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          density="compact"
          hide-details
          clearable
          color="red-darken-3"
          class="buscador"
          bg-color="grey-darken-4"
        />

        <v-btn
          :color="hayFiltrosActivos ? 'red-darken-3' : 'grey-darken-3'"
          variant="tonal"
          size="small"
          :prepend-icon="mostrarFiltros ? 'mdi-filter-off' : 'mdi-filter'"
          class="text-no-wrap"
          @click="mostrarFiltros = !mostrarFiltros"
        >
          Filtros
          <v-badge
            v-if="hayFiltrosActivos"
            :content="numFiltrosActivos"
            color="red-darken-3"
            inline
            class="ml-1"
          />
        </v-btn>

        <span class="text-caption text-grey text-no-wrap">
          {{ itemsFiltrados.length }}
          {{ hayFiltrosActivos || busqueda ? 'resultado' + (itemsFiltrados.length !== 1 ? 's' : '') : categoriaActual.label.toLowerCase() }}
        </span>

        <v-spacer />

        <v-btn
          :color="mostrarForm ? 'grey-darken-2' : 'red-darken-4'"
          size="small"
          variant="elevated"
          :prepend-icon="mostrarForm ? 'mdi-close' : 'mdi-plus'"
          class="text-no-wrap"
          @click="mostrarForm = !mostrarForm"
        >
          {{ mostrarForm ? 'Cerrar' : 'Añadir ' + categoriaActual.singular }}
        </v-btn>
      </div>

      <v-expand-transition>
        <div v-if="mostrarFiltros" class="filtros-panel pa-3 mb-2 rounded-lg">
          <v-row dense align="center">
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filtros.genero"
                :items="generosDisponibles"
                label="Género"
                variant="filled"
                density="compact"
                hide-details
                clearable
                prepend-inner-icon="mdi-tag"
                color="red-darken-3"
              />
            </v-col>

            <v-col cols="6" sm="3" md="2">
              <v-text-field
                v-model="filtros.anioDesde"
                label="Año desde"
                variant="filled"
                density="compact"
                hide-details
                type="number"
                min="1888"
                :max="anioActual"
                color="red-darken-3"
              />
            </v-col>

            <v-col cols="6" sm="3" md="2">
              <v-text-field
                v-model="filtros.anioHasta"
                label="Año hasta"
                variant="filled"
                density="compact"
                hide-details
                type="number"
                min="1888"
                :max="anioActual"
                color="red-darken-3"
              />
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <div class="d-flex align-center ga-2">
                <v-icon icon="mdi-star" color="amber" size="18" />
                <span class="text-caption text-grey text-no-wrap">Puntuación mínima:</span>
                <v-rating
                  v-model="filtros.puntuacionMin"
                  color="amber"
                  empty-icon="mdi-star-outline"
                  density="compact"
                  size="20"
                  half-increments
                />
                <v-btn
                  v-if="filtros.puntuacionMin"
                  icon="mdi-close"
                  size="x-small"
                  variant="text"
                  color="grey"
                  @click="filtros.puntuacionMin = 0"
                />
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="2">
              <v-checkbox
                v-model="filtros.soloEnCine"
                :label="checkboxEnCineLabel"
                color="red-darken-3"
                density="compact"
                hide-details
              />
            </v-col>
          </v-row>

          <v-row dense align="center" class="mt-2">
            <v-col cols="12" sm="4" md="3">
              <v-select
                v-model="filtros.ordenarPor"
                :items="opcionesOrden"
                label="Ordenar por"
                variant="filled"
                density="compact"
                hide-details
                prepend-inner-icon="mdi-sort"
                color="red-darken-3"
              />
            </v-col>

            <v-col cols="12" sm="3" md="2">
              <v-btn-toggle
                v-model="filtros.orden"
                density="compact"
                color="red-darken-3"
                variant="outlined"
                mandatory
              >
                <v-btn value="asc" size="small" icon="mdi-sort-ascending" />
                <v-btn value="desc" size="small" icon="mdi-sort-descending" />
              </v-btn-toggle>
            </v-col>

            <v-spacer />

            <v-col cols="auto">
              <v-btn
                variant="text"
                color="grey"
                size="small"
                prepend-icon="mdi-restore"
                @click="resetFiltros"
              >
                Limpiar filtros
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>
    </div>

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

      <div v-else-if="busqueda || hayFiltrosActivos" class="empty-state">
        <v-icon icon="mdi-movie-search-outline" size="56" color="grey-darken-1" class="mb-4" />
        <div class="text-h6 text-grey-darken-1">Sin resultados</div>
        <div class="text-caption text-grey-darken-2 mt-1">
          Prueba cambiando los filtros o el texto de búsqueda
        </div>
        <v-btn variant="text" color="grey" size="small" class="mt-3" @click="resetFiltros">
          Limpiar todo
        </v-btn>
      </div>

      <div v-else class="empty-state">
        <v-icon :icon="categoriaActual.icon" size="56" color="grey-darken-1" class="mb-4" />
        <div class="text-h6 text-grey-darken-1">Sin {{ categoriaActual.label.toLowerCase() }} todavía</div>
        <div class="text-caption text-grey-darken-2 mt-1">
          Pulsa "Añadir {{ categoriaActual.singular }}" para empezar
        </div>
      </div>
    </div>

    <footer class="footer-main">
      <v-row no-gutters justify="center" class="px-6 py-12">
        <v-col cols="12" md="3" class="d-flex flex-column align-start align-md-end pr-md-10 mb-8 mb-md-0">
          <div class="logo mb-6">
            <v-icon icon="mdi-play-circle" color="red-darken-3" size="64" class="mr-2" />
            <span class="logo-text text-h3 text-white">MovieTime<span class="logo-excl">!</span></span>
          </div>
        </v-col>

        <v-col cols="12" sm="6" md="3" class="mb-6 text-left">
          <h3 class="text-uppercase text-subtitle-1 font-weight-black mb-4">Creadores</h3>
          <ul class="footer-links">
            <li>Atakito - Pablo Martin Nebreda</li>
            <li>Skyckino - Daniel Garcia Marquez</li>
          </ul>
        </v-col>
      </v-row>

      <div class="footer-bottom py-4 text-center">
        <span class="text-caption text-grey-lighten-1 opacity-60">
          &copy; {{ anioActual }} MovieTime! — {{ BUILD_VERSION }}
        </span>
      </div>
    </footer>

    <DetallePelicula
      v-model="detalle.visible"
      :pelicula="detalle.item"
      @votar="registrarVoto"
    />

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

/* ── CONFIGURACIÓN MANUAL ── */
const BUILD_VERSION = 'v.0.1alph - TEST' 

const categorias = [
  { value: 'pelicula',   label: 'Películas',    singular: 'Película',   icon: 'mdi-movie' },
  { value: 'serie',      label: 'Series',        singular: 'Serie',      icon: 'mdi-television-play' },
  { value: 'documental', label: 'Documentales',  singular: 'Documental', icon: 'mdi-earth' },
  { value: 'anime',      label: 'Anime',         singular: 'Anime',      icon: 'mdi-star-four-points' },
]

const anioActual = new Date().getFullYear()

const categoriaActiva = ref('pelicula')
const categoriaActual = computed(
  () => categorias.find(c => c.value === categoriaActiva.value) || categorias[0]
)

// ── Búsqueda y filtros ───────────────────────────────────────────
const busqueda      = ref('')
const mostrarFiltros = ref(false)

const filtros = reactive({
  genero:        null,
  anioDesde:     '',
  anioHasta:     '',
  puntuacionMin: 0,
  soloEnCine:    false,
  ordenarPor:    'creadoEn',
  orden:         'desc'
})

const opcionesOrden = [
  { title: 'Fecha de añadido', value: 'creadoEn' },
  { title: 'Título',           value: 'nombre' },
  { title: 'Año',              value: 'estreno' },
  { title: 'Puntuación',       value: 'puntuacionMedia' },
]

const checkboxEnCineLabel = computed(() => ({
  pelicula:   'Solo en cines',
  serie:      'Solo en emisión',
  documental: 'Solo en streaming',
  anime:      'Solo en emisión'
}[categoriaActiva.value] || 'Solo disponibles'))

const generosDisponibles = computed(() => {
  const set = new Set(
    catalogo.value
      .filter(i => i.categoria === categoriaActiva.value && i.genero)
      .map(i => i.genero)
  )
  return [...set].sort()
})

const hayFiltrosActivos = computed(() =>
  !!filtros.genero ||
  !!filtros.anioDesde ||
  !!filtros.anioHasta ||
  filtros.puntuacionMin > 0 ||
  filtros.soloEnCine
)

const numFiltrosActivos = computed(() =>
  [filtros.genero, filtros.anioDesde, filtros.anioHasta,
   filtros.puntuacionMin > 0, filtros.soloEnCine].filter(Boolean).length
)

const resetFiltros = () => {
  busqueda.value         = ''
  filtros.genero         = null
  filtros.anioDesde      = ''
  filtros.anioHasta      = ''
  filtros.puntuacionMin  = 0
  filtros.soloEnCine     = false
  filtros.ordenarPor     = 'creadoEn'
  filtros.orden          = 'desc'
}

// ── Persistencia ─────────────────────────────────────────────────
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

// ── Filtrado + ordenación ────────────────────────────────────────
const itemsFiltrados = computed(() => {
  const termino    = busqueda.value.trim().toLowerCase()
  const anioDesde  = filtros.anioDesde  ? Number(filtros.anioDesde)  : null
  const anioHasta  = filtros.anioHasta  ? Number(filtros.anioHasta)  : null

  let resultado = catalogo.value
    .filter(item => item.categoria === categoriaActiva.value)
    .filter(item => {
      if (termino && !(
        item.nombre?.toLowerCase().includes(termino) ||
        item.genero?.toLowerCase().includes(termino) ||
        String(item.estreno).includes(termino)
      )) return false
      if (filtros.genero && item.genero !== filtros.genero) return false
      const anio = Number(item.estreno)
      if (anioDesde && anio < anioDesde) return false
      if (anioHasta && anio > anioHasta) return false
      if (filtros.puntuacionMin > 0 && (item.puntuacionMedia || 0) < filtros.puntuacionMin) return false
      if (filtros.soloEnCine && !item.enCine) return false
      return true
    })

  resultado = [...resultado].sort((a, b) => {
    let va = a[filtros.ordenarPor] ?? ''
    let vb = b[filtros.ordenarPor] ?? ''
    if (typeof va === 'string') va = va.toLowerCase()
    if (typeof vb === 'string') vb = vb.toLowerCase()
    if (va < vb) return filtros.orden === 'asc' ? -1 : 1
    if (va > vb) return filtros.orden === 'asc' ? 1 : -1
    return 0
  })

  return resultado
})

// ── Formulario ───────────────────────────────────────────────────
const mostrarForm = ref(false)

const agregarItem = (item) => {
  catalogo.value.unshift({
    ...item,
    id: item.id || Date.now().toString(),
    categoria: categoriaActiva.value,
    creadoEn: Date.now()
  })
  mostrarForm.value = false
}

// ── Ver detalle ──────────────────────────────────────────────────
const detalle = reactive({ visible: false, item: null })

const abrirDetalle = (id) => {
  const found = catalogo.value.find(p => p.id === id)
  if (!found) return
  detalle.item = found
  detalle.visible = true
}

// ── Registrar voto ───────────────────────────────────────────────
const registrarVoto = ({ id, puntuacion }) => {
  const idx = catalogo.value.findIndex(p => p.id === id)
  if (idx === -1) return
  const p = catalogo.value[idx]
  const totalVotos = (p.numVotos || 0) + 1
  const nuevaMedia = ((p.puntuacionMedia || 0) * (totalVotos - 1) + puntuacion) / totalVotos
  catalogo.value[idx] = {
    ...p,
    numVotos: totalVotos,
    puntuacionMedia: Math.round(nuevaMedia * 10) / 10
  }
  detalle.item = catalogo.value[idx]
}

// ── Eliminar ─────────────────────────────────────────────────────
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

.buscador {
  max-width: 320px;
  min-width: 160px;
}

.filtros-panel {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  text-align: center;
}

.footer-main {
  background-color: #222021;
  color: white;
  width: 100%;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  font-size: 0.95rem;
  line-height: 1.8;
  color: white;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.footer-links li:hover {
  opacity: 0.6;
}

.footer-bottom {
  background-color: rgba(0,0,0,0.15);
  border-top: 1px solid rgba(255,255,255,0.03);
}

@media (max-width: 960px) {
  .footer-main { text-align: left; }
}
</style>
