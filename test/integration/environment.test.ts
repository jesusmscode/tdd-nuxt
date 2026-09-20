import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AppLogo from '~/components/AppLogo.vue'

describe('nuxt integration environment', () => {
  it('exposes the nuxt app', () => {
    const app = useNuxtApp()

    expect(app).toBeTruthy()
  })

  it('mounts a vue component', async () => {
    const wrapper = await mountSuspended(AppLogo)

    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
