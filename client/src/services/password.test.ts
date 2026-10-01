import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from './password'

describe('hashPassword', () => {
    it('no guarda la contraseña en texto plano', async () => {
        const result = await hashPassword('MiClave123')

        expect(result.hash).not.toContain('MiClave123')
        expect(result.hash).toMatch(/^[0-9a-f]{64}$/)
        expect(result.salt).toMatch(/^[0-9a-f]{32}$/)
    })

    it('genera hashes distintos para la misma contraseña gracias a la sal', async () => {
        const first = await hashPassword('MiClave123')
        const second = await hashPassword('MiClave123')

        expect(first.salt).not.toBe(second.salt)
        expect(first.hash).not.toBe(second.hash)
    })

    it('con la misma contraseña y la misma sal produce el mismo hash', async () => {
        const original = await hashPassword('MiClave123')
        const recalculated = await hashPassword('MiClave123', original.salt)

        expect(recalculated.hash).toBe(original.hash)
    })
})

describe('verifyPassword', () => {
    it('acepta la contraseña correcta y rechaza una casi igual', async () => {
        const stored = await hashPassword('MiClave123')

        expect(await verifyPassword('MiClave123', stored)).toBe(true)
        expect(await verifyPassword('miclave123', stored)).toBe(false)
    })
})