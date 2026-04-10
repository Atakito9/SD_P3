<template>
  <v-app theme="dark">
    <v-app-bar flat color="transparent">
      <v-toolbar-title class="text-red-darken-4 font-weight-bold">NETFLIX_CLONE_$\Sigma$</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-menu" @click="drawer = !drawer"></v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" location="right" temporary>
      <v-list>
        <v-list-item title="Configuración $\alpha$"></v-list-item>
        <v-list-item title="Perfil $\beta$"></v-list-item>
        <v-divider></v-divider>
        <v-list-item title="Cerrar"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <slot /> [cite: 126, 127]
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
const drawer = ref(false)
</script>
