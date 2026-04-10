<template>
  <Transition name="fade-out" @after-leave="$emit('done')">
    <div v-if="visible" class="loading-screen">

      <!-- Líneas de escaneo animadas (efecto cine) -->
      <div class="scanlines" />

      <!-- Contenido central -->
      <div class="loading-content">
        <!-- Icono de película animado -->
        <div class="film-icon-wrap">
          <div class="film-reel">
            <v-icon icon="mdi-filmstrip-box" size="64" color="white" />
          </div>
          <div class="film-glow" />
        </div>

        <!-- Título -->
        <div class="app-title">MovieTime!</div>
        <div class="app-subtitle">Catálogo de peliculas</div>

        <!-- Barra de progreso -->
        <div class="progress-wrap">
          <div class="progress-bar" :style="{ width: progreso + '%' }" />
        </div>
        <div class="progress-label">{{ Math.round(progreso) }}%</div>
      </div>

      <!-- Viñeta en los bordes -->
      <div class="vignette" />
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

defineEmits(['done'])

const visible = ref(true)
const progreso = ref(0)

onMounted(() => {
  // Simulamos una carga progresiva con velocidad variable (más realista)
  const etapas = [
    { hasta: 40, duracion: 400 },
    { hasta: 70, duracion: 300 },
    { hasta: 90, duracion: 500 },
    { hasta: 100, duracion: 200 }
  ]

  let etapaActual = 0

  const avanzar = () => {
    if (etapaActual >= etapas.length) {
      // Pequeña pausa antes de ocultar para que se vea el 100%
      setTimeout(() => { visible.value = false }, 400)
      return
    }

    const { hasta, duracion } = etapas[etapaActual]
    const desde = progreso.value
    const pasos = 20
    const incremento = (hasta - desde) / pasos
    const intervalo = duracion / pasos

    let paso = 0
    const timer = setInterval(() => {
      progreso.value = Math.min(hasta, progreso.value + incremento)
      paso++
      if (paso >= pasos) {
        clearInterval(timer)
        etapaActual++
        avanzar()
      }
    }, intervalo)
  }

  avanzar()
})
</script>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Efecto de líneas de escaneo */
.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 2px,
    rgba(255, 255, 255, 0.025) 2px,
    rgba(255, 255, 255, 0.025) 4px
  );
  pointer-events: none;
  z-index: 1;
}

/* Viñeta */
.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%);
  pointer-events: none;
  z-index: 1;
}

/* Contenido */
.loading-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

/* Icono giratorio */
.film-icon-wrap {
  position: relative;
  margin-bottom: 8px;
}

.film-reel {
  animation: spin 3s linear infinite;
}

.film-glow {
  position: absolute;
  inset: -16px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(183, 28, 28, 0.4) 0%, transparent 70%);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.2); }
}

/* Tipografía */
.app-title {
  font-family: 'Georgia', serif;
  font-size: 2.8rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  color: #fff;
  text-transform: uppercase;
  animation: flicker 4s linear infinite;
}

.app-subtitle {
  font-size: 0.75rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  margin-top: -8px;
}

@keyframes flicker {
  0%, 95%, 100% { opacity: 1; }
  96%           { opacity: 0.85; }
  97%           { opacity: 1; }
  98%           { opacity: 0.7; }
  99%           { opacity: 1; }
}

/* Barra de progreso */
.progress-wrap {
  width: 220px;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 24px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(to right, #b71c1c, #ef5350);
  border-radius: 2px;
  transition: width 0.05s linear;
  box-shadow: 0 0 8px rgba(239, 83, 80, 0.8);
}

.progress-label {
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.35);
  font-variant-numeric: tabular-nums;
}

/* Transición de salida */
.fade-out-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.fade-out-leave-to {
  opacity: 0;
  transform: scale(1.04);
}
</style>
