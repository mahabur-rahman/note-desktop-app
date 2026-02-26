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
    <button
      type="button"
      aria-label={ariaLabel}
      className={`focus-visible:ring-2 focus-visible:ring-[#88a5ff] focus-visible:ring-offset-1 focus-visible:outline-none ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
