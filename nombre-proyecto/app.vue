<template>
  <div>
    <!-- Pantalla de carga: se muestra hasta que emite 'done' -->
    <Carga v-if="cargando" @done="cargando = false" />

    <!-- Contenido principal: aparece tras la carga -->
    <Transition name="fade-in">
      <NuxtPage v-if="!cargando" />
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const cargando = ref(true)
</script>

<style>
/* Reset base */
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #000;
}

/* Entrada suave de la página tras la carga */
.fade-in-enter-active {
  transition: opacity 0.5s ease;
}
.fade-in-enter-from {
  opacity: 0;
}
</style>
