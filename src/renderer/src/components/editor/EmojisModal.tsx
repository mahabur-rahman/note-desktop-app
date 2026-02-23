import { useEffect, useState } from 'react'
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

export function EmojisModal({ isOpen, onClose, onInsert }: EmojisModalProps): React.JSX.Element | null {
  const [selectedEmoji, setSelectedEmoji] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setSelectedEmoji('')
      return
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleInsert = (): void => {
    if (!selectedEmoji) return
    onInsert(selectedEmoji)
    setSelectedEmoji('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Emojis"
        className="w-full max-w-[620px] overflow-hidden rounded-[4px] border border-[#d8dde5] bg-[#f7f8fa]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#d8dde5] px-4 py-2.5">
          <h2 className="m-0 text-[35px] leading-none font-semibold text-[#29334a]">Emojis</h2>
          <IconButton
            ariaLabel="Close emojis modal"
            className="cursor-pointer p-1 text-[22px] text-[#26324a]"
            onClick={onClose}
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
                  selectedEmoji === emoji ? 'bg-[#d5dae4]' : 'hover:bg-[#e8ebf0]'
                ].join(' ')}
                onClick={() => setSelectedEmoji(emoji)}
                onDoubleClick={() => {
                  onInsert(emoji)
                  setSelectedEmoji('')
                  onClose()
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-[#d8dde5] px-4 py-3">
          <button
            type="button"
            onClick={handleInsert}
            disabled={!selectedEmoji}
            className={[
              'inline-flex min-w-[98px] items-center justify-center rounded px-4 py-2 text-[16px] text-white',
              selectedEmoji ? 'cursor-pointer bg-[#4f63f6]' : 'cursor-not-allowed bg-[#9da7e6]'
            ].join(' ')}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  )
}
