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
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#0b1324]/60 px-4 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-[520px] overflow-hidden rounded-xl border border-[#cfdaec] bg-[#f8fbff] shadow-[0_20px_34px_rgba(16,27,46,0.35)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#d8e1f0] px-4 py-3">
          <h2 className="m-0 text-[21px] leading-none font-semibold text-[#273b5c]">{title}</h2>
          <IconButton
            ariaLabel="Close confirmation modal"
            onClick={onCancel}
            className="cursor-pointer rounded p-1 text-[22px] text-[#304a72] transition hover:bg-[#eaf1fc]"
          >
            <FiX />
          </IconButton>
        </div>

        <div className="border-b border-[#d8e1f0] px-4 py-4 text-[16px] text-[#344a69]">
          {message}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3">
          <button
            type="button"
            onClick={onConfirm}
            className="min-w-[100px] cursor-pointer rounded bg-[#4f63f6] px-4 py-2 text-[15px] font-semibold text-white transition hover:bg-[#4158e8]"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="min-w-[100px] cursor-pointer rounded border border-[#cad5eb] bg-white px-4 py-2 text-[15px] font-semibold text-[#2f435f] transition hover:bg-[#f4f8ff]"
          >
            No
          </button>
        </div>
      </div>
    </div>
  )
}
