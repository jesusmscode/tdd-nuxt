import type { DuracionMinutos } from './PartidoPadel'
import { DURACION_MINUTOS_POR_DEFECTO } from './PartidoPadel'

export function formatearTiempo(segundos: number) {
  const minutos = Math.floor(Math.max(0, segundos) / 60)
  const resto = Math.max(0, segundos) % 60

  return `${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`
}

export class CronometroPartido {
  #duracionMinutos: DuracionMinutos
  #segundosRestantes: number
  #enMarcha = false
  #iniciado = false

  constructor(duracionMinutos: DuracionMinutos = DURACION_MINUTOS_POR_DEFECTO) {
    this.#duracionMinutos = duracionMinutos
    this.#segundosRestantes = duracionMinutos * 60
  }

  get segundosRestantes() {
    return this.#segundosRestantes
  }

  get tiempoVisible() {
    return formatearTiempo(this.#segundosRestantes)
  }

  get enMarcha() {
    return this.#enMarcha
  }

  get iniciado() {
    return this.#iniciado
  }

  get agotado() {
    return this.#iniciado && this.#segundosRestantes === 0
  }

  establecerDuracion(duracionMinutos: DuracionMinutos) {
    if (this.#iniciado) {
      return
    }

    this.#duracionMinutos = duracionMinutos
    this.#segundosRestantes = duracionMinutos * 60
  }

  empezar() {
    if (this.#iniciado) {
      return
    }

    this.#iniciado = true
    this.#enMarcha = this.#segundosRestantes > 0
  }

  tick() {
    if (!this.#enMarcha) {
      return
    }

    this.#segundosRestantes = Math.max(0, this.#segundosRestantes - 1)

    if (this.#segundosRestantes === 0) {
      this.#enMarcha = false
    }
  }

  resetear(duracionMinutos: DuracionMinutos = this.#duracionMinutos) {
    this.#duracionMinutos = duracionMinutos
    this.#segundosRestantes = duracionMinutos * 60
    this.#enMarcha = false
    this.#iniciado = false
  }
}
