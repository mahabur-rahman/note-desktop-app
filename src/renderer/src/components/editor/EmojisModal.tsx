import { useCallback, useEffect, useState } from 'react'
import { FiX } from 'react-icons/fi'
import { IconButton } from '../common/IconButton'

interface EmojisModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (value: string) => void
}

const emojis = [
  '😀',
  '😁',
  '😂',
  '🤣',
  '😃',
  '😄',
  '😅',
  '😆',
  '😉',
  '😊',
  '😋',
  '😎',
  '😍',
  '😘',
  '😗',
  '😙',
  '😚',
  '🙂',
  '🤗',
  '🤩',
  '🤔',
  '🤨',
  '😐',
  '😑',
  '😶',
  '🙄',
  '😏',
  '😣',
  '😥',
  '😮',
  '🤐',
  '😯',
  '😪',
  '😫',
  '😴',
  '😌',
  '😛',
  '😜',
  '😝',
  '🤤',
  '😒',
  '😓',
  '😔',
  '😕',
  '🙃',
  '🤑',
  '😲',
  '☹️',
  '🙁',
  '😖',
  '😞',
  '😟',
  '😤',
  '😢',
  '😭',
  '😦',
  '😧',
  '😨',
  '😩',
  '🤯',
  '😬',
  '😰',
  '😱',
  '🥵',
  '🥶',
  '😳',
  '🤪',
  '😵',
  '🥴',
  '😠',
  '😡',
  '🤬',
  '😷',
  '🤒',
  '🤕',
  '🤢',
  '🤮',
  '🤧',
  '😇',
  '🤠',
  '🤡',
  '🥳',
  '🥸',
  '😈',
  '👿',
  '👹',
  '👺',
  '💀',
  '👻',
  '👽',
  '🤖',
  '💩',
  '🐱',
  '🐶',
  '🐭',
  '🐹',
  '🐰',
  '🦊',
  '🐻',
  '🐼',
  '🐨',
  '🐯'
] as const

export function EmojisModal({
  isOpen,
  onClose,
  onInsert
}: EmojisModalProps): React.JSX.Element | null {
  const [selectedEmoji, setSelectedEmoji] = useState('')

  const handleClose = useCallback((): void => {
    setSelectedEmoji('')
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') handleClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, handleClose])

  if (!isOpen) return null

  const handleInsert = (): void => {
    if (!selectedEmoji) return
    onInsert(selectedEmoji)
    handleClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#0b1324]/60 px-4 backdrop-blur-[2px]"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Emojis"
        className="w-full max-w-[620px] overflow-hidden rounded-xl border border-[#cfdaec] bg-[#f8fbff] shadow-[0_20px_34px_rgba(16,27,46,0.35)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#d8e1f0] px-4 py-3">
          <h2 className="m-0 text-[28px] leading-none font-semibold text-[#273b5c]">Emojis</h2>
          <IconButton
            ariaLabel="Close emojis modal"
            className="cursor-pointer rounded p-1 text-[22px] text-[#304a72] transition hover:bg-[#eaf1fc]"
            onClick={handleClose}
          >
            <FiX />
          </IconButton>
        </div>

        <div className="max-h-[320px] overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap gap-2">
            {emojis.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                type="button"
                aria-label={`Select emoji ${emoji}`}
                className={[
                  'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded text-[22px]',
                  selectedEmoji === emoji ? 'bg-[#dce6fb]' : 'hover:bg-[#e9effb]'
                ].join(' ')}
                onClick={() => setSelectedEmoji(emoji)}
                onDoubleClick={() => {
                  onInsert(emoji)
                  handleClose()
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-[#d8e1f0] px-4 py-3">
          <button
            type="button"
            onClick={handleInsert}
            disabled={!selectedEmoji}
            className={[
              'inline-flex min-w-[98px] items-center justify-center rounded px-4 py-2 text-[15px] font-semibold text-white transition',
              selectedEmoji
                ? 'cursor-pointer bg-[#4f63f6] hover:bg-[#4158e8]'
                : 'cursor-not-allowed bg-[#9da7e6]'
            ].join(' ')}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  )
}
