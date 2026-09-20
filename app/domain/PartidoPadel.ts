export type Jugador = 'J1' | 'J2'

export type PuntoVisible
  = | '0'
    | '15'
    | '30'
    | '40'
    | 'Deuce'
    | 'Ventaja J1'
    | 'Ventaja J2'
    | `${number}`

export type MarcadorPadel = {
  puntos: { j1: PuntoVisible, j2: PuntoVisible }
  juegos: { j1: number, j2: number }
  sets: { j1: number, j2: number }
  enTieBreak: boolean
  ganador: Jugador | null
  setsAnteriores: { j1: number, j2: number }[]
}

const PUNTOS_JUEGO = ['0', '15', '30', '40'] as const

export class PartidoPadel {
  #puntos = { j1: 0, j2: 0 }
  #juegos = { j1: 0, j2: 0 }
  #sets = { j1: 0, j2: 0 }
  #enTieBreak = false
  #ganador: Jugador | null = null
  #setsAnteriores: { j1: number, j2: number }[] = []

  resetear() {
    this.#puntos = { j1: 0, j2: 0 }
    this.#juegos = { j1: 0, j2: 0 }
    this.#sets = { j1: 0, j2: 0 }
    this.#enTieBreak = false
    this.#ganador = null
    this.#setsAnteriores = []
  }

  punto(jugador: Jugador) {
    if (this.#ganador) {
      return
    }

    this.#puntos[clave(jugador)]++

    if (this.#enTieBreak) {
      this.#resolverTieBreak()
      return
    }

    this.#resolverJuego()
  }

  get puntos(): MarcadorPadel['puntos'] {
    if (this.#enTieBreak) {
      return {
        j1: String(this.#puntos.j1) as PuntoVisible,
        j2: String(this.#puntos.j2) as PuntoVisible
      }
    }

    const { j1, j2 } = this.#puntos

    if (j1 >= 3 && j2 >= 3) {
      if (j1 === j2) {
        return { j1: 'Deuce', j2: 'Deuce' }
      }

      if (j1 > j2) {
        return { j1: 'Ventaja J1', j2: '40' }
      }

      return { j1: '40', j2: 'Ventaja J2' }
    }

    return {
      j1: PUNTOS_JUEGO[Math.min(j1, 3)],
      j2: PUNTOS_JUEGO[Math.min(j2, 3)]
    }
  }

  get juegos() {
    return { ...this.#juegos }
  }

  get sets() {
    return { ...this.#sets }
  }

  get enTieBreak() {
    return this.#enTieBreak
  }

  get ganador() {
    return this.#ganador
  }

  get setsAnteriores() {
    return this.#setsAnteriores.map(set => ({ ...set }))
  }

  getMarcador(): MarcadorPadel {
    return {
      puntos: this.puntos,
      juegos: this.juegos,
      sets: this.sets,
      enTieBreak: this.enTieBreak,
      ganador: this.ganador,
      setsAnteriores: this.setsAnteriores
    }
  }

  #resolverJuego() {
    const { j1, j2 } = this.#puntos

    if (j1 >= 4 && j1 - j2 >= 2) {
      this.#ganarJuego('J1')
    } else if (j2 >= 4 && j2 - j1 >= 2) {
      this.#ganarJuego('J2')
    }
  }

  #ganarJuego(jugador: Jugador) {
    this.#puntos = { j1: 0, j2: 0 }
    this.#juegos[clave(jugador)]++
    this.#resolverSet()
  }

  #resolverSet() {
    const { j1, j2 } = this.#juegos

    if (j1 === 6 && j2 === 6) {
      this.#enTieBreak = true
      return
    }

    if (j1 >= 6 && j1 - j2 >= 2) {
      this.#ganarSet('J1')
    } else if (j2 >= 6 && j2 - j1 >= 2) {
      this.#ganarSet('J2')
    }
  }

  #resolverTieBreak() {
    const { j1, j2 } = this.#puntos

    if (j1 >= 7 && j1 - j2 >= 2) {
      this.#juegos.j1++
      this.#ganarSet('J1')
    } else if (j2 >= 7 && j2 - j1 >= 2) {
      this.#juegos.j2++
      this.#ganarSet('J2')
    }
  }

  #ganarSet(jugador: Jugador) {
    this.#setsAnteriores.push({ ...this.#juegos })
    this.#sets[clave(jugador)]++
    this.#juegos = { j1: 0, j2: 0 }
    this.#puntos = { j1: 0, j2: 0 }
    this.#enTieBreak = false

    if (this.#sets.j1 >= 2) {
      this.#ganador = 'J1'
    } else if (this.#sets.j2 >= 2) {
      this.#ganador = 'J2'
    }
  }
}

function clave(jugador: Jugador): 'j1' | 'j2' {
  return jugador === 'J1' ? 'j1' : 'j2'
}
