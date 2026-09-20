import type { Jugador, PartidoPadel } from '~/domain/PartidoPadel'

export function llevarA(partido: PartidoPadel, puntosJ1: number, puntosJ2: number) {
  for (let i = 0; i < puntosJ1; i++) {
    partido.punto('J1')
  }

  for (let i = 0; i < puntosJ2; i++) {
    partido.punto('J2')
  }
}

export function ganarJuego(partido: PartidoPadel, jugador: Jugador) {
  for (let i = 0; i < 4; i++) {
    partido.punto(jugador)
  }
}

export function ganarJuegos(partido: PartidoPadel, juegosJ1: number, juegosJ2: number) {
  const setsAntes = partido.sets

  while (
    (partido.juegos.j1 < juegosJ1 || partido.juegos.j2 < juegosJ2)
    && partido.sets.j1 === setsAntes.j1
    && partido.sets.j2 === setsAntes.j2
  ) {
    if (partido.juegos.j1 < juegosJ1) {
      ganarJuego(partido, 'J1')
    }

    if (partido.juegos.j2 < juegosJ2 && partido.sets.j1 === setsAntes.j1 && partido.sets.j2 === setsAntes.j2) {
      ganarJuego(partido, 'J2')
    }
  }
}

export function ganarSet(partido: PartidoPadel, jugador: Jugador) {
  for (let i = 0; i < 6; i++) {
    ganarJuego(partido, jugador)
  }
}
