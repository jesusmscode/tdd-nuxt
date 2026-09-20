import type { JugadorId, MarcadorPadel, ModoPuntuacion, OpcionesPartido, Team } from '~/domain/PartidoPadel'
import { CronometroPartido } from '~/domain/CronometroPartido'
import { PartidoPadel } from '~/domain/PartidoPadel'

export function useMarcador() {
  const partido = new PartidoPadel()
  const cronometro = new CronometroPartido(partido.duracionMinutos)
  const marcador = ref<MarcadorPadel>(partido.getMarcador())
  const tiempoVisible = ref(cronometro.tiempoVisible)
  const cronometroEnMarcha = ref(cronometro.enMarcha)
  const tiempoAgotado = ref(cronometro.agotado)
  let intervalo: ReturnType<typeof setInterval> | undefined

  function refrescar() {
    marcador.value = partido.getMarcador()
    tiempoVisible.value = cronometro.tiempoVisible
    cronometroEnMarcha.value = cronometro.enMarcha
    tiempoAgotado.value = cronometro.agotado
  }

  function detenerIntervalo() {
    if (intervalo) {
      clearInterval(intervalo)
      intervalo = undefined
    }
  }

  function punto(team: Team) {
    partido.punto(team)
    refrescar()
  }

  function deshacer() {
    partido.deshacer()
    refrescar()
  }

  function resetear(opciones: OpcionesPartido = {}) {
    detenerIntervalo()
    partido.resetear(opciones)
    cronometro.resetear(partido.duracionMinutos)
    refrescar()
  }

  function establecerModo(modo: ModoPuntuacion) {
    partido.establecerModo(modo)
    refrescar()
  }

  function establecerDuracion(minutos: number) {
    partido.establecerDuracion(minutos)
    cronometro.establecerDuracion(partido.duracionMinutos)
    refrescar()
  }

  function establecerNombre(jugador: JugadorId, nombre: string) {
    partido.establecerNombre(jugador, nombre)
    refrescar()
  }

  function establecerSacador(jugador: JugadorId) {
    partido.establecerSacador(jugador)
    refrescar()
  }

  function empezarPartido() {
    partido.iniciar()
    cronometro.empezar()
    refrescar()
    detenerIntervalo()

    intervalo = setInterval(() => {
      cronometro.tick()
      refrescar()

      if (!cronometro.enMarcha) {
        detenerIntervalo()
      }
    }, 1000)
  }

  onUnmounted(() => {
    detenerIntervalo()
  })

  return {
    marcador,
    tiempoVisible,
    cronometroEnMarcha,
    tiempoAgotado,
    punto,
    deshacer,
    resetear,
    establecerModo,
    establecerDuracion,
    establecerNombre,
    establecerSacador,
    empezarPartido
  }
}
