import { useState } from 'react'

import { RegisterPage } from './pages/RegisterPage'
import type { User } from './types/auth'

function App() {
  const [user, setUser] = useState<User | null>(null)

  return (
    <main className="min-vh-100 bg-body-tertiary py-5">
      <div className="container">
        <h1 className="text-center mb-4">Carreras de caracoles</h1>
        {user ? (
          <div className="alert alert-success text-center" role="status">
            ¡Cuenta creada! Hola, {user.fullName}. Tu saldo es de ${user.balance}.
          </div>
        ) : (
          <RegisterPage onRegistered={setUser} />
        )}
      </div>
    </main>
  )
}

export default App