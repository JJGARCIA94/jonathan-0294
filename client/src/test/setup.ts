import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Limpia el DOM y el localStorage entre pruebas para que no se contaminen
afterEach(() => {
  cleanup()
  localStorage.clear()
})
