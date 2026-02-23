import { useEffect, useState } from 'react'
import { FiX } from 'react-icons/fi'
import { IconButton } from '../common/IconButton'

interface SpecialCharactersModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (value: string) => void
}

const specialCharacters = [
  '¢',
  '€',
  '£',
  '¥',
  '©',
  '®',
  '™',
  '‰',
  'µ',
  '•',
  '…',
  '’',
  '”',
  '§',
  '¶',
  'ß',
  '›',
  '«',
  '»',
  '‘',
  ',',
  '“',
  '”',
  '–',
  '<',
  '>',
  '≤',
  '≥',
  '−',
  '_',
  '¦',
  '¤',
  '¨',
  '¡',
  '¿',
  'ˆ',
  '˜',
  '°',
  '±',
  '÷',
  '/',
  '×',
  '¹',
  '²',
  '³',
  '¼',
  '½',
  '¾',
  'ƒ',
  '∫',
  '∑',
  '∞',
  '√',
  '~',
  '≅',
  '≈',
  '≠',
  '≡',
  '∃',
  '∏',
  '∧',
  '∨',
  '¬',
  '∩',
  '∪',
  '∂',
  '∀',
  'Ø',
  '∇',
  '∗',
  '∠',
  '′',
  '‚',
  '¸',
  'ª',
  'º',
  '†',
  '‡',
  'Á',
  'À',
  'Â',
  'Ã',
  'Ä',
  'Å',
  'Æ',
  'Ç',
  'È',
  'É',
  'Ê',
  'Ë',
  'Ì',
  'Í',
  'Î',
  'Ï',
  'Ð',
  'Ñ',
  'Ò',
  'Ó',
  'Ô',
  'Õ',
  'Ö',
  'Ù',
  'Ú',
  'Û',
  'Ü',
  'Ý',
  'Ÿ',
  'Þ',
  'à',
  'á',
  'â',
  'ã',
  'ä',
  'å',
  'æ',
  'ç',
  'è',
  'é',
  'ê',
  'ë',
  'ì',
  'í',
  'î',
  'ï',
  'ð',
  'ñ',
  'ò',
  'ó',
  'ô',
  'õ',
  'ö',
  'ø',
  'ù',
  'ú',
  'û',
  'ü',
  'ý',
  'ÿ',
  'Α',
  'Β',
  'Γ',
  'Δ',
  'Ε',
  'Ζ',
  'Η',
  'Θ',
  'Ι',
  'Κ',
  'Λ',
  'Μ',
  'Ν',
  'Ξ',
  'Ο',
  'Π',
  'Ρ',
  'Σ',
  'Τ',
  'Υ',
  'Φ',
  'Χ',
  'Ψ',
  'Ω',
  'α',
  'β',
  'γ',
  'δ',
  'ε',
  'ζ',
  'η',
  'θ',
  'ι',
  'κ',
  'λ',
  'μ',
  'ν',
  'ξ',
  'ο',
  'π',
  'ρ',
  'σ',
  'τ',
  'υ',
  'φ',
  'χ',
  'ψ',
  'ω',
  '←',
  '↑',
  '→',
  '↓',
  '↔',
  '↕',
  '⇐',
  '⇒',
  '⇑',
  '⇓',
  '∴',
  '∵',
  '⌈',
  '⌉',
  '⌊',
  '⌋',
  '〈',
  '〉',
  '◊',
  '♠',
  '♣',
  '♥',
  '♦'
] as const

export function SpecialCharactersModal({
  isOpen,
  onClose,
  onInsert
}: SpecialCharactersModalProps): React.JSX.Element | null {
  const [selectedCharacter, setSelectedCharacter] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setSelectedCharacter('')
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
    if (!selectedCharacter) return
    onInsert(selectedCharacter)
    setSelectedCharacter('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Special Characters"
        className="w-full max-w-[620px] overflow-hidden rounded-[4px] border border-[#d8dde5] bg-[#f7f8fa]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#d8dde5] px-4 py-2.5">
          <h2 className="m-0 text-[35px] leading-none font-semibold text-[#29334a]">Special Characters</h2>
          <IconButton
            ariaLabel="Close special characters modal"
            className="cursor-pointer p-1 text-[22px] text-[#26324a]"
            onClick={onClose}
          >
            <FiX />
          </IconButton>
        </div>

        <div className="max-h-[390px] overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-16 gap-1">
            {specialCharacters.map((character, index) => (
              <button
                key={`${character}-${index}`}
                type="button"
                aria-label={`Select character ${character}`}
                className={[
                  'inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded text-[19px] text-[#26324a]',
                  selectedCharacter === character ? 'bg-[#d5dae4]' : 'hover:bg-[#e8ebf0]'
                ].join(' ')}
                onClick={() => setSelectedCharacter(character)}
                onDoubleClick={() => {
                  onInsert(character)
                  setSelectedCharacter('')
                  onClose()
                }}
              >
                {character}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-[#d8dde5] px-4 py-3">
          <button
            type="button"
            onClick={handleInsert}
            disabled={!selectedCharacter}
            className={[
              'inline-flex min-w-[98px] items-center justify-center rounded px-4 py-2 text-[16px] text-white',
              selectedCharacter ? 'cursor-pointer bg-[#4f63f6]' : 'cursor-not-allowed bg-[#9da7e6]'
            ].join(' ')}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  )
}
