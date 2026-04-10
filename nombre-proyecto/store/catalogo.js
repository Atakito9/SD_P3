import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
  query
} from 'firebase/firestore'
import { useFirestore } from 'vuefire'

export const useCatalogoStore = defineStore('catalogo', () => {

  // ── Estado ────────────────────────────────────────────────────
  const items = ref([])
  const cargando = ref(false)
  const error = ref(null)
  let unsubscribe = null  // guardamos la función para cancelar la suscripción

  // ── Suscripción en tiempo real ────────────────────────────────
  // Llama a esta acción al montar la página principal.
  // onSnapshot se queda escuchando cambios y actualiza `items`
  // automáticamente para todos los usuarios conectados.
  const suscribir = () => {
    // Evitamos suscripciones duplicadas
    if (unsubscribe) return

    cargando.value = true
    error.value = null

    const db = useFirestore()
    const q = query(
      collection(db, 'catalogo'),
      orderBy('creadoEn', 'desc')
    )

    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        items.value = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))
        cargando.value = false
      },
      (err) => {
        console.error('Error en la suscripción a Firestore:', err)
        error.value = 'No se pudo conectar con la base de datos.'
        cargando.value = false
      }
    )
  }

  // Cancela la suscripción al desmontar (opcional pero recomendable)
  const desuscribir = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  // ── Añadir item ───────────────────────────────────────────────
  const agregarItem = async (item) => {
    try {
      const db = useFirestore()
      await addDoc(collection(db, 'catalogo'), {
        nombre:          item.nombre,
        genero:          item.genero,
        estreno:         item.estreno,
        enCine:          item.enCine ?? false,
        urlImagen:       item.urlImagen ?? '',
        categoria:       item.categoria,
        puntuacionMedia: 0,
        numVotos:        0,
        creadoEn:        serverTimestamp()
      })
      // No hace falta actualizar items manualmente:
      // onSnapshot lo detecta y actualiza automáticamente
    } catch (err) {
      console.error('Error al añadir item:', err)
      error.value = 'No se pudo añadir el elemento.'
    }
  }

  // ── Eliminar item ─────────────────────────────────────────────
  const eliminarItem = async (id) => {
    try {
      const db = useFirestore()
      await deleteDoc(doc(db, 'catalogo', id))
    } catch (err) {
      console.error('Error al eliminar item:', err)
      error.value = 'No se pudo eliminar el elemento.'
    }
  }

  // ── Votar (recalcula la media en el servidor) ─────────────────
  const votar = async (id, puntuacion) => {
    try {
      const db = useFirestore()
      const item = items.value.find(p => p.id === id)
      if (!item) return

      const totalVotos = (item.numVotos || 0) + 1
      const nuevaMedia = ((item.puntuacionMedia || 0) * (totalVotos - 1) + puntuacion) / totalVotos

      await updateDoc(doc(db, 'catalogo', id), {
        numVotos:        totalVotos,
        puntuacionMedia: Math.round(nuevaMedia * 10) / 10
      })
    } catch (err) {
      console.error('Error al votar:', err)
      error.value = 'No se pudo registrar la valoración.'
    }
  }

  return {
    // Estado
    items,
    cargando,
    error,
    // Acciones
    suscribir,
    desuscribir,
    agregarItem,
    eliminarItem,
    votar
  }
})
