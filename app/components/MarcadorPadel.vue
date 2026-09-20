<script setup lang="ts">
const { marcador, punto, resetear } = useMarcador()

const partidoTerminado = computed(() => marcador.value.ganador !== null)
</script>

<template>
  <div class="mx-auto flex max-w-lg flex-col gap-4 p-4">
    <header class="text-center">
      <h1 class="text-2xl font-bold">
        Marcador de pádel
      </h1>
      <p class="text-sm text-muted">
        Mejor de 3 sets · ventaja tradicional
      </p>
    </header>

    <UAlert
      v-if="marcador.ganador"
      color="success"
      variant="subtle"
      :title="`Ganador: ${marcador.ganador}`"
      data-testid="ganador"
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
            J1
          </p>
          <p
            class="text-4xl font-bold"
            data-testid="puntos-j1"
          >
            {{ marcador.puntos.j1 }}
          </p>
        </div>
        <div>
          <p class="text-xs text-muted">
            J2
          </p>
          <p
            class="text-4xl font-bold"
            data-testid="puntos-j2"
          >
            {{ marcador.puntos.j2 }}
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
        {{ marcador.juegos.j1 }} – {{ marcador.juegos.j2 }}
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
        {{ marcador.sets.j1 }} – {{ marcador.sets.j2 }}
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
          Set {{ index + 1 }}: {{ set.j1 }}–{{ set.j2 }}
        </li>
      </ul>
    </section>

    <div class="grid grid-cols-2 gap-3">
      <UButton
        size="xl"
        block
        :disabled="partidoTerminado"
        data-testid="punto-j1"
        @click="punto('J1')"
      >
        Punto J1
      </UButton>
      <UButton
        size="xl"
        block
        color="neutral"
        :disabled="partidoTerminado"
        data-testid="punto-j2"
        @click="punto('J2')"
      >
        Punto J2
      </UButton>
    </div>

    <UButton
      block
      color="neutral"
      variant="outline"
      data-testid="resetear"
      @click="resetear"
    >
      Nuevo partido
    </UButton>
  </div>
</template>
