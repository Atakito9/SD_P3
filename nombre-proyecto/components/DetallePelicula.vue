<template>
  <!-- Overlay de fondo -->
  <v-dialog
    v-model="visible"
    fullscreen
    transition="dialog-bottom-transition"
    scrollable
  >
    <v-card class="detalle-card bg-black" v-if="pelicula">

      <!-- ── FONDO DIFUMINADO CON LA PORTADA ─────────────────── -->
      <div class="backdrop">
        <img
          v-if="pelicula.urlImagen"
          :src="pelicula.urlImagen"
          class="backdrop-img"
        />
        <div class="backdrop-overlay" />
      </div>

      <!-- ── BOTÓN CERRAR ────────────────────────────────────── -->
      <v-btn
        icon="mdi-arrow-left"
        variant="tonal"
        class="btn-cerrar"
        @click="$emit('update:modelValue', false)"
      />

      <!-- ── CONTENIDO ───────────────────────────────────────── -->
      <v-card-text class="detalle-body pa-0">
        <v-container class="py-10 px-6" style="max-width: 960px;">
          <v-row>

            <!-- Portada -->
            <v-col cols="12" sm="4" md="3">
              <v-img
                :src="pelicula.urlImagen || fallback"
                class="portada-img rounded-xl"
                cover
              />
            </v-col>

            <!-- Info principal -->
            <v-col cols="12" sm="8" md="9" class="pl-sm-6">

              <!-- Badges -->
              <div class="d-flex align-center ga-2 mb-3 flex-wrap">
                <v-chip size="small" color="red-darken-3" variant="elevated" label>
                  {{ etiquetaCategoria }}
                </v-chip>
                <v-chip size="small" color="grey-darken-2" variant="tonal" label>
                  {{ pelicula.genero }}
                </v-chip>
                <v-chip v-if="pelicula.enCine" size="small" color="green-darken-2" variant="tonal" label>
                  <v-icon start icon="mdi-filmstrip" size="12" />
                  En cines
                </v-chip>
              </div>

              <!-- Título y año -->
              <h1 class="titulo-detalle">
                {{ pelicula.nombre }}
                <span class="titulo-anio">({{ pelicula.estreno }})</span>
              </h1>

              <!-- Puntuación media grande -->
              <div class="score-wrap mt-4 mb-2">
                <div
                  class="score-circle"
                  :style="{
                    border: '3px solid ' + scoreColor,
                    boxShadow: '0 0 16px ' + scoreColor + '88'
                  }"
                >
                  <span class="score-num" :style="{ color: scoreColor }">{{ scoreDisplay }}</span>
                </div>
                <div class="ml-4">
                  <div class="text-caption text-grey-lighten-1 text-uppercase" style="letter-spacing:.1em">
                    Puntuación media
                  </div>
                  <v-rating
                    :model-value="pelicula.puntuacionMedia"
                    color="amber"
                    half-increments
                    readonly
                    density="compact"
                    size="small"
                  />
                  <div class="text-caption text-grey mt-1">
                    {{ pelicula.numVotos || 0 }} {{ pelicula.numVotos === 1 ? 'valoración' : 'valoraciones' }}
                  </div>
                </div>
              </div>

              <v-divider class="my-5 border-opacity-10" />

              <!-- ── SECCIÓN VALORAR ─────────────────────────── -->
              <div class="valorar-section">
                <div class="text-subtitle-1 font-weight-bold text-white mb-3">
                  <v-icon icon="mdi-star-plus-outline" color="amber" class="mr-1" />
                  Tu valoración
                </div>

                <v-rating
                  v-model="miVoto"
                  color="amber"
                  empty-icon="mdi-star-outline"
                  full-icon="mdi-star"
                  half-icon="mdi-star-half-full"
                  half-increments
                  hover
                  size="36"
                  class="mb-3"
                />

                <v-textarea
                  v-model="miComentario"
                  label="Comentario opcional"
                  variant="filled"
                  rows="2"
                  auto-grow
                  hide-details
                  class="mb-4"
                  color="amber"
                />

                <v-btn
                  color="amber-darken-2"
                  variant="elevated"
                  :disabled="!miVoto"
                  prepend-icon="mdi-send"
                  @click="enviarVoto"
                >
                  Enviar valoración
                </v-btn>

                <v-alert
                  v-if="votoEnviado"
                  type="success"
                  variant="tonal"
                  density="compact"
                  class="mt-3"
                  icon="mdi-check-circle"
                >
                  ¡Valoración enviada! Media actualizada.
                </v-alert>
              </div>
            </v-col>
          </v-row>

          <!-- ── HISTORIAL DE COMENTARIOS ────────────────────── -->
          <div v-if="comentarios.length > 0" class="mt-8">
            <v-divider class="mb-6 border-opacity-10" />
            <div class="text-subtitle-1 font-weight-bold text-white mb-4">
              <v-icon icon="mdi-comment-multiple-outline" class="mr-2" color="grey-lighten-1" />
              Valoraciones de usuarios
            </div>
            <v-row>
              <v-col
                v-for="(c, i) in comentarios"
                :key="i"
                cols="12"
                md="6"
              >
                <v-card class="bg-grey-darken-4 rounded-xl pa-4" elevation="0">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <v-rating
                      :model-value="c.puntuacion"
                      color="amber"
                      readonly
                      half-increments
                      density="compact"
                      size="small"
                    />
                    <span class="text-caption text-grey">{{ c.fecha }}</span>
                  </div>
                  <p v-if="c.comentario" class="text-body-2 text-grey-lighten-2 ma-0">
                    "{{ c.comentario }}"
                  </p>
                  <p v-else class="text-caption text-grey font-italic ma-0">
                    Sin comentario
                  </p>
                </v-card>
              </v-col>
            </v-row>
          </div>

        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  pelicula:   { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'votar'])

// computed writable: v-dialog usa esto en lugar de la prop directamente
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const fallback = 'https://placehold.co/300x450/1a1a1a/555555?text=Sin+portada'

// ── Categoría legible ───────────────────────────────────────────
const etiquetaCategoria = computed(() => ({
  pelicula:   'Película',
  serie:      'Serie',
  documental: 'Documental',
  anime:      'Anime'
}[props.pelicula?.categoria] || 'Película'))

// ── Score circular ──────────────────────────────────────────────
const scoreDisplay = computed(() => {
  const p = props.pelicula?.puntuacionMedia || 0
  return p > 0 ? p.toFixed(1) : '—'
})

const scoreColor = computed(() => {
  const p = props.pelicula?.puntuacionMedia || 0
  if (p >= 4) return '#4caf50'
  if (p >= 2.5) return '#ffc107'
  return '#f44336'
})

// ── Comentarios guardados para esta película ────────────────────
const COMENTARIOS_KEY = 'movietime-comentarios'

const cargarComentarios = (id) => {
  try {
    const todos = JSON.parse(localStorage.getItem(COMENTARIOS_KEY) || '{}')
    return todos[id] || []
  } catch { return [] }
}

const guardarComentario = (id, entrada) => {
  try {
    const todos = JSON.parse(localStorage.getItem(COMENTARIOS_KEY) || '{}')
    if (!todos[id]) todos[id] = []
    todos[id].unshift(entrada)
    localStorage.setItem(COMENTARIOS_KEY, JSON.stringify(todos))
  } catch {}
}

const comentarios = ref([])

watch(() => props.pelicula?.id, (id) => {
  comentarios.value = id ? cargarComentarios(id) : []
  miVoto.value = 0
  miComentario.value = ''
  votoEnviado.value = false
}, { immediate: true })

// ── Valoración ──────────────────────────────────────────────────
const miVoto = ref(0)
const miComentario = ref('')
const votoEnviado = ref(false)

const enviarVoto = () => {
  if (!miVoto.value || !props.pelicula) return

  const entrada = {
    puntuacion: miVoto.value,
    comentario: miComentario.value.trim(),
    fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Guardamos el comentario localmente
  guardarComentario(props.pelicula.id, entrada)
  comentarios.value.unshift(entrada)

  // Emitimos al padre para que recalcule la media
  emit('votar', { id: props.pelicula.id, puntuacion: miVoto.value })

  miVoto.value = 0
  miComentario.value = ''
  votoEnviado.value = true
  setTimeout(() => { votoEnviado.value = false }, 3000)
}
</script>

<style scoped>
.detalle-card {
  position: relative;
  overflow-y: auto;
}

/* ── Backdrop ─────────────────────────────────────────────────── */
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.backdrop-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(28px) brightness(0.25) saturate(1.4);
  transform: scale(1.08);
}

.backdrop-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.92) 60%);
}

/* ── Botón cerrar ─────────────────────────────────────────────── */
.btn-cerrar {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 100;
}

/* ── Body ─────────────────────────────────────────────────────── */
.detalle-body {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

/* ── Portada ──────────────────────────────────────────────────── */
.portada-img {
  width: 100%;
  aspect-ratio: 2/3;
  box-shadow: 0 20px 60px rgba(0,0,0,0.8);
}

/* ── Título ───────────────────────────────────────────────────── */
.titulo-detalle {
  font-family: 'Georgia', serif;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.titulo-anio {
  font-weight: 300;
  color: rgba(255,255,255,0.5);
  font-size: 0.75em;
}

/* ── Score circular ───────────────────────────────────────────── */
.score-wrap {
  display: flex;
  align-items: center;
}

.score-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(0,0,0,0.5);
}

.score-num {
  font-size: 1.2rem;
  font-weight: 700;
}

/* ── Valorar ──────────────────────────────────────────────────── */
.valorar-section {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 20px;
}
</style>
