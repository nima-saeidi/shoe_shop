import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Field({ label, error, id, className = '', ...rest }: Props) {
  const fieldId = id ?? rest.name
  return (
    <div className={className}>
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input id={fieldId} className="input" aria-invalid={Boolean(error)} {...rest} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
