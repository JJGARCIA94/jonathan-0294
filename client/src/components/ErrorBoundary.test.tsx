import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function BrokenComponent(): never {
    throw new Error('Falla de prueba')
}

afterEach(() => {
    vi.restoreAllMocks()
})

describe('ErrorBoundary', () => {
    it('si nada falla, muestra el contenido normal', () => {
        render(
            <ErrorBoundary>
                <p>Contenido normal</p>
            </ErrorBoundary>,
        )

        expect(screen.getByText('Contenido normal')).toBeInTheDocument()
    })

    it('si un componente falla, muestra un mensaje en lugar de una pantalla en blanco', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { })

        render(
            <ErrorBoundary>
                <BrokenComponent />
            </ErrorBoundary>,
        )

        expect(screen.getByRole('heading', { name: 'Algo salió mal' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Recargar la página' })).toBeInTheDocument()
        expect(consoleError).toHaveBeenCalled()
    })
})