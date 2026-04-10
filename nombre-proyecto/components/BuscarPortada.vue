<template>
  <v-card variant="outlined" class="pa-4 buscar-portada">
    <div class="text-overline mb-2 text-grey-lighten-1">
      Buscar portada
    </div>

    <v-text-field
      v-model="terminoBusqueda"
      label="Nombre de la película"
      append-inner-icon="mdi-magnify"
      variant="solo-filled"
      density="compact"
      color="red-darken-4"
      :loading="buscando"
      @click:append-inner="buscar"
      @keyup.enter="buscar"
      clearable
    />

    <v-alert
      v-if="error"
      type="warning"
      variant="tonal"
      density="compact"
      class="mt-2"
      closable
      @click:close="error = ''"
    >
      {{ error }}
    </v-alert>

    <v-expand-transition>
      <div v-if="resultados.length > 0" class="mt-3">
        <div class="text-caption text-grey mb-2">
          Haz clic en una portada para seleccionarla
        </div>
        <v-row dense>
          <v-col
            v-for="(pelicula, i) in resultados"
            :key="i"
            cols="4"
          >
            <v-hover v-slot="{ isHovering, props }">
              <v-card
                v-bind="props"
                :elevation="isHovering ? 10 : 2"
                class="cursor-pointer rounded-lg overflow-hidden"
                @click="seleccionar(pelicula.poster)"
              >
                <v-img
                  :src="pelicula.poster"
                  aspect-ratio="0.67"
                  cover
                  class="bg-grey-darken-3"
                >
                  <v-overlay
                    :model-value="isHovering"
                    contained
                    scrim="red-darken-4"
                    class="align-center justify-center"
                  >
                    <v-icon icon="mdi-check-circle" size="large" color="white" />
                  </v-overlay>
                </v-img>
                <div class="text-caption text-center pa-1 text-truncate">
                  {{ pelicula.titulo }}
                </div>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>

    <div v-if="buscando" class="text-center py-4">
      <v-progress-circular indeterminate size="24" color="red-darken-4" />
      <div class="text-caption mt-2 text-grey">Buscando...</div>
    </div>

    <div v-if="!buscando && terminoBuscado && resultados.length === 0" class="text-center py-3 text-grey text-caption">
      No se encontraron resultados para "{{ terminoBuscado }}"
    </div>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

// Obtén tu API key gratuita en: https://www.themoviedb.org/settings/api
const TMDB_API_KEY = '824ce8d1cce84b6028b6390dc4b80724'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

const emit = defineEmits(['imagen-seleccionada'])

const terminoBusqueda = ref('')
const terminoBuscado = ref('')
const buscando = ref(false)
const resultados = ref([])
const error = ref('')

const buscar = async () => {
  const termino = terminoBusqueda.value?.trim()
  if (!termino) return

  buscando.value = true
  resultados.value = []
  error.value = ''
  terminoBuscado.value = termino

  try {
    const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(termino)}&language=es-ES&api_key=${TMDB_API_KEY}`
    const respuesta = await fetch(url)

    if (!respuesta.ok) {
      throw new Error(`Error de red: ${respuesta.status}`)
    }

    const datos = await respuesta.json()

    // Filtramos los que tienen póster y construimos la URL completa de la imagen
    resultados.value = (datos.results || [])
      .filter(item => item.poster_path)
      .slice(0, 6)
      .map(item => ({
        titulo: item.title,
        anio: item.release_date?.slice(0, 4) || '',
        poster: TMDB_IMAGE_BASE + item.poster_path
      }))

    if (resultados.value.length === 0) {
      error.value = 'No se encontraron resultados con portada disponible.'
    }

  } catch (err) {
    console.error('Error al buscar portada:', err)
    error.value = 'No se pudo conectar con el servicio de búsqueda.'
  } finally {
    buscando.value = false
  }
}

const seleccionar = (url) => {
  emit('imagen-seleccionada', url)
  resultados.value = []
  terminoBusqueda.value = ''
  terminoBuscado.value = ''
}
</script>

<style scoped>
.buscar-portada {
  border-style: dashed !important;
  border-width: 2px !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
