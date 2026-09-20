import { describe, expect, it } from 'vitest'

describe('unit environment', () => {
  it('runs in node without a browser window', () => {
    expect(typeof window).toBe('undefined')
  })
})
