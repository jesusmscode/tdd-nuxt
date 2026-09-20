import type { Jugador, MarcadorPadel } from '~/domain/PartidoPadel'
import { PartidoPadel } from '~/domain/PartidoPadel'

export function useMarcador() {
  const partido = new PartidoPadel()
  const marcador = ref<MarcadorPadel>(partido.getMarcador())

  function punto(jugador: Jugador) {
    partido.punto(jugador)
    marcador.value = partido.getMarcador()
  }

  function resetear() {
    partido.resetear()
    marcador.value = partido.getMarcador()
  }

  return { marcador, punto, resetear }
}
