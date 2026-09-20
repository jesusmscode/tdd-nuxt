export type Team = 'T1' | 'T2'

export const JUGADORES = ['T1A', 'T1B', 'T2A', 'T2B'] as const

export type JugadorId = typeof JUGADORES[number]

export const ORDEN_SAQUE: JugadorId[] = ['T1A', 'T2A', 'T1B', 'T2B']

export const NOMBRES_POR_DEFECTO: Record<JugadorId, string> = {
  T1A: 'Jugador 1',
  T1B: 'Jugador 2',
  T2A: 'Jugador 3',
  T2B: 'Jugador 4'
}

export type RegistroSaque = {
  orden: number
  jugador: JugadorId
  nombre: string
}

export type ModoPuntuacion = 'ventaja' | 'bolaDeOro'

export type DuracionMinutos = 60 | 90

export type OpcionesPartido = {
  modo?: ModoPuntuacion
  duracionMinutos?: DuracionMinutos | number
}

export const DURACION_MINUTOS_POR_DEFECTO: DuracionMinutos = 90

export type PuntoVisible
  = | '0'
    | '15'
    | '30'
    | '40'
    | 'Deuce'
    | 'Ventaja Team 1'
    | 'Ventaja Team 2'
    | `${number}`

export type MarcadorPadel = {
  puntos: { t1: PuntoVisible, t2: PuntoVisible }
  juegos: { t1: number, t2: number }
  sets: { t1: number, t2: number }
  enTieBreak: boolean
  ganador: Team | null
  setsAnteriores: { t1: number, t2: number }[]
  modo: ModoPuntuacion
  duracionMinutos: DuracionMinutos
  enCurso: boolean
  iniciado: boolean
  nombres: Record<JugadorId, string>
  sacador: JugadorId
  historialSaques: RegistroSaque[]
  ordenSaque: JugadorId[] | null
  puedeDeshacer: boolean
  avisoCambioDeLado: boolean
}

const PUNTOS_JUEGO = ['0', '15', '30', '40'] as const

type EstadoPartido = {
  puntos: { t1: number, t2: number }
  juegos: { t1: number, t2: number }
  sets: { t1: number, t2: number }
  enTieBreak: boolean
  ganador: Team | null
  setsAnteriores: { t1: number, t2: number }[]
  iniciado: boolean
  sacador: JugadorId
  historialSaques: RegistroSaque[]
  avisoCambioDeLado: boolean
}

export class PartidoPadel {
  #puntos = { t1: 0, t2: 0 }
  #juegos = { t1: 0, t2: 0 }
  #sets = { t1: 0, t2: 0 }
  #enTieBreak = false
  #ganador: Team | null = null
  #setsAnteriores: { t1: number, t2: number }[] = []
  #modo: ModoPuntuacion
  #duracionMinutos: DuracionMinutos
  #iniciado = false
  #nombres: Record<JugadorId, string> = { ...NOMBRES_POR_DEFECTO }
  #sacador: JugadorId = 'T1A'
  #historialSaques: RegistroSaque[] = []
  #historialDeshacer: EstadoPartido[] = []
  #avisoCambioDeLado = false

  constructor(opciones: OpcionesPartido = {}) {
    this.#modo = opciones.modo ?? 'ventaja'
    this.#duracionMinutos = normalizarDuracion(opciones.duracionMinutos)
  }

  resetear(opciones: OpcionesPartido = {}) {
    this.#modo = opciones.modo ?? this.#modo
    this.#duracionMinutos = opciones.duracionMinutos === undefined
      ? this.#duracionMinutos
      : normalizarDuracion(opciones.duracionMinutos)
    this.#puntos = { t1: 0, t2: 0 }
    this.#juegos = { t1: 0, t2: 0 }
    this.#sets = { t1: 0, t2: 0 }
    this.#enTieBreak = false
    this.#ganador = null
    this.#setsAnteriores = []
    this.#iniciado = false
    this.#historialSaques = []
    this.#historialDeshacer = []
    this.#avisoCambioDeLado = false
  }

  iniciar() {
    this.#iniciado = true
  }

  deshacer() {
    const previo = this.#historialDeshacer.pop()
    if (!previo) {
      return
    }

    this.#restaurar(previo)
  }

  punto(team: Team) {
    if (this.#ganador) {
      return
    }

    this.#historialDeshacer.push(this.#capturarEstado())
    this.#avisoCambioDeLado = false
    this.#puntos[clave(team)]++

    if (this.#enTieBreak) {
      this.#resolverTieBreak()
      if (this.#enTieBreak) {
        this.#avisarCambioEnTieBreak()
      }
      return
    }

    this.#resolverJuego()
  }

  get puntos(): MarcadorPadel['puntos'] {
    if (this.#enTieBreak) {
      return {
        t1: String(this.#puntos.t1) as PuntoVisible,
        t2: String(this.#puntos.t2) as PuntoVisible
      }
    }

    const { t1, t2 } = this.#puntos

    if (t1 >= 3 && t2 >= 3) {
      if (t1 === t2) {
        return this.#modo === 'bolaDeOro'
          ? { t1: '40', t2: '40' }
          : { t1: 'Deuce', t2: 'Deuce' }
      }

      if (t1 > t2) {
        return { t1: 'Ventaja Team 1', t2: '40' }
      }

      return { t1: '40', t2: 'Ventaja Team 2' }
    }

    return {
      t1: PUNTOS_JUEGO[Math.min(t1, 3)],
      t2: PUNTOS_JUEGO[Math.min(t2, 3)]
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

  get modo() {
    return this.#modo
  }

  get duracionMinutos() {
    return this.#duracionMinutos
  }

  get enCurso() {
    return this.#iniciado
      || this.#puntos.t1 > 0
      || this.#puntos.t2 > 0
      || this.#juegos.t1 > 0
      || this.#juegos.t2 > 0
      || this.#sets.t1 > 0
      || this.#sets.t2 > 0
      || this.#enTieBreak
      || this.#ganador !== null
      || this.#setsAnteriores.length > 0
  }

  get iniciado() {
    return this.#iniciado
  }

  establecerModo(modo: ModoPuntuacion) {
    if (this.enCurso) {
      return
    }

    this.#modo = modo
  }

  establecerDuracion(minutos: number) {
    if (this.enCurso) {
      return
    }

    this.#duracionMinutos = normalizarDuracion(minutos)
  }

  establecerNombre(jugador: JugadorId, nombre: string) {
    const limpio = nombre.trim()
    this.#nombres[jugador] = limpio || NOMBRES_POR_DEFECTO[jugador]
  }

  establecerSacador(jugador: JugadorId) {
    if (this.ordenSaque) {
      return
    }

    this.#sacador = jugador
  }

  get nombres() {
    return { ...this.#nombres }
  }

  get sacador() {
    return this.#sacador
  }

  get historialSaques() {
    return this.#historialSaques.map(registro => ({ ...registro }))
  }

  get ordenSaque(): JugadorId[] | null {
    if (this.#historialSaques.length < 4) {
      return null
    }

    return this.#historialSaques.slice(0, 4).map(registro => registro.jugador)
  }

  get puedeDeshacer() {
    return this.#historialDeshacer.length > 0
  }

  get avisoCambioDeLado() {
    return this.#avisoCambioDeLado
  }

  getMarcador(): MarcadorPadel {
    return {
      puntos: this.puntos,
      juegos: this.juegos,
      sets: this.sets,
      enTieBreak: this.enTieBreak,
      ganador: this.ganador,
      setsAnteriores: this.setsAnteriores,
      modo: this.modo,
      duracionMinutos: this.duracionMinutos,
      enCurso: this.enCurso,
      iniciado: this.iniciado,
      nombres: this.nombres,
      sacador: this.sacador,
      historialSaques: this.historialSaques,
      ordenSaque: this.ordenSaque,
      puedeDeshacer: this.puedeDeshacer,
      avisoCambioDeLado: this.avisoCambioDeLado
    }
  }

  #resolverJuego() {
    const { t1, t2 } = this.#puntos
    const diferenciaMinima = this.#enBolaDeOro() && t1 >= 3 && t2 >= 3 ? 1 : 2

    if (t1 >= 4 && t1 - t2 >= diferenciaMinima) {
      this.#ganarJuego('T1')
    } else if (t2 >= 4 && t2 - t1 >= diferenciaMinima) {
      this.#ganarJuego('T2')
    }
  }

  #enBolaDeOro() {
    return this.#modo === 'bolaDeOro'
  }

  #ganarJuego(team: Team) {
    this.#anotarSaqueYRotar()
    this.#puntos = { t1: 0, t2: 0 }
    this.#juegos[clave(team)]++
    this.#avisoCambioDeLado = this.#totalJuegosImpar()
    this.#resolverSet()
  }

  #resolverSet() {
    const { t1, t2 } = this.#juegos

    if (t1 === 6 && t2 === 6) {
      this.#enTieBreak = true
      return
    }

    if (t1 >= 6 && t1 - t2 >= 2) {
      this.#ganarSet('T1')
    } else if (t2 >= 6 && t2 - t1 >= 2) {
      this.#ganarSet('T2')
    }
  }

  #resolverTieBreak() {
    const { t1, t2 } = this.#puntos

    if (t1 >= 7 && t1 - t2 >= 2) {
      this.#anotarSaqueYRotar()
      this.#juegos.t1++
      this.#avisoCambioDeLado = this.#totalJuegosImpar()
      this.#ganarSet('T1')
    } else if (t2 >= 7 && t2 - t1 >= 2) {
      this.#anotarSaqueYRotar()
      this.#juegos.t2++
      this.#avisoCambioDeLado = this.#totalJuegosImpar()
      this.#ganarSet('T2')
    }
  }

  #ganarSet(team: Team) {
    this.#setsAnteriores.push({ ...this.#juegos })
    this.#sets[clave(team)]++
    this.#juegos = { t1: 0, t2: 0 }
    this.#puntos = { t1: 0, t2: 0 }
    this.#enTieBreak = false

    if (this.#sets.t1 >= 2) {
      this.#ganador = 'T1'
    } else if (this.#sets.t2 >= 2) {
      this.#ganador = 'T2'
    }
  }

  #anotarSaqueYRotar() {
    this.#historialSaques.push({
      orden: this.#historialSaques.length + 1,
      jugador: this.#sacador,
      nombre: this.#nombres[this.#sacador]
    })

    const orden = this.ordenSaque ?? ORDEN_SAQUE
    const indice = this.ordenSaque
      ? this.#historialSaques.length % 4
      : (orden.indexOf(this.#sacador) + 1) % orden.length

    this.#sacador = orden[indice]
  }

  #capturarEstado(): EstadoPartido {
    return {
      puntos: { ...this.#puntos },
      juegos: { ...this.#juegos },
      sets: { ...this.#sets },
      enTieBreak: this.#enTieBreak,
      ganador: this.#ganador,
      setsAnteriores: this.#setsAnteriores.map(set => ({ ...set })),
      iniciado: this.#iniciado,
      sacador: this.#sacador,
      historialSaques: this.#historialSaques.map(registro => ({ ...registro })),
      avisoCambioDeLado: this.#avisoCambioDeLado
    }
  }

  #restaurar(estado: EstadoPartido) {
    this.#puntos = { ...estado.puntos }
    this.#juegos = { ...estado.juegos }
    this.#sets = { ...estado.sets }
    this.#enTieBreak = estado.enTieBreak
    this.#ganador = estado.ganador
    this.#setsAnteriores = estado.setsAnteriores.map(set => ({ ...set }))
    this.#iniciado = estado.iniciado
    this.#sacador = estado.sacador
    this.#historialSaques = estado.historialSaques.map(registro => ({ ...registro }))
    this.#avisoCambioDeLado = estado.avisoCambioDeLado
  }

  #totalJuegosImpar() {
    return (this.#juegos.t1 + this.#juegos.t2) % 2 === 1
  }

  #avisarCambioEnTieBreak() {
    const total = this.#puntos.t1 + this.#puntos.t2
    this.#avisoCambioDeLado = total > 0 && total % 6 === 0
  }
}

function clave(team: Team): 't1' | 't2' {
  return team === 'T1' ? 't1' : 't2'
}

function normalizarDuracion(minutos?: number): DuracionMinutos {
  return minutos === 60 ? 60 : DURACION_MINUTOS_POR_DEFECTO
}
