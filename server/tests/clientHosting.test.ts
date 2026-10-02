import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'

let distDir: string

beforeAll(() => {
    distDir = mkdtempSync(join(tmpdir(), 'client-dist-'))
    writeFileSync(join(distDir, 'index.html'), '<!doctype html><div id="root"></div>')
    mkdirSync(join(distDir, 'assets'))
    writeFileSync(join(distDir, 'assets', 'app.js'), 'console.log("app")')
    process.env.CLIENT_DIST_DIR = distDir
})

afterAll(() => {
    delete process.env.CLIENT_DIST_DIR
    rmSync(distDir, { recursive: true, force: true })
})

describe('frontend en producción', () => {
    it('entrega los archivos del frontend compilado', async () => {
        const response = await request(createApp()).get('/assets/app.js')

        expect(response.status).toBe(200)
        expect(response.text).toContain('console.log')
    })

    it('las rutas de React, como /dashboard, devuelven index.html', async () => {
        const response = await request(createApp()).get('/dashboard')

        expect(response.status).toBe(200)
        expect(response.headers['content-type']).toContain('text/html')
    })

    it('el API sigue respondiendo en el mismo servidor', async () => {
        const response = await request(createApp()).get('/api/health')

        expect(response.body).toEqual({ status: 'ok' })
    })

    it('una ruta del API que no existe no devuelve index.html', async () => {
        const response = await request(createApp()).get('/api/no-existe')

        expect(response.status).toBe(404)
        expect(response.text).not.toContain('<div id="root">')
    })
})