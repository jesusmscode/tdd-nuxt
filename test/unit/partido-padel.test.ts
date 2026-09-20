import { describe, expect, it } from 'vitest'
import { PartidoPadel } from '~/domain/PartidoPadel'
import { ganarJuego, ganarJuegos, ganarSet, llevarA } from './helpers/partido'

/**
 * Formato de puntos visibles:
 * juego: '0' | '15' | '30' | '40' | 'Deuce' | 'Ventaja J1' | 'Ventaja J2'
 * tie-break: '0' | '1' | '2' | …
 */

describe('PartidoPadel', () => {
  describe('puntuación básica', () => {
    it('inicia en 0-0 puntos, juegos y sets', () => {
      const partido = new PartidoPadel()

      expect(partido.puntos).toEqual({ j1: '0', j2: '0' })
      expect(partido.juegos).toEqual({ j1: 0, j2: 0 })
      expect(partido.sets).toEqual({ j1: 0, j2: 0 })
    })

    it('sube a 15-0 al anotar J1', () => {
      const partido = new PartidoPadel()

      partido.punto('J1')

      expect(partido.puntos).toEqual({ j1: '15', j2: '0' })
    })

    it('sigue 30-0 y 40-0 con más puntos de J1', () => {
      const partido = new PartidoPadel()

      partido.punto('J1')
      partido.punto('J1')
      expect(partido.puntos).toEqual({ j1: '30', j2: '0' })

      partido.punto('J1')
      expect(partido.puntos).toEqual({ j1: '40', j2: '0' })
    })

    it('anota puntos de J2 y empates 15-15', () => {
      const partido = new PartidoPadel()

      partido.punto('J2')
      expect(partido.puntos).toEqual({ j1: '0', j2: '15' })

      partido.punto('J1')
      expect(partido.puntos).toEqual({ j1: '15', j2: '15' })
    })
  })

  describe('deuce y ventajas', () => {
    it('muestra Deuce en 40-40', () => {
      const partido = new PartidoPadel()
      llevarA(partido, 3, 3)

      expect(partido.puntos).toEqual({ j1: 'Deuce', j2: 'Deuce' })
    })

    it('pasa de Deuce a Ventaja J1', () => {
      const partido = new PartidoPadel()
      llevarA(partido, 3, 3)

      partido.punto('J1')

      expect(partido.puntos).toEqual({ j1: 'Ventaja J1', j2: '40' })
    })

    it('vuelve a Deuce si J2 empata la ventaja de J1', () => {
      const partido = new PartidoPadel()
      llevarA(partido, 3, 3)
      partido.punto('J1')

      partido.punto('J2')

      expect(partido.puntos).toEqual({ j1: 'Deuce', j2: 'Deuce' })
    })

    it('gestiona Ventaja J2 y el retorno a Deuce', () => {
      const partido = new PartidoPadel()
      llevarA(partido, 3, 3)

      partido.punto('J2')
      expect(partido.puntos).toEqual({ j1: '40', j2: 'Ventaja J2' })

      partido.punto('J1')
      expect(partido.puntos).toEqual({ j1: 'Deuce', j2: 'Deuce' })
    })
  })

  describe('ganar un juego', () => {
    it('gana el juego desde 40 si el rival tiene 30 o menos', () => {
      const partido = new PartidoPadel()
      llevarA(partido, 3, 2)

      partido.punto('J1')

      expect(partido.puntos).toEqual({ j1: '0', j2: '0' })
      expect(partido.juegos).toEqual({ j1: 1, j2: 0 })
    })

    it('gana el juego desde Ventaja J1', () => {
      const partido = new PartidoPadel()
      llevarA(partido, 3, 3)
      partido.punto('J1')

      partido.punto('J1')

      expect(partido.juegos).toEqual({ j1: 1, j2: 0 })
      expect(partido.puntos).toEqual({ j1: '0', j2: '0' })
    })

    it('no gana el juego con un solo punto desde Deuce', () => {
      const partido = new PartidoPadel()
      llevarA(partido, 3, 3)

      partido.punto('J1')

      expect(partido.juegos).toEqual({ j1: 0, j2: 0 })
      expect(partido.puntos).toEqual({ j1: 'Ventaja J1', j2: '40' })
    })

    it('gana el juego J2 desde 40-0', () => {
      const partido = new PartidoPadel()
      llevarA(partido, 0, 3)

      partido.punto('J2')

      expect(partido.juegos).toEqual({ j1: 0, j2: 1 })
      expect(partido.puntos).toEqual({ j1: '0', j2: '0' })
    })
  })

  describe('helpers de set', () => {
    it('deja el marcador en 5-5 con ganarJuegos', () => {
      const partido = new PartidoPadel()

      ganarJuegos(partido, 5, 5)

      expect(partido.juegos).toEqual({ j1: 5, j2: 5 })
      expect(partido.sets).toEqual({ j1: 0, j2: 0 })
    })
  })

  describe('set estándar', () => {
    it('cierra el set al ganar 6 juegos seguidos', () => {
      const partido = new PartidoPadel()

      ganarSet(partido, 'J1')

      expect(partido.sets).toEqual({ j1: 1, j2: 0 })
      expect(partido.juegos).toEqual({ j1: 0, j2: 0 })
      expect(partido.puntos).toEqual({ j1: '0', j2: '0' })
    })

    it('cierra el set en 6-4', () => {
      const partido = new PartidoPadel()

      ganarJuegos(partido, 6, 4)

      expect(partido.sets).toEqual({ j1: 1, j2: 0 })
      expect(partido.juegos).toEqual({ j1: 0, j2: 0 })
      expect(partido.setsAnteriores).toEqual([{ j1: 6, j2: 4 }])
    })
  })

  describe('diferencia de 2 juegos', () => {
    it('no cierra el set en 6-5', () => {
      const partido = new PartidoPadel()
      ganarJuegos(partido, 5, 5)

      ganarJuego(partido, 'J1')

      expect(partido.juegos).toEqual({ j1: 6, j2: 5 })
      expect(partido.sets).toEqual({ j1: 0, j2: 0 })
    })

    it('cierra el set en 7-5', () => {
      const partido = new PartidoPadel()
      ganarJuegos(partido, 6, 5)

      ganarJuego(partido, 'J1')

      expect(partido.sets).toEqual({ j1: 1, j2: 0 })
      expect(partido.juegos).toEqual({ j1: 0, j2: 0 })
    })

    it('no cierra en 5-6 y sí en 5-7', () => {
      const partido = new PartidoPadel()
      ganarJuegos(partido, 5, 6)

      expect(partido.sets).toEqual({ j1: 0, j2: 0 })

      ganarJuego(partido, 'J2')

      expect(partido.sets).toEqual({ j1: 0, j2: 1 })
      expect(partido.juegos).toEqual({ j1: 0, j2: 0 })
    })
  })

  describe('tie-break', () => {
    it('activa tie-break en 6-6 y no cierra el set', () => {
      const partido = new PartidoPadel()
      ganarJuegos(partido, 6, 6)

      expect(partido.enTieBreak).toBe(true)
      expect(partido.sets).toEqual({ j1: 0, j2: 0 })
      expect(partido.juegos).toEqual({ j1: 6, j2: 6 })
    })

    it('cuenta puntos correlativos en el tie-break', () => {
      const partido = new PartidoPadel()
      ganarJuegos(partido, 6, 6)

      partido.punto('J1')
      expect(partido.puntos).toEqual({ j1: '1', j2: '0' })

      partido.punto('J1')
      expect(partido.puntos).toEqual({ j1: '2', j2: '0' })

      partido.punto('J1')
      expect(partido.puntos).toEqual({ j1: '3', j2: '0' })
    })

    it('gana el set en 7-5 del tie-break y limpia el estado', () => {
      const partido = new PartidoPadel()
      ganarJuegos(partido, 6, 6)
      llevarA(partido, 6, 5)

      partido.punto('J1')

      expect(partido.sets).toEqual({ j1: 1, j2: 0 })
      expect(partido.juegos).toEqual({ j1: 0, j2: 0 })
      expect(partido.enTieBreak).toBe(false)
      expect(partido.puntos).toEqual({ j1: '0', j2: '0' })
      expect(partido.setsAnteriores).toEqual([{ j1: 7, j2: 6 }])
    })

    it('no cierra el tie-break en 7-6 y sí en 8-6', () => {
      const partido = new PartidoPadel()
      ganarJuegos(partido, 6, 6)
      llevarA(partido, 6, 6)

      partido.punto('J1')
      expect(partido.enTieBreak).toBe(true)
      expect(partido.puntos).toEqual({ j1: '7', j2: '6' })
      expect(partido.sets).toEqual({ j1: 0, j2: 0 })

      partido.punto('J1')
      expect(partido.sets).toEqual({ j1: 1, j2: 0 })
      expect(partido.enTieBreak).toBe(false)
      expect(partido.juegos).toEqual({ j1: 0, j2: 0 })
    })
  })

  describe('partido (mejor de 3)', () => {
    it('declara ganador al primero que gana 2 sets', () => {
      const partido = new PartidoPadel()

      ganarSet(partido, 'J1')
      ganarSet(partido, 'J1')

      expect(partido.ganador).toBe('J1')
      expect(partido.sets).toEqual({ j1: 2, j2: 0 })
    })

    it('continúa con 1-1 en sets', () => {
      const partido = new PartidoPadel()

      ganarSet(partido, 'J1')
      ganarSet(partido, 'J2')

      expect(partido.ganador).toBeNull()
      expect(partido.sets).toEqual({ j1: 1, j2: 1 })
    })

    it('bloquea el marcador cuando el partido ya tiene ganador', () => {
      const partido = new PartidoPadel()
      ganarSet(partido, 'J1')
      ganarSet(partido, 'J1')

      partido.punto('J2')

      expect(partido.ganador).toBe('J1')
      expect(partido.puntos).toEqual({ j1: '0', j2: '0' })
      expect(partido.juegos).toEqual({ j1: 0, j2: 0 })
      expect(partido.sets).toEqual({ j1: 2, j2: 0 })
    })

    it('resetea el partido a 0-0 y vuelve a aceptar puntos', () => {
      const partido = new PartidoPadel()
      ganarSet(partido, 'J1')
      ganarSet(partido, 'J1')

      partido.resetear()

      expect(partido.getMarcador()).toEqual({
        puntos: { j1: '0', j2: '0' },
        juegos: { j1: 0, j2: 0 },
        sets: { j1: 0, j2: 0 },
        enTieBreak: false,
        ganador: null,
        setsAnteriores: []
      })

      partido.punto('J2')
      expect(partido.puntos).toEqual({ j1: '0', j2: '15' })
    })
  })
})
