import { describe, expect, it } from 'vitest'
import { CronometroPartido, formatearTiempo } from '~/domain/CronometroPartido'

describe('CronometroPartido', () => {
  it('formatea minutos y segundos', () => {
    expect(formatearTiempo(5400)).toBe('90:00')
    expect(formatearTiempo(3600)).toBe('60:00')
    expect(formatearTiempo(61)).toBe('01:01')
    expect(formatearTiempo(0)).toBe('00:00')
  })

  it('parte de 90:00 por defecto y de 60:00 si se elige esa duración', () => {
    expect(new CronometroPartido().tiempoVisible).toBe('90:00')
    expect(new CronometroPartido(60).tiempoVisible).toBe('60:00')
  })

  it('no cuenta atrás hasta empezar', () => {
    const cronometro = new CronometroPartido(60)

    cronometro.tick()

    expect(cronometro.tiempoVisible).toBe('60:00')
    expect(cronometro.iniciado).toBe(false)
  })

  it('al empezar resta un segundo en cada tick', () => {
    const cronometro = new CronometroPartido(60)

    cronometro.empezar()
    cronometro.tick()

    expect(cronometro.tiempoVisible).toBe('59:59')
    expect(cronometro.enMarcha).toBe(true)
  })

  it('permite cambiar la duración solo antes de empezar', () => {
    const cronometro = new CronometroPartido(90)

    cronometro.establecerDuracion(60)
    expect(cronometro.tiempoVisible).toBe('60:00')

    cronometro.empezar()
    cronometro.establecerDuracion(90)

    expect(cronometro.tiempoVisible).toBe('60:00')
  })

  it('se detiene en 00:00 y marca el tiempo agotado', () => {
    const cronometro = new CronometroPartido(60)
    cronometro.empezar()

    for (let i = 0; i < 3600; i++) {
      cronometro.tick()
    }

    expect(cronometro.tiempoVisible).toBe('00:00')
    expect(cronometro.enMarcha).toBe(false)
    expect(cronometro.agotado).toBe(true)
  })

  it('resetear vuelve a la duración y detiene la cuenta', () => {
    const cronometro = new CronometroPartido(90)
    cronometro.empezar()
    cronometro.tick()

    cronometro.resetear(60)

    expect(cronometro.tiempoVisible).toBe('60:00')
    expect(cronometro.iniciado).toBe(false)
    expect(cronometro.enMarcha).toBe(false)
  })
})
