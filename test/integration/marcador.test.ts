import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import MarcadorPadel from '~/components/MarcadorPadel.vue'

describe('marcador de pádel', () => {
  it('muestra 15-0 al pulsar Punto J1', async () => {
    const wrapper = await mountSuspended(MarcadorPadel)

    await wrapper.get('[data-testid="punto-j1"]').trigger('click')

    expect(wrapper.get('[data-testid="puntos-j1"]').text()).toBe('15')
    expect(wrapper.get('[data-testid="puntos-j2"]').text()).toBe('0')
    expect(wrapper.text()).toContain('15')
  })

  it('deshabilita los botones cuando hay ganador', async () => {
    const wrapper = await mountSuspended(MarcadorPadel)
    const puntoJ1 = wrapper.get('[data-testid="punto-j1"]')

    for (let i = 0; i < 48; i++) {
      await puntoJ1.trigger('click')
    }

    expect(wrapper.get('[data-testid="ganador"]').text()).toContain('J1')
    expect(puntoJ1.attributes('disabled')).toBeDefined()
  })

  it('empieza un partido nuevo al pulsar Nuevo partido', async () => {
    const wrapper = await mountSuspended(MarcadorPadel)

    await wrapper.get('[data-testid="punto-j1"]').trigger('click')
    await wrapper.get('[data-testid="resetear"]').trigger('click')

    expect(wrapper.get('[data-testid="puntos-j1"]').text()).toBe('0')
    expect(wrapper.get('[data-testid="puntos-j2"]').text()).toBe('0')
    expect(wrapper.get('[data-testid="juegos"]').text()).toBe('0 – 0')
    expect(wrapper.get('[data-testid="sets"]').text()).toBe('0 – 0')
  })
})
