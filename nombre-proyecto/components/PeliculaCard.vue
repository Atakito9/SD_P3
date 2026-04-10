<template>
  <v-hover v-slot="{ isHovering, props }">
    <v-card
      v-bind="props"
      :elevation="isHovering ? 16 : 3"
      class="pelicula-card"
      :class="{ 'on-hover': isHovering }"
      rounded="lg"
      @click="$emit('ver', pelicula.id)"
    >
      <!-- Imagen / Portada -->
      <v-img
        :src="pelicula.urlImagen || imagenFallback"
        aspect-ratio="0.67"
        cover
        class="bg-grey-darken-3"
      >
        <template #placeholder>
          <v-row class="fill-height ma-0" align="center" justify="center">
            <v-progress-circular indeterminate color="grey" size="28" />
          </v-row>
        </template>

        <!-- Badge "En cines" -->
        <div v-if="pelicula.enCine" class="badge-cine">
          <v-icon icon="mdi-filmstrip" size="12" class="mr-1" />
          En cines
        </div>

        <!-- Botón eliminar -->
        <v-fade-transition>
          <v-btn
            v-if="isHovering"
            icon="mdi-trash-can"
            size="x-small"
            color="red-darken-4"
            class="btn-eliminar"
            @click.stop="$emit('eliminar', pelicula.id)"
          />
        </v-fade-transition>

        <!-- Overlay hover -->
        <v-expand-transition>
          <div v-if="isHovering" class="overlay d-flex flex-column justify-end pa-3">
            <div class="text-subtitle-2 font-weight-bold text-white text-truncate">
              {{ pelicula.nombre }}
            </div>
            <div class="text-caption text-grey-lighten-2 mb-1">
              {{ pelicula.genero }} · {{ pelicula.estreno }}
            </div>
            <div class="d-flex align-center justify-space-between">
              <v-rating
                :model-value="pelicula.puntuacionMedia"
                color="amber"
                density="compact"
                half-increments
                readonly
                size="small"
              />
              <span class="text-caption text-amber font-weight-bold">
                {{ pelicula.puntuacionMedia > 0 ? pelicula.puntuacionMedia.toFixed(1) : 'Sin votos' }}
              </span>
            </div>
            <!-- Indicador de que es clicable -->
            <div class="text-center mt-2">
              <v-chip size="x-small" color="white" variant="tonal">
                <v-icon start icon="mdi-eye" size="10" /> Ver detalle
              </v-chip>
            </div>
          </div>
        </v-expand-transition>
      </v-img>

      <!-- Pie siempre visible -->
      <div class="pie-card bg-grey-darken-4 px-2 py-1">
        <div class="text-caption font-weight-medium text-white text-truncate">
          {{ pelicula.nombre }}
        </div>
        <div class="d-flex align-center justify-space-between">
          <span class="text-truncate" style="font-size: 10px; color: rgba(255,255,255,0.45);">
            {{ pelicula.genero }}
          </span>
          <span style="font-size: 10px; color: #FFB300; white-space: nowrap;">
            {{ pelicula.puntuacionMedia > 0 ? '★ ' + pelicula.puntuacionMedia.toFixed(1) : '—' }}
          </span>
        </div>
      </div>
    </v-card>
  </v-hover>
</template>

<script setup>
defineProps({
  pelicula: { type: Object, required: true }
})

defineEmits(['eliminar', 'ver'])

const imagenFallback = 'https://placehold.co/300x450/1a1a1a/555555?text=Sin+portada'
</script>

<style scoped>
.pelicula-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;
  overflow: hidden;
}

.on-hover {
  transform: scale(1.04);
  z-index: 10;
}

.pie-card {
  min-height: 42px;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.92) 60%, transparent 100%);
}

.badge-cine {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(183, 28, 28, 0.9);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  backdrop-filter: blur(4px);
}

.btn-eliminar {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}
</style>
