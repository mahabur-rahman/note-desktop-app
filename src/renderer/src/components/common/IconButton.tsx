import type { ReactNode } from 'react'

interface IconButtonProps {
  ariaLabel: string
  className?: string
  children: ReactNode
}

export function IconButton({ ariaLabel, className = '', children }: IconButtonProps): React.JSX.Element {
  return (
    <button type="button" aria-label={ariaLabel} className={className}>
      {children}
    </button>
  )
}
