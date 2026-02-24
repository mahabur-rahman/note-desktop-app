import type { MouseEventHandler, ReactNode } from 'react'

interface IconButtonProps {
  ariaLabel: string
  className?: string
  children: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
}

export function IconButton({
  ariaLabel,
  className = '',
  children,
  onClick
}: IconButtonProps): React.JSX.Element {
  return (
    <button type="button" aria-label={ariaLabel} className={className} onClick={onClick}>
      {children}
    </button>
  )
}
