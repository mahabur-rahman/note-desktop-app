import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import { IconButton } from './IconButton'

interface ConfirmModalProps {
  title: string
  message: string
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  title,
  message,
  isOpen,
  onConfirm,
  onCancel
}: ConfirmModalProps): React.JSX.Element | null {
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onCancel()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-[520px] overflow-hidden rounded-[3px] border border-[#d8dde5] bg-[#f7f8fa]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#d8dde5] px-4 py-2">
          <h2 className="m-0 text-[20px] leading-none font-semibold text-[#29334a]">{title}</h2>
          <IconButton
            ariaLabel="Close confirmation modal"
            onClick={onCancel}
            className="cursor-pointer p-1 text-[22px] text-[#26324a]"
          >
            <FiX />
          </IconButton>
        </div>

        <div className="border-b border-[#d8dde5] px-4 py-3 text-[17px] text-[#1f2d45]">
          {message}
        </div>

        <div className="flex items-center justify-end gap-0.5 px-4 py-3">
          <button
            type="button"
            onClick={onConfirm}
            className="min-w-[100px] cursor-pointer rounded bg-[#4f63f6] px-4 py-1.5 text-[17px] text-white"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="min-w-[100px] cursor-pointer rounded bg-[#4f63f6] px-4 py-1.5 text-[17px] text-white"
          >
            No
          </button>
        </div>
      </div>
    </div>
  )
}
