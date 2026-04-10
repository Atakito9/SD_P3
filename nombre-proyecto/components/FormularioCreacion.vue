<<template>
  <v-card class="pa-6 bg-grey-darken-4 rounded-xl" elevation="4">
    <v-card-title class="text-h5 font-weight-bold d-flex align-center mb-2">
      <v-icon icon="mdi-plus-circle" class="mr-2" color="red" />
      Añadir {{ etiquetaCategoria }}
    </v-card-title>

    <v-card-text>
      <v-form ref="refForm" v-model="esValido">
        <v-row>
          <!-- Columna izquierda: campos -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="item.nombre"
              label="Título"
              :rules="[reglas.requerido]"
              variant="filled"
              prepend-inner-icon="mdi-format-title"
            />

            <v-select
              v-model="item.genero"
              :items="generos"
              label="Género"
              :rules="[reglas.requerido]"
              variant="filled"
              prepend-inner-icon="mdi-tag"
            />

            <v-text-field
              v-model="item.estreno"
              label="Año de estreno"
              :rules="[reglas.requerido, reglas.anio]"
              variant="filled"
              prepend-inner-icon="mdi-calendar-range"
              type="number"
              :min="1888"
              :max="anioActual"
            />

            <v-checkbox
              v-model="item.enCine"
              :label="checkboxLabel"
              color="red-darken-3"
              hide-details
            />
          </v-col>

          <!-- Columna derecha: portada -->
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 mb-2 text-grey-lighten-1">Portada</div>

            <v-img
              v-if="item.urlImagen"
              :src="item.urlImagen"
              height="200"
              cover
              class="rounded-lg mb-3"
            >
              <template #placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="red" />
                </v-row>
              </template>
              <div class="d-flex justify-end pa-1">
                <v-btn icon="mdi-close" size="x-small" color="grey-darken-3" @click="item.urlImagen = ''" />
              </div>
            </v-img>

            <BuscarPortada @imagen-seleccionada="url => item.urlImagen = url" />

            <div v-if="!item.urlImagen" class="text-caption text-grey mt-2">
              Busca el título para seleccionar su portada.
            </div>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <v-divider class="border-opacity-25" />

    <v-card-actions class="pa-4">
      <v-btn variant="text" color="grey-lighten-1" @click="limpiar">Limpiar</v-btn>
      <v-spacer />
      <v-btn
        color="red-darken-4"
        size="large"
        variant="elevated"
        :disabled="!esValido"
        @click="enviar"
      >
        Añadir
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  categoria: {
    type: String,
    default: 'pelicula'
  }
})

const emit = defineEmits(['nueva-pelicula'])

// Etiqueta legible según categoría
const etiquetaCategoria = computed(() => ({
  pelicula:   'Película',
  serie:      'Serie',
  documental: 'Documental',
  anime:      'Anime'
}[props.categoria] || 'Elemento'))

// Label del checkbox según categoría
const checkboxLabel = computed(() => ({
  pelicula:   'Actualmente en cines',
  serie:      'Actualmente en emisión',
  documental: 'Disponible en streaming',
  anime:      'Actualmente en emisión'
}[props.categoria] || 'Disponible ahora'))

const generos = [
  'Acción', 'Animación', 'Aventura', 'Ciencia ficción',
  'Comedia', 'Drama', 'Fantástico', 'Horror',
  'Misterio', 'Romance', 'Thriller', 'Documental'
]

const anioActual = new Date().getFullYear()

const reglas = {
  requerido: v => !!v || 'Este campo es obligatorio',
  anio: v => (v >= 1888 && v <= anioActual) || `El año debe estar entre 1888 y ${anioActual}`
}

const refForm = ref(null)
const esValido = ref(false)

const itemVacio = () => ({
  nombre: '',
  genero: '',
  estreno: '',
  enCine: false,
  puntuacionMedia: 0,
  numVotos: 0,
  urlImagen: ''
})

const item = ref(itemVacio())

const enviar = () => {
  if (!esValido.value) return
  emit('nueva-pelicula', { ...item.value })
  limpiar()
}

const limpiar = () => {
  item.value = itemVacio()
  refForm.value?.resetValidation()
}
</script>
