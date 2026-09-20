import type { PartidoPadel, Team } from '~/domain/PartidoPadel'

export function llevarA(partido: PartidoPadel, puntosT1: number, puntosT2: number) {
  for (let i = 0; i < puntosT1; i++) {
    partido.punto('T1')
  }

  for (let i = 0; i < puntosT2; i++) {
    partido.punto('T2')
  }
}

export function ganarJuego(partido: PartidoPadel, team: Team) {
  for (let i = 0; i < 4; i++) {
    partido.punto(team)
  }
}

export function ganarJuegos(partido: PartidoPadel, juegosT1: number, juegosT2: number) {
  const setsAntes = partido.sets

  while (
    (partido.juegos.t1 < juegosT1 || partido.juegos.t2 < juegosT2)
    && partido.sets.t1 === setsAntes.t1
    && partido.sets.t2 === setsAntes.t2
  ) {
    if (partido.juegos.t1 < juegosT1) {
      ganarJuego(partido, 'T1')
    }

    if (partido.juegos.t2 < juegosT2 && partido.sets.t1 === setsAntes.t1 && partido.sets.t2 === setsAntes.t2) {
      ganarJuego(partido, 'T2')
    }
  }
}

export function ganarSet(partido: PartidoPadel, team: Team) {
  for (let i = 0; i < 6; i++) {
    ganarJuego(partido, team)
  }
}
