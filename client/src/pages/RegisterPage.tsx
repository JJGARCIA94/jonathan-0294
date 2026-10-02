import { useState, type ChangeEvent, type SubmitEvent } from 'react'
import { Link } from 'react-router'
import { AuthLayout } from '../components/AuthLayout'
import { FormField } from '../components/FormField'
import { useAuth } from '../hooks/useAuth'
import { AuthError } from '../services/authService'
import type { RegisterForm } from '../types/auth'
import { hasErrors, PASSWORD_HINT, validateRegister, type FieldErrors } from '../utils/validations'
import { usePageTitle } from '../hooks/usePageTitle'

const EMPTY_FORM: RegisterForm = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
}

export function RegisterPage() {
    const { register } = useAuth()
    usePageTitle('Crear cuenta')
    const [form, setForm] = useState<RegisterForm>(EMPTY_FORM)
    const [wasSubmitted, setWasSubmitted] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const errors: FieldErrors<RegisterForm> = wasSubmitted ? validateRegister(form) : {}

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target
        setForm((current) => ({ ...current, [name]: value }))
    }

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()

        setWasSubmitted(true)
        setSubmitError(null)
        if (hasErrors(validateRegister(form))) return

        setIsSubmitting(true)
        try {
            await register(form)
        } catch (error) {
            setSubmitError(error instanceof AuthError ? error.message : 'No pudimos crear tu cuenta. Inténtalo de nuevo.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AuthLayout
            title="Crear cuenta"
            footer={
                <>
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} noValidate>
                <FormField
                    id="fullName"
                    name="fullName"
                    label="Nombre completo"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                    validated={wasSubmitted}
                />
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
                    autoComplete="new-password"
                    hint={PASSWORD_HINT}
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    validated={wasSubmitted}
                />
                <FormField
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    label="Confirmar contraseña"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    validated={wasSubmitted}
                />

                {submitError && (
                    <div className="alert alert-danger py-2" role="alert">
                        {submitError}
                    </div>
                )}

                <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                    {isSubmitting && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
                    {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
                </button>
            </form>
        </AuthLayout>
    )
}