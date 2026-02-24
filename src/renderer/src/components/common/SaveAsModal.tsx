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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Save As"
        className="w-full max-w-[620px] overflow-hidden rounded-[4px] border border-[#d8dde5] bg-[#f7f8fa]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#d8dde5] px-4 py-2.5">
          <h2 className="m-0 text-[33px] leading-none font-semibold text-[#29334a]">Save As</h2>
          <IconButton
            ariaLabel="Close save as modal"
            className="cursor-pointer p-1 text-[22px] text-[#26324a]"
            onClick={onCancel}
          >
            <FiX />
          </IconButton>
        </div>

        <div className="grid grid-cols-[132px_minmax(0,1fr)] items-center gap-3 border-b border-[#d8dde5] px-4 py-5">
          <label htmlFor="save-as-filename" className="text-[15px] text-[#1f2d45]">
            Filename
          </label>
          <input
            id="save-as-filename"
            ref={inputRef}
            type="text"
            value={fileName}
            onChange={(event) => onFileNameChange(event.target.value)}
            className="h-11 w-full border border-[#c7ccd5] bg-transparent px-3 text-[16px] text-[#1f2d45] outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-0.5 px-4 py-3">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaveDisabled}
            className={[
              'min-w-[98px] rounded px-4 py-1.5 text-[17px] text-white',
              isSaveDisabled ? 'cursor-not-allowed bg-[#9da7e6]' : 'cursor-pointer bg-[#4f63f6]'
            ].join(' ')}
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="min-w-[98px] cursor-pointer rounded bg-[#4f63f6] px-4 py-1.5 text-[17px] text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
