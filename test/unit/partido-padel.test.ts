import { describe, expect, it } from 'vitest'
import { NOMBRES_POR_DEFECTO, PartidoPadel } from '~/domain/PartidoPadel'
import { ganarJuego, ganarJuegos, ganarSet, llevarA } from './helpers/partido'

/**
 * Formato de puntos visibles:
 * juego: '0' | '15' | '30' | '40' | 'Deuce' | 'Ventaja Team 1' | 'Ventaja Team 2'
 * tie-break: '0' | '1' | '2' | …
 */

describe('PartidoPadel', () => {
  describe('puntuación básica', () => {
    it('inicia en 0-0 puntos, juegos y sets', () => {
      const partido = new PartidoPadel()

      expect(partido.puntos).toEqual({ t1: '0', t2: '0' })
      expect(partido.juegos).toEqual({ t1: 0, t2: 0 })
      expect(partido.sets).toEqual({ t1: 0, t2: 0 })
    })

    it('sube a 15-0 al anotar T1', () => {
      const partido = new PartidoPadel()

      partido.punto('T1')

      expect(partido.puntos).toEqual({ t1: '15', t2: '0' })
    })

    it('sigue 30-0 y 40-0 con más puntos de T1', () => {
      const partido = new PartidoPadel()

      partido.punto('T1')
      partido.punto('T1')
      expect(partido.puntos).toEqual({ t1: '30', t2: '0' })

      partido.punto('T1')
      expect(partido.puntos).toEqual({ t1: '40', t2: '0' })
    })

    it('anota puntos de T2 y empates 15-15', () => {
      const partido = new PartidoPadel()

      partido.punto('T2')
      expect(partido.puntos).toEqual({ t1: '0', t2: '15' })

      partido.punto('T1')
      expect(partido.puntos).toEqual({ t1: '15', t2: '15' })
    })
  })

  describe('deuce y ventajas', () => {
    it('muestra Deuce en 40-40', () => {
      const partido = new PartidoPadel()
      llevarA(partido, 3, 3)

      expect(partido.puntos).toEqual({ t1: 'Deuce', t2: 'Deuce' })
    })

    it('pasa de Deuce a Ventaja Team 1', () => {
      const partido = new PartidoPadel()
      llevarA(partido, 3, 3)

      partido.punto('T1')

      expect(partido.puntos).toEqual({ t1: 'Ventaja Team 1', t2: '40' })
    })

    it('vuelve a Deuce si T2 empata la ventaja de T1', () => {
      const partido = new PartidoPadel()
      llevarA(partido, 3, 3)
      partido.punto('T1')

      partido.punto('T2')

      expect(partido.puntos).toEqual({ t1: 'Deuce', t2: 'Deuce' })
    })

    it('gestiona Ventaja Team 2 y el retorno a Deuce', () => {
      const partido = new PartidoPadel()
      llevarA(partido, 3, 3)

      partido.punto('T2')
      expect(partido.puntos).toEqual({ t1: '40', t2: 'Ventaja Team 2' })

      partido.punto('T1')
      expect(partido.puntos).toEqual({ t1: 'Deuce', t2: 'Deuce' })
    })
  })

  describe('ganar un juego', () => {
    it('gana el juego desde 40 si el rival tiene 30 o menos', () => {
      const partido = new PartidoPadel()
      llevarA(partido, 3, 2)

      partido.punto('T1')

      expect(partido.puntos).toEqual({ t1: '0', t2: '0' })
      expect(partido.juegos).toEqual({ t1: 1, t2: 0 })
    })

    it('gana el juego desde Ventaja Team 1', () => {
      const partido = new PartidoPadel()
      llevarA(partido, 3, 3)
      partido.punto('T1')

      partido.punto('T1')

      expect(partido.juegos).toEqual({ t1: 1, t2: 0 })
      expect(partido.puntos).toEqual({ t1: '0', t2: '0' })
    })

    it('no gana el juego con un solo punto desde Deuce', () => {
      const partido = new PartidoPadel()
      llevarA(partido, 3, 3)

      partido.punto('T1')

      expect(partido.juegos).toEqual({ t1: 0, t2: 0 })
      expect(partido.puntos).toEqual({ t1: 'Ventaja Team 1', t2: '40' })
    })

    it('gana el juego T2 desde 40-0', () => {
      const partido = new PartidoPadel()
      llevarA(partido, 0, 3)

      partido.punto('T2')

      expect(partido.juegos).toEqual({ t1: 0, t2: 1 })
      expect(partido.puntos).toEqual({ t1: '0', t2: '0' })
    })
  })

  describe('helpers de set', () => {
    it('deja el marcador en 5-5 con ganarJuegos', () => {
      const partido = new PartidoPadel()

      ganarJuegos(partido, 5, 5)

      expect(partido.juegos).toEqual({ t1: 5, t2: 5 })
      expect(partido.sets).toEqual({ t1: 0, t2: 0 })
    })
  })

  describe('set estándar', () => {
    it('cierra el set al ganar 6 juegos seguidos', () => {
      const partido = new PartidoPadel()

      ganarSet(partido, 'T1')

      expect(partido.sets).toEqual({ t1: 1, t2: 0 })
      expect(partido.juegos).toEqual({ t1: 0, t2: 0 })
      expect(partido.puntos).toEqual({ t1: '0', t2: '0' })
    })

    it('cierra el set en 6-4', () => {
      const partido = new PartidoPadel()

      ganarJuegos(partido, 6, 4)

      expect(partido.sets).toEqual({ t1: 1, t2: 0 })
      expect(partido.juegos).toEqual({ t1: 0, t2: 0 })
      expect(partido.setsAnteriores).toEqual([{ t1: 6, t2: 4 }])
    })
  })

  describe('diferencia de 2 juegos', () => {
    it('no cierra el set en 6-5', () => {
      const partido = new PartidoPadel()
      ganarJuegos(partido, 5, 5)

      ganarJuego(partido, 'T1')

      expect(partido.juegos).toEqual({ t1: 6, t2: 5 })
      expect(partido.sets).toEqual({ t1: 0, t2: 0 })
    })

    it('cierra el set en 7-5', () => {
      const partido = new PartidoPadel()
      ganarJuegos(partido, 6, 5)

      ganarJuego(partido, 'T1')

      expect(partido.sets).toEqual({ t1: 1, t2: 0 })
      expect(partido.juegos).toEqual({ t1: 0, t2: 0 })
    })

    it('no cierra en 5-6 y sí en 5-7', () => {
      const partido = new PartidoPadel()
      ganarJuegos(partido, 5, 6)

      expect(partido.sets).toEqual({ t1: 0, t2: 0 })

      ganarJuego(partido, 'T2')

      expect(partido.sets).toEqual({ t1: 0, t2: 1 })
      expect(partido.juegos).toEqual({ t1: 0, t2: 0 })
    })
  })

  describe('tie-break', () => {
    it('activa tie-break en 6-6 y no cierra el set', () => {
      const partido = new PartidoPadel()
      ganarJuegos(partido, 6, 6)

      expect(partido.enTieBreak).toBe(true)
      expect(partido.sets).toEqual({ t1: 0, t2: 0 })
      expect(partido.juegos).toEqual({ t1: 6, t2: 6 })
    })

    it('cuenta puntos correlativos en el tie-break', () => {
      const partido = new PartidoPadel()
      ganarJuegos(partido, 6, 6)

      partido.punto('T1')
      expect(partido.puntos).toEqual({ t1: '1', t2: '0' })

      partido.punto('T1')
      expect(partido.puntos).toEqual({ t1: '2', t2: '0' })

      partido.punto('T1')
      expect(partido.puntos).toEqual({ t1: '3', t2: '0' })
    })

    it('gana el set en 7-5 del tie-break y limpia el estado', () => {
      const partido = new PartidoPadel()
      ganarJuegos(partido, 6, 6)
      llevarA(partido, 6, 5)

      partido.punto('T1')

      expect(partido.sets).toEqual({ t1: 1, t2: 0 })
      expect(partido.juegos).toEqual({ t1: 0, t2: 0 })
      expect(partido.enTieBreak).toBe(false)
      expect(partido.puntos).toEqual({ t1: '0', t2: '0' })
      expect(partido.setsAnteriores).toEqual([{ t1: 7, t2: 6 }])
    })

    it('no cierra el tie-break en 7-6 y sí en 8-6', () => {
      const partido = new PartidoPadel()
      ganarJuegos(partido, 6, 6)
      llevarA(partido, 6, 6)

      partido.punto('T1')
      expect(partido.enTieBreak).toBe(true)
      expect(partido.puntos).toEqual({ t1: '7', t2: '6' })
      expect(partido.sets).toEqual({ t1: 0, t2: 0 })

      partido.punto('T1')
      expect(partido.sets).toEqual({ t1: 1, t2: 0 })
      expect(partido.enTieBreak).toBe(false)
      expect(partido.juegos).toEqual({ t1: 0, t2: 0 })
    })
  })

  describe('partido (mejor de 3)', () => {
    it('declara ganador al primero que gana 2 sets', () => {
      const partido = new PartidoPadel()

      ganarSet(partido, 'T1')
      ganarSet(partido, 'T1')

      expect(partido.ganador).toBe('T1')
      expect(partido.sets).toEqual({ t1: 2, t2: 0 })
    })

    it('continúa con 1-1 en sets', () => {
      const partido = new PartidoPadel()

      ganarSet(partido, 'T1')
      ganarSet(partido, 'T2')

      expect(partido.ganador).toBeNull()
      expect(partido.sets).toEqual({ t1: 1, t2: 1 })
    })

    it('bloquea el marcador cuando el partido ya tiene ganador', () => {
      const partido = new PartidoPadel()
      ganarSet(partido, 'T1')
      ganarSet(partido, 'T1')

      partido.punto('T2')

      expect(partido.ganador).toBe('T1')
      expect(partido.puntos).toEqual({ t1: '0', t2: '0' })
      expect(partido.juegos).toEqual({ t1: 0, t2: 0 })
      expect(partido.sets).toEqual({ t1: 2, t2: 0 })
    })

    it('resetea el partido a 0-0 y vuelve a aceptar puntos', () => {
      const partido = new PartidoPadel()
      ganarSet(partido, 'T1')
      ganarSet(partido, 'T1')

      partido.resetear()

      expect(partido.getMarcador()).toEqual({
        puntos: { t1: '0', t2: '0' },
        juegos: { t1: 0, t2: 0 },
        sets: { t1: 0, t2: 0 },
        enTieBreak: false,
        ganador: null,
        setsAnteriores: [],
        modo: 'ventaja',
        duracionMinutos: 90,
        enCurso: false,
        iniciado: false,
        nombres: NOMBRES_POR_DEFECTO,
        sacador: 'T1A',
        historialSaques: [],
        ordenSaque: null,
        puedeDeshacer: false,
        avisoCambioDeLado: false
      })

      partido.punto('T2')
      expect(partido.puntos).toEqual({ t1: '0', t2: '15' })
    })
  })

  describe('bola de oro vs ventaja tradicional', () => {
    it('permite elegir el modo solo antes de empezar', () => {
      const partido = new PartidoPadel()

      partido.establecerModo('bolaDeOro')
      expect(partido.modo).toBe('bolaDeOro')
      expect(partido.enCurso).toBe(false)

      partido.punto('T1')
      partido.establecerModo('ventaja')

      expect(partido.enCurso).toBe(true)
      expect(partido.modo).toBe('bolaDeOro')

      partido.resetear()
      partido.establecerModo('ventaja')

      expect(partido.enCurso).toBe(false)
      expect(partido.modo).toBe('ventaja')
    })

    it('usa ventaja tradicional por defecto: un punto desde Deuce no gana el juego', () => {
      const partido = new PartidoPadel()
      llevarA(partido, 3, 3)

      partido.punto('T1')

      expect(partido.modo).toBe('ventaja')
      expect(partido.juegos).toEqual({ t1: 0, t2: 0 })
      expect(partido.puntos).toEqual({ t1: 'Ventaja Team 1', t2: '40' })
    })

    it('con bola de oro, un punto desde 40-40 gana el juego para T1', () => {
      const partido = new PartidoPadel({ modo: 'bolaDeOro' })
      llevarA(partido, 3, 3)

      expect(partido.puntos).toEqual({ t1: '40', t2: '40' })

      partido.punto('T1')

      expect(partido.juegos).toEqual({ t1: 1, t2: 0 })
      expect(partido.puntos).toEqual({ t1: '0', t2: '0' })
    })

    it('con bola de oro, un punto desde Deuce gana el juego para T2', () => {
      const partido = new PartidoPadel({ modo: 'bolaDeOro' })
      llevarA(partido, 3, 3)

      partido.punto('T2')

      expect(partido.juegos).toEqual({ t1: 0, t2: 1 })
      expect(partido.puntos).toEqual({ t1: '0', t2: '0' })
    })

    it('con bola de oro, gana el juego desde 40 si el rival tiene 30', () => {
      const partido = new PartidoPadel({ modo: 'bolaDeOro' })
      llevarA(partido, 3, 2)

      partido.punto('T1')

      expect(partido.juegos).toEqual({ t1: 1, t2: 0 })
      expect(partido.puntos).toEqual({ t1: '0', t2: '0' })
    })

    it('resetear con bola de oro deja 0-0 y aplica ese modo en el siguiente Deuce', () => {
      const partido = new PartidoPadel()
      llevarA(partido, 1, 0)

      partido.resetear({ modo: 'bolaDeOro' })

      expect(partido.getMarcador()).toEqual({
        puntos: { t1: '0', t2: '0' },
        juegos: { t1: 0, t2: 0 },
        sets: { t1: 0, t2: 0 },
        enTieBreak: false,
        ganador: null,
        setsAnteriores: [],
        modo: 'bolaDeOro',
        duracionMinutos: 90,
        enCurso: false,
        iniciado: false,
        nombres: NOMBRES_POR_DEFECTO,
        sacador: 'T1A',
        historialSaques: [],
        ordenSaque: null,
        puedeDeshacer: false,
        avisoCambioDeLado: false
      })

      llevarA(partido, 3, 3)
      partido.punto('T1')

      expect(partido.juegos).toEqual({ t1: 1, t2: 0 })
      expect(partido.puntos).toEqual({ t1: '0', t2: '0' })
    })

    it('resetear sin argumentos conserva el modo', () => {
      const partido = new PartidoPadel({ modo: 'bolaDeOro' })

      partido.resetear()

      expect(partido.modo).toBe('bolaDeOro')
    })
  })

  describe('duración del partido', () => {
    it('al iniciar el partido bloquea el modo y la duración', () => {
      const partido = new PartidoPadel()

      partido.iniciar()
      partido.establecerModo('bolaDeOro')
      partido.establecerDuracion(60)

      expect(partido.iniciado).toBe(true)
      expect(partido.enCurso).toBe(true)
      expect(partido.modo).toBe('ventaja')
      expect(partido.duracionMinutos).toBe(90)
    })

    it('usa 90 minutos por defecto', () => {
      const partido = new PartidoPadel()

      expect(partido.duracionMinutos).toBe(90)
    })

    it('acepta 60 minutos', () => {
      const partido = new PartidoPadel({ duracionMinutos: 60 })

      expect(partido.duracionMinutos).toBe(60)
    })

    it('trata cualquier valor distinto de 60 como 90', () => {
      expect(new PartidoPadel({ duracionMinutos: 45 }).duracionMinutos).toBe(90)
      expect(new PartidoPadel({ duracionMinutos: 75 }).duracionMinutos).toBe(90)
      expect(new PartidoPadel({ duracionMinutos: 120 }).duracionMinutos).toBe(90)
    })

    it('permite cambiar la duración solo antes de empezar', () => {
      const partido = new PartidoPadel()

      partido.establecerDuracion(60)
      expect(partido.duracionMinutos).toBe(60)

      partido.punto('T1')
      partido.establecerDuracion(90)

      expect(partido.duracionMinutos).toBe(60)

      partido.resetear()
      partido.establecerDuracion(90)

      expect(partido.duracionMinutos).toBe(90)
    })

    it('resetear conserva la duración si no se indica otra', () => {
      const partido = new PartidoPadel({ duracionMinutos: 60 })

      partido.resetear()

      expect(partido.duracionMinutos).toBe(60)
    })
  })

  describe('jugadores y saque', () => {
    it('permite nombrar a los cuatro jugadores', () => {
      const partido = new PartidoPadel()

      partido.establecerNombre('T1A', 'Ana')
      partido.establecerNombre('T1B', 'Luis')
      partido.establecerNombre('T2A', 'Marta')
      partido.establecerNombre('T2B', 'Paco')

      expect(partido.nombres).toEqual({
        T1A: 'Ana',
        T1B: 'Luis',
        T2A: 'Marta',
        T2B: 'Paco'
      })
    })

    it('asigna el sacador y lo rota al ganar un juego', () => {
      const partido = new PartidoPadel()
      partido.establecerNombre('T1A', 'Ana')
      partido.establecerSacador('T1A')

      ganarJuego(partido, 'T1')

      expect(partido.historialSaques).toEqual([
        { orden: 1, jugador: 'T1A', nombre: 'Ana' }
      ])
      expect(partido.sacador).toBe('T2A')
    })

    it('permite cambiar el sacador a mano durante el partido', () => {
      const partido = new PartidoPadel()
      partido.establecerSacador('T2B')

      expect(partido.sacador).toBe('T2B')

      ganarJuego(partido, 'T2')

      expect(partido.historialSaques[0]?.jugador).toBe('T2B')
      expect(partido.sacador).toBe('T1A')
    })

    it('tras los 4 primeros saques guarda ese orden y lo repite', () => {
      const partido = new PartidoPadel()
      partido.establecerNombre('T1A', 'Ana')
      partido.establecerNombre('T2A', 'Marta')
      partido.establecerNombre('T1B', 'Luis')
      partido.establecerNombre('T2B', 'Paco')

      partido.establecerSacador('T1A')
      ganarJuego(partido, 'T1')
      partido.establecerSacador('T2B')
      ganarJuego(partido, 'T2')
      partido.establecerSacador('T1B')
      ganarJuego(partido, 'T1')
      partido.establecerSacador('T2A')
      ganarJuego(partido, 'T2')

      expect(partido.ordenSaque).toEqual(['T1A', 'T2B', 'T1B', 'T2A'])
      expect(partido.sacador).toBe('T1A')

      partido.establecerSacador('T2A')
      expect(partido.sacador).toBe('T1A')

      ganarJuego(partido, 'T1')
      expect(partido.sacador).toBe('T2B')
    })

    it('resetear limpia el historial de saques y conserva los nombres', () => {
      const partido = new PartidoPadel()
      partido.establecerNombre('T1A', 'Ana')
      ganarJuego(partido, 'T1')

      partido.resetear()

      expect(partido.nombres.T1A).toBe('Ana')
      expect(partido.historialSaques).toEqual([])
      expect(partido.ordenSaque).toBeNull()
    })
  })

  describe('deshacer', () => {
    it('no hace nada si no hay puntos que deshacer', () => {
      const partido = new PartidoPadel()

      partido.deshacer()

      expect(partido.puntos).toEqual({ t1: '0', t2: '0' })
      expect(partido.puedeDeshacer).toBe(false)
    })

    it('deshace el último punto', () => {
      const partido = new PartidoPadel()
      partido.punto('T1')
      partido.punto('T2')

      partido.deshacer()

      expect(partido.puntos).toEqual({ t1: '15', t2: '0' })
      expect(partido.puedeDeshacer).toBe(true)

      partido.deshacer()

      expect(partido.puntos).toEqual({ t1: '0', t2: '0' })
      expect(partido.puedeDeshacer).toBe(false)
    })

    it('deshace un punto que ganó el juego y restaura saque e historial', () => {
      const partido = new PartidoPadel()
      partido.establecerNombre('T1A', 'Ana')
      ganarJuego(partido, 'T1')

      expect(partido.juegos).toEqual({ t1: 1, t2: 0 })
      expect(partido.historialSaques).toHaveLength(1)
      expect(partido.sacador).toBe('T2A')

      partido.deshacer()

      expect(partido.puntos).toEqual({ t1: '40', t2: '0' })
      expect(partido.juegos).toEqual({ t1: 0, t2: 0 })
      expect(partido.historialSaques).toEqual([])
      expect(partido.sacador).toBe('T1A')
    })

    it('deshace un punto que cerró el partido y vuelve a aceptar puntos', () => {
      const partido = new PartidoPadel()
      ganarSet(partido, 'T1')
      ganarSet(partido, 'T1')

      expect(partido.ganador).toBe('T1')

      partido.deshacer()

      expect(partido.ganador).toBeNull()
      expect(partido.sets).toEqual({ t1: 1, t2: 0 })
      expect(partido.juegos).toEqual({ t1: 5, t2: 0 })
      expect(partido.puntos).toEqual({ t1: '40', t2: '0' })

      partido.punto('T2')
      expect(partido.puntos).toEqual({ t1: '40', t2: '15' })
    })
  })

  describe('cambio de lado', () => {
    it('avisa tras un juego impar y no tras uno par', () => {
      const partido = new PartidoPadel()

      ganarJuego(partido, 'T1')
      expect(partido.avisoCambioDeLado).toBe(true)

      ganarJuego(partido, 'T2')
      expect(partido.avisoCambioDeLado).toBe(false)

      ganarJuego(partido, 'T1')
      expect(partido.avisoCambioDeLado).toBe(true)
    })

    it('oculta el aviso al anotar el siguiente punto', () => {
      const partido = new PartidoPadel()
      ganarJuego(partido, 'T1')

      partido.punto('T1')

      expect(partido.avisoCambioDeLado).toBe(false)
    })

    it('avisa cada 6 puntos en el tie-break', () => {
      const partido = new PartidoPadel()
      ganarJuegos(partido, 6, 6)
      llevarA(partido, 5, 0)

      partido.punto('T1')
      expect(partido.avisoCambioDeLado).toBe(true)

      partido.punto('T2')
      expect(partido.avisoCambioDeLado).toBe(false)
    })
  })
})
