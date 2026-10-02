import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it } from 'vitest'
import App from './App'
import { logout, register } from './services/authService'

function renderAt(path: string) {
  window.history.pushState({}, '', path)
  render(<App />)
}

const AFTER_HASH = { timeout: 15_000 }

beforeAll(async () => {
  await import('./pages/DashboardPage')
}, 60_000)

describe('navegación y sesión', () => {
  it('sin sesión, el dashboard redirige al login', async () => {
    renderAt('/dashboard')

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
  })

  it('registrarse, cerrar sesión y volver a entrar', async () => {
    const user = userEvent.setup()
    renderAt('/registro')

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana López')
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com')
    await user.type(screen.getByLabelText('Contraseña'), 'MiClave123')
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'MiClave123')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByRole('heading', { name: 'Hola, Ana López' }, AFTER_HASH)).toBeInTheDocument()
    expect(screen.getByText('$0.00')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Cerrar sesión/ }))
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com')
    await user.type(screen.getByLabelText('Contraseña'), 'MiClave123')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByRole('heading', { name: 'Hola, Ana López' }, AFTER_HASH)).toBeInTheDocument()
  })

  it('el registro muestra los errores al enviar y los quita en vivo al corregir', async () => {
    const user = userEvent.setup()
    renderAt('/registro')

    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(screen.getByText('Escribe tu nombre completo')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre completo')).toHaveAttribute('aria-invalid', 'true')

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana López')
    expect(screen.queryByText('Escribe tu nombre completo')).not.toBeInTheDocument()
  })

  it('un login con contraseña incorrecta muestra el error genérico', async () => {
    await register({ fullName: 'Ana López', email: 'ana@correo.com', password: 'MiClave123' })
    logout()
    const user = userEvent.setup()
    renderAt('/login')

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com')
    await user.type(screen.getByLabelText('Contraseña'), 'OtraClave123')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByRole('alert', {}, AFTER_HASH)).toHaveTextContent('Correo o contraseña incorrectos')
  })
})