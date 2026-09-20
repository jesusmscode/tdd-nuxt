import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import MarcadorPadel from '~/components/MarcadorPadel.vue'

describe('marcador de pádel', () => {
  it('muestra 15-0 al pulsar Punto Team 1', async () => {
    const wrapper = await mountSuspended(MarcadorPadel)

    await empezarPartido(wrapper)
    await wrapper.get('[data-testid="punto-t1"]').trigger('click')

    expect(wrapper.get('[data-testid="puntos-t1"]').text()).toBe('15')
    expect(wrapper.get('[data-testid="puntos-t2"]').text()).toBe('0')
    expect(wrapper.text()).toContain('15')
  })

  it('deshabilita los botones cuando hay ganador', async () => {
    const wrapper = await mountSuspended(MarcadorPadel)
    await empezarPartido(wrapper)
    const puntoT1 = wrapper.get('[data-testid="punto-t1"]')

    for (let i = 0; i < 48; i++) {
      await puntoT1.trigger('click')
    }

    expect(wrapper.get('[data-testid="ganador"]').text()).toContain('Team 1')
    expect(puntoT1.attributes('disabled')).toBeDefined()
  })

  it('empieza un partido nuevo al pulsar Nuevo partido', async () => {
    const wrapper = await mountSuspended(MarcadorPadel)

    await empezarPartido(wrapper)
    await wrapper.get('[data-testid="punto-t1"]').trigger('click')
    await wrapper.get('[data-testid="resetear"]').trigger('click')

    expect(wrapper.get('[data-testid="puntos-t1"]').text()).toBe('0')
    expect(wrapper.get('[data-testid="puntos-t2"]').text()).toBe('0')
    expect(wrapper.get('[data-testid="juegos"]').text()).toBe('0 – 0')
    expect(wrapper.get('[data-testid="sets"]').text()).toBe('0 – 0')
    expect(wrapper.get('[data-testid="cronometro"]').text()).toBe('90:00')
    expect(wrapper.get('[data-testid="empezar-partido"]').attributes('disabled')).toBeUndefined()
  })

  it('con ventaja tradicional, un punto desde Deuce muestra ventaja', async () => {
    const wrapper = await mountSuspended(MarcadorPadel)

    await empezarPartido(wrapper)
    await llegarADeuce(wrapper)
    await wrapper.get('[data-testid="punto-t1"]').trigger('click')

    expect(wrapper.get('[data-testid="puntos-t1"]').text()).toBe('Ventaja Team 1')
    expect(wrapper.get('[data-testid="juegos"]').text()).toBe('0 – 0')
  })

  it('con bola de oro, un punto desde 40-40 gana el juego', async () => {
    const wrapper = await mountSuspended(MarcadorPadel)

    await wrapper.get('[data-testid="modo-bola-de-oro"]').setValue(true)

    expect(wrapper.get('[data-testid="modo-activo"]').text()).toContain('bola de oro')

    await empezarPartido(wrapper)
    await llegarADeuce(wrapper)

    expect(wrapper.get('[data-testid="puntos-t1"]').text()).toBe('40')
    expect(wrapper.get('[data-testid="puntos-t2"]').text()).toBe('40')
    expect(wrapper.get('[data-testid="estado-bola-de-oro"]').text()).toContain('el siguiente punto gana el juego')

    await wrapper.get('[data-testid="punto-t1"]').trigger('click')

    expect(wrapper.get('[data-testid="puntos-t1"]').text()).toBe('0')
    expect(wrapper.get('[data-testid="puntos-t2"]').text()).toBe('0')
    expect(wrapper.get('[data-testid="juegos"]').text()).toBe('1 – 0')
  })

  it('bloquea el cambio de modo tras empezar el partido y lo desbloquea al resetear', async () => {
    const wrapper = await mountSuspended(MarcadorPadel)
    const modoBola = wrapper.get('[data-testid="modo-bola-de-oro"]')

    expect(modoBola.attributes('disabled')).toBeUndefined()

    await empezarPartido(wrapper)

    expect(modoBola.attributes('disabled')).toBeDefined()

    await modoBola.setValue(true)

    expect(wrapper.get('[data-testid="modo-activo"]').text()).toContain('ventaja tradicional')

    await wrapper.get('[data-testid="resetear"]').trigger('click')

    expect(wrapper.get('[data-testid="modo-bola-de-oro"]').attributes('disabled')).toBeUndefined()
  })

  it('permite elegir 60 o 90 minutos antes de empezar', async () => {
    const wrapper = await mountSuspended(MarcadorPadel)
    const duracion60 = wrapper.get('[data-testid="duracion-60"]')

    expect(wrapper.get('[data-testid="modo-activo"]').text()).toContain('90 min')
    expect(wrapper.get('[data-testid="cronometro"]').text()).toBe('90:00')
    expect(wrapper.get('[data-testid="duracion-90"]').element).toMatchObject({ checked: true })

    await duracion60.setValue(true)

    expect(wrapper.get('[data-testid="modo-activo"]').text()).toContain('60 min')
    expect(wrapper.get('[data-testid="cronometro"]').text()).toBe('60:00')

    await empezarPartido(wrapper)
    await wrapper.get('[data-testid="duracion-90"]').setValue(true)

    expect(duracion60.attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid="modo-activo"]').text()).toContain('60 min')
    expect(wrapper.get('[data-testid="cronometro"]').text()).toBe('60:00')
    expect(wrapper.get('[data-testid="empezar-partido"]').attributes('disabled')).toBeDefined()
  })

  it('no deja anotar puntos hasta pulsar Empezar partido', async () => {
    const wrapper = await mountSuspended(MarcadorPadel)

    expect(wrapper.get('[data-testid="punto-t1"]').attributes('disabled')).toBeDefined()

    await empezarPartido(wrapper)

    expect(wrapper.get('[data-testid="punto-t1"]').attributes('disabled')).toBeUndefined()
  })

  it('permite nombrar jugadores, asignar el saque y guarda el historial', async () => {
    const wrapper = await mountSuspended(MarcadorPadel)

    await wrapper.get('[data-testid="nombre-T1A"]').setValue('Ana')
    await wrapper.get('[data-testid="sacador-T1A"]').setValue(true)

    expect(wrapper.get('[data-testid="sacador-activo"]').text()).toContain('Ana')

    await empezarPartido(wrapper)
    const puntoT1 = wrapper.get('[data-testid="punto-t1"]')
    for (let i = 0; i < 4; i++) {
      await puntoT1.trigger('click')
    }

    expect(wrapper.get('[data-testid="historial-saques"]').text()).toContain('Juego 1: Ana')
    expect(wrapper.get('[data-testid="sacador-activo"]').text()).toContain('Jugador 3')
  })

  it('deshace el último punto', async () => {
    const wrapper = await mountSuspended(MarcadorPadel)

    expect(wrapper.get('[data-testid="deshacer"]').attributes('disabled')).toBeDefined()

    await empezarPartido(wrapper)
    await wrapper.get('[data-testid="punto-t1"]').trigger('click')
    await wrapper.get('[data-testid="deshacer"]').trigger('click')

    expect(wrapper.get('[data-testid="puntos-t1"]').text()).toBe('0')
    expect(wrapper.get('[data-testid="puntos-t2"]').text()).toBe('0')
  })

  it('deshace un punto que cerró el juego', async () => {
    const wrapper = await mountSuspended(MarcadorPadel)
    await empezarPartido(wrapper)
    const puntoT1 = wrapper.get('[data-testid="punto-t1"]')

    for (let i = 0; i < 4; i++) {
      await puntoT1.trigger('click')
    }

    expect(wrapper.get('[data-testid="juegos"]').text()).toBe('1 – 0')

    await wrapper.get('[data-testid="deshacer"]').trigger('click')

    expect(wrapper.get('[data-testid="puntos-t1"]').text()).toBe('40')
    expect(wrapper.get('[data-testid="juegos"]').text()).toBe('0 – 0')
  })

  it('avisa cambio de lado tras el primer juego', async () => {
    const wrapper = await mountSuspended(MarcadorPadel)
    await empezarPartido(wrapper)
    const puntoT1 = wrapper.get('[data-testid="punto-t1"]')

    for (let i = 0; i < 4; i++) {
      await puntoT1.trigger('click')
    }

    expect(wrapper.get('[data-testid="cambio-de-lado"]').text()).toContain('Cambio de lado')

    await puntoT1.trigger('click')

    expect(wrapper.find('[data-testid="cambio-de-lado"]').exists()).toBe(false)
  })
})

async function empezarPartido(wrapper: { get: (selector: string) => { trigger: (event: string) => Promise<unknown> } }) {
  await wrapper.get('[data-testid="empezar-partido"]').trigger('click')
}

async function llegarADeuce(wrapper: { get: (selector: string) => { trigger: (event: string) => Promise<unknown> } }) {
  const puntoT1 = wrapper.get('[data-testid="punto-t1"]')
  const puntoT2 = wrapper.get('[data-testid="punto-t2"]')

  for (let i = 0; i < 3; i++) {
    await puntoT1.trigger('click')
    await puntoT2.trigger('click')
  }
}
