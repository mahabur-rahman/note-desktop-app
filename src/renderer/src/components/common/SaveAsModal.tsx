import { useEffect, useRef } from 'react'
import { FiX } from 'react-icons/fi'
import { IconButton } from './IconButton'

interface SaveAsModalProps {
  isOpen: boolean
  fileName: string
  onFileNameChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
}

export function SaveAsModal({
  isOpen,
  fileName,
  onFileNameChange,
  onSave,
  onCancel
}: SaveAsModalProps): React.JSX.Element | null {
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onCancel()
        return
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        onSave()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onCancel, onSave])

  useEffect(() => {
    if (!isOpen) return

    window.requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }, [isOpen])

  if (!isOpen) return null

  const isSaveDisabled = fileName.trim().length === 0

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#0b1324]/60 px-4 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Save As"
        className="w-full max-w-[620px] overflow-hidden rounded-xl border border-[#cfdaec] bg-[#f8fbff] shadow-[0_20px_34px_rgba(16,27,46,0.35)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#d8e1f0] px-4 py-3">
          <h2 className="m-0 text-[28px] leading-none font-semibold text-[#273b5c]">Save As</h2>
          <IconButton
            ariaLabel="Close save as modal"
            className="cursor-pointer rounded p-1 text-[22px] text-[#304a72] transition hover:bg-[#eaf1fc]"
            onClick={onCancel}
          >
            <FiX />
          </IconButton>
        </div>

        <div className="grid grid-cols-[132px_minmax(0,1fr)] items-center gap-3 border-b border-[#d8e1f0] px-4 py-5">
          <label htmlFor="save-as-filename" className="text-[15px] font-medium text-[#314766]">
            Filename
          </label>
          <input
            id="save-as-filename"
            ref={inputRef}
            type="text"
            value={fileName}
            onChange={(event) => onFileNameChange(event.target.value)}
            className="h-11 w-full rounded border border-[#c9d4e8] bg-white px-3 text-[15px] text-[#243650] outline-none focus:border-[#93a8d2]"
          />
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaveDisabled}
            className={[
              'min-w-[98px] rounded px-4 py-2 text-[15px] font-semibold text-white transition',
              isSaveDisabled
                ? 'cursor-not-allowed bg-[#9da7e6]'
                : 'cursor-pointer bg-[#4f63f6] hover:bg-[#4158e8]'
            ].join(' ')}
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="min-w-[98px] cursor-pointer rounded border border-[#cad5eb] bg-white px-4 py-2 text-[15px] font-semibold text-[#2f435f] transition hover:bg-[#f4f8ff]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
