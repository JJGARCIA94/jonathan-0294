import { useState, type ChangeEvent, type SubmitEvent } from 'react'
import { Link } from 'react-router'

import { AuthLayout } from '../components/AuthLayout'
import { FormField } from '../components/FormField'
import { useAuth } from '../hooks/useAuth'
import { AuthError } from '../services/authService'
import type { LoginForm } from '../types/auth'
import { hasErrors, validateLogin, type FieldErrors } from '../utils/validations'

const EMPTY_FORM: LoginForm = {
    email: '',
    password: '',
}

export function LoginPage() {
    const { login } = useAuth()
    const [form, setForm] = useState<LoginForm>(EMPTY_FORM)
    const [wasSubmitted, setWasSubmitted] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const errors: FieldErrors<LoginForm> = wasSubmitted ? validateLogin(form) : {}

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target
        setForm((current) => ({ ...current, [name]: value }))
    }

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()

        setWasSubmitted(true)
        setSubmitError(null)
        if (hasErrors(validateLogin(form))) return

        setIsSubmitting(true)
        try {
            await login(form.email, form.password)
        } catch (error) {
            setSubmitError(error instanceof AuthError ? error.message : 'No pudimos iniciar sesión. Inténtalo de nuevo.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AuthLayout
            title="Iniciar sesión"
            footer={
                <>
                    ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} noValidate>
                <FormField
                    id="email"
                    name="email"
                    type="email"
                    label="Correo electrónico"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    validated={wasSubmitted}
                />
                <FormField
                    id="password"
                    name="password"
                    type="password"
                    label="Contraseña"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                />

                {submitError && (
                    <div className="alert alert-danger py-2" role="alert">
                        {submitError}
                    </div>
                )}

                <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                    {isSubmitting && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
                    {isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
                </button>
            </form>
        </AuthLayout>
    )
}