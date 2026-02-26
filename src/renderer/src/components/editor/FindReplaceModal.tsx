import { useEffect, useState } from 'react'
import { FiX } from 'react-icons/fi'
import { IconButton } from '../common/IconButton'

export interface FindReplacePayload {
  findText: string
  replaceText: string
  matchCase: boolean
  wholeWords: boolean
}

interface FindReplaceModalProps {
  isOpen: boolean
  onClose: () => void
  onReplace: (payload: FindReplacePayload) => void
}

export function FindReplaceModal({
  isOpen,
  onClose,
  onReplace
}: FindReplaceModalProps): React.JSX.Element | null {
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [matchCase, setMatchCase] = useState(false)
  const [wholeWords, setWholeWords] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isReplaceDisabled = findText.trim().length === 0

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#0b1324]/60 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Find and replace"
        className="w-full max-w-[620px] overflow-hidden rounded-xl border border-[#cfdaec] bg-[#f8fbff] shadow-[0_20px_34px_rgba(16,27,46,0.35)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#d8e1f0] px-4 py-3">
          <h2 className="m-0 text-[20px] leading-none font-semibold text-[#29334a]">
            Find and replace
          </h2>
          <IconButton
            ariaLabel="Close find and replace modal"
            className="cursor-pointer rounded p-1 text-[22px] text-[#304a72] transition hover:bg-[#eaf1fc]"
            onClick={onClose}
          >
            <FiX />
          </IconButton>
        </div>

        <div className="space-y-4 border-b border-[#d8e1f0] px-4 py-5">
          <div className="grid grid-cols-[132px_minmax(0,1fr)] items-center gap-3">
            <label
              htmlFor="find-replace-find-this"
              className="text-[15px] font-medium text-[#314766]"
            >
              Find this
            </label>
            <input
              id="find-replace-find-this"
              type="text"
              value={findText}
              onChange={(event) => setFindText(event.target.value)}
              className="h-11 w-full rounded border border-[#c9d4e8] bg-white px-3 text-[15px] text-[#243650] outline-none focus:border-[#93a8d2]"
            />
          </div>

          <div className="grid grid-cols-[132px_minmax(0,1fr)] items-center gap-3">
            <label
              htmlFor="find-replace-replace-with"
              className="text-[15px] font-medium text-[#314766]"
            >
              Replace with
            </label>
            <input
              id="find-replace-replace-with"
              type="text"
              value={replaceText}
              onChange={(event) => setReplaceText(event.target.value)}
              className="h-11 w-full rounded border border-[#c9d4e8] bg-white px-3 text-[15px] text-[#243650] outline-none focus:border-[#93a8d2]"
            />
          </div>

          <div className="space-y-2 pl-[132px]">
            <label className="flex cursor-pointer items-center gap-3 text-[15px] text-[#304866]">
              <input
                type="checkbox"
                className="h-6 w-6 cursor-pointer accent-[#4f63f6]"
                checked={matchCase}
                onChange={(event) => setMatchCase(event.target.checked)}
              />
              <span>Match case</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-[15px] text-[#304866]">
              <input
                type="checkbox"
                className="h-6 w-6 cursor-pointer accent-[#4f63f6]"
                checked={wholeWords}
                onChange={(event) => setWholeWords(event.target.checked)}
              />
              <span>Whole words</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end px-4 py-3">
          <button
            type="button"
            onClick={() =>
              onReplace({
                findText,
                replaceText,
                matchCase,
                wholeWords
              })
            }
            disabled={isReplaceDisabled}
            className={[
              'inline-flex min-w-[98px] items-center justify-center rounded px-4 py-2 text-[15px] font-semibold text-white transition',
              isReplaceDisabled
                ? 'cursor-not-allowed bg-[#9da7e6]'
                : 'cursor-pointer bg-[#4f63f6] hover:bg-[#4158e8]'
            ].join(' ')}
          >
            Replace
          </button>
        </div>
      </div>
    </div>
  )
}
