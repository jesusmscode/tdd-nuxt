<script setup lang="ts">
import type { DuracionMinutos, JugadorId, ModoPuntuacion } from '~/domain/PartidoPadel'
import { JUGADORES } from '~/domain/PartidoPadel'

const { marcador, tiempoVisible, tiempoAgotado, punto, deshacer, resetear, establecerModo, establecerDuracion, establecerNombre, establecerSacador, empezarPartido } = useMarcador()

const partidoTerminado = computed(() => marcador.value.ganador !== null)
const modoElegido = ref<ModoPuntuacion>(marcador.value.modo)
const duracionElegida = ref<DuracionMinutos>(marcador.value.duracionMinutos)
const puntosBloqueados = computed(() => partidoTerminado.value || !marcador.value.iniciado)
const etiquetaTeam = computed(() => marcador.value.ganador === 'T1' ? 'Team 1' : 'Team 2')
const etiquetaEquipoT1 = computed(() => `${marcador.value.nombres.T1A} / ${marcador.value.nombres.T1B}`)
const etiquetaEquipoT2 = computed(() => `${marcador.value.nombres.T2A} / ${marcador.value.nombres.T2B}`)
const nombreSacador = computed(() => marcador.value.nombres[marcador.value.sacador])
const equipoSacador = computed(() => marcador.value.sacador.startsWith('T1') ? 'Team 1' : 'Team 2')

const etiquetasPosicion: Record<JugadorId, string> = {
  T1A: 'Team 1 · A',
  T1B: 'Team 1 · B',
  T2A: 'Team 2 · A',
  T2B: 'Team 2 · B'
}

const sacadorElegido = computed({
  get: () => marcador.value.sacador,
  set: (jugador: JugadorId) => establecerSacador(jugador)
})

const etiquetaModo = computed(() =>
  marcador.value.modo === 'bolaDeOro' ? 'bola de oro' : 'ventaja tradicional'
)

const enBolaDeOro40 = computed(() =>
  marcador.value.modo === 'bolaDeOro'
  && !marcador.value.enTieBreak
  && marcador.value.puntos.t1 === '40'
  && marcador.value.puntos.t2 === '40'
)

const opcionesBloqueadas = computed(() => marcador.value.enCurso)

watch(modoElegido, (modo) => {
  establecerModo(modo)
})

watch(duracionElegida, (minutos) => {
  establecerDuracion(Number(minutos))
})

function nuevoPartido() {
  resetear({
    modo: modoElegido.value,
    duracionMinutos: Number(duracionElegida.value)
  })
}
</script>

<template>
  <div class="mx-auto flex max-w-lg flex-col gap-4 p-4">
    <header class="text-center">
      <h1 class="text-2xl font-bold">
        Marcador de pádel
      </h1>
      <p
        class="text-sm text-muted"
        data-testid="modo-activo"
      >
        Mejor de 3 sets · {{ etiquetaModo }} · {{ marcador.duracionMinutos }} min
      </p>
    </header>

    <fieldset class="rounded-xl bg-elevated p-4">
      <legend class="mb-3 text-sm font-medium text-muted">
        Modo de puntuación
      </legend>
      <p class="mb-3 text-xs text-muted">
        Elige el modo antes del primer punto. Para cambiarlo, empieza un partido nuevo.
      </p>
      <div class="grid grid-cols-2 gap-3">
        <label
          class="flex items-center gap-2 rounded-lg border border-default p-3"
          :class="opcionesBloqueadas ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'"
        >
          <input
            v-model="modoElegido"
            type="radio"
            name="modo"
            value="ventaja"
            :disabled="opcionesBloqueadas"
            data-testid="modo-ventaja"
          >
          <span class="text-sm">Ventaja tradicional</span>
        </label>
        <label
          class="flex items-center gap-2 rounded-lg border border-default p-3"
          :class="opcionesBloqueadas ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'"
        >
          <input
            v-model="modoElegido"
            type="radio"
            name="modo"
            value="bolaDeOro"
            :disabled="opcionesBloqueadas"
            data-testid="modo-bola-de-oro"
          >
          <span class="text-sm">Bola de oro</span>
        </label>
      </div>
    </fieldset>

    <fieldset class="rounded-xl bg-elevated p-4">
      <legend class="mb-3 text-sm font-medium text-muted">
        Duración
      </legend>
      <p class="mb-3 text-xs text-muted">
        60 o 90 minutos. Se elige antes del primer punto.
      </p>
      <div class="grid grid-cols-2 gap-3">
        <label
          class="flex items-center gap-2 rounded-lg border border-default p-3"
          :class="opcionesBloqueadas ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'"
        >
          <input
            v-model.number="duracionElegida"
            type="radio"
            name="duracion"
            :value="60"
            :disabled="opcionesBloqueadas"
            data-testid="duracion-60"
          >
          <span class="text-sm">60 min</span>
        </label>
        <label
          class="flex items-center gap-2 rounded-lg border border-default p-3"
          :class="opcionesBloqueadas ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'"
        >
          <input
            v-model.number="duracionElegida"
            type="radio"
            name="duracion"
            :value="90"
            :disabled="opcionesBloqueadas"
            data-testid="duracion-90"
          >
          <span class="text-sm">90 min</span>
        </label>
      </div>
    </fieldset>

    <fieldset class="rounded-xl bg-elevated p-4">
      <legend class="mb-3 text-sm font-medium text-muted">
        Jugadores y saque
      </legend>
      <div class="grid grid-cols-2 gap-3">
        <label
          v-for="jugador in JUGADORES"
          :key="jugador"
          class="flex flex-col gap-1"
        >
          <span class="text-xs text-muted">{{ etiquetasPosicion[jugador] }}</span>
          <input
            class="rounded-lg border border-default bg-default px-3 py-2 text-sm"
            :value="marcador.nombres[jugador]"
            :data-testid="`nombre-${jugador}`"
            @input="establecerNombre(jugador, ($event.target as HTMLInputElement).value)"
          >
        </label>
      </div>
      <p class="mt-4 mb-2 text-sm font-medium">
        ¿Quién saca?
      </p>
      <div class="grid grid-cols-2 gap-2">
        <label
          v-for="jugador in JUGADORES"
          :key="`saque-${jugador}`"
          class="flex cursor-pointer items-center gap-2 rounded-lg border border-default p-2"
        >
          <input
            v-model="sacadorElegido"
            type="radio"
            name="sacador"
            :value="jugador"
            :disabled="Boolean(marcador.ordenSaque)"
            :data-testid="`sacador-${jugador}`"
          >
          <span class="text-sm">{{ marcador.nombres[jugador] }}</span>
        </label>
      </div>
      <p
        class="mt-3 text-center text-sm font-semibold"
        data-testid="sacador-activo"
      >
        Saca: {{ nombreSacador }} ({{ equipoSacador }})
      </p>
      <p
        v-if="marcador.ordenSaque"
        class="mt-2 text-center text-xs text-muted"
        data-testid="orden-saque"
      >
        Orden guardado:
        {{ marcador.ordenSaque.map(jugador => marcador.nombres[jugador]).join(' → ') }}
      </p>
      <div
        v-if="marcador.historialSaques.length"
        class="mt-3"
      >
        <h3 class="mb-1 text-xs font-medium text-muted">
          Historial de saques
        </h3>
        <ol
          class="space-y-1 text-sm"
          data-testid="historial-saques"
        >
          <li
            v-for="registro in marcador.historialSaques"
            :key="registro.orden"
          >
            Juego {{ registro.orden }}: {{ registro.nombre }}
          </li>
        </ol>
      </div>
    </fieldset>

    <section class="rounded-xl bg-elevated p-4 text-center">
      <h2 class="mb-1 text-sm font-medium text-muted">
        Cronómetro
      </h2>
      <p
        class="font-mono text-5xl font-bold tracking-tight"
        data-testid="cronometro"
      >
        {{ tiempoVisible }}
      </p>
      <p
        v-if="tiempoAgotado"
        class="mt-2 text-sm font-medium text-warning"
        data-testid="tiempo-agotado"
      >
        Tiempo agotado
      </p>
      <UButton
        class="mt-4"
        block
        size="xl"
        :disabled="marcador.iniciado"
        data-testid="empezar-partido"
        @click="empezarPartido"
      >
        Empezar partido
      </UButton>
    </section>

    <UAlert
      v-if="marcador.avisoCambioDeLado && !marcador.ganador"
      color="info"
      variant="subtle"
      title="Cambio de lado"
      description="Los equipos deben cambiar de campo."
      data-testid="cambio-de-lado"
    />

    <UAlert
      v-if="marcador.ganador"
      color="success"
      variant="subtle"
      :title="`Ganador: ${etiquetaTeam}`"
      data-testid="ganador"
    />

    <UAlert
      v-else-if="enBolaDeOro40"
      color="warning"
      variant="subtle"
      title="Bola de oro"
      description="40-40: el siguiente punto gana el juego."
      data-testid="estado-bola-de-oro"
    />

    <UAlert
      v-else-if="marcador.enTieBreak"
      color="warning"
      variant="subtle"
      title="Tie-break"
      description="Puntos correlativos. Hace falta diferencia de 2."
      data-testid="estado-tie-break"
    />

    <section class="rounded-xl bg-elevated p-4">
      <h2 class="mb-3 text-sm font-medium text-muted">
        Puntos {{ marcador.enTieBreak ? '(tie-break)' : 'del juego' }}
      </h2>
      <div class="grid grid-cols-2 gap-3 text-center">
        <div>
          <p class="text-xs text-muted">
            {{ etiquetaEquipoT1 }}
          </p>
          <p
            class="text-4xl font-bold"
            data-testid="puntos-t1"
          >
            {{ marcador.puntos.t1 }}
          </p>
        </div>
        <div>
          <p class="text-xs text-muted">
            {{ etiquetaEquipoT2 }}
          </p>
          <p
            class="text-4xl font-bold"
            data-testid="puntos-t2"
          >
            {{ marcador.puntos.t2 }}
          </p>
        </div>
      </div>
    </section>

    <section class="rounded-xl bg-elevated p-4">
      <h2 class="mb-3 text-sm font-medium text-muted">
        Juegos del set actual
      </h2>
      <p
        class="text-center text-3xl font-semibold"
        data-testid="juegos"
      >
        {{ marcador.juegos.t1 }} – {{ marcador.juegos.t2 }}
      </p>
    </section>

    <section class="rounded-xl bg-elevated p-4">
      <h2 class="mb-3 text-sm font-medium text-muted">
        Sets
      </h2>
      <p
        class="text-center text-3xl font-semibold"
        data-testid="sets"
      >
        {{ marcador.sets.t1 }} – {{ marcador.sets.t2 }}
      </p>
      <ul
        v-if="marcador.setsAnteriores.length"
        class="mt-3 space-y-1 text-center text-sm text-muted"
        data-testid="sets-anteriores"
      >
        <li
          v-for="(set, index) in marcador.setsAnteriores"
          :key="index"
        >
          Set {{ index + 1 }}: {{ set.t1 }}–{{ set.t2 }}
        </li>
      </ul>
    </section>

    <div class="grid grid-cols-2 gap-3">
      <UButton
        size="xl"
        block
        :disabled="puntosBloqueados"
        data-testid="punto-t1"
        @click="punto('T1')"
      >
        Punto {{ etiquetaEquipoT1 }}
      </UButton>
      <UButton
        size="xl"
        block
        color="neutral"
        :disabled="puntosBloqueados"
        data-testid="punto-t2"
        @click="punto('T2')"
      >
        Punto {{ etiquetaEquipoT2 }}
      </UButton>
    </div>

    <UButton
      block
      color="neutral"
      variant="soft"
      :disabled="!marcador.puedeDeshacer"
      data-testid="deshacer"
      @click="deshacer"
    >
      Deshacer último punto
    </UButton>

    <UButton
      block
      color="neutral"
      variant="outline"
      data-testid="resetear"
      @click="nuevoPartido"
    >
      Nuevo partido
    </UButton>
  </div>
</template>
