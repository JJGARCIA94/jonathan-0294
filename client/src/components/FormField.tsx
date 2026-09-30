import { useState, type InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    id: string
    label: string
    hint?: string
    error?: string
    validated?: boolean
}

export function FormField({ id, label, hint, error, validated = false, type = 'text', ...inputProps }: FormFieldProps) {
    const [showPassword, setShowPassword] = useState(false)

    const isPassword = type === 'password'
    const hintId = `${id}-hint`
    const errorId = `${id}-error`
    const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ')

    let inputClassName = 'form-control'
    if (error) inputClassName += ' is-invalid'
    else if (validated) inputClassName += ' is-valid'

    const input = (
        <input
            id={id}
            type={isPassword && showPassword ? 'text' : type}
            className={inputClassName}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy || undefined}
            {...inputProps}
        />
    )

    const errorMessage = error && (
        <div id={errorId} className="invalid-feedback">
            {error}
        </div>
    )

    return (
        <div className="mb-3">
            <label htmlFor={id} className="form-label">
                {label}
            </label>

            {isPassword ? (
                <div className={error ? 'input-group has-validation' : 'input-group'}>
                    {input}
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        aria-pressed={showPassword}
                    >
                        <i className={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'} aria-hidden="true" />
                    </button>
                    {errorMessage}
                </div>
            ) : (
                <>
                    {input}
                    {errorMessage}
                </>
            )}

            {hint && (
                <div id={hintId} className="form-text">
                    {hint}
                </div>
            )}
        </div>
    )
}